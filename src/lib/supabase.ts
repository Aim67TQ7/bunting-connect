/**
 * Unified Cookie-Based Supabase Client
 * 
 * Session storage scoped to .buntinggpt.com for cross-subdomain auth.
 * No localStorage. No chunking. Simple cookie storage.
 * 
 * CRITICAL: self.buntinggpt.com must use an identical client configuration.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

const isDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.lovableproject.com');
};

const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(^| )${key}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    const secure = isDev() ? '' : '; Secure';
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${domain}${secure}`;
  },
  
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
  },
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
