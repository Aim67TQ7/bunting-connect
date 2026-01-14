# Authentication Fix - Implementation Summary

## Status: Deployed (Jan 14, 2026)

### Changes Made

#### bunting-connect (login.buntinggpt.com)
| File | Change |
|------|--------|
| `src/pages/Login.tsx` | Use `getReturnUrl()` for both `return_url` and `returnUrl` params |
| `src/lib/auth.ts` | Default to `/` instead of `https://buntinggpt.com` |
| `src/pages/MicrosoftCallback.tsx` | Default to `/` instead of `https://buntinggpt.com` |

#### performance-pulse (self.buntinggpt.com)
| File | Change |
|------|--------|
| `src/contexts/TokenContext.tsx` | Replaced URL token params with Supabase session check |
| `src/components/TokenGate.tsx` | Added `return_url` param to login redirect |

### Root Cause
1. **Parameter mismatch**: Login.tsx checked `returnUrl` but self app sent `return_url`
2. **Bad default**: When return URL was missing/invalid, defaulted to `buntinggpt.com` causing loop

### How It Works Now
```
1. User visits self.buntinggpt.com
2. TokenContext checks for Supabase session cookie
3. If no session → redirect to login.buntinggpt.com?return_url=...
4. User logs in via Microsoft/Badge
5. Login hub sets session cookie (scoped to .buntinggpt.com)
6. Callback reads auth_return_url cookie → redirects back
7. Session cookie present → auth succeeds!
```

### Test Steps
1. Clear cookies for `*.buntinggpt.com`
2. Visit `https://self.buntinggpt.com`
3. Should redirect to login hub (not loop)
4. Complete Microsoft login
5. Should return to self app successfully

### Key Configuration
Both apps use identical Supabase cookie settings:
- Domain: `.buntinggpt.com`
- SameSite: `Lax`
- Secure: `true` (production)
- Max-Age: 7 days
