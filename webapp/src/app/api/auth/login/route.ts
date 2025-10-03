import { NextRequest, NextResponse } from 'next/server';
import { recordFailedLogin, checkLoginLockout, resetRateLimit } from '@/lib/site-auth/rate-limit';
import { cookies } from 'next/headers';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

// Server-side credential storage key
const STORAGE_KEY = 'webcam_site_auth';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'changeme';

/**
 * Get stored credentials from cookies (server-side)
 * On first launch, returns default credentials
 */
async function getStoredCredentials() {
  const cookieStore = await cookies();
  const storedCreds = cookieStore.get(STORAGE_KEY)?.value;
  
  if (!storedCreds) {
    // First launch - use default credentials
    return {
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
      isDefault: true,
    };
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(storedCreds));
    return {
      username: parsed.credentials?.username || DEFAULT_USERNAME,
      password: parsed.credentials?.password || DEFAULT_PASSWORD,
      isDefault: false,
    };
  } catch {
    // Fallback to defaults if parsing fails
    return {
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD,
      isDefault: true,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check for rate limiting
    const lockout = checkLoginLockout();
    if (lockout.isLocked) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many failed attempts. Please try again later.',
          isLocked: true,
          remainingTime: lockout.remainingTime,
        },
        { status: 429 }
      );
    }

    // Get stored credentials (server-side)
    const storedCreds = await getStoredCredentials();

    // Validate credentials
    const isValid = username === storedCreds.username && password === storedCreds.password;
    const isDefaultCredentials = username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD;

    if (!isValid) {
      // Record failed attempt
      const rateLimitResult = recordFailedLogin();
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
          attempts: rateLimitResult.attempts,
          isLocked: rateLimitResult.isLocked,
          remainingTime: rateLimitResult.remainingTime,
        },
        { status: 401 }
      );
    }

    // Success - reset rate limit
    resetRateLimit();

    // Create session
    const expiresAt = Date.now() + SESSION_DURATION;
    const sessionData = {
      username,
      expiresAt,
      createdAt: Date.now(),
    };

    // Create response with cookies
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      isDefaultCredentials,
      expiresAt,
    });

    // Set HTTP-only cookies for security
    response.cookies.set('site_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: '/',
    });

    response.cookies.set('site_session_data', encodeURIComponent(JSON.stringify(sessionData)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
