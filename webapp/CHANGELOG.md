# Changelog - WebRTC Cam Suite

## [2.0.0] - 2025-10-02

### 🎉 Major Changes - Enhanced Authentication System

This release implements a **dual authentication system** that clearly separates website access from camera stream authentication, providing better security and user experience.

### ✨ New Features

#### 1. Default Site Credentials on First Launch
- **Default credentials**: `admin` / `changeme`
- Automatic first-launch detection with helpful notice
- No manual setup required for initial access
- Security warnings for default credential usage

#### 2. Separate Authentication Systems

**Site Authentication (Website Login)**
- Controls access to the web application interface
- Stored locally in browser (sessionStorage + localStorage)
- No server-side validation (suitable for local/personal use)
- Can be changed in Settings → Account Security

**Camera Authentication (Stream Access)**
- Authenticates with MediaMTX server for camera streams
- Global default credentials OR per-camera credentials
- Validated against MediaMTX server (401/403 responses)
- Configured in Settings → Camera Auth

#### 3. Enhanced Settings Page

**New Tabs:**
- **Camera Auth**: Configure global default credentials for MediaMTX access
- **Account Security**: Change website login credentials

**Features:**
- Test camera credentials against live server
- Real-time validation and feedback
- Per-camera credential overrides
- Security best practices guidance

#### 4. Improved User Experience

**Login Flow:**
- Clear first-launch messaging
- Separation between site and camera credentials explained
- Visual warnings for default credentials
- Smooth onboarding process

**Settings:**
- Organized tabs for different configuration aspects
- Visual feedback for all actions
- Helpful explanations and tooltips
- Validation before saving

### 🔧 Technical Changes

#### New Modules

```
webapp/src/lib/
├── site-auth/index.ts       # Site authentication system
├── camera-auth/index.ts     # Camera authentication system
└── migration.ts             # Legacy auth migration utilities
```

#### Modified Files

**Authentication:**
- `app/login/page.tsx` - Enhanced with first-launch detection
- `components/forms/login-form.tsx` - Uses site authentication
- `components/layout/auth-gate.tsx` - Checks site session
- `components/layout/main-layout.tsx` - Updated logout logic

**Settings:**
- `components/forms/settings-form.tsx` - Added Camera Auth & Account tabs
- `app/settings/page.tsx` - Updated imports

**Player:**
- `components/player/player.tsx` - Uses camera authentication

**Configuration:**
- `.env.example` - Updated with clear documentation
- `config/index.ts` - Type improvements

#### API Changes

**New Exports:**

```typescript
// From lib/site-auth
isFirstLaunch(): boolean
getSiteAuthConfig(): SiteAuthConfig
setSiteCredentials(credentials: SiteCredentials): void
validateSiteLogin(username, password): ValidationResult
createSiteSession(): void
hasSiteSession(): boolean
clearSiteAuth(): void
shouldPromptPasswordChange(): boolean

// From lib/camera-auth
getDefaultCameraCredentials(): Credentials | null
setDefaultCameraCredentials(credentials: Credentials): void
getCameraCredentials(camera: Camera): Credentials | null
validateCameraCredentials(serverUrl, cameraPath, credentials): Promise<Result>
```

**Deprecated (but still available):**
- `lib/auth/index.ts` - Now primarily used for validation helpers

### 🔒 Security Improvements

1. **Separate Credential Storage**
   - Site credentials: `localStorage` (config) + `sessionStorage` (session)
   - Camera credentials: `localStorage` (separate keys)
   - Clear separation prevents credential confusion

2. **Validation**
   - Camera credentials validated against MediaMTX server
   - Per-camera credential support for granular access control
   - Password strength requirements (8+ characters)

3. **User Warnings**
   - Visible warnings when using default credentials
   - Prompted to change defaults after first login
   - Security best practices documented in settings

### 📚 Documentation

**New Files:**
- `AUTHENTICATION_GUIDE.md` - Comprehensive authentication documentation
- `CHANGELOG.md` - This file

**Updated Files:**
- `.env.example` - Clear separation of authentication types
- `README.md` (if exists) - Updated with new authentication info

### 🔄 Migration

**For Existing Users:**

The migration utility (`lib/migration.ts`) automatically:
1. Detects legacy single-credential system
2. Migrates old credentials to camera auth
3. Prompts for site credential setup

**Manual Steps (if needed):**
1. Clear browser localStorage: `localStorage.clear()`
2. Refresh page
3. Use default credentials: `admin` / `changeme`
4. Configure camera credentials in Settings → Camera Auth
5. Change site password in Settings → Account Security

### 🧪 Testing

**Build Status:** ✅ Successful
- TypeScript compilation: ✅ Pass
- ESLint (warnings only): ⚠️  Minor warnings
- Production build: ✅ Success

**Manual Testing Checklist:**
- [x] First launch shows default credentials
- [x] Login with default credentials works
- [x] Security warnings displayed
- [x] Can change site credentials
- [x] Can configure camera credentials
- [x] Can test camera credentials
- [x] Per-camera credentials work
- [x] Logout clears site session
- [x] Auth gate protects routes

### ⚠️  Breaking Changes

1. **Authentication System**
   - Old single-credential system replaced with dual auth
   - Existing users must configure camera credentials separately
   - Session storage keys changed

2. **Login Flow**
   - Default credentials required on first launch
   - New login page UI and messaging

3. **Settings Page**
   - New tab structure (5 tabs instead of 3)
   - Credentials now split across multiple tabs

### 🐛 Bug Fixes

- Fixed credential reuse ambiguity
- Improved error messages for authentication failures
- Better handling of missing credentials
- Type safety improvements

### 📦 Dependencies

No new dependencies added. Uses existing:
- Next.js 15.5.2
- React 18+
- TypeScript
- Tailwind CSS
- Lucide Icons
- Sonner (toasts)
- Framer Motion

### 🎯 Future Enhancements

Potential improvements for future versions:
- [ ] Multi-user support with server-side validation
- [ ] Role-based access control (admin, viewer, etc.)
- [ ] OAuth/SSO integration
- [ ] Audit logging for authentication events
- [ ] Password recovery mechanism
- [ ] Two-factor authentication
- [ ] Encrypted credential storage
- [ ] Session timeout configuration

### 📝 Notes

**Important Security Considerations:**

This authentication system is designed for **local/personal use** scenarios:
- Site authentication is client-side only
- Suitable for home networks or trusted environments
- **NOT recommended** for public internet exposure
- For production use, implement server-side authentication

**Recommended Setup:**
1. Change default site credentials immediately
2. Use strong, unique passwords
3. Keep camera credentials different from site credentials
4. Regularly rotate credentials on MediaMTX server
5. Use per-camera credentials for sensitive cameras

### 🙏 Acknowledgments

This implementation was designed based on the comprehensive plan:
- Clear separation of concerns
- User-friendly onboarding
- Security-first approach
- Backward compatibility considerations

---

**Full Diff:** [View Changes](https://github.com/your-repo/compare/v1.0.0...v2.0.0)
**Documentation:** [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)
**Issues:** Report bugs on GitHub Issues
