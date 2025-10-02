import { WhepSession, StreamStats, Credentials, RTCIceServer } from '@/types';
import { buildWhepUrl } from '@/config';

/**
 * WHEP (WebRTC-HTTP Egress Protocol) utilities for MediaMTX streaming
 * Handles WebRTC peer connection, SDP negotiation, and authentication
 */

/**
 * Generate HTTP Basic Authentication header
 */
export const createAuthHeader = (credentials: Credentials): string => {
  const { username, password } = credentials;
  const credentialsString = `${username}:${password}`;
  const encodedCredentials = btoa(credentialsString);
  return `Basic ${encodedCredentials}`;
};

/**
 * Create WebRTC peer connection with ICE servers
 */
export const createPeerConnection = (iceServers?: RTCIceServer[]): RTCPeerConnection => {
  const config: RTCConfiguration = {
    iceServers: iceServers || [
      { urls: 'stun:stun.l.google.com:19302' }
    ],
  };

  return new RTCPeerConnection(config);
};

/**
 * Establish WHEP session with MediaMTX server
 */
export const createWhepSession = async (
  serverUrl: string,
  cameraPath: string,
  credentials: Credentials,
  iceServers?: RTCIceServer[]
): Promise<WhepSession> => {
  const whepUrl = buildWhepUrl(serverUrl, cameraPath);
  const peerConnection = createPeerConnection(iceServers);

  let stream: MediaStream | undefined;
  let isActive = false;
  const reconnectAttempts = 0;

  // Handle incoming media stream
  peerConnection.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      stream = event.streams[0];
      isActive = true;
    }
  };

  // Handle ICE connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    const state = peerConnection.iceConnectionState;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[WHEP] ICE connection state:', state);
    }

    if (state === 'connected' || state === 'completed') {
      isActive = true;
    } else if (state === 'failed' || state === 'disconnected') {
      isActive = false;
    }
  };

  try {
    // Debug logging (gated for development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[WHEP] Creating session for:', whepUrl);
    }
    
    // Create SDP offer
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection.setLocalDescription(offer);

    // Send offer to WHEP endpoint
    let response: Response;
    try {
      response = await fetch(whepUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/sdp',
          'Authorization': createAuthHeader(credentials),
        },
        body: offer.sdp,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[WHEP] Response status:', response.status);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WHEP error response:', errorText);
        throw new Error(`WHEP request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
    } catch (fetchError) {
      console.error('[WHEP] Network error:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
      throw fetchError;
    }

    // Get SDP answer
    const answerSdp = await response.text();

    // Set remote description
    const answer = new RTCSessionDescription({
      type: 'answer',
      sdp: answerSdp,
    });

    await peerConnection.setRemoteDescription(answer);

    return {
      peerConnection,
      stream,
      isActive: true,
      reconnectAttempts,
    };

  } catch (error) {
    console.error('Failed to create WHEP session:', error);
    peerConnection.close();

    return {
      peerConnection,
      stream: undefined,
      isActive: false,
      reconnectAttempts,
      lastError: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Close WHEP session and clean up resources
 */
export const closeWhepSession = (session: WhepSession): void => {
  try {
    if (session.peerConnection) {
      session.peerConnection.close();
    }
    session.isActive = false;
  } catch (error) {
    console.warn('Error closing WHEP session:', error);
  }
};

/**
 * Get stream statistics from WebRTC peer connection
 */
export const getStreamStats = async (peerConnection: RTCPeerConnection): Promise<StreamStats> => {
  try {
    const stats = await peerConnection.getStats();

    let bitrate = 0;
    let packetLoss = 0;
    let resolution = '';
    let fps = 0;
    let codec = '';
    let latency = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        // Calculate bitrate (bytes per second to kbps)
        if (report.bytesReceived && report.timestamp) {
          const duration = (report.timestamp - ((report as unknown as { lastTimestamp?: number }).lastTimestamp || 0)) / 1000;
          if (duration > 0) {
            bitrate = Math.round((report.bytesReceived * 8) / (duration * 1000));
          }
        }

        // Packet loss
        if (report.packetsLost && report.packetsReceived) {
          const totalPackets = report.packetsLost + report.packetsReceived;
          packetLoss = totalPackets > 0 ? Math.round((report.packetsLost / totalPackets) * 100) : 0;
        }

        // Frame rate
        if (report.framesPerSecond) {
          fps = Math.round(report.framesPerSecond);
        }

        // Codec
        if (report.codecId) {
          const codecReport = stats.get(report.codecId);
          if (codecReport && codecReport.mimeType) {
            codec = codecReport.mimeType.split('/')[1] || '';
          }
        }

        // Resolution (from track stats)
        if (report.frameWidth && report.frameHeight) {
          resolution = `${report.frameWidth}x${report.frameHeight}`;
        }
      }

      // Round trip time for latency estimate
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime) {
          latency = Math.round(report.currentRoundTripTime * 1000); // Convert to ms
        }
      }
    });

    return {
      bitrate,
      packetLoss,
      resolution,
      fps,
      codec,
      latency,
    };

  } catch (error) {
    console.warn('Failed to get stream stats:', error);
    return {};
  }
};

/**
 * Reconnect WHEP session with exponential backoff
 */
export const reconnectWhepSession = async (
  serverUrl: string,
  cameraPath: string,
  credentials: Credentials,
  iceServers?: RTCIceServer[],
  maxAttempts: number = 5,
  baseDelay: number = 1000
): Promise<WhepSession> => {
  let lastSession: WhepSession | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[WHEP] Reconnection attempt ${attempt}/${maxAttempts}`);
    }

    // Close previous session if it exists
    if (lastSession) {
      closeWhepSession(lastSession);
    }

    try {
      const session = await createWhepSession(serverUrl, cameraPath, credentials, iceServers);

      if (session.isActive) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[WHEP] Reconnection successful');
        }
        return session;
      }

      lastSession = session;

      // Exponential backoff delay
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[WHEP] Reconnection attempt ${attempt} failed:`, error);
      }

      // Wait before next attempt
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Return the last failed session
  return lastSession || {
    peerConnection: createPeerConnection(),
    isActive: false,
    reconnectAttempts: maxAttempts,
    lastError: 'Maximum reconnection attempts exceeded',
  };
};

/**
 * Check if WebRTC is supported in the current browser
 */
export const isWebRTCSupported = (): boolean => {
  return !!(
    window.RTCPeerConnection &&
    window.RTCSessionDescription &&
    navigator.mediaDevices
  );
};

/**
 * Get user-friendly error message for WHEP errors
 */
export const getWhepErrorMessage = (error: string): string => {
  if (error.includes('401') || error.includes('403')) {
    return 'Authentication failed. Please check your credentials.';
  }
  if (error.includes('404')) {
    return 'Stream not found. Please check the camera path.';
  }
  if (error.includes('CORS')) {
    return 'Cross-origin request blocked. Please check server CORS configuration.';
  }
  if (error.includes('network') || error.includes('fetch') || error.includes('NetworkError')) {
    return 'Network error. Please check your connection and server URL.';
  }
  return 'Connection failed. Please try again.';
};

/**
 * Test WHEP endpoint connectivity
 */
export const testWhepEndpoint = async (
  serverUrl: string,
  cameraPath: string,
  credentials: Credentials
): Promise<{ success: boolean; error?: string }> => {
  try {
    const whepUrl = buildWhepUrl(serverUrl, cameraPath);
    console.log('Testing WHEP endpoint:', whepUrl);
    
    const response = await fetch(whepUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': createAuthHeader(credentials),
      },
      body: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n', // Minimal SDP for testing
    });

    console.log('Test response status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Authentication failed' };
    }
    
    // Any other response (including 400 for bad SDP) means the endpoint is reachable
    return { success: true };
    
  } catch (error) {
    console.error('WHEP endpoint test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
