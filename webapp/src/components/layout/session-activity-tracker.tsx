'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { updateLastActivity, isSessionTimedOut, clearSiteAuth } from '@/lib/site-auth';

/**
 * SessionActivityTracker - Tracks user activity and enforces session timeout
 * Should be included in the root layout for authenticated pages
 */
export function SessionActivityTracker() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip on login page
    if (pathname === '/login') return;

    // Check session timeout on mount
    if (isSessionTimedOut()) {
      clearSiteAuth();
      router.push('/login?reason=timeout');
      return;
    }

    // Activity events to track
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    const handleActivity = () => {
      updateLastActivity();
    };

    // Register activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check for timeout every minute
    const timeoutCheck = setInterval(() => {
      if (isSessionTimedOut()) {
        clearSiteAuth();
        router.push('/login?reason=timeout');
      }
    }, 60000); // Check every 60 seconds

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(timeoutCheck);
    };
  }, [router, pathname]);

  return null; // This component doesn't render anything
}
