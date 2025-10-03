# Security Implementation Notes

## Overview
This application now implements **server-side authentication** with proper route protection to prevent unauthorized access.

## Security Features

### ✅ Server-Side Route Protection
- **Next.js Middleware** (`middleware.ts`) runs on the server BEFORE pages render
- All protected routes require valid authentication
- Cannot be bypassed via browser console or client-side manipulation

### ✅ HTTP-Only Cookies
- Session tokens stored in **HTTP-only cookies**
- Not accessible via JavaScript (`document.cookie` or `sessionStorage`)
- Prevents XSS attacks from stealing session tokens

### ✅ Cookie Security
- `httpOnly: true` - Cannot be accessed by JavaScript
- `secure: true` in production - Only sent over HTTPS
- `sameSite: 'lax'` - CSRF protection
- Automatic expiration after 30 minutes of inactivity

### ✅ Rate Limiting
- Failed login attempts are tracked
- Account lockout after 5 failed attempts
- Automatic unlock after 15 minutes

### ✅ Session Management
- Sessions expire after 30 minutes of inactivity
- Activity automatically extends session
- Sessions validated on every protected route access
- Logout properly clears all session data

## Protected Routes

The following routes require authentication:
- `/` - Home page (camera grid)
- `/settings` - Settings page
- `/viewer/*` - Camera viewer pages

Public routes (no authentication required):
- `/login` - Login page
- `/privacy` - Privacy policy

## API Endpoints

### POST `/api/auth/login`
Authenticates user and creates session.

**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "isDefaultCredentials": boolean,
  "expiresAt": number
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "attempts": number,
  "isLocked": boolean,
  "remainingTime": number
}
```

### POST `/api/auth/logout`
Clears session and logs out user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/auth/session`
Checks if user has valid active session.

**Response (Authenticated):**
```json
{
  "authenticated": true,
  "username": "string",
  "expiresAt": number
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "message": "No active session"
}
```

## Security Testing

### ❌ Previously Vulnerable (FIXED)
```javascript
// This NO LONGER WORKS - the old vulnerability is fixed:
sessionStorage.setItem('site_authenticated', 'true');
// Middleware will still block access because no valid HTTP-only cookie exists
```

### ✅ Proper Testing
To test authentication, you must:
1. Navigate to `/login`
2. Enter valid credentials (default: `admin` / `changeme`)
3. System creates HTTP-only session cookies
4. Middleware validates cookies on every request

### Testing Bypass Attempts

Try these to verify security is working:

1. **Direct URL Access (Without Login)**
   - Navigate to `http://localhost:3000/settings` without logging in
   - Expected: Redirect to `/login`

2. **Console Manipulation**
   - Open browser console
   - Try: `sessionStorage.setItem('site_authenticated', 'true')`
   - Navigate to a protected route
   - Expected: Still redirected to `/login` (cookies are checked, not sessionStorage)

3. **Cookie Manipulation**
   - Open browser DevTools > Application > Cookies
   - Try to manually edit or create cookies
   - Expected: Invalid cookies rejected by middleware

4. **Session Expiration**
   - Login successfully
   - Wait 30 minutes without activity
   - Try to access a protected route
   - Expected: Redirect to `/login`

## Default Credentials

**⚠️ IMPORTANT SECURITY WARNING**

Default credentials on first launch:
- Username: `admin`
- Password: `changeme`

**These MUST be changed immediately after first login!**

Go to Settings → Account Security to change credentials.

## Recommendation for Production

Before deploying to production:

1. ✅ Change default credentials immediately
2. ✅ Ensure `NODE_ENV=production` is set (enables secure cookies over HTTPS)
3. ✅ Use HTTPS/SSL certificates (required for secure cookies)
4. ✅ Consider implementing:
   - Stronger password requirements
   - Two-factor authentication (2FA)
   - Password reset functionality
   - Audit logging of authentication events
5. ✅ Review and update rate limiting thresholds as needed
6. ✅ Consider using a more robust session store (Redis, database) for multi-server deployments

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Client Browser                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Protected Page Request                              │   │
│  │  (No session token or invalid token)                │   │
│  └──────────────────────────┬──────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js Server (middleware.ts)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. Check HTTP-only cookies                         │   │
│  │  2. Validate session token                          │   │
│  │  3. Check expiration                                │   │
│  │  └─► No valid session?                              │   │
│  │      → Redirect to /login (BEFORE page renders)    │   │
│  │  └─► Valid session?                                 │   │
│  │      → Allow access + extend session               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Migration from Old System

The old client-side authentication using `sessionStorage` is deprecated but compatibility code remains to clear old sessions during logout. This can be removed in future versions once all users have migrated.

## Security Contact

If you discover a security vulnerability, please report it responsibly.

---

**Last Updated:** 2025-10-03  
**Security Implementation Version:** 2.0
