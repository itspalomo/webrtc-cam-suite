// Core data types for the WebRTC Camera Suite

/**
 * User credentials for authentication
 */
export interface Credentials {
  username: string;
  password: string;
}

/**
 * Camera configuration and metadata
 */
export interface Camera {
  id: string;
  name: string;
  path: string; // MediaMTX stream path (e.g., "camera1", "camera2")
  lastSeen?: Date;
  status: CameraStatus;
  thumbnail?: string; // Optional thumbnail URL
  // Optional per-camera credentials (overrides global auth)
  credentials?: Credentials;
}

/**
 * Camera connection status
 */
export type CameraStatus = 'online' | 'offline' | 'unknown' | 'connecting';

/**
 * WebRTC player connection states
 */
export type PlayerState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'failed'
  | 'disconnected';

/**
 * WebRTC stream statistics
 */
export interface StreamStats {
  latency?: number; // milliseconds
  bitrate?: number; // kbps
  packetLoss?: number; // percentage
  resolution?: string; // e.g., "1920x1080"
  fps?: number;
  codec?: string;
}

/**
 * Player control states
 */
export interface PlayerControls {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  volume: number; // 0-1
}

/**
 * WebRTC ICE server configuration
 */
export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * Application configuration
 */
export interface AppConfig {
  serverUrl: string;
  iceServers?: RTCIceServer[];
  defaultCredentials?: Credentials;
  cameras: Camera[];
  // Playback preferences
  autoPlay: boolean;
  startMuted: boolean;
  rememberCredentials: boolean;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  credentials?: Credentials;
  rememberCredentials: boolean;
}

/**
 * WHEP (WebRTC-HTTP Egress Protocol) session
 */
export interface WhepSession {
  peerConnection: RTCPeerConnection;
  stream?: MediaStream;
  isActive: boolean;
  reconnectAttempts: number;
  lastError?: string;
}

/**
 * Error types for different failure scenarios
 */
export type AppError =
  | 'AUTH_FAILED'
  | 'SERVER_UNREACHABLE'
  | 'STREAM_NOT_FOUND'
  | 'WEBRTC_UNSUPPORTED'
  | 'CORS_ERROR'
  | 'NETWORK_ERROR';

/**
 * Error with user-friendly message
 */
export interface AppErrorDetails {
  type: AppError;
  message: string;
  details?: string;
}

/**
 * Settings validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * UI theme and layout preferences
 */
export interface UiPreferences {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showStats: boolean;
}
