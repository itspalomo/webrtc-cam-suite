/**
 * HLS (HTTP Live Streaming) utilities
 * Provides HLS.js integration for fallback streaming when WebRTC is unavailable
 */

import Hls from 'hls.js';
import { Credentials } from '@/types';

/**
 * Check if HLS is supported in the current browser
 */
export function isHlsSupported(): boolean {
  return Hls.isSupported();
}

/**
 * Check if native HLS is supported (Safari)
 */
export function isNativeHlsSupported(): boolean {
  const video = document.createElement('video');
  return Boolean(video.canPlayType('application/vnd.apple.mpegurl'));
}

/**
 * Build HLS URL for a camera stream
 * MediaMTX HLS endpoint: http://server:8888/{path}/index.m3u8
 */
export function buildHlsUrl(serverUrl: string, cameraPath: string): string {
  // Extract base URL and replace port with HLS port (8888)
  const url = new URL(serverUrl);
  url.port = '8888';
  
  const baseUrl = url.toString().replace(/\/$/, ''); // Remove trailing slash
  const path = cameraPath.replace(/^\//, ''); // Remove leading slash
  
  return `${baseUrl}/${path}/index.m3u8`;
}

/**
 * Create authorization header for HLS requests
 */
export function createHlsAuthHeader(credentials: Credentials): Record<string, string> {
  const { username, password } = credentials;
  const encodedCredentials = btoa(`${username}:${password}`);
  
  return {
    'Authorization': `Basic ${encodedCredentials}`,
  };
}

/**
 * Initialize HLS player with authentication
 */
export function initializeHlsPlayer(
  video: HTMLVideoElement,
  hlsUrl: string,
  credentials?: Credentials
): Hls {
  const hls = new Hls({
    debug: process.env.NODE_ENV === 'development',
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 90,
    xhrSetup: credentials ? (xhr: XMLHttpRequest) => {
      const authHeader = createHlsAuthHeader(credentials);
      Object.entries(authHeader).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    } : undefined,
  });

  hls.loadSource(hlsUrl);
  hls.attachMedia(video);

  return hls;
}

/**
 * Initialize native HLS (Safari)
 */
export function initializeNativeHls(
  video: HTMLVideoElement,
  hlsUrl: string,
  credentials?: Credentials
): void {
  // For native HLS, credentials need to be in the URL for Safari
  // Note: This is less secure but required for Safari native HLS
  if (credentials) {
    const url = new URL(hlsUrl);
    url.username = credentials.username;
    url.password = credentials.password;
    video.src = url.toString();
  } else {
    video.src = hlsUrl;
  }
}

/**
 * Cleanup HLS player
 */
export function cleanupHlsPlayer(hls: Hls | null): void {
  if (hls) {
    hls.destroy();
  }
}
