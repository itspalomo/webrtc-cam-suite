# Security Implementation Test Checklist

## Pre-Deployment Security Verification

Use this checklist to verify that authentication security is working correctly.

---

## ✅ Test 1: Direct URL Access (Unauthenticated)

**Test:** Try to access protected routes without logging in

### Steps:
1. Open a new incognito/private browser window
2. Navigate to `http://localhost:3000/`
3. Navigate to `http://localhost:3000/settings`
4. Navigate to `http://localhost:3000/viewer/camera1`

### Expected Result:
- ✅ All requests should immediately redirect to `/login`
- ✅ Protected pages should NOT render (even briefly)
- ✅ URL should change to `/login` before any content loads

### Status: [ ]

---

## ✅ Test 2: Console Bypass Attempt (Old Vulnerability)

**Test:** Try to bypass authentication using browser console (the old exploit)

### Steps:
1. Open browser console (F12)
2. Run: `sessionStorage.setItem('site_authenticated', 'true')`
3. Run: `sessionStorage.setItem('site_last_activity', Date.now().toString())`
4. Try to navigate to `http://localhost:3000/`

### Expected Result:
- ✅ Still redirected to `/login`
- ✅ sessionStorage manipulation has NO EFFECT
- ✅ Middleware checks server-side cookies, not client-side storage

### Status: [ ]

---

## ✅ Test 3: Successful Login

**Test:** Login with valid credentials

### Steps:
1. Navigate to `/login`
2. Enter credentials:
   - Username: `admin`
   - Password: `changeme`
3. Click "Sign In to Website"

### Expected Result:
- ✅ Redirected to `/` (home page)
- ✅ Can access all protected routes
- ✅ See camera grid/content
- ✅ Warning about default credentials (first time only)

### Status: [ ]

---

## ✅ Test 4: Cookie Verification

**Test:** Verify HTTP-only cookies are set correctly

### Steps:
1. Login successfully
2. Open DevTools > Application > Cookies
3. Look for `site_session` and `site_session_data`

### Expected Result:
- ✅ Both cookies exist
- ✅ `HttpOnly` flag is checked (✓)
- ✅ `SameSite` is set to `Lax`
- ✅ Cookies have expiration time (~30 minutes)
- ✅ Cannot access via `document.cookie` in console

### Status: [ ]

---

## ✅ Test 5: Invalid Login Attempts

**Test:** Rate limiting and failed login handling

### Steps:
1. Logout (if logged in)
2. Try to login with wrong password 5 times
3. Try 6th time

### Expected Result:
- ✅ First 5 attempts: Show remaining attempts (4, 3, 2, 1, 0)
- ✅ After 5 attempts: Account locked with countdown timer
- ✅ Cannot login even with correct password during lockout
- ✅ Lockout expires after 15 minutes

### Status: [ ]

---

## ✅ Test 6: Logout Functionality

**Test:** Verify logout clears session properly

### Steps:
1. Login successfully
2. Click "Logout" button
3. Try to navigate back to `/`

### Expected Result:
- ✅ Redirected to `/login`
- ✅ Session cookies are cleared
- ✅ Cannot access protected routes
- ✅ Must login again

### Status: [ ]

---

## ✅ Test 7: Session Timeout

**Test:** Session expires after inactivity

### Steps:
1. Login successfully
2. Wait 31 minutes without any activity
3. Try to navigate to any protected route

### Expected Result:
- ✅ Redirected to `/login`
- ✅ Session expired message (if implemented)
- ✅ Must login again

**Note:** For faster testing, temporarily change `SESSION_DURATION` in the API routes to 60000 (1 minute)

### Status: [ ]

---

## ✅ Test 8: Session Extension (Activity)

**Test:** Session extends with user activity

### Steps:
1. Login successfully
2. Check cookie expiration time (DevTools)
3. Wait 5 minutes
4. Navigate to different page or refresh
5. Check cookie expiration time again

### Expected Result:
- ✅ Cookie expiration time is extended with each request
- ✅ Session stays alive while user is active
- ✅ No unexpected logouts during normal usage

### Status: [ ]

---

## ✅ Test 9: Multiple Tabs

**Test:** Session works across multiple tabs

### Steps:
1. Login in Tab 1
2. Open new tab (Tab 2)
3. Navigate to protected route in Tab 2

### Expected Result:
- ✅ Tab 2 can access protected routes
- ✅ Same session across all tabs
- ✅ Logout in one tab logs out all tabs

### Status: [ ]

---

## ✅ Test 10: Cookie Tampering

**Test:** Verify tampered cookies are rejected

### Steps:
1. Login successfully
2. Open DevTools > Application > Cookies
3. Try to modify `site_session` cookie value
4. Refresh or navigate to protected route

### Expected Result:
- ✅ Invalid cookie rejected
- ✅ Redirected to `/login`
- ✅ Must login again

### Status: [ ]

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Changed default credentials from `admin`/`changeme`
- [ ] `NODE_ENV=production` environment variable is set
- [ ] HTTPS/SSL is enabled (required for secure cookies)
- [ ] Tested all scenarios above in production-like environment
- [ ] Reviewed rate limiting thresholds
- [ ] Documented credentials management process
- [ ] Set up monitoring for failed login attempts
- [ ] Consider implementing 2FA (optional but recommended)

---

## Quick Verification Script

Run this in your browser console AFTER logging in to verify security:

```javascript
// Test 1: Verify you CANNOT read session cookie
console.log('Session cookie (should be undefined):', document.cookie.includes('site_session'));

// Test 2: Verify sessionStorage manipulation does nothing
sessionStorage.clear();
console.log('Cleared sessionStorage - you should still be logged in');

// Test 3: Check session API
fetch('/api/auth/session', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('Session check:', d.authenticated ? '✅ Valid' : '❌ Invalid'));
```

---

## Reporting Issues

If any test fails, please check:
1. Next.js development server is running (`npm run dev`)
2. No caching issues (try incognito mode)
3. Console for error messages
4. Network tab for failed requests

If issues persist, review:
- `middleware.ts` - Route protection logic
- `/api/auth/*` routes - Authentication endpoints
- Browser cookie settings

---

**Last Updated:** 2025-10-03
