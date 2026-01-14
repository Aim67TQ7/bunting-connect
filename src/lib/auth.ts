/**
 * Minimal Auth Utilities
 *
 * Only essential functions for the auth hub.
 * No duplicate storage logic. No rate limiting.
 */

export const isDevelopment = (): boolean => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

export const isValidReturnUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Only allow http/https protocols
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    // Allow localhost only when running in development
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return isDevelopment();
    }

    // Allow buntinggpt.com and all subdomains
    return parsed.hostname.endsWith(".buntinggpt.com") || parsed.hostname === "buntinggpt.com";
  } catch {
    return false;
  }
};

export const getReturnUrl = (): string => {
  if (typeof window === "undefined") return "/";

  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get("return_url") || params.get("returnUrl");

  if (returnUrl && isValidReturnUrl(returnUrl)) {
    return returnUrl;
  }

  return "/";
};
