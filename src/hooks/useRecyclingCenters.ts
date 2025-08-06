import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface RecyclingCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operating_hours: string;
  accepted_materials: string[];
  rating: number;
  capacity_status: 'low' | 'medium' | 'high';
  distance?: number;
}

export const useRecyclingCenters = () => {
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recycling_centers')
        .select('*')
        .order('name');

      if (error) throw error;

      setCenters(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Provide mock data for demo
      setCenters([
        {
          id: 'center-1',
          name: 'Green Center Dhaka',
          address: 'House 45, Road 12, Gulshan-1, Dhaka',
          latitude: 23.7808,
          longitude: 90.4142,
          phone: '+880 1234-567890',
          email: 'gulshan@greenloop.bd',
          operating_hours: '9:00 AM - 6:00 PM',
          accepted_materials: ['Plastic', 'Paper', 'Glass', 'Metal'],
          rating: 4.5,
          capacity_status: 'medium'
        },
        {
          id: 'center-2',
          name: 'Tech Recycle Center',
          address: 'Plot 23, Dhanmondi R/A, Dhaka',
          latitude: 23.7461,
          longitude: 90.3742,
          phone: '+880 1234-567891',
          email: 'dhanmondi@greenloop.bd',
          operating_hours: '10:00 AM - 7:00 PM',
          accepted_materials: ['Electronics', 'Batteries', 'Cables'],
          rating: 4.8,
          capacity_status: 'high'
        },
        {
          id: 'center-3',
          name: 'Eco Waste Solutions',
          address: 'Sector 7, Uttara, Dhaka',
          latitude: 23.8759,
          longitude: 90.3795,
          phone: '+880 1234-567892',
          email: 'uttara@greenloop.bd',
          operating_hours: '8:00 AM - 5:00 PM',
          accepted_materials: ['Organic', 'Paper', 'Cardboard'],
          rating: 4.2,
          capacity_status: 'low'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const findNearbyCenter = async (userLat: number, userLng: number, radiusKm: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('recycling_centers')
        .select('*');

      if (error) throw error;

      // Calculate distances and filter by radius
      const centersWithDistance = (data || []).map(center => {
        const distance = calculateDistance(userLat, userLng, center.latitude, center.longitude);
        return { ...center, distance };
      }).filter(center => center.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);

      return centersWithDistance;
    } catch (err) {
      console.error('Error finding nearby centers:', err);
      return [];
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return {
    centers,
    loading,
    error,
    fetchCenters,
    findNearbyCenter,
  };
};