'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerWithFallback } from '@/components/player/player-with-fallback';
import { CameraSwitcher } from '@/components/camera-switcher';
import { loadConfig } from '@/config';
import { getMockCameraById } from '@/lib/mock-data';
import { Camera, AppConfig } from '@/types';

/**
 * Client-side wrapper for camera viewer that loads config from localStorage
 */
interface ViewerClientProps {
  cameraId: string;
}

export function ViewerClient({ cameraId }: ViewerClientProps) {
  const router = useRouter();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load config from localStorage on client side
    const loadedConfig = loadConfig();
    const foundCamera = loadedConfig.cameras.find(cam => cam.id === cameraId) ||
                        getMockCameraById(cameraId);

    if (!foundCamera) {
      router.push('/');
      return;
    }

    setConfig(loadedConfig);
    setCamera(foundCamera);
    setIsLoading(false);
  }, [cameraId, router]);

  if (isLoading || !config || !camera) {
    return (
      <div className="space-y-6">
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Loading camera stream...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
        <PlayerWithFallback
          camera={camera}
          serverUrl={config.serverUrl}
          className="w-full aspect-video"
          autoPlay={config.autoPlay}
          startMuted={config.startMuted}
          showStats={true}
        />
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
              <p>Protocol: {camera.protocol || 'auto'} (WebRTC → HLS fallback)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
