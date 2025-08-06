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
  points_earned: number;
  created_at: string;
  updated_at: string;
  recycling_centers?: {
    name: string;
    address: string;
    phone: string;
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
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPickups(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Provide mock data for demo
      setPickups([
        {
          id: 'pickup-demo-1',
          user_id: user.id,
          center_id: 'center-1',
          pickup_date: new Date().toISOString().split('T')[0],
          pickup_time: '10:00',
          items_description: 'Plastic bottles and paper waste',
          estimated_weight: 3.5,
          status: 'completed',
          points_earned: 35,
          created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          recycling_centers: {
            name: 'Green Center Dhaka',
            address: 'Gulshan, Dhaka',
            phone: '+880 1234-567890'
          }
        },
        {
          id: 'pickup-demo-2',
          user_id: user.id,
          center_id: 'center-2',
          pickup_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          pickup_time: '14:00',
          items_description: 'Electronic waste - old phone and chargers',
          estimated_weight: 1.2,
          status: 'scheduled',
          points_earned: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          recycling_centers: {
            name: 'Tech Recycle Center',
            address: 'Dhanmondi, Dhaka',
            phone: '+880 1234-567891'
          }
        }
      ]);
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
          points_earned: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh pickups list
      await fetchPickups();

      return { data, error: null };
    } catch (error) {
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
        await supabase.rpc('increment_user_points', {
          user_id: user.id,
          points_to_add: pointsEarned
        });
      }

      // Refresh pickups list
      await fetchPickups();

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const cancelPickup = async (pickupId: string) => {
    return updatePickupStatus(pickupId, 'cancelled');
  };

  useEffect(() => {
    fetchPickups();
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