/**
 * Rate limiting for login attempts
 * Prevents brute force attacks by limiting failed login attempts
 */

const RATE_LIMIT_KEY = 'login_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface RateLimitData {
  attempts: number;
  lockoutUntil?: number;
  lastAttempt: number;
}

/**
 * Get current rate limit data
 */
function getRateLimitData(): RateLimitData {
  if (typeof window === 'undefined') {
    return { attempts: 0, lastAttempt: Date.now() };
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (!stored) {
      return { attempts: 0, lastAttempt: Date.now() };
    }
    return JSON.parse(stored);
  } catch {
    return { attempts: 0, lastAttempt: Date.now() };
  }
}

/**
 * Save rate limit data
 */
function saveRateLimitData(data: RateLimitData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if login is currently locked out
 * Returns { isLocked: boolean, remainingTime?: number (ms) }
 */
export function checkLoginLockout(): { isLocked: boolean; remainingTime?: number } {
  const data = getRateLimitData();

  if (!data.lockoutUntil) {
    return { isLocked: false };
  }

  const now = Date.now();
  if (now < data.lockoutUntil) {
    return {
      isLocked: true,
      remainingTime: data.lockoutUntil - now,
    };
  }

  // Lockout expired, reset
  saveRateLimitData({ attempts: 0, lastAttempt: now });
  return { isLocked: false };
}

/**
 * Record a failed login attempt
 * Returns updated lockout status
 */
export function recordFailedLogin(): { isLocked: boolean; remainingTime?: number; attempts: number } {
  const data = getRateLimitData();
  const now = Date.now();

  // Reset if last attempt was more than 15 minutes ago
  if (now - data.lastAttempt > 15 * 60 * 1000) {
    data.attempts = 0;
  }

  data.attempts += 1;
  data.lastAttempt = now;

  // Check if we've exceeded max attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = now + LOCKOUT_DURATION;
    saveRateLimitData(data);
    return {
      isLocked: true,
      remainingTime: LOCKOUT_DURATION,
      attempts: data.attempts,
    };
  }

  saveRateLimitData(data);
  return {
    isLocked: false,
    attempts: data.attempts,
  };
}

/**
 * Reset rate limit data (called on successful login)
 */
export function resetRateLimit(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RATE_LIMIT_KEY);
}

/**
 * Format remaining time for display
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
}
