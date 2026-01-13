import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

const mapSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? null,
    name: supabaseUser.user_metadata?.full_name ?? supabaseUser.user_metadata?.name ?? null,
    role: supabaseUser.user_metadata?.role,
  };
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const checkSession = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      setAuthState({
        isAuthenticated: !!session,
        isLoading: false,
        user: mapSupabaseUser(session?.user ?? null),
        error: null,
      });
    } catch (error) {
      console.error('Session check failed:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: 'Unable to verify session. Please try again.',
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Sign out failed. Please try again.',
      }));
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          isAuthenticated: !!session,
          isLoading: false,
          user: mapSupabaseUser(session?.user ?? null),
          error: null,
        });
      }
    );

    // Then check initial session
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession]);

  return {
    ...authState,
    checkSession,
    signOut,
  };
};

export default useAuth;
