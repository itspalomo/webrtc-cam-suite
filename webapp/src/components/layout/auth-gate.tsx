'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

/**
 * AuthGate component that protects routes requiring authentication
 * Redirects unauthenticated users to the login page
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
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuthed(authenticated);
      setIsChecking(false);

      if (!authenticated) {
        router.push(redirectTo);
      }
    };

    checkAuth();
  }, [router, redirectTo]);

  // Show loading state while checking authentication
  if (isChecking) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
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
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuthed(authenticated);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return { isAuthenticated: isAuthed, isLoading };
}
