import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Create a mock storage system for demo purposes
class MockStorage {
  private data: { [key: string]: any[] } = {
    profiles: [],
    pickups: [],
    recycling_centers: [],
    green_riders: [],
    moderators: []
  };

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Demo users
    this.data.profiles = [
      {
        id: 'user-001',
        email: 'john@example.com',
        name: 'John Doe',
        phone: '+880 1234-567890',
        user_type: 'consumer',
        points: 150,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'user-002',
        email: 'sarah@business.com',
        name: 'Sarah Ahmed',
        phone: '+880 1234-567891',
        user_type: 'business',
        points: 320,
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Demo recycling centers
    this.data.recycling_centers = [
      {
        id: 'center-001',
        name: 'Green Center Dhaka',
        address: 'House 45, Road 12, Gulshan-1, Dhaka',
        latitude: 23.7808,
        longitude: 90.4142,
        phone: '+880 1234-567890',
        email: 'gulshan@greenloop.bd',
        operating_hours: '9:00 AM - 6:00 PM',
        accepted_materials: ['Plastic', 'Paper', 'Glass', 'Metal'],
        rating: 4.5,
        capacity_status: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Demo green riders
    this.data.green_riders = [
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
      },
      {
        id: 'rider-002',
        name: 'Fatima Khan',
        email: 'fatima@greenloop.bd',
        phone: '+880 1234-567893',
        vehicle_type: 'motorcycle',
        license_number: 'DH-1234',
        is_available: true,
        current_location_lat: 23.7461,
        current_location_lng: 90.3742,
        rating: 4.9,
        total_pickups: 67,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Demo pickups
    this.data.pickups = [
      {
        id: 'pickup-001',
        user_id: 'user-001',
        center_id: 'center-001',
        pickup_date: new Date().toISOString().split('T')[0],
        pickup_time: '10:00',
        items_description: 'Plastic bottles and containers',
        estimated_weight: 5.5,
        status: 'scheduled',
        priority: 'medium',
        points_earned: 0,
        moderator_notes: null,
        assigned_rider_id: null,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'pickup-002',
        user_id: 'user-002',
        center_id: 'center-001',
        pickup_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pickup_time: '14:00',
        items_description: 'Office paper waste and cardboard',
        estimated_weight: 12.0,
        status: 'completed',
        priority: 'high',
        points_earned: 120,
        moderator_notes: 'Large pickup completed successfully',
        assigned_rider_id: 'rider-001',
        created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Demo moderator
    this.data.moderators = [
      {
        id: 'mod-001',
        email: 'moderator@gmail.com',
        name: 'System Moderator',
        phone: '+880 1234-567890',
        is_active: true,
        permissions: ['manage_users', 'manage_pickups', 'manage_riders', 'view_analytics'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Mock database operations
  async from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const item = this.data[table]?.find((item: any) => item[column] === value);
            return { data: item || null, error: item ? null : new Error('Not found') };
          },
          order: (column: string, options?: any) => ({
            data: this.data[table]?.filter((item: any) => item[column] === value) || [],
            error: null
          })
        }),
        order: (column: string, options?: any) => ({
          data: this.data[table] || [],
          error: null
        }),
        data: this.data[table] || [],
        error: null
      }),
      insert: (newData: any) => ({
        select: () => ({
          single: async () => {
            const id = newData.id || `${table}-${Date.now()}`;
            const item = { ...newData, id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
            this.data[table] = this.data[table] || [];
            this.data[table].push(item);
            this.notifyDataChange(table, 'insert', item);
            return { data: item, error: null };
          }
        })
      }),
      update: (updateData: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              const index = this.data[table]?.findIndex((item: any) => item[column] === value);
              if (index !== undefined && index >= 0) {
                this.data[table][index] = { ...this.data[table][index], ...updateData, updated_at: new Date().toISOString() };
                this.notifyDataChange(table, 'update', this.data[table][index]);
                return { data: this.data[table][index], error: null };
              }
              return { data: null, error: new Error('Not found') };
            }
          })
        })
      })
    };
  }

  private listeners: { [key: string]: Function[] } = {};

  private notifyDataChange(table: string, operation: string, data: any) {
    const key = `${table}:${operation}`;
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(data));
    }
    // Also notify general table listeners
    if (this.listeners[table]) {
      this.listeners[table].forEach(callback => callback({ operation, data }));
    }
  }

  subscribe(table: string, callback: Function) {
    if (!this.listeners[table]) {
      this.listeners[table] = [];
    }
    this.listeners[table].push(callback);
    
    return {
      unsubscribe: () => {
        const index = this.listeners[table].indexOf(callback);
        if (index > -1) {
          this.listeners[table].splice(index, 1);
        }
      }
    };
  }

  // Get all data for a table
  getData(table: string) {
    return this.data[table] || [];
  }

  // Update data and notify listeners
  updateData(table: string, id: string, updates: any) {
    const index = this.data[table]?.findIndex((item: any) => item.id === id);
    if (index !== undefined && index >= 0) {
      this.data[table][index] = { ...this.data[table][index], ...updates, updated_at: new Date().toISOString() };
      this.notifyDataChange(table, 'update', this.data[table][index]);
      return this.data[table][index];
    }
    return null;
  }
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create global mock storage instance
const mockStorage = new MockStorage();
// Export mock storage for demo purposes
export { mockStorage };

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
          points_earned: number;
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
          points_earned?: number;
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
          points_earned?: number;
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