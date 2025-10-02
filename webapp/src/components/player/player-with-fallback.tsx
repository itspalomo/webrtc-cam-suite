'use client';

import { useState, useEffect } from 'react';
import { Camera, StreamingProtocol } from '@/types';
import { Player } from './player';
import { HlsPlayer } from './hls-player';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Player with automatic fallback support
 * Tries WebRTC first, falls back to HLS on failure
 */
interface PlayerWithFallbackProps {
  camera: Camera;
  serverUrl: string;
  autoPlay?: boolean;
  startMuted?: boolean;
  showStats?: boolean;
  className?: string;
}

export function PlayerWithFallback({
  camera,
  serverUrl,
  autoPlay = true,
  startMuted = true,
  showStats = true,
  className = '',
}: PlayerWithFallbackProps) {
  const [currentProtocol, setCurrentProtocol] = useState<StreamingProtocol | null>(null);
  const [hasWebRTCFailed, setHasWebRTCFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial protocol based on camera preference
  useEffect(() => {
    const protocol = camera.protocol || 'auto';
    
    if (protocol === 'hls') {
      setCurrentProtocol('hls');
    } else if (protocol === 'webrtc') {
      setCurrentProtocol('webrtc');
    } else {
      // Auto mode: try WebRTC first
      setCurrentProtocol('webrtc');
    }
  }, [camera.protocol]);

  const handleWebRTCError = (errorMsg: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PlayerFallback] WebRTC error, attempting HLS fallback:', errorMsg);
    }

    const protocol = camera.protocol || 'auto';
    
    if (protocol === 'auto') {
      // Auto mode: fallback to HLS
      setHasWebRTCFailed(true);
      setCurrentProtocol('hls');
    } else {
      // Explicit WebRTC mode: show error
      setError(`WebRTC failed: ${errorMsg}`);
    }
  };

  const handleHlsError = (errorMsg: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PlayerFallback] HLS error:', errorMsg);
    }
    
    setError(`HLS failed: ${errorMsg}`);
  };

  const handleRetryWebRTC = () => {
    setHasWebRTCFailed(false);
    setCurrentProtocol('webrtc');
    setError(null);
  };

  if (!currentProtocol) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">Initializing player...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Playback Error:</strong> {error}
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryWebRTC}
              >
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Fallback Notice */}
      {hasWebRTCFailed && currentProtocol === 'hls' && (
        <div className="absolute top-16 left-4 right-4 z-20">
          <Alert className="bg-orange-50 border-orange-300">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 text-sm">
              <strong>Automatic Fallback:</strong> Switched to HLS streaming due to WebRTC connection issues.
              <Button
                variant="link"
                size="sm"
                onClick={handleRetryWebRTC}
                className="ml-2 h-auto p-0 text-orange-700 underline"
              >
                Retry WebRTC
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Render appropriate player */}
      {currentProtocol === 'webrtc' ? (
        <Player
          camera={camera}
          autoPlay={autoPlay}
          startMuted={startMuted}
          showStats={showStats}
          className="w-full h-full"
          onError={handleWebRTCError}
        />
      ) : (
        <HlsPlayer
          camera={camera}
          serverUrl={serverUrl}
          autoPlay={autoPlay}
          muted={startMuted}
          className="w-full h-full"
          onError={handleHlsError}
        />
      )}
    </div>
  );
}
