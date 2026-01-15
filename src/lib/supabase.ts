import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

const COOKIE_DOMAIN = '.buntinggpt.com';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Cross-domain cookie storage for session sharing across *.buntinggpt.com
const crossDomainCookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
    if (!cookie) return null;
    return decodeURIComponent(cookie.split('=')[1]);
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
    if (!isLocalhost) cookieString += `; domain=${COOKIE_DOMAIN}`;
    if (window.location.protocol === 'https:') cookieString += '; Secure';
    document.cookie = cookieString;
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let cookieString = `${key}=; path=/; max-age=0; SameSite=Lax`;
    if (!isLocalhost) cookieString += `; domain=${COOKIE_DOMAIN}`;
    document.cookie = cookieString;
  }
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: 'sb-auth',
    storage: crossDomainCookieStorage,
    persistSession: true,
    autoRefreshToken: false,  // Let login hub handle refresh
  }
});
