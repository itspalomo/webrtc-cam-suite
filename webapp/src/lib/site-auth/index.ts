/**
 * Site authentication - controls access to the web application itself
 * This is SEPARATE from camera credentials which authenticate with MediaMTX
 */

export interface SiteCredentials {
  username: string;
  password: string;
}

export interface SiteAuthConfig {
  isFirstLaunch: boolean;
  requiresSetup: boolean;
  credentials?: SiteCredentials;
}

const STORAGE_KEY = 'webcam_site_auth';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'changeme';

/**
 * Check if this is the first launch (no site credentials configured)
 */
export function isFirstLaunch(): boolean {
  if (typeof window === 'undefined') return false;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  return !stored;
}

/**
 * Get site authentication configuration
 */
export function getSiteAuthConfig(): SiteAuthConfig {
  if (typeof window === 'undefined') {
    return { isFirstLaunch: true, requiresSetup: true };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  
  if (!stored) {
    // First launch - use default credentials
    return {
      isFirstLaunch: true,
      requiresSetup: false, // Can use defaults
      credentials: {
        username: DEFAULT_USERNAME,
        password: DEFAULT_PASSWORD,
      },
    };
  }

  try {
    const config = JSON.parse(stored) as SiteAuthConfig;
    return {
      ...config,
      isFirstLaunch: false,
      requiresSetup: false,
    };
  } catch {
    return { isFirstLaunch: true, requiresSetup: true };
  }
}

/**
 * Set site credentials (replaces defaults)
 */
export function setSiteCredentials(credentials: SiteCredentials): void {
  const config: SiteAuthConfig = {
    isFirstLaunch: false,
    requiresSetup: false,
    credentials,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Validate site login attempt
 */
export function validateSiteLogin(
  username: string,
  password: string
): { success: boolean; message?: string; isDefaultCredentials?: boolean } {
  const config = getSiteAuthConfig();
  
  if (!config.credentials) {
    return { success: false, message: 'No site credentials configured' };
  }

  const isValid =
    username === config.credentials.username &&
    password === config.credentials.password;

  if (!isValid) {
    return { success: false, message: 'Invalid username or password' };
  }

  const isDefault =
    username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD;

  return {
    success: true,
    isDefaultCredentials: isDefault,
  };
}

/**
 * Clear site authentication (logout)
 */
export function clearSiteAuth(): void {
  // Note: We don't clear the stored credentials, just the session
  // This allows the same credentials to be used on next login
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('site_authenticated');
  }
}

/**
 * Check if user should be prompted to change default credentials
 */
export function shouldPromptPasswordChange(): boolean {
  const config = getSiteAuthConfig();
  
  return (
    config.credentials?.username === DEFAULT_USERNAME &&
    config.credentials?.password === DEFAULT_PASSWORD
  );
}

/**
 * Check if user has an active site session
 */
export function hasSiteSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('site_authenticated') === 'true';
}

/**
 * Create a site session (called after successful login)
 */
export function createSiteSession(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('site_authenticated', 'true');
}

/**
 * Get default credentials info (for display purposes only)
 */
export function getDefaultCredentialsInfo(): { username: string; password: string } {
  return {
    username: DEFAULT_USERNAME,
    password: DEFAULT_PASSWORD,
  };
}
