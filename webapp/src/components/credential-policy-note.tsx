'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Clock, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * CredentialPolicyNote explains how user credentials are handled
 * Provides transparency about storage choices and security measures
 */
interface CredentialPolicyNoteProps {
  className?: string;
  compact?: boolean;
}

export function CredentialPolicyNote({
  className = '',
  compact = false
}: CredentialPolicyNoteProps) {
  const policies = [
    {
      title: 'Session Storage (Recommended)',
      description: 'Credentials are stored only in memory during your browsing session',
      icon: Clock,
      benefits: [
        'Automatically cleared when you close the browser',
        'No persistent storage on device',
        'Most secure option for shared devices',
      ],
      risks: [
        'Must re-enter credentials on each visit',
        'Credentials lost if browser crashes',
      ],
      badge: 'Secure',
      badgeVariant: 'default' as const,
    },
    {
      title: 'Persistent Storage',
      description: 'Credentials are saved locally and persist across browser sessions',
      icon: Lock,
      benefits: [
        'Convenient - no need to re-enter credentials',
        'Faster login experience',
        'Remains available after browser restart',
      ],
      risks: [
        'Credentials stored on device permanently',
        'Accessible if device is compromised',
        'Should not be used on shared/public devices',
      ],
      badge: 'Convenient',
      badgeVariant: 'secondary' as const,
    },
  ];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-sm text-gray-600 ${className}`}
      >
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 mb-1">Credential Storage</p>
            <p>
              Your login credentials are used only to authenticate with your MediaMTX server.
              Choose &quot;Remember me&quot; to save credentials for future sessions, or leave unchecked
              for session-only storage (more secure).
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Credential Storage Policy
          </CardTitle>
          <CardDescription>
            Understanding how your login credentials are handled and stored
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Security First</h4>
                <p className="text-sm text-blue-800">
                  Your credentials are used exclusively to authenticate WebRTC WHEP requests
                  to your MediaMTX server. They are never transmitted to any third-party services
                  or stored on external servers.
                </p>
              </div>
            </div>
          </div>

          {/* Storage Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map((policy, index) => {
              const Icon = policy.icon;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium">{policy.title}</h4>
                    </div>
                    <Badge variant={policy.badgeVariant}>
                      {policy.badge}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {policy.description}
                  </p>

                  <Separator />

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-green-700 mb-1">Benefits:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {policy.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start space-x-1">
                            <span className="text-green-600 mt-1">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-orange-700 mb-1">Considerations:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {policy.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start space-x-1">
                            <span className="text-orange-600 mt-1">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendations */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Shared devices:</strong> Use session storage (uncheck &quot;Remember me&quot;)</li>
              <li>• <strong>Personal devices:</strong> Persistent storage is convenient and secure</li>
              <li>• <strong>Public networks:</strong> Always use HTTPS for server connections</li>
              <li>• <strong>Regular cleanup:</strong> Clear stored credentials periodically if needed</li>
            </ul>
          </div>

          {/* Technical Details */}
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-900 mb-2">
              Technical Details
            </summary>
            <div className="space-y-2 text-gray-600 bg-gray-50 p-3 rounded">
              <p>
                <strong>Session Storage:</strong> Credentials stored in browser memory only.
                Automatically cleared when the browser tab/window is closed.
              </p>
              <p>
                <strong>Persistent Storage:</strong> Credentials encrypted and stored in
                browser localStorage. Accessible across browser sessions until manually cleared.
              </p>
              <p>
                <strong>Network Transmission:</strong> Credentials sent via HTTP Basic Authentication
                headers to your MediaMTX server only. Never logged or stored in query parameters.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>
    </motion.div>
  );
}
