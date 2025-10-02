# Authentication Guide - WebRTC Cam Suite

## Overview

This guide explains the **dual authentication system** implemented in WebRTC Cam Suite, which clearly separates website access from camera stream access.

## 🔐 Two Authentication Systems

### 1. Site Authentication (Website Login)

**Purpose:** Controls who can access the web application itself.

**Features:**
- Default credentials on first launch: `admin` / `changeme`
- Credentials stored locally in browser (sessionStorage for session, localStorage for config)
- No server validation - purely client-side for local access control
- Can be changed in Settings → Account Security

**Usage:**
```typescript
import { 
  validateSiteLogin, 
  createSiteSession,
  clearSiteAuth,
  hasSiteSession 
} from '@/lib/site-auth';

// Login
const result = validateSiteLogin(username, password);
if (result.success) {
  createSiteSession();
}

// Check if logged in
if (hasSiteSession()) {
  // User is authenticated
}

// Logout
clearSiteAuth();
```

### 2. Camera Authentication (Stream Access)

**Purpose:** Authenticates with MediaMTX server to access camera streams.

**Features:**
- Global default credentials for all cameras
- Per-camera credentials (override defaults)
- Validated against MediaMTX server
- Configured in Settings → Camera Auth

**Usage:**
```typescript
import { 
  getCameraCredentials,
  setDefaultCameraCredentials,
  validateCameraCredentials 
} from '@/lib/camera-auth';

// Get credentials for a camera
const credentials = getCameraCredentials(camera);

// Set global defaults
setDefaultCameraCredentials({ username: 'camuser', password: 'campass' });

// Test credentials
const result = await validateCameraCredentials(serverUrl, cameraPath, credentials);
```

## 🚀 First Launch Experience

### Step-by-Step Flow

1. **Navigate to app** → Redirected to `/login`
2. **See first launch notice** → Default credentials displayed
3. **Login with defaults** → `admin` / `changeme`
4. **See security warning** → Prompted to change credentials
5. **Access settings** → Configure camera credentials and change site password

### User Journey

```
┌─────────────────────────────────────────────────────┐
│  First Visit → /login                               │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ 🔵 First Launch Detected!                 │    │
│  │                                           │    │
│  │ Default credentials:                      │    │
│  │ Username: admin                           │    │
│  │ Password: changeme                        │    │
│  │                                           │    │
│  │ You can change these in Settings          │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  [Enter credentials: admin / changeme]              │
│                                                     │
│  ⬇️ Login Successful                                │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │ ⚠️  Security Warning                       │    │
│  │ You're using default credentials.         │    │
│  │ Please change in Settings.                │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  ⬇️ Redirected to Home                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Home → Settings                                    │
│                                                     │
│  📑 Tabs:                                           │
│  ├─ Server     (MediaMTX URL)                      │
│  ├─ Cameras    (Camera list & per-cam creds)       │
│  ├─ Camera Auth (Global camera credentials)        │
│  ├─ Account    (Change site password) ⭐           │
│  └─ Playback   (Auto-play, muted, etc.)            │
│                                                     │
│  1️⃣ Go to "Camera Auth" tab                         │
│     → Enter MediaMTX credentials                    │
│     → Test against server                           │
│     → Save as defaults                              │
│                                                     │
│  2️⃣ Go to "Account" tab                              │
│     → Change username/password                      │
│     → Must be 8+ characters                         │
│     → Logout required after change                  │
│                                                     │
│  ✅ All configured!                                  │
└─────────────────────────────────────────────────────┘
```

## 📂 File Structure

### New Files

```
webapp/src/lib/
├── site-auth/
│   └── index.ts          # Site authentication (website login)
├── camera-auth/
│   └── index.ts          # Camera authentication (MediaMTX)
└── migration.ts          # Legacy auth migration utilities
```

### Modified Files

```
webapp/src/
├── app/
│   ├── login/
│   │   └── page.tsx      # Enhanced with first-launch notice
│   └── settings/
│       └── page.tsx      # (imports enhanced settings form)
├── components/
│   ├── forms/
│   │   ├── login-form.tsx       # Uses site auth
│   │   └── settings-form.tsx    # Added Camera Auth & Account tabs
│   ├── layout/
│   │   ├── auth-gate.tsx        # Uses site session check
│   │   └── main-layout.tsx      # Updated logout
│   └── player/
│       └── player.tsx            # Uses camera auth
└── lib/
    └── auth/
        └── index.ts              # Legacy (still used for validation helpers)
```

## 🔄 Authentication Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STEP 1: SITE AUTHENTICATION                        │   │
│  │  (Controls access to web interface)                 │   │
│  │                                                      │   │
│  │  • Login with: admin / changeme (default)           │   │
│  │  • Storage: sessionStorage (session)                │   │
│  │  • Storage: localStorage (credentials)              │   │
│  │  • Validation: Local only                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ Grants access to ↓                │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WEB INTERFACE                                      │   │
│  │  • Settings page                                    │   │
│  │  • Camera grid                                      │   │
│  │  • Player component                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          │ When viewing camera ↓             │
│                          ↓                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STEP 2: CAMERA AUTHENTICATION                      │   │
│  │  (Authenticates with MediaMTX server)               │   │
│  │                                                      │   │
│  │  • Credentials: Per-camera OR global defaults       │   │
│  │  • Storage: localStorage                            │   │
│  │  • Validation: Against MediaMTX (401/403)          │   │
│  │  • Sent as: HTTP Basic Auth header                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           │ HTTP Request with Authorization header
                           ↓
                  ┌─────────────────────┐
                  │  MediaMTX Server    │
                  │  (Raspberry Pi)     │
                  │                     │
                  │  Validates camera   │
                  │  credentials        │
                  └─────────────────────┘
```

## 🔧 Configuration

### Environment Variables

See `.env.example`:

```bash
# MediaMTX Server
BABYCAM_SERVER_URL=http://192.168.1.100:8889

# Camera Stream Paths
BABYCAM_CAMERAS=nursery,playroom,kitchen

# Website Authentication (SITE LOGIN)
# Default on first launch: admin / changeme
# Configure in Settings → Account Security

# Camera Authentication (CAMERA STREAMS)
# Configure in Settings → Camera Auth
# Can be global defaults or per-camera

# WebRTC ICE Servers
BABYCAM_ICE_SERVERS=stun:stun.l.google.com:19302
```

### Storage Keys

```typescript
// Site auth
localStorage: 'webcam_site_auth'
sessionStorage: 'site_authenticated'

// Camera auth
localStorage: 'webcam_camera_defaults'

// App config (includes per-camera credentials)
localStorage: 'babycam_config'
```

## 🛡️ Security Best Practices

### For Site Authentication

1. **Change default credentials immediately**
   - Go to Settings → Account Security
   - Use strong password (8+ characters)
   - Choose unique username

2. **Understand limitations**
   - Client-side only (browser storage)
   - No server-side validation
   - Suitable for local/personal use
   - Not for public internet exposure

### For Camera Authentication

1. **Use different credentials than site login**
   - Separate concerns
   - Limit blast radius

2. **Set per-camera credentials for sensitive cameras**
   - Each camera can have unique creds
   - Configured in Settings → Cameras

3. **Rotate regularly**
   - Update on MediaMTX server
   - Update in app settings
   - Test after changes

4. **Never expose publicly**
   - Don't commit to git
   - Don't share in screenshots
   - Use environment variables if needed

## 📝 API Reference

### Site Auth Module (`lib/site-auth`)

```typescript
// Check if first launch
isFirstLaunch(): boolean

// Get site config
getSiteAuthConfig(): SiteAuthConfig

// Set credentials
setSiteCredentials(credentials: SiteCredentials): void

// Validate login
validateSiteLogin(username: string, password: string): {
  success: boolean;
  message?: string;
  isDefaultCredentials?: boolean;
}

// Session management
createSiteSession(): void
hasSiteSession(): boolean
clearSiteAuth(): void

// Check if using defaults
shouldPromptPasswordChange(): boolean
```

### Camera Auth Module (`lib/camera-auth`)

```typescript
// Get/set defaults
getDefaultCameraCredentials(): Credentials | null
setDefaultCameraCredentials(credentials: Credentials): void

// Get credentials for specific camera
getCameraCredentials(camera: Camera): Credentials | null

// Validate against server
validateCameraCredentials(
  serverUrl: string,
  cameraPath: string,
  credentials: Credentials
): Promise<{ success: boolean; error?: string }>
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] **First Launch**
  - [ ] See default credentials notice
  - [ ] Login with admin/changeme
  - [ ] See security warning
  
- [ ] **Change Site Credentials**
  - [ ] Go to Settings → Account
  - [ ] Change username/password
  - [ ] Logout and re-login
  
- [ ] **Configure Camera Credentials**
  - [ ] Go to Settings → Camera Auth
  - [ ] Enter MediaMTX credentials
  - [ ] Test against server
  - [ ] See success/failure message
  
- [ ] **Per-Camera Credentials**
  - [ ] Go to Settings → Cameras
  - [ ] Add camera with specific credentials
  - [ ] View stream
  - [ ] Verify uses camera-specific creds

- [ ] **Logout**
  - [ ] Click Logout
  - [ ] Verify redirected to login
  - [ ] Verify can't access protected pages

### Automated Tests

```typescript
// Example test
test('first launch shows default credentials', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=First launch detected')).toBeVisible();
  await expect(page.locator('text=admin / changeme')).toBeVisible();
});

test('site auth and camera auth are separate', async ({ page }) => {
  // Login to site
  await loginToSite(page, 'admin', 'changeme');
  
  // Set different camera credentials
  await page.goto('/settings');
  await page.click('text=Camera Auth');
  await setCameraCredentials(page, 'camuser', 'campass');
  
  // Verify stored separately
  const siteAuth = await page.evaluate(() => 
    sessionStorage.getItem('site_authenticated')
  );
  const cameraAuth = await page.evaluate(() =>
    localStorage.getItem('webcam_camera_defaults')
  );
  
  expect(siteAuth).toBe('true');
  expect(JSON.parse(cameraAuth)).toEqual({
    username: 'camuser',
    password: 'campass'
  });
});
```

## 🐛 Troubleshooting

### "No camera credentials available"

**Problem:** Seeing this error when trying to view a camera.

**Solution:**
1. Go to Settings → Camera Auth
2. Enter MediaMTX credentials
3. Test against server
4. Save settings
5. Refresh camera view

### "Invalid username or password" (Site Login)

**Problem:** Can't login to website.

**Solutions:**
- If first launch: Use `admin` / `changeme`
- If changed: Use your custom credentials
- If forgotten: Clear browser localStorage and start fresh

### Camera streams not connecting

**Problem:** Credentials are configured but streams fail.

**Solutions:**
1. Verify MediaMTX server is running
2. Check credentials on MediaMTX server
3. Test credentials in Settings → Camera Auth
4. Check browser console for auth errors (401/403)

### After changing site password, still see warning

**Problem:** Changed password but still seeing "using default credentials".

**Solution:** Refresh the page or logout/login again.

## 🔄 Migration from Legacy System

If you're upgrading from a previous version that used a single credential system:

```typescript
import { migrateLegacyAuth } from '@/lib/migration';

// Run on app initialization
const result = migrateLegacyAuth();

if (result.migrated) {
  // Old credentials moved to camera auth
  // User needs to set up site credentials
  console.log('Migration complete. Please set up site credentials.');
}
```

## 📚 Additional Resources

- [MediaMTX Documentation](https://github.com/bluenviron/mediamtx)
- [WHEP Protocol Specification](https://www.ietf.org/archive/id/draft-murillo-whep-00.html)
- [WebRTC Security Best Practices](https://webrtc-security.github.io/)

---

**Last Updated:** 2025-10-02
**Version:** 2.0.0
**Author:** WebRTC Cam Suite Team
