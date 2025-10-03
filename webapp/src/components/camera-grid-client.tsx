'use client';

import { useEffect, useState } from 'react';
import { CameraGrid } from './camera-grid';
import { loadConfig } from '@/config';
import { Camera } from '@/types';

/**
 * Client-side wrapper for CameraGrid that loads config from localStorage
 */
export function CameraGridClient() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load config from localStorage on client side
    const config = loadConfig();
    setCameras(config.cameras);
    setIsLoading(false);
  }, []);

  return <CameraGrid cameras={cameras} isLoading={isLoading} />;
}
