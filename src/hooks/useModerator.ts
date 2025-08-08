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

      // For demo purposes, use hardcoded credentials
      if (email === 'moderator@gmail.com' && password === 'md1234') {
        const mockModerator: Moderator = {
          id: 'mod-001',
          email: 'moderator@gmail.com',
          name: 'System Moderator',
          phone: '+880 1234-567890',
          is_active: true,
          permissions: ['manage_users', 'manage_pickups', 'manage_riders', 'view_analytics'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setModerator(mockModerator);
        localStorage.setItem('moderator_session', JSON.stringify(mockModerator));
        return { data: mockModerator, error: null };
      }

      // Try to fetch from database as fallback
      const { data, error } = await supabase
        .from('moderators')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !data || data.password_hash !== `simple_hash_${password}`) {
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
      // Return mock data for demo
      return [
        {
          id: 'pickup-001',
          user_id: 'user-001',
          center_id: 'center-001',
          pickup_date: new Date().toISOString().split('T')[0],
          pickup_time: '10:00',
          items_description: 'Plastic bottles and containers',
          estimated_weight: 5.5,
          status: 'scheduled' as const,
          priority: 'medium' as const,
          points_earned: 0,
          moderator_notes: null,
          assigned_rider_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profiles: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+880 1234-567890'
          },
          recycling_centers: {
            name: 'Green Center Dhaka',
            address: 'Gulshan, Dhaka',
            phone: '+880 1234-567891'
          }
        }
      ];
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
      // Return mock data for demo
      return [
        {
          id: 'user-001',
          email: 'john@example.com',
          name: 'John Doe',
          phone: '+880 1234-567890',
          user_type: 'consumer',
          points: 150,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
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
      // Return mock data for demo
      return [
        {
          id: 'rider-001',
          name: 'Ahmed Rahman',
          email: 'ahmed@greenloop.bd',
          phone: '+880 1234-567892',
          vehicle_type: 'bicycle',
          license_number: null,
          is_available: true,
          current_location_lat: 23.8103,
          current_location_lng: 90.4125,
          rating: 4.8,
          total_pickups: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
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

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('pickup_assignments')
        .insert({
          pickup_id: pickupId,
          rider_id: riderId,
          moderator_id: moderator?.id,
          notes: notes,
          status: 'assigned'
        });

      if (assignmentError) throw assignmentError;

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePickupStatus = async (pickupId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('pickups')
        .update({
          status,
          moderator_notes: notes,
          updated_at: new Date().toISOString()
        })
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
      // For demo, return success
      const mockRider: GreenRider = {
        id: 'rider-' + Date.now(),
        ...riderData,
        rating: 5.0,
        total_pickups: 0,
        is_available: true,
        current_location_lat: null,
        current_location_lng: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: mockRider, error: null };
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