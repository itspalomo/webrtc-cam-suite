import { AuthState, Credentials } from '@/types';
import { loadCredentials, saveCredentials, clearCredentials } from '@/config';

/**
 * Authentication utilities for credential management and session handling
 */

// In-memory storage for session-only credentials
let sessionCredentials: Credentials | null = null;

/**
 * Get current authentication state
 * Safe for server-side rendering
 */
export const getAuthState = (): AuthState => {
  // Return unauthenticated state on server
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      rememberCredentials: false,
    };
  }

  // Check session storage first (higher priority)
  if (sessionCredentials) {
    return {
      isAuthenticated: true,
      credentials: sessionCredentials,
      rememberCredentials: false,
    };
  }

  // Check persistent storage
  const persistentCredentials = loadCredentials();
  if (persistentCredentials) {
    return {
      isAuthenticated: true,
      credentials: persistentCredentials,
      rememberCredentials: true,
    };
  }

  return {
    isAuthenticated: false,
    rememberCredentials: false,
  };
};

/**
 * Authenticate user with provided credentials
 */
export const authenticate = (
  credentials: Credentials,
  remember: boolean = false
): AuthState => {
  // Validate credentials (basic validation)
  if (!credentials.username || !credentials.password) {
    return {
      isAuthenticated: false,
      rememberCredentials: remember,
    };
  }

  // Store credentials based on preference
  if (remember) {
    saveCredentials(credentials);
    sessionCredentials = null; // Clear session storage
  } else {
    sessionCredentials = credentials;
    clearCredentials(); // Clear persistent storage
  }

  return {
    isAuthenticated: true,
    credentials,
    rememberCredentials: remember,
  };
};

/**
 * Clear authentication state
 */
export const logout = (): void => {
  sessionCredentials = null;
  clearCredentials();
};

/**
 * Update credential storage preference
 */
export const updateCredentialStorage = (remember: boolean): void => {
  const authState = getAuthState();

  if (!authState.isAuthenticated || !authState.credentials) {
    return;
  }

  if (remember) {
    // Move from session to persistent storage
    saveCredentials(authState.credentials);
    sessionCredentials = null;
  } else {
    // Move from persistent to session storage
    sessionCredentials = authState.credentials;
    clearCredentials();
  }
};

/**
 * Get current credentials (from session or persistent storage)
 * Safe for server-side rendering
 */
export const getCurrentCredentials = (): Credentials | null => {
  // Return null on server
  if (typeof window === 'undefined') {
    return null;
  }

  if (sessionCredentials) {
    return sessionCredentials;
  }

  return loadCredentials();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthState().isAuthenticated;
};

/**
 * Validate credentials format
 */
export const validateCredentials = (credentials: Credentials): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!credentials.username?.trim()) {
    errors.push('Username is required');
  }

  if (!credentials.password?.trim()) {
    errors.push('Password is required');
  }

  if (credentials.username && credentials.username.length < 2) {
    errors.push('Username must be at least 2 characters');
  }

  if (credentials.password && credentials.password.length < 4) {
    errors.push('Password must be at least 4 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Test authentication against server
 */
export const testAuthentication = async (
  serverUrl: string,
  credentials: Credentials,
  testPath: string = 'test'
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Try to access a WHEP endpoint to test authentication
    const testUrl = `${serverUrl.replace(/\/$/, '')}/${testPath}/whep`;
    const authHeader = `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': authHeader,
      },
      body: 'dummy-offer', // Minimal SDP offer for testing
    });

    // 401/403 = auth failed, 404 = path doesn't exist but auth worked
    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Any other response means auth succeeded (even 404 is OK for this test)
    return { success: true };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};
