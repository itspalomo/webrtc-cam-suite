'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { AlertCircle, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera } from '@/types';
import { getCameraCredentials } from '@/lib/camera-auth';
import { 
  buildHlsUrl, 
  initializeHlsPlayer, 
  initializeNativeHls,
  isHlsSupported,
  isNativeHlsSupported,
  cleanupHlsPlayer
} from '@/lib/hls';

/**
 * HLS Player component
 * Fallback player using HLS protocol when WebRTC is unavailable
 */
interface HlsPlayerProps {
  camera: Camera;
  serverUrl: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  onError?: (error: string) => void;
}

export function HlsPlayer({
  camera,
  serverUrl,
  autoPlay = true,
  muted = true,
  className = '',
  onError,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleError = useCallback((errorMsg: string) => {
    setError(errorMsg);
    setIsLoading(false);
    onError?.(errorMsg);
  }, [onError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const credentials = getCameraCredentials(camera);
    const hlsUrl = buildHlsUrl(serverUrl, camera.path);

    if (process.env.NODE_ENV === 'development') {
      console.log('[HLS] Initializing HLS player');
      console.log('[HLS] URL:', hlsUrl);
    }

    // Check HLS support
    if (isHlsSupported()) {
      // Use HLS.js for browsers that support it
      try {
        const hls = initializeHlsPlayer(video, hlsUrl, credentials || undefined);
        hlsRef.current = hls;

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[HLS] Manifest parsed, stream ready');
          }
          setIsLoading(false);
          
          if (autoPlay) {
            video.play().catch(err => {
              console.warn('[HLS] Autoplay failed:', err);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                handleError('Network error loading HLS stream. Check your connection.');
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                handleError('Media error playing HLS stream. Try refreshing.');
                break;
              default:
                handleError(`HLS error: ${data.details}`);
                break;
            }
          }
        });

      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to initialize HLS player');
      }

    } else if (isNativeHlsSupported()) {
      // Use native HLS for Safari
      try {
        initializeNativeHls(video, hlsUrl, credentials || undefined);
        
        video.addEventListener('loadedmetadata', () => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[HLS] Native HLS loaded');
          }
          setIsLoading(false);
          
          if (autoPlay) {
            video.play().catch(err => {
              console.warn('[HLS] Autoplay failed:', err);
            });
          }
        });

        video.addEventListener('error', () => {
          handleError('Error loading HLS stream');
        });

      } catch (err) {
        handleError(err instanceof Error ? err.message : 'Failed to load native HLS');
      }

    } else {
      handleError('HLS is not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        cleanupHlsPlayer(hlsRef.current);
        hlsRef.current = null;
      }
    };
  }, [camera, serverUrl, autoPlay, handleError]);

  // Track play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>HLS Playback Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading HLS stream...</p>
          </div>
        </div>
      )}

      {/* HLS Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
          HLS
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full bg-black"
        controls
        muted={muted}
        playsInline
        aria-label={`HLS stream for ${camera.name}`}
      />
    </div>
  );
}
