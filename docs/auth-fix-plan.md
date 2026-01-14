# Login Redirect Loop Fix - Cookie-Based Authentication

## Problem Analysis

**Root Cause:** Authentication model mismatch between the two apps.

| App | Domain | Current Auth Method |
|-----|--------|---------------------|
| bunting-connect | login.buntinggpt.com | Cookie-based (Supabase sessions scoped to `.buntinggpt.com`) |
| performance-pulse | self.buntinggpt.com | URL token-based (`?token=...&user_id=...`) |

**The Loop:**
1. User visits `self.buntinggpt.com`
2. `TokenContext.tsx` checks for URL params `?token=...&user_id=...` → missing
3. Shows "Access Denied - Missing access token" → redirects to `login.buntinggpt.com`
4. User authenticates successfully at login hub
5. Login hub redirects back to `self.buntinggpt.com` (without token params)
6. → Repeats from step 2

## Solution: Convert performance-pulse to Cookie-Based Auth

Align self.buntinggpt.com with the same Supabase cookie-based session model as login.buntinggpt.com.

### Files to Modify

**1. `src/contexts/TokenContext.tsx`** - Replace URL token logic with Supabase session check
- Remove URL parameter extraction
- Add Supabase `getSession()` check
- Use cookie-based session instead of `app_items` token lookup

**2. `src/lib/supabase.ts` or `src/integrations/supabase/client.ts`** - Update Supabase config
- Add cookie storage with `.buntinggpt.com` domain scope
- Match configuration from bunting-connect

**3. `src/components/TokenGate.tsx`** - Update redirect logic
- Include return URL when redirecting to login hub

### Implementation Steps

#### Step 1: Update Supabase Client Configuration
Add cookie-based storage matching bunting-connect:
```typescript
const cookieStorage = {
  getItem: (key) => /* read from document.cookie */,
  setItem: (key, value) => /* write to .buntinggpt.com domain */,
  removeItem: (key) => /* clear cookies */
};

export const supabase = createClient(URL, KEY, {
  auth: {
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

#### Step 2: Replace TokenContext Authentication
Change from:
```typescript
// Current: URL-based token check
const urlToken = params.get('token');
if (!urlToken) {
  setError('Missing access token');
}
```

To:
```typescript
// New: Supabase session check
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect to login hub with return URL
  window.location.href = `https://login.buntinggpt.com?return_url=${encodeURIComponent(window.location.href)}`;
  return;
}
// Use session.user.id for employee lookup
```

#### Step 3: Update Employee Lookup
Change `user_id` URL param to `session.user.id`:
```typescript
const { data: employee } = await supabase
  .from('employees')
  .select('id')
  .eq('user_id', session.user.id)  // ← from session, not URL
  .maybeSingle();
```

#### Step 4: Update TokenGate Redirect
Include return URL in redirect:
```typescript
<a href={`https://login.buntinggpt.com?return_url=${encodeURIComponent(window.location.href)}`}>
  login.buntinggpt.com
</a>
```

### Critical: Supabase Cookie Domain Configuration
Both apps MUST use identical cookie settings:
- Domain: `.buntinggpt.com` (note the leading dot)
- SameSite: `Lax`
- Secure: `true` (production)
- Max-Age: 604800 (7 days)

## User Mapping Decision

**Using `session.user.id` (Supabase UUID)** - Recommended for:
- Consistency with bunting-connect pattern
- Stability (UUIDs don't change, emails can)
- Direct mapping to existing `employees.user_id` column

## Verification Steps

1. Clear all cookies for `*.buntinggpt.com`
2. Visit `https://self.buntinggpt.com` → should redirect to login hub
3. Complete Microsoft authentication
4. Should redirect back to `self.buntinggpt.com` and show app (no loop)
5. Open new browser tab → `self.buntinggpt.com` → should be already logged in
6. Test logout from login hub → self app should require re-auth

## Alternative Considered (Not Recommended)

**Option B: Pass tokens in URL from login hub**
- Modify bunting-connect to redirect with `?token=...&user_id=...`
- Requires generating/managing app-specific tokens
- Less secure (tokens in browser history/logs)
- More complex token management
- Doesn't leverage existing Supabase SSO

## Key Files Reference

| File | Repo | Purpose |
|------|------|---------|
| `src/contexts/TokenContext.tsx` | performance-pulse | Auth logic to modify |
| `src/components/TokenGate.tsx` | performance-pulse | Error display/redirect |
| `src/integrations/supabase/client.ts` | performance-pulse | Supabase config to update |
| `src/lib/supabase.ts` | bunting-connect | Reference cookie config |
| `src/hooks/useBuntingAuth.ts` | bunting-connect | Reference auth hook pattern |
