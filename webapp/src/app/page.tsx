import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { CameraGridClient } from '@/components/camera-grid-client';

/**
 * Home page component
 * Displays the camera grid with authentication protection
 */
export default function HomePage() {
  return (
    <AuthGate>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Camera Streams</h1>
              <p className="text-gray-600">
                Monitor your live camera feeds with low-latency WebRTC streaming
              </p>
            </div>
          </div>

          {/* Camera Grid */}
          <CameraGridClient />
        </div>
      </MainLayout>
    </AuthGate>
  );
}
