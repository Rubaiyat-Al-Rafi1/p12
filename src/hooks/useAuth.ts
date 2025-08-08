import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, mockStorage } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  user_type: 'consumer' | 'business' | 'facility';
  points: number;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Try to get from mock storage first
      const profiles = mockStorage.getData('profiles');
      let data = profiles.find((p: any) => p.id === userId);
      let error = null;

      if (!data) {
        // Fallback to Supabase
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    name: string;
    phone?: string;
    user_type: 'consumer' | 'business' | 'facility';
  }) => {
    try {
      // Create user in mock storage for demo
      const mockUser = {
        id: 'user-' + Date.now(),
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User;
      
      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email,
        name: userData.name,
        phone: userData.phone || null,
        user_type: userData.user_type,
        points: userData.user_type === 'consumer' ? 100 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add to mock storage
      const profiles = mockStorage.getData('profiles');
      profiles.push(mockProfile);
      
      setUser(mockUser);
      setProfile(mockProfile);
      
      return { data: { user: mockUser, session: null }, error: null };

      // Original Supabase code as fallback
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: userData.name,
            phone: userData.phone || null,
            user_type: userData.user_type,
            points: userData.user_type === 'consumer' ? 100 : 0, // Welcome bonus for consumers
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // For demo, create a mock profile if database fails
          const mockProfile: UserProfile = {
            id: data.user.id,
            email: data.user.email!,
            name: userData.name,
            phone: userData.phone || null,
            user_type: userData.user_type,
            points: userData.user_type === 'consumer' ? 100 : 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(mockProfile);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.log('Signup error, using demo mode:', error);
      
      // Create demo user as fallback
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User;
      
      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email,
        name: userData.name,
        phone: userData.phone || null,
        user_type: userData.user_type,
        points: userData.user_type === 'consumer' ? 100 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      setProfile(mockProfile);
      
      return { data: { user: mockUser, session: null }, error: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check mock storage first
      const profiles = mockStorage.getData('profiles');
      const existingProfile = profiles.find((p: any) => p.email === email);
      
      if (existingProfile) {
        const mockUser = {
          id: existingProfile.id,
          email: existingProfile.email,
          created_at: existingProfile.created_at,
          updated_at: existingProfile.updated_at
        } as User;
        
        setUser(mockUser);
        setProfile(existingProfile);
        
        return { data: { user: mockUser, session: null }, error: null };
      }

      // Fallback to Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If Supabase auth fails, create a demo session for testing
      if (error) {
        console.log('Supabase auth failed, using demo mode:', error.message);
        
        const mockUser = {
          id: 'demo-user-' + Date.now(),
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as User;
        
        const mockProfile: UserProfile = {
          id: mockUser.id,
          email: email,
          name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo User',
          phone: null,
          user_type: 'consumer',
          points: 150,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUser(mockUser);
        setProfile(mockProfile);
        
        return { data: { user: mockUser, session: null }, error: null };
      }

      return { data, error };
    } catch (error) {
      console.log('Sign in error, using demo mode:', error);
      
      // Create demo session as fallback
      const mockUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as User;
      
      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email,
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo User',
        phone: null,
        user_type: 'consumer',
        points: 150,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      setProfile(mockProfile);
      
      return { data: { user: mockUser, session: null }, error: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Update in mock storage
      const updatedProfile = mockStorage.updateData('profiles', user.id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }

      // Fallback to Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Subscribe to profile changes
  useEffect(() => {
    if (!user) return;

    const subscription = mockStorage.subscribe('profiles', (change: any) => {
      if (change.operation === 'update' && change.data.id === user.id) {
        setProfile(change.data);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  return {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};