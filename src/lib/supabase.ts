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

const CHUNK_SIZE = 3500; // Leave room for key name, encoding overhead, and cookie attributes

const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const allCookies = document.cookie;
    
    // First, try to get direct value (non-chunked)
    const directMatch = allCookies.match(new RegExp(`(^| )${key}=([^;]+)`));
    if (directMatch) {
      const value = decodeURIComponent(directMatch[2]);
      console.log('[cookieStorage.getItem] Found direct cookie', { key, valueLength: value.length });
      return value;
    }
    
    // Try to reassemble chunked cookies
    const chunks: string[] = [];
    let chunkIndex = 0;
    
    while (true) {
      const chunkKey = `${key}_chunk_${chunkIndex}`;
      const chunkMatch = allCookies.match(new RegExp(`(^| )${chunkKey}=([^;]+)`));
      
      if (!chunkMatch) break;
      
      chunks.push(decodeURIComponent(chunkMatch[2]));
      chunkIndex++;
    }
    
    if (chunks.length > 0) {
      const reassembled = chunks.join('');
      console.log('[cookieStorage.getItem] Reassembled from chunks', { 
        key, 
        chunkCount: chunks.length, 
        totalLength: reassembled.length 
      });
      return reassembled;
    }
    
    console.log('[cookieStorage.getItem] No cookie found', { key });
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    
    const devMode = isDev();
    const domain = devMode ? '' : '; domain=.buntinggpt.com';
    const secure = devMode ? '' : '; Secure';
    
    // First, clear any existing chunks for this key
    const existingCookies = document.cookie;
    let chunkIndex = 0;
    while (true) {
      const chunkKey = `${key}_chunk_${chunkIndex}`;
      if (!existingCookies.includes(chunkKey)) break;
      document.cookie = `${chunkKey}=; path=/; max-age=0${domain}`;
      chunkIndex++;
    }
    // Also clear the direct key if it exists
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
    
    // If value fits in one cookie, store directly
    if (value.length <= CHUNK_SIZE) {
      const cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${domain}${secure}`;
      document.cookie = cookieString;
      console.log('[cookieStorage.setItem] Stored directly', { key, valueLength: value.length });
      return;
    }
    
    // Split into chunks
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    
    console.log('[cookieStorage.setItem] Splitting into chunks', { 
      key, 
      valueLength: value.length, 
      chunkCount: chunks.length 
    });
    
    // Store each chunk
    chunks.forEach((chunk, index) => {
      const chunkKey = `${key}_chunk_${index}`;
      const cookieString = `${chunkKey}=${encodeURIComponent(chunk)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${domain}${secure}`;
      document.cookie = cookieString;
      
      // Verify chunk was set
      const verifyMatch = document.cookie.includes(chunkKey);
      console.log('[cookieStorage.setItem] Chunk stored', { 
        chunkKey, 
        chunkLength: chunk.length, 
        success: verifyMatch 
      });
    });
  },
  
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDev() ? '' : '; domain=.buntinggpt.com';
    
    console.log('[cookieStorage.removeItem]', { key });
    
    // Remove direct key
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
    
    // Remove any chunks
    let chunkIndex = 0;
    while (chunkIndex < 10) { // Safety limit
      const chunkKey = `${key}_chunk_${chunkIndex}`;
      document.cookie = `${chunkKey}=; path=/; max-age=0${domain}`;
      chunkIndex++;
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
