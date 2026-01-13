import { useState, useEffect, useCallback } from 'react';

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

// This hook will be connected to Supabase once configured
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
      
      // TODO: Implement Supabase session check
      // const { data: { session }, error } = await supabase.auth.getSession();
      
      // For now, simulate no session
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
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
      
      // TODO: Implement Supabase sign out
      // await supabase.auth.signOut();
      
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
    checkSession();
  }, [checkSession]);

  return {
    ...authState,
    checkSession,
    signOut,
  };
};

export default useAuth;
