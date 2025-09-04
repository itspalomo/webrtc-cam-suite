import { Suspense } from 'react';
import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { CameraGrid } from '@/components/camera-grid';
import { loadConfig } from '@/config';

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
          <Suspense fallback={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <CameraGridContent />
          </Suspense>
        </div>
      </MainLayout>
    </AuthGate>
  );
}

/**
 * CameraGridContent component that loads camera data
 * Separated to allow for Suspense boundary
 */
function CameraGridContent() {
  const config = loadConfig();
  const cameras = config.cameras;

  return <CameraGrid cameras={cameras} />;
}
