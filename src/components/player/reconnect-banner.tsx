'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * ReconnectBanner displays reconnection status and controls
 * Shows when the stream is attempting to reconnect
 */
interface ReconnectBannerProps {
  attempts: number;
  maxAttempts?: number;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function ReconnectBanner({
  attempts,
  maxAttempts = 5,
  onRetry,
  onCancel,
  className = '',
}: ReconnectBannerProps) {
  const isLastAttempt = attempts >= maxAttempts - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`absolute top-4 left-4 right-4 z-10 ${className}`}
    >
      <Alert className="bg-yellow-900/90 border-yellow-600 text-yellow-100 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
          <AlertCircle className="h-4 w-4 text-yellow-400" />
        </div>

        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <span className="font-medium">
              {isLastAttempt ? 'Final reconnection attempt...' : 'Reconnecting to stream...'}
            </span>
            <span className="text-sm text-yellow-200 ml-2">
              Attempt {attempts + 1} of {maxAttempts}
            </span>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            {onRetry && !isLastAttempt && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="bg-yellow-800 border-yellow-600 text-yellow-100 hover:bg-yellow-700"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry Now
              </Button>
            )}

            {onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-yellow-200 hover:bg-yellow-800 hover:text-yellow-100"
              >
                Cancel
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
