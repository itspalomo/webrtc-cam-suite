'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Camera,
  Wifi,
  WifiOff,
  Clock,
  Eye,
  AlertCircle,
  Loader2,
  Key
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { Camera as CameraType, CameraStatus } from '@/types';

/**
 * CameraCard component displays individual camera information
 * Shows status, last seen time, and provides navigation to viewer
 */
interface CameraCardProps {
  camera: CameraType;
  className?: string;
}

const statusConfig = {
  online: {
    label: 'Online',
    variant: 'default' as const,
    icon: Wifi,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  offline: {
    label: 'Offline',
    variant: 'secondary' as const,
    icon: WifiOff,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  unknown: {
    label: 'Unknown',
    variant: 'outline' as const,
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  connecting: {
    label: 'Connecting',
    variant: 'outline' as const,
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
};

function formatLastSeen(date: Date | undefined): string {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function CameraCard({ camera, className = '' }: CameraCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const statusInfo = statusConfig[camera.status];
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Camera thumbnail */}
        <div className="relative aspect-video bg-gray-100">
          {camera.thumbnail && !imageError ? (
            <>
              <Image
                src={camera.thumbnail}
                alt={`${camera.name} camera view`}
                fill
                className={`object-cover transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <Badge
              variant={statusInfo.variant}
              className={`flex items-center gap-1 ${statusInfo.bgColor} ${statusInfo.color} border-0`}
            >
              <StatusIcon className={`h-3 w-3 ${camera.status === 'connecting' ? 'animate-spin' : ''}`} />
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {camera.name}
                </h3>
                {camera.credentials && (
                  <div className="flex items-center space-x-1">
                    <Key className="h-3 w-3 text-blue-500" />
                    <span className="text-xs text-blue-600 font-medium">Custom</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 font-mono">
                /{camera.path}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Last seen information */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Clock className="h-4 w-4" />
            <span>Last seen: {formatLastSeen(camera.lastSeen)}</span>
          </div>

          {/* Action button */}
          <Button
            asChild
            className="w-full"
            disabled={camera.status === 'connecting'}
          >
            <Link href={`/viewer/${camera.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              {camera.status === 'connecting' ? 'Connecting...' : 'View Stream'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/**
 * Skeleton version for loading state
 */
export function CameraCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="aspect-video bg-gray-100">
        <Skeleton className="w-full h-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
