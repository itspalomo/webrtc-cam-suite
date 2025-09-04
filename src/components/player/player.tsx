'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

import { PlayerState, StreamStats, WhepSession, Camera } from '@/types';
import {
  createWhepSession,
  closeWhepSession,
  getStreamStats,
  reconnectWhepSession,
  isWebRTCSupported
} from '@/lib/whep';
import { getCurrentCredentials } from '@/lib/auth';
import { loadConfig } from '@/config';

import { PlayerStatsHUD } from './player-stats-hud';
import { ReconnectBanner } from './reconnect-banner';

/**
 * Player component for WebRTC WHEP streaming
 * Handles video playback, controls, and connection management
 */
interface PlayerProps {
  camera: Camera;
  className?: string;
  autoPlay?: boolean;
  startMuted?: boolean;
  showStats?: boolean;
  onError?: (error: string) => void;
  onStatsUpdate?: (stats: StreamStats) => void;
}

export function Player({
  camera,
  className = '',
  autoPlay = true,
  startMuted = true,
  showStats = true,
  onError,
  onStatsUpdate,
}: PlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const statsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [whepSession, setWhepSession] = useState<WhepSession | null>(null);
  const [streamStats, setStreamStats] = useState<StreamStats>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(startMuted);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Check WebRTC support
  useEffect(() => {
    if (!isWebRTCSupported()) {
      const errorMsg = 'WebRTC is not supported in this browser';
      setError(errorMsg);
      setPlayerState('failed');
      onError?.(errorMsg);
    }
  }, [onError]);

  // Initialize stream on mount
  useEffect(() => {
    if (playerState === 'idle' && autoPlay) {
      initializeStream();
    }

    return () => {
      cleanup();
    };
  }, [camera.id, autoPlay]);

  // Update stats periodically
  useEffect(() => {
    if (whepSession?.isActive && showStats) {
      statsIntervalRef.current = setInterval(async () => {
        if (whepSession.peerConnection) {
          try {
            const stats = await getStreamStats(whepSession.peerConnection);
            setStreamStats(stats);
            onStatsUpdate?.(stats);
          } catch (err) {
            console.warn('Failed to get stream stats:', err);
          }
        }
      }, 1000);
    }

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [whepSession?.isActive, showStats, onStatsUpdate]);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && whepSession?.stream) {
      videoRef.current.srcObject = whepSession.stream;
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;

      if (autoPlay) {
        videoRef.current.play().catch(err => {
          console.warn('Autoplay failed:', err);
        });
      }
    }
  }, [whepSession?.stream, isMuted, volume, autoPlay]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const initializeStream = useCallback(async () => {
    try {
      setPlayerState('connecting');
      setError(null);

      // Use camera-specific credentials if available, otherwise use global credentials
      const credentials = camera.credentials || getCurrentCredentials();
      if (!credentials) {
        throw new Error('No authentication credentials available');
      }

      const config = loadConfig();
      const session = await createWhepSession(
        config.serverUrl,
        camera.path,
        credentials,
        config.iceServers
      );

      setWhepSession(session);
      setReconnectAttempts(0);

      if (session.isActive) {
        setPlayerState('connected');
      } else {
        throw new Error(session.lastError || 'Failed to establish connection');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setPlayerState('failed');
      onError?.(errorMsg);
    }
  }, [camera.path, onError]);

  const reconnectStream = useCallback(async () => {
    if (!whepSession) return;

    try {
      setPlayerState('reconnecting');
      setError(null);

      const credentials = getCurrentCredentials();
      if (!credentials) {
        throw new Error('No authentication credentials available');
      }

      const config = loadConfig();
      const newSession = await reconnectWhepSession(
        config.serverUrl,
        camera.path,
        credentials,
        config.iceServers,
        3, // max attempts
        1000 // base delay
      );

      setWhepSession(newSession);
      setReconnectAttempts(prev => prev + 1);

      if (newSession.isActive) {
        setPlayerState('connected');
      } else {
        throw new Error(newSession.lastError || 'Reconnection failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Reconnection failed';
      setError(errorMsg);
      setPlayerState('failed');
      onError?.(errorMsg);
    }
  }, [whepSession, camera.path, onError]);

  const cleanup = useCallback(() => {
    if (whepSession) {
      closeWhepSession(whepSession);
      setWhepSession(null);
    }

    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setPlayerState('disconnected');
  }, [whepSession]);

  // Control handlers
  const handlePlayPause = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn('Play/pause failed:', err);
    }
  }, [isPlaying]);

  const handleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const handleFullscreen = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isFullscreen) {
        await document.exitFullscreen();
      } else {
        await videoRef.current.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  }, [isFullscreen]);

  const handlePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (isPiP) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP toggle failed:', err);
    }
  }, [isPiP]);

  // Handle PiP changes
  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(!!document.pictureInPictureElement);
    };

    document.addEventListener('enterpictureinpicture', handlePiPChange);
    document.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePiPChange);
      document.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  // Loading state
  if (playerState === 'idle' || playerState === 'connecting') {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-black ${className}`}>
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">
            {playerState === 'connecting' ? 'Connecting...' : 'Initializing...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Establishing WebRTC connection to {camera.name}
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (playerState === 'failed' && error) {
    return (
      <Card className={`aspect-video flex items-center justify-center bg-black ${className}`}>
        <div className="text-center text-white">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg mb-2">Connection Failed</p>
          <p className="text-sm text-gray-400 mb-4 max-w-md">{error}</p>
          <div className="space-x-2">
            <Button onClick={initializeStream} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {reconnectAttempts < 3 && (
              <Button onClick={reconnectStream} variant="default" size="sm">
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full bg-black rounded-lg"
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Video error:', e);
          setError('Video playback error');
          setPlayerState('failed');
        }}
      />

      {/* Reconnect banner */}
      {playerState === 'reconnecting' && (
        <ReconnectBanner
          attempts={reconnectAttempts}
          onRetry={reconnectStream}
        />
      )}

      {/* Stats HUD */}
      {showStats && Object.keys(streamStats).length > 0 && (
        <PlayerStatsHUD
          stats={streamStats}
          isVisible={true}
          className="absolute top-4 left-4"
        />
      )}

      {/* Control bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <div className="flex items-center space-x-2 min-w-[100px]">
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={1}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center space-x-2">
            {document.pictureInPictureEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePictureInPicture}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
