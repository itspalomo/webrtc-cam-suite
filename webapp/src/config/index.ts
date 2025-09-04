import { AppConfig, Camera, Credentials, RTCIceServer } from '@/types';

/**
 * Configuration management for the BabyCam Viewer app
 * Handles environment variables, localStorage, and default values
 */

// Environment variable access with defaults
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return process.env[key] || defaultValue;
};

const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = process.env[key];
  if (!value) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return value.split(',').map(s => s.trim());
  }
};

// Default configuration values
export const DEFAULT_CONFIG: Partial<AppConfig> = {
  serverUrl: getEnvVar('BABYCAM_SERVER_URL', 'http://localhost:8889'),
  iceServers: getEnvArray('BABYCAM_ICE_SERVERS', ['stun:stun.l.google.com:19302']).map(url => ({
    urls: url.startsWith('stun:') || url.startsWith('turn:') ? url : `stun:${url}`
  })),
  autoPlay: true,
  startMuted: true,
  rememberCredentials: getEnvVar('BABYCAM_DEFAULT_REMEMBER', 'false').toLowerCase() === 'true',
  cameras: getEnvArray('BABYCAM_CAMERAS', ['cam']).map((name, index) => ({
    id: `camera-${index}`,
    name: name === 'cam' ? 'Baby Camera' : name.charAt(0).toUpperCase() + name.slice(1),
    path: name,
    status: 'unknown' as const,
  })),
};

// Local storage keys
const STORAGE_KEYS = {
  APP_CONFIG: 'babycam_config',
  CREDENTIALS: 'babycam_credentials',
  UI_PREFERENCES: 'babycam_ui_prefs',
} as const;

/**
 * Load configuration from localStorage with environment variable fallbacks
 * Safe for server-side rendering
 */
export const loadConfig = (): AppConfig => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG as AppConfig;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
    if (stored) {
      const parsedConfig = JSON.parse(stored) as Partial<AppConfig>;
      // Merge with defaults to ensure all required fields are present
      return {
        ...DEFAULT_CONFIG,
        ...parsedConfig,
        // Ensure cameras array is properly typed
        cameras: parsedConfig.cameras?.map((cam: any) => ({
          ...cam,
          lastSeen: cam.lastSeen ? new Date(cam.lastSeen) : undefined,
        })) || DEFAULT_CONFIG.cameras || [],
      } as AppConfig;
    }
  } catch (error) {
    console.warn('Failed to load config from localStorage:', error);
  }

  return DEFAULT_CONFIG as AppConfig;
};

/**
 * Save configuration to localStorage
 */
export const saveConfig = (config: AppConfig): void => {
  try {
    // Create a serializable version (convert Date objects to ISO strings)
    const serializableConfig = {
      ...config,
      cameras: config.cameras.map(cam => ({
        ...cam,
        lastSeen: cam.lastSeen?.toISOString(),
      })),
    };
    localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(serializableConfig));
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
  }
};

/**
 * Load credentials from localStorage (only if remember is enabled)
 * Safe for server-side rendering
 */
export const loadCredentials = (): Credentials | null => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CREDENTIALS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load credentials from localStorage:', error);
    return null;
  }
};

/**
 * Save credentials to localStorage (only if remember is enabled)
 */
export const saveCredentials = (credentials: Credentials): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CREDENTIALS, JSON.stringify(credentials));
  } catch (error) {
    console.error('Failed to save credentials to localStorage:', error);
  }
};

/**
 * Clear credentials from localStorage
 */
export const clearCredentials = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CREDENTIALS);
  } catch (error) {
    console.warn('Failed to clear credentials from localStorage:', error);
  }
};

/**
 * Clear all stored data
 */
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear all data from localStorage:', error);
  }
};

/**
 * Build WHEP URL for a camera stream
 * MediaMTX uses /{path}/whep endpoint format
 */
export const buildWhepUrl = (serverUrl: string, cameraPath: string): string => {
  const baseUrl = serverUrl.replace(/\/$/, ''); // Remove trailing slash
  const path = cameraPath.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${path}/whep`;
};

/**
 * Validate server URL format
 */
export const validateServerUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Test server connectivity
 */
export const testServerConnection = async (serverUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(serverUrl, {
      method: 'HEAD',
      mode: 'no-cors', // Avoid CORS issues during connectivity test
    });
    return true; // If we get any response, server is reachable
  } catch {
    return false;
  }
};
