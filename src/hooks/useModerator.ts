import { useState, useEffect } from 'react';
import { supabase, mockStorage } from '../lib/supabase';

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
      // Get from mock storage
      const pickups = mockStorage.getData('pickups');
      const profiles = mockStorage.getData('profiles');
      const centers = mockStorage.getData('recycling_centers');
      const riders = mockStorage.getData('green_riders');
      
      // Join the data
      const pickupsWithDetails = pickups.map((pickup: any) => {
        const profile = profiles.find((p: any) => p.id === pickup.user_id);
        const center = centers.find((c: any) => c.id === pickup.center_id);
        const rider = pickup.assigned_rider_id ? riders.find((r: any) => r.id === pickup.assigned_rider_id) : null;
        
        return {
          ...pickup,
          profiles: profile ? {
            name: profile.name,
            email: profile.email,
            phone: profile.phone
          } : null,
          recycling_centers: center ? {
            name: center.name,
            address: center.address,
            phone: center.phone
          } : null,
          green_riders: rider ? {
            name: rider.name,
            phone: rider.phone,
            vehicle_type: rider.vehicle_type
          } : null
        };
      });
      
      return pickupsWithDetails;

      // Fallback to Supabase
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
      // Get from mock storage
      const users = mockStorage.getData('profiles');
      return users;

      // Fallback to Supabase
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
      // Get from mock storage
      const riders = mockStorage.getData('green_riders');
      return riders;

      // Fallback to Supabase
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
      // Update in mock storage
      const updatedPickup = mockStorage.updateData('pickups', pickupId, {
        assigned_rider_id: riderId,
        moderator_notes: notes,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      });
      
      if (updatedPickup) {
        return { success: true, error: null };
      }

      // Fallback to Supabase
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
      // Update in mock storage
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.moderator_notes = notes;
      }
      
      // If completing pickup, award points
      if (status === 'completed') {
        const pickups = mockStorage.getData('pickups');
        const pickup = pickups.find((p: any) => p.id === pickupId);
        if (pickup) {
          const pointsToAward = Math.round(pickup.estimated_weight * 10); // 10 points per kg
          updateData.points_earned = pointsToAward;
          
          // Update user points
          const profiles = mockStorage.getData('profiles');
          const userProfile = profiles.find((p: any) => p.id === pickup.user_id);
          if (userProfile) {
            mockStorage.updateData('profiles', pickup.user_id, {
              points: (userProfile.points || 0) + pointsToAward
            });
          }
        }
      }
      
      const updatedPickup = mockStorage.updateData('pickups', pickupId, updateData);
      
      if (updatedPickup) {
        return { success: true, error: null };
      }

      // Fallback to Supabase
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
      // Update in mock storage
      const updatedPickup = mockStorage.updateData('pickups', pickupId, {
        priority,
        updated_at: new Date().toISOString()
      });
      
      if (updatedPickup) {
        return { success: true, error: null };
      }

      // Fallback to Supabase
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
      // Create in mock storage
      const newRider: GreenRider = {
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
      
      const riders = mockStorage.getData('green_riders');
      riders.push(newRider);
      
      return { data: newRider, error: null };

      // Fallback to Supabase
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
      // Update in mock storage
      const updatedRider = mockStorage.updateData('green_riders', riderId, {
        is_available: isAvailable
      });
      
      if (updatedRider) {
        return { success: true, error: null };
      }

      // Fallback to Supabase
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