import { NextRequest, NextResponse } from 'next/server';

const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('site_session')?.value;
    const sessionData = request.cookies.get('site_session_data')?.value;

    if (!sessionToken || !sessionData || sessionToken !== 'authenticated') {
      return NextResponse.json({
        authenticated: false,
        message: 'No active session',
      });
    }

    try {
      const data = JSON.parse(decodeURIComponent(sessionData));
      const now = Date.now();

      // Check if session has expired
      if (data.expiresAt && now > data.expiresAt) {
        // Session expired
        const response = NextResponse.json({
          authenticated: false,
          message: 'Session expired',
        });

        // Clear expired cookies
        response.cookies.delete('site_session');
        response.cookies.delete('site_session_data');

        return response;
      }

      // Session is valid - extend it
      const newExpiresAt = now + SESSION_DURATION;
      const updatedSessionData = {
        ...data,
        expiresAt: newExpiresAt,
      };

      const response = NextResponse.json({
        authenticated: true,
        username: data.username,
        expiresAt: newExpiresAt,
      });

      // Update cookies with extended expiration
      response.cookies.set('site_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
      });

      response.cookies.set('site_session_data', encodeURIComponent(JSON.stringify(updatedSessionData)), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_DURATION / 1000,
        path: '/',
      });

      return response;
    } catch {
      return NextResponse.json({
        authenticated: false,
        message: 'Invalid session data',
      });
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
