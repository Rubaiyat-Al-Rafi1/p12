import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Moderator {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  is_active: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface GreenRider {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  license_number: string | null;
  is_available: boolean;
  current_location_lat: number | null;
  current_location_lng: number | null;
  rating: number;
  total_pickups: number;
  created_at: string;
  updated_at: string;
}

interface PickupWithDetails {
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
  profiles?: {
    name: string;
    email: string;
    phone: string | null;
  };
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

export const useModerator = () => {
  const [moderator, setModerator] = useState<Moderator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if moderator exists in database
      const { data, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('Invalid email or password');
      }

      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll use simple password check
      if (password !== 'md1234') {
        throw new Error('Invalid email or password');
      }

      setModerator(data);
      localStorage.setItem('moderator_session', JSON.stringify(data));
      return { data, error: null };
    } catch (err: any) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setModerator(null);
    localStorage.removeItem('moderator_session');
  };

  const fetchAllPickups = async (): Promise<PickupWithDetails[]> => {
    try {
      const { data, error } = await supabase
        .from('pickups')
        .select(`
          *,
          profiles (
            name,
            email,
            phone
          ),
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching pickups:', err);
      return [];
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      return [];
    }
  };

  const fetchGreenRiders = async (): Promise<GreenRider[]> => {
    try {
      const { data, error } = await supabase
        .from('green_riders')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching riders:', err);
      return [];
    }
  };

  const assignPickupToRider = async (pickupId: string, riderId: string, notes?: string) => {
    try {
      // Update pickup with assigned rider
      const { error: pickupError } = await supabase
        .from('pickups')
        .update({
          assigned_rider_id: riderId,
          moderator_notes: notes,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', pickupId);

      if (pickupError) throw pickupError;

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePickupStatus = async (pickupId: string, status: string, notes?: string) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.moderator_notes = notes;
      }
      
      // If completing pickup, award points
      if (status === 'completed') {
        // Get pickup details to calculate points
        const { data: pickup, error: pickupError } = await supabase
          .from('pickups')
          .select('estimated_weight, user_id')
          .eq('id', pickupId)
          .single();

        if (!pickupError && pickup) {
          const pointsToAward = Math.round(pickup.estimated_weight * 10); // 10 points per kg
          updateData.points_earned = pointsToAward;
          
          // Update user points
          const { error: pointsError } = await supabase
            .from('profiles')
            .update({ 
              points: supabase.sql`points + ${pointsToAward}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', pickup.user_id);

          if (pointsError) {
            console.error('Error updating user points:', pointsError);
          }
        }
      }
      
      const { error } = await supabase
        .from('pickups')
        .update(updateData)
        .eq('id', pickupId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePickupPriority = async (pickupId: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('pickups')
        .update({
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', pickupId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const createGreenRider = async (riderData: Omit<GreenRider, 'id' | 'rating' | 'total_pickups' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('green_riders')
        .insert({
          ...riderData,
          rating: 5.0,
          total_pickups: 0,
          is_available: true
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating rider:', err);
      return { data: null, error: err };
    }
  };

  const updateRiderAvailability = async (riderId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from('green_riders')
        .update({ is_available: isAvailable })
        .eq('id', riderId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    setLoading(true);
    const savedSession = localStorage.getItem('moderator_session');
    if (savedSession) {
      try {
        const moderatorData = JSON.parse(savedSession);
        setModerator(moderatorData);
      } catch (err) {
        localStorage.removeItem('moderator_session');
      }
    }
    setLoading(false);
  }, []);

  return {
    moderator,
    loading,
    error,
    signIn,
    signOut,
    fetchAllPickups,
    fetchAllUsers,
    fetchGreenRiders,
    assignPickupToRider,
    updatePickupStatus,
    updatePickupPriority,
    createGreenRider,
    updateRiderAvailability,
  };
};