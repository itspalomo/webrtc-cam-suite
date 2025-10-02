/**
 * Camera authentication - manages credentials for MediaMTX camera access
 * This is SEPARATE from site authentication
 */

import { Credentials, Camera } from '@/types';

const STORAGE_KEY = 'webcam_camera_defaults';

/**
 * Global default credentials for cameras (used when camera has no specific creds)
 */
export function getDefaultCameraCredentials(): Credentials | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Set global default credentials for cameras
 */
export function setDefaultCameraCredentials(credentials: Credentials): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

/**
 * Clear default camera credentials
 */
export function clearDefaultCameraCredentials(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get credentials for a specific camera
 * Priority: camera.credentials > global defaults > null
 */
export function getCameraCredentials(camera: Camera): Credentials | null {
  // 1. Check camera-specific credentials
  if (camera.credentials) {
    return camera.credentials;
  }

  // 2. Fallback to global defaults
  return getDefaultCameraCredentials();
}

/**
 * Validate camera credentials against MediaMTX server
 */
export async function validateCameraCredentials(
  serverUrl: string,
  cameraPath: string,
  credentials: Credentials
): Promise<{ success: boolean; error?: string }> {
  try {
    const whepUrl = `${serverUrl.replace(/\/$/, '')}/${cameraPath}/whep`;
    const authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;

    const response = await fetch(whepUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': authHeader,
      },
      body: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n',
    });

    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Invalid credentials for this camera' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Test default camera credentials against the server
 */
export async function testDefaultCameraCredentials(
  serverUrl: string,
  testPath: string = 'test'
): Promise<{ success: boolean; error?: string }> {
  const credentials = getDefaultCameraCredentials();
  
  if (!credentials) {
    return { success: false, error: 'No default credentials configured' };
  }

  return validateCameraCredentials(serverUrl, testPath, credentials);
}
