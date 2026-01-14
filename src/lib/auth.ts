/**
 * Minimal Auth Utilities
 * 
 * Only essential functions for the auth hub.
 * No duplicate storage logic. No rate limiting.
 */

export const isDevelopment = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.lovableproject.com');
};

export const isValidReturnUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    if (isDevelopment() && (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')) {
      return true;
    }
    return parsed.hostname.endsWith('.buntinggpt.com') || parsed.hostname === 'buntinggpt.com';
  } catch {
    return false;
  }
};

export const getReturnUrl = (): string => {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('return_url') || params.get('returnUrl');
  
  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return returnUrl;
  }
  
  // Default: stay on login hub - don't redirect to main domain
  return '/';
};
// Deploy trigger Wed, Jan 14, 2026  6:55:04 AM
