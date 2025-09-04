'use client';

import { motion } from 'framer-motion';
import { Camera, AlertCircle, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { CameraCard, CameraCardSkeleton } from './camera-card';
import { Camera as CameraType } from '@/types';

/**
 * CameraGrid component displays a responsive grid of camera cards
 * Handles empty states and loading states
 */
interface CameraGridProps {
  cameras: CameraType[];
  isLoading?: boolean;
  className?: string;
}

/**
 * Empty state component when no cameras are configured
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full"
    >
      <Card className="text-center py-12">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Camera className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl">No Cameras Configured</CardTitle>
          <CardDescription>
            Get started by adding your first camera in settings. Configure the server URL and camera paths to begin monitoring.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg">
            <a href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Go to Settings
            </a>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Error state component for when cameras fail to load
 */
function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="col-span-full"
    >
      <Card className="text-center py-12 border-red-200">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">Unable to Load Cameras</CardTitle>
          <CardDescription className="text-red-700">
            There was an error loading your camera configuration. Please check your settings and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button asChild variant="outline">
              <a href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Check Settings
              </a>
            </Button>
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CameraGrid({
  cameras,
  isLoading = false,
  className = ''
}: CameraGridProps) {
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <CameraCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!cameras || cameras.length === 0) {
    return (
      <div className={`grid grid-cols-1 ${className}`}>
        <EmptyState />
      </div>
    );
  }

  // Show camera grid
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
    >
      {cameras.map((camera, index) => (
        <motion.div
          key={camera.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1, // Stagger animation
          }}
        >
          <CameraCard camera={camera} />
        </motion.div>
      ))}
    </motion.div>
  );
}
