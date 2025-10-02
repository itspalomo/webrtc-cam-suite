'use client';

import { useState } from 'react';
import { AlertCircle, Shield, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

/**
 * CredentialSecurityWarning - Displays warning about localStorage credential storage
 * Should be shown in settings when configuring camera credentials
 */
export function CredentialSecurityWarning() {
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('credential_security_warning_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('credential_security_warning_dismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  return (
    <Alert className="bg-yellow-50 border-yellow-300 relative">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-900 pr-8">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="font-semibold">Security Notice: Credential Storage</p>
            <p className="text-sm">
              Camera credentials are stored in your browser&apos;s localStorage in plaintext.
              This means they are accessible via browser DevTools and not encrypted.
            </p>
            <div className="text-sm space-y-1 mt-2">
              <p className="font-medium">Security Recommendations:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Use HTTPS in production (required for WebRTC)</li>
                <li>Use strong, unique passwords for camera access</li>
                <li>Clear credentials when using shared computers</li>
                <li>Consider using per-camera credentials instead of global defaults</li>
                <li>Regularly review stored credentials in Settings</li>
              </ul>
            </div>
            <div className="text-xs text-yellow-700 mt-2 bg-yellow-100 p-2 rounded">
              <strong>Note:</strong> While credentials are Base64 encoded when transmitted
              (via HTTP Basic Auth), they are <strong>not encrypted</strong> in browser storage.
              For maximum security in production environments, ensure your MediaMTX server
              uses HTTPS and restrict network access appropriately.
            </div>
          </div>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}
