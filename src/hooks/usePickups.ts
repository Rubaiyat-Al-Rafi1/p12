import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Pickup {
  id: string;
  user_id: string;
  center_id: string;
  pickup_date: string;
  pickup_time: string;
  items_description: string;
  estimated_weight: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  points_earned: number;
  moderator_notes: string | null;
  assigned_rider_id: string | null;
  created_at: string;
  updated_at: string;
  recycling_centers?: {
    name: string;
    address: string;
    phone: string;
  };
  green_riders?: {
    name: string;
    phone: string;
    vehicle_type: string;
  };
}

interface CreatePickupData {
  center_id: string;
  pickup_date: string;
  pickup_time: string;
  items_description: string;
  estimated_weight: number;
}

export const usePickups = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPickups = async () => {
    if (!user) {
      setPickups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pickups')
        .select(`
          *,
          recycling_centers (
            name,
            address,
            phone
          ),
          green_riders (
            name,
            phone,
            vehicle_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPickups(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pickups:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPickup = async (pickupData: CreatePickupData) => {
    if (!user) {
      throw new Error('User must be logged in to create pickup');
    }

    try {
      const { data, error } = await supabase
        .from('pickups')
        .insert({
          user_id: user.id,
          ...pickupData,
          status: 'scheduled',
          priority: 'medium',
          points_earned: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh pickups list
      await fetchPickups();

      return { data, error: null };
    } catch (error) {
      console.error('Error creating pickup:', error);
      return { data: null, error };
    }
  };

  const updatePickupStatus = async (pickupId: string, status: Pickup['status'], pointsEarned?: number) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (pointsEarned !== undefined) {
        updateData.points_earned = pointsEarned;
      }

      const { data, error } = await supabase
        .from('pickups')
        .update(updateData)
        .eq('id', pickupId)
        .select()
        .single();

      if (error) throw error;

      // If pickup is completed and points were earned, update user's total points
      if (status === 'completed' && pointsEarned && user) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ 
            points: supabase.sql`points + ${pointsEarned}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (pointsError) {
          console.error('Error updating user points:', pointsError);
        }
      }

      // Refresh pickups list
      await fetchPickups();

      return { data, error: null };
    } catch (error) {
      console.error('Error updating pickup status:', error);
      return { data: null, error };
    }
  };

  const cancelPickup = async (pickupId: string) => {
    return updatePickupStatus(pickupId, 'cancelled');
  };

  useEffect(() => {
    fetchPickups();

    // Subscribe to pickup changes
    const subscription = supabase
      .channel('pickups_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pickups',
          filter: user ? `user_id=eq.${user.id}` : undefined
        }, 
        () => {
          fetchPickups(); // Refresh when pickups change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    pickups,
    loading,
    error,
    fetchPickups,
    createPickup,
    updatePickupStatus,
    cancelPickup,
  };
};