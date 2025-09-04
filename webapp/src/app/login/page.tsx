'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { LoginForm } from '@/components/forms/login-form';

/**
 * Login page component
 * Handles user authentication and redirects to home if already authenticated
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated (client-side only)
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BabyCam</h1>
          <p className="text-gray-600">Secure live streaming for your cameras</p>
        </div>

        <LoginForm />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Connect to your MediaMTX server for low-latency WebRTC streaming.
            <br />
            All connections are secured with HTTP Basic Authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
