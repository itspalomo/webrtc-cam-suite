/**
 * Migration utilities for legacy authentication system
 * Handles transition from single credential system to dual auth system
 */

import { loadCredentials, clearCredentials } from '@/config';
import { setDefaultCameraCredentials } from './camera-auth';
import { getSiteAuthConfig } from './site-auth';

/**
 * Migrate from legacy single-credential system to new dual auth system
 */
export function migrateLegacyAuth(): {
  migrated: boolean;
  needsSiteSetup: boolean;
} {
  if (typeof window === 'undefined') {
    return { migrated: false, needsSiteSetup: false };
  }

  // Check if site auth is already configured
  const siteConfig = getSiteAuthConfig();
  if (!siteConfig.isFirstLaunch) {
    return { migrated: false, needsSiteSetup: false };
  }

  // Check if old credentials exist
  const oldCredentials = loadCredentials();
  
  if (oldCredentials) {
    try {
      // Migrate old credentials to camera defaults
      setDefaultCameraCredentials(oldCredentials);
      
      // Clear the old credentials to prevent confusion
      clearCredentials();
      
      console.log('Successfully migrated legacy credentials to camera auth system');
      
      return { 
        migrated: true, 
        needsSiteSetup: true // User needs to set up site credentials
      };
    } catch (error) {
      console.error('Failed to migrate credentials:', error);
    }
  }

  return { migrated: false, needsSiteSetup: true };
}

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  if (typeof window === 'undefined') return false;
  
  const oldCredentials = loadCredentials();
  const siteConfig = getSiteAuthConfig();
  
  // Migration needed if old credentials exist but site auth not configured
  return !!oldCredentials && siteConfig.isFirstLaunch;
}
