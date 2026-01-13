/**
 * Cookie-Based Supabase Client for Cross-Subdomain Authentication
 * 
 * This client uses cookie storage scoped to .buntinggpt.com, enabling
 * session sharing across all subdomains (login.buntinggpt.com, app.buntinggpt.com, etc.)
 * 
 * IMPORTANT: Use this client instead of @/integrations/supabase/client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

// Check if running in development mode
const isDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.lovableproject.com');
};

// Native cookie storage for cross-subdomain sessions
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    const secure = isDev() ? '' : '; Secure';
    document.cookie = `${key}=${encodeURIComponent(value)}${domain}; path=/; max-age=${60*60*24*7}; SameSite=Lax${secure}`;
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
