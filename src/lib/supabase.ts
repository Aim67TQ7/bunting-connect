/**
 * Cookie-Based Supabase Client for Cross-Subdomain Authentication
 * 
 * This client uses cookie storage scoped to .buntinggpt.com, enabling
 * session sharing across all subdomains (login.buntinggpt.com, self.buntinggpt.com, etc.)
 * 
 * Features:
 * - Cookie chunking for tokens >4KB (Supabase JWTs can be large)
 * - Works on 99%+ of browsers (first-party cookies, SameSite=Lax)
 * - Native document.cookie (no dependencies)
 * 
 * IMPORTANT: Use this client instead of @/integrations/supabase/client
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://qzwxisdfwswsrbzvpzlo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6d3hpc2Rmd3N3c3JienZwemxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1OTg2NjYsImV4cCI6MjA1NDE3NDY2Nn0.nVV1d-_BfhfVNOSiusg8zSuvPwS4dSB-cJAMGVjujr4";

// Cookie chunking constants
const MAX_COOKIE_SIZE = 3500; // Leave room for name, attributes, and encoding overhead
const CHUNK_SEPARATOR = '__chunk__';

// Check if running in development mode
const isDev = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.lovableproject.com');
};

// Native cookie storage with chunking for cross-subdomain sessions
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ');
    
    // First try direct read (for non-chunked values)
    const directMatch = cookies.find(c => c.startsWith(`${key}=`));
    if (directMatch) {
      return decodeURIComponent(directMatch.split('=').slice(1).join('='));
    }
    
    // Check for chunked cookies
    const chunks: string[] = [];
    let i = 0;
    while (true) {
      const chunkKey = `${key}${CHUNK_SEPARATOR}${i}`;
      const chunk = cookies.find(c => c.startsWith(`${chunkKey}=`));
      if (!chunk) break;
      chunks.push(decodeURIComponent(chunk.split('=').slice(1).join('=')));
      i++;
    }
    
    return chunks.length > 0 ? chunks.join('') : null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    const secure = isDev() ? '' : '; Secure';
    const cookieBase = `${domain}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
    
    // Clear any existing value/chunks first
    cookieStorage.removeItem(key);
    
    const encoded = encodeURIComponent(value);
    
    // If small enough, store directly
    if (encoded.length <= MAX_COOKIE_SIZE) {
      document.cookie = `${key}=${encoded}${cookieBase}`;
      return;
    }
    
    // Otherwise chunk it
    let i = 0;
    for (let pos = 0; pos < encoded.length; pos += MAX_COOKIE_SIZE) {
      const chunk = encoded.slice(pos, pos + MAX_COOKIE_SIZE);
      document.cookie = `${key}${CHUNK_SEPARATOR}${i}=${chunk}${cookieBase}`;
      i++;
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    
    // Remove direct cookie
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
    
    // Remove any chunks (up to 10 should cover even very large tokens)
    for (let i = 0; i < 10; i++) {
      document.cookie = `${key}${CHUNK_SEPARATOR}${i}=; path=/; max-age=0${domain}`;
    }
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