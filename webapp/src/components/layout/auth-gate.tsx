'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasSiteSession } from '@/lib/site-auth';
import { Loader2 } from 'lucide-react';

/**
 * AuthGate - protects routes requiring website authentication
 * Note: This checks SITE authentication, not camera credentials
 */
interface AuthGateProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGate({
  children,
  redirectTo = '/login',
  fallback
}: AuthGateProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has authenticated with the website
        const authenticated = await hasSiteSession();
        
        setIsAuthed(authenticated);
        setIsChecking(false);

        if (!authenticated) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthed(false);
        setIsChecking(false);
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  if (isChecking) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying website authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
}

/**
 * HOC (Higher Order Component) version for wrapping page components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  redirectTo?: string
) {
  const WrappedComponent = (props: P) => (
    <AuthGate redirectTo={redirectTo}>
      <Component {...props} />
    </AuthGate>
  );

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for checking authentication status in components
 */
export function useAuth() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await hasSiteSession();
        setIsAuthed(authenticated);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthed(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated: isAuthed, isLoading };
}
