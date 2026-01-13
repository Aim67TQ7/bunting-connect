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
import Cookies from 'js-cookie';
import { isDevelopment } from '@/lib/auth';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

// Cookie options based on environment
const getCookieOptions = (): Cookies.CookieAttributes => {
  if (isDevelopment()) {
    return {
      expires: 7,
      sameSite: 'lax',
      path: '/',
    };
  }
  return {
    domain: '.buntinggpt.com',
    secure: true,
    sameSite: 'lax',
    expires: 7,
    path: '/',
  };
};

// Custom storage using js-cookie for cross-subdomain sessions
const cookieStorage = {
  getItem: (key: string): string | null => {
    return Cookies.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    Cookies.set(key, value, getCookieOptions());
  },
  removeItem: (key: string): void => {
    const removeOptions: Cookies.CookieAttributes = isDevelopment() 
      ? { path: '/' }
      : { domain: '.buntinggpt.com', path: '/' };
    Cookies.remove(key, removeOptions);
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
