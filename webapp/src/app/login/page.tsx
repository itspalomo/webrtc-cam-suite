'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';
import { getSiteAuthConfig, hasSiteSession } from '@/lib/site-auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';

/**
 * Login page component
 * Handles site authentication (separate from camera credentials)
 */
export default function LoginPage() {
  const router = useRouter();
  const [showDefaultCredsNotice, setShowDefaultCredsNotice] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Redirect if already authenticated
      const hasSession = await hasSiteSession();
      if (hasSession) {
        router.push('/');
        return;
      }

      // Show notice about default credentials on first launch
      const config = getSiteAuthConfig();
      if (config.isFirstLaunch) {
        setShowDefaultCredsNotice(true);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            WebRTC Cam Suite
          </h1>
          <p className="text-gray-600">
            Sign in to access the web interface
          </p>
        </div>

        {/* First Launch Notice */}
        {showDefaultCredsNotice && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              <strong>First launch detected!</strong>
              <br />
              Default credentials: <code className="bg-blue-100 px-2 py-1 rounded">admin</code> / <code className="bg-blue-100 px-2 py-1 rounded">changeme</code>
              <br />
              <span className="text-xs mt-2 block">
                You can change these in Settings after logging in.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <LoginForm />

        {/* Explanation Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            About Website Authentication
          </h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">This login controls access to this website only.</strong>
              <p className="mt-1">
                These credentials protect who can view and manage your camera configuration
                through this web interface.
              </p>
            </div>

            <div className="border-t pt-3">
              <strong className="text-gray-900">Camera authentication is separate.</strong>
              <p className="mt-1">
                You&apos;ll configure camera credentials in Settings after logging in. Each camera
                can have its own username/password for connecting to the MediaMTX server.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
              <p className="text-blue-900 text-xs">
                <strong>Security Note:</strong> The default credentials (admin/changeme) should
                be changed immediately in Settings → Account Security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
