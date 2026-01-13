// Auth utility functions for the Bunting Authentication Hub

// Check if running in development mode
export const isDevelopment = (): boolean => {
  const host = window.location.hostname;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.lovableproject.com')
  );
};

// Validate return URL is within buntinggpt.com domain
export const isValidReturnUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Allow localhost in development
    if (isDevelopment() && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    // Only allow *.buntinggpt.com in production
    return parsed.hostname.endsWith('.buntinggpt.com') || parsed.hostname === 'buntinggpt.com';
  } catch {
    return false;
  }
};

// Get return URL from query params with validation
export const getReturnUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  // Support both param names - self.buntinggpt.com uses 'returnUrl'
  const returnUrl = params.get('return_url') || params.get('returnUrl');
  
  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return returnUrl;
  }
  
  // Default to main app, NOT login.buntinggpt.com
  return isDevelopment() ? '/' : 'https://buntinggpt.com';
};

// Cookie chunking constants (must match src/lib/supabase.ts)
const MAX_COOKIE_SIZE = 3500;
const CHUNK_SEPARATOR = '__chunk__';

// Cookie storage for cross-subdomain sessions with chunking support
export const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ');
    
    // First try direct read
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
    const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
    const secure = isDevelopment() ? '' : '; Secure';
    const cookieBase = `${domain}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
    
    // Clear existing first
    cookieStorage.removeItem(key);
    
    const encoded = encodeURIComponent(value);
    
    if (encoded.length <= MAX_COOKIE_SIZE) {
      document.cookie = `${key}=${encoded}${cookieBase}`;
      return;
    }
    
    // Chunk large values
    let i = 0;
    for (let pos = 0; pos < encoded.length; pos += MAX_COOKIE_SIZE) {
      const chunk = encoded.slice(pos, pos + MAX_COOKIE_SIZE);
      document.cookie = `${key}${CHUNK_SEPARATOR}${i}=${chunk}${cookieBase}`;
      i++;
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
    
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
    
    for (let i = 0; i < 10; i++) {
      document.cookie = `${key}${CHUNK_SEPARATOR}${i}=; path=/; max-age=0${domain}`;
    }
  }
};

// Rate limiting for badge login attempts
const loginAttempts: Map<string, { count: number; firstAttempt: number }> = new Map();

export const checkRateLimit = (badgeNumber: string): { allowed: boolean; remainingAttempts: number; waitTime?: number } => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const attempts = loginAttempts.get(badgeNumber);
  
  if (!attempts) {
    loginAttempts.set(badgeNumber, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Reset if window has passed
  if (now - attempts.firstAttempt > windowMs) {
    loginAttempts.set(badgeNumber, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }
  
  // Check if within limits
  if (attempts.count >= maxAttempts) {
    const waitTime = Math.ceil((windowMs - (now - attempts.firstAttempt)) / 1000 / 60);
    return { allowed: false, remainingAttempts: 0, waitTime };
  }
  
  // Increment attempts
  attempts.count++;
  return { allowed: true, remainingAttempts: maxAttempts - attempts.count };
};

// Reset rate limit on successful login
export const resetRateLimit = (badgeNumber: string): void => {
  loginAttempts.delete(badgeNumber);
};
