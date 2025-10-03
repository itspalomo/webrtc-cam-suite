'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Camera,
  Wifi,
  WifiOff,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import { Camera as CameraType } from '@/types';

/**
 * CameraSwitcher provides quick navigation between cameras
 * Shows current camera and allows switching to others
 */
interface CameraSwitcherProps {
  cameras: CameraType[];
  currentCameraId?: string;
  className?: string;
  compact?: boolean;
  showThumbnails?: boolean;
}

const statusConfig = {
  online: {
    icon: Wifi,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
  },
  offline: {
    icon: WifiOff,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
  },
  unknown: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
  },
  connecting: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
  },
};

export function CameraSwitcher({
  cameras,
  currentCameraId,
  className = '',
  compact = false,
  showThumbnails = false,
}: CameraSwitcherProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentCamera = cameras.find(cam => cam.id === currentCameraId);
  const otherCameras = cameras.filter(cam => cam.id !== currentCameraId);

  const getNextCamera = () => {
    if (!currentCamera) return cameras[0];
    const currentIndex = cameras.findIndex(cam => cam.id === currentCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    return cameras[nextIndex];
  };

  const getPrevCamera = () => {
    if (!currentCamera) return cameras[cameras.length - 1];
    const currentIndex = cameras.findIndex(cam => cam.id === currentCameraId);
    const prevIndex = currentIndex === 0 ? cameras.length - 1 : currentIndex - 1;
    return cameras[prevIndex];
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      // Number keys for direct camera switching (1-9)
      if (key >= '1' && key <= '9') {
        const index = parseInt(key) - 1;
        if (cameras[index]) {
          window.location.href = `/viewer/${cameras[index].id}`;
        }
        return;
      }

      // Arrow keys for navigation
      if (key === 'arrowleft' || key === 'arrowright') {
        e.preventDefault();
        const nextCamera = key === 'arrowright' ? getNextCamera() : getPrevCamera();
        if (nextCamera) {
          window.location.href = `/viewer/${nextCamera.id}`;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [cameras, currentCameraId]);

  if (cameras.length <= 1) {
    return null;
  }

  // Compact version - just navigation arrows
  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`} data-testid="camera-switcher">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const prev = getPrevCamera();
            if (prev) window.location.href = `/viewer/${prev.id}`;
          }}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm font-medium min-w-[120px] text-center">
          {currentCamera ? currentCamera.name : 'No Camera'}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const next = getNextCamera();
            if (next) window.location.href = `/viewer/${next.id}`;
          }}
          className="p-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Full version with dropdown
  return (
    <div className={`flex items-center space-x-2 ${className}`} data-testid="camera-switcher">
      {/* Previous camera button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const prev = getPrevCamera();
          if (prev) window.location.href = `/viewer/${prev.id}`;
        }}
        className="p-2"
        aria-label="Previous camera"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Current camera display */}
      <div className="flex-1 min-w-0">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
            >
              <div className="flex items-center space-x-2 min-w-0">
                {currentCamera && (
                  <>
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const StatusIcon = statusConfig[currentCamera.status].icon;
                        return (
                          <StatusIcon
                            className={`h-4 w-4 ${statusConfig[currentCamera.status].color} ${
                              currentCamera.status === 'connecting' ? 'animate-spin' : ''
                            }`}
                          />
                        );
                      })()}
                    </div>
                    <span className="truncate">{currentCamera.name}</span>
                  </>
                )}
                {!currentCamera && (
                  <>
                    <Camera className="h-4 w-4" />
                    <span>Select Camera</span>
                  </>
                )}
              </div>
              <Grid3X3 className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>

          <AnimatePresence>
            {isOpen && (
              <DropdownMenuContent
                className="w-64 p-2"
                align="start"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {otherCameras.map((camera) => {
                    const StatusIcon = statusConfig[camera.status].icon;
                    const isActive = pathname === `/viewer/${camera.id}`;

                    return (
                      <DropdownMenuItem
                        key={camera.id}
                        asChild
                        className="p-3 cursor-pointer"
                      >
                        <Link href={`/viewer/${camera.id}`}>
                          <div className="flex items-center space-x-3 w-full">
                            {/* Thumbnail */}
                            {showThumbnails && camera.thumbnail && (
                              <div className="w-8 h-8 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={camera.thumbnail}
                                  alt={camera.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            {/* Camera info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium truncate ${
                                  isActive ? 'text-blue-600' : ''
                                }`}>
                                  {camera.name}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    camera.status === 'online' ? 'border-green-300 text-green-700' :
                                    camera.status === 'offline' ? 'border-red-300 text-red-700' :
                                    'border-gray-300 text-gray-700'
                                  }`}
                                >
                                  <StatusIcon className={`h-3 w-3 mr-1 ${
                                    camera.status === 'connecting' ? 'animate-spin' : ''
                                  }`} />
                                  {camera.status}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                /{camera.path}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="p-3">
                    <Link href="/" className="flex items-center space-x-2">
                      <Grid3X3 className="h-4 w-4" />
                      <span>View All Cameras</span>
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            )}
          </AnimatePresence>
        </DropdownMenu>
      </div>

      {/* Next camera button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const next = getNextCamera();
          if (next) window.location.href = `/viewer/${next.id}`;
        }}
        className="p-2"
        aria-label="Next camera"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
