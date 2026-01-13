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
  const returnUrl = params.get('return_url');
  
  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return returnUrl;
  }
  
  // Default redirect:
  // - In dev/preview stay within the app
  // - In prod, default to this auth hub origin (login.buntinggpt.com)
  return isDevelopment() ? '/' : window.location.origin;
};

// Cookie storage for cross-subdomain sessions
export const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(`${key}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
    const secure = isDevelopment() ? '' : '; Secure';
    document.cookie = `${key}=${encodeURIComponent(value)}${domain}; path=/; max-age=${60*60*24*7}; SameSite=Lax${secure}`;
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return;
    const domain = isDevelopment() ? '' : '; domain=.buntinggpt.com';
    document.cookie = `${key}=; path=/; max-age=0${domain}`;
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
