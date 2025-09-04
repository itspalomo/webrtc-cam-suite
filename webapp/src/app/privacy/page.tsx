import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { CredentialPolicyNote } from '@/components/credential-policy-note';

/**
 * Privacy page component
 * Explains credential storage and data handling policies
 */
export default function PrivacyPage() {
  return (
    <AuthGate>
      <MainLayout title="Privacy & Security">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Privacy & Security
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn how BabyCam Viewer handles your credentials and protects your privacy
            </p>
          </div>

          {/* Credential Storage Policy */}
          <CredentialPolicyNote />

          {/* Additional Security Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Additional Security Measures
            </h2>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">No Data Collection</h3>
                  <p className="text-gray-600">
                    BabyCam Viewer does not collect, store, or transmit any personal data to external servers.
                    All authentication happens directly between your browser and your MediaMTX server.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">HTTPS Recommended</h3>
                  <p className="text-gray-600">
                    For maximum security, configure your MediaMTX server with HTTPS. This encrypts all
                    communication between your browser and the server, including authentication credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Local Network Security</h3>
                  <p className="text-gray-600">
                    When accessing cameras on your local network, ensure your Wi-Fi network is secure
                    and consider using a VPN for remote access to prevent unauthorized connections.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Technical Implementation
            </h2>

            <div className="prose prose-sm max-w-none text-gray-700">
              <h3>Authentication Flow</h3>
              <ol>
                <li>User enters credentials in the login form</li>
                <li>Credentials are used to generate HTTP Basic Auth header</li>
                <li>Header is sent with WebRTC WHEP requests to MediaMTX server</li>
                <li>Server validates credentials and streams video if authorized</li>
                <li>No credentials are stored on external servers</li>
              </ol>

              <h3>WebRTC Security</h3>
              <ul>
                <li>All video streams are encrypted using DTLS (Datagram Transport Layer Security)</li>
                <li>Peer-to-peer connections use secure key exchange</li>
                <li>ICE (Interactive Connectivity Establishment) handles NAT traversal securely</li>
                <li>Optional TURN servers can be configured for complex network setups</li>
              </ul>

              <h3>Data Storage</h3>
              <ul>
                <li><strong>Session Storage:</strong> Credentials kept in browser memory only</li>
                <li><strong>Persistent Storage:</strong> Encrypted localStorage (optional)</li>
                <li><strong>Server Communication:</strong> Direct HTTPS to your MediaMTX server</li>
                <li><strong>No External Tracking:</strong> Zero analytics or third-party data collection</li>
              </ul>
            </div>
          </div>

          {/* Contact/Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Need Help?</h3>
                <p className="text-blue-800 mt-1">
                  If you have questions about security or need assistance configuring your setup,
                  please refer to the MediaMTX documentation or contact your system administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGate>
  );
}
