import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          user_type: 'consumer' | 'business' | 'facility';
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          user_type: 'consumer' | 'business' | 'facility';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          user_type?: 'consumer' | 'business' | 'facility';
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      recycling_centers: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          latitude: number;
          longitude: number;
          phone: string;
          email: string;
          operating_hours: string;
          accepted_materials: string[];
          rating?: number;
          capacity_status?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          phone?: string;
          email?: string;
          operating_hours?: string;
          accepted_materials?: string[];
          rating?: number;
          capacity_status?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
        };
      };
      pickups: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          center_id: string;
          pickup_date: string;
          pickup_time: string;
          items_description: string;
          estimated_weight: number;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          points_earned?: number;
          moderator_notes?: string | null;
          assigned_rider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          center_id?: string;
          pickup_date?: string;
          pickup_time?: string;
          items_description?: string;
          estimated_weight?: number;
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          points_earned?: number;
          moderator_notes?: string | null;
          assigned_rider_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      green_riders: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          vehicle_type: string;
          license_number?: string | null;
          is_available?: boolean;
          current_location_lat?: number | null;
          current_location_lng?: number | null;
          rating?: number;
          total_pickups?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          vehicle_type?: string;
          license_number?: string | null;
          is_available?: boolean;
          current_location_lat?: number | null;
          current_location_lng?: number | null;
          rating?: number;
          total_pickups?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      moderators: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          phone: string | null;
          is_active: boolean;
          permissions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          phone?: string | null;
          is_active?: boolean;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          phone?: string | null;
          is_active?: boolean;
          permissions?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      recycling_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: 'pickup' | 'drop_off' | 'purchase';
          material_type: string;
          weight_kg: number;
          points_earned: number;
          co2_saved_kg: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: 'pickup' | 'drop_off' | 'purchase';
          material_type: string;
          weight_kg: number;
          points_earned: number;
          co2_saved_kg: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: 'pickup' | 'drop_off' | 'purchase';
          material_type?: string;
          weight_kg?: number;
          points_earned?: number;
          co2_saved_kg?: number;
          created_at?: string;
        };
      };
    };
  };
};