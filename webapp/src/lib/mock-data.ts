import { Camera, Credentials, AppConfig, StreamStats } from '@/types';

/**
 * Mock data for development and testing
 * Provides sample cameras, credentials, and configuration
 */

// Mock credentials for testing
export const MOCK_CREDENTIALS: Credentials = {
  username: 'admin',
  password: 'changeme',
};

// Mock cameras with different states
export const MOCK_CAMERAS: Camera[] = [
  {
    id: 'camera1',
    name: 'Front Door',
    path: 'camera1',
    status: 'online',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    thumbnail: 'https://placekitten.com/320/180', // Placeholder image
  },
  {
    id: 'camera2',
    name: 'Backyard',
    path: 'camera2',
    status: 'online',
    lastSeen: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    thumbnail: 'https://placekitten.com/321/180', // Different placeholder
  },
  {
    id: 'camera3',
    name: 'Garage',
    path: 'camera3',
    status: 'offline',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 'camera4',
    name: 'Office',
    path: 'camera4',
    status: 'unknown',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
];

// Mock configuration for development
export const MOCK_CONFIG: AppConfig = {
  serverUrl: 'http://192.168.1.100:8889',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
  cameras: MOCK_CAMERAS,
  autoPlay: true,
  startMuted: true,
  rememberCredentials: false,
};

// Mock stream statistics
export const MOCK_STREAM_STATS: StreamStats = {
  latency: 45,
  bitrate: 2048,
  packetLoss: 0.1,
  resolution: '1920x1080',
  fps: 30,
  codec: 'H.264',
};

// Mock error states for testing
export const MOCK_ERRORS = {
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  SERVER_UNREACHABLE: 'Cannot connect to server. Please check the server URL.',
  STREAM_NOT_FOUND: 'Stream not found. Please check the camera path.',
  WEBRTC_UNSUPPORTED: 'WebRTC is not supported in this browser.',
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  CORS_ERROR: 'Cross-origin request blocked. Please check server CORS configuration.',
};

// Empty states for when no data is available
export const EMPTY_STATES = {
  NO_CAMERAS: {
    title: 'No Cameras Configured',
    description: 'Add your first camera in Settings to start viewing.',
    actionText: 'Go to Settings',
  },
  NO_STREAM: {
    title: 'Stream Unavailable',
    description: 'The camera stream is currently unavailable. This could be due to network issues or the camera being offline.',
    actionText: 'Try Again',
  },
  LOADING: {
    title: 'Loading...',
    description: 'Please wait while we connect to your camera.',
  },
};

// Sample configuration templates for different environments
export const CONFIG_TEMPLATES = {
  LAN_SETUP: {
    serverUrl: 'http://192.168.1.100:8889',
    cameras: ['camera1', 'camera2'],
    iceServers: ['stun:stun.l.google.com:19302'],
  },
  REMOTE_SETUP: {
    serverUrl: 'https://camsuite.example.com:8889',
    cameras: ['camera1', 'camera2', 'camera3'],
    iceServers: [
      'stun:stun.l.google.com:19302',
      'turn:turn.example.com:3478?transport=udp',
    ],
  },
  DEVELOPMENT: {
    serverUrl: 'http://localhost:8889',
    cameras: ['test1', 'test2'],
    iceServers: ['stun:stun.l.google.com:19302'],
  },
};

// Helper functions for mock data
export const getMockCameraById = (id: string): Camera | undefined => {
  return MOCK_CAMERAS.find(camera => camera.id === id);
};

export const getMockCamerasByStatus = (status: Camera['status']): Camera[] => {
  return MOCK_CAMERAS.filter(camera => camera.status === status);
};

export const getRandomMockStats = (): StreamStats => {
  return {
    latency: Math.floor(Math.random() * 100) + 20,
    bitrate: Math.floor(Math.random() * 2000) + 1000,
    packetLoss: Math.random() * 2,
    resolution: Math.random() > 0.5 ? '1920x1080' : '1280x720',
    fps: Math.random() > 0.5 ? 30 : 25,
    codec: Math.random() > 0.5 ? 'H.264' : 'H.265',
  };
};

// Simulate random camera status changes for testing
export const simulateCameraStatusChange = (camera: Camera): Camera => {
  const statuses: Camera['status'][] = ['online', 'offline', 'unknown', 'connecting'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    ...camera,
    status: randomStatus,
    lastSeen: randomStatus === 'online' ? new Date() : camera.lastSeen,
  };
};
