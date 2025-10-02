import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AuthGate } from '@/components/layout/auth-gate';
import { MainLayout } from '@/components/layout/main-layout';
import { Player } from '@/components/player/player';
import { CameraSwitcher } from '@/components/camera-switcher';
import { loadConfig } from '@/config';
import { getMockCameraById } from '@/lib/mock-data';

/**
 * Camera viewer page component
 * Displays individual camera stream with controls
 */
interface ViewerPageProps {
  params: Promise<{
    cameraId: string;
  }>;
}

export default async function ViewerPage({ params }: ViewerPageProps) {
  const { cameraId } = await params;
  const config = loadConfig();
  const camera = config.cameras.find(cam => cam.id === cameraId) ||
                 getMockCameraById(cameraId);

  if (!camera) {
    notFound();
  }

  return (
    <AuthGate>
      <MainLayout
        title={`Viewing ${camera.name}`}
        showBackButton={true}
        backHref="/"
      >
        <div className="space-y-6">
          {/* Camera Switcher */}
          <div className="flex justify-center">
            <CameraSwitcher
              cameras={config.cameras}
              currentCameraId={camera.id}
              compact={true}
              className="max-w-md"
            />
          </div>

          {/* Video Player */}
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg">Loading camera stream...</p>
                </div>
              </div>
            }>
              <Player
                camera={camera}
                className="w-full aspect-video"
                autoPlay={config.autoPlay}
                startMuted={config.startMuted}
                showStats={true}
              />
            </Suspense>
          </div>

          {/* Camera Info */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {camera.name}
                  </h2>
                  <p className="text-gray-600">
                    Stream path: /{camera.path}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-500">
                  <p>Server: {config.serverUrl}</p>
                  <p>WebRTC WHEP Protocol</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGate>
  );
}

/**
 * Generate static params for static generation
 * This helps with performance and SEO
 */
export async function generateStaticParams() {
  const config = loadConfig();

  return config.cameras.map((camera) => ({
    cameraId: camera.id,
  }));
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: ViewerPageProps) {
  const { cameraId } = await params;
  const config = loadConfig();
  const camera = config.cameras.find(cam => cam.id === cameraId);

  if (!camera) {
    return {
      title: 'Camera Not Found - Camera Suite',
    };
  }

  return {
    title: `${camera.name} - Camera Suite`,
    description: `Live stream of ${camera.name} camera using WebRTC WHEP protocol`,
    openGraph: {
      title: `${camera.name} - Camera Suite`,
      description: `Live stream of ${camera.name} camera`,
      type: 'video.other',
    },
  };
}
