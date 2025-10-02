# MediaMTX API Reference

This document describes the MediaMTX API endpoints used by the WebRTC Camera Suite.

## Base Configuration

- **Base URL:** `http://your-pi-ip:9997`
- **Authentication:** HTTP Basic Auth (username/password)
- **Content-Type:** `application/json`

## Authentication

All API requests require HTTP Basic Authentication using the same credentials configured for stream access.

```bash
curl -u admin:changeme http://192.168.1.100:9997/v3/config/get
```

## Core Endpoints

### 1. Configuration Management

#### Get Configuration
```http
GET /v3/config/get
```

**Description:** Retrieve the current MediaMTX configuration.

**Response:**
```json
{
  "logLevel": "info",
  "api": true,
  "webrtc": true,
  "webrtcAddress": ":8889",
  "paths": {
    "camera1": {
      "source": "rtsp://192.168.1.101:554/stream1",
      "sourceOnDemand": true,
      "readUser": "admin",
      "readPass": "changeme"
    }
  }
}
```

#### Update Configuration
```http
POST /v3/config/set
Content-Type: application/json
```

**Request Body:**
```json
{
  "paths": {
    "camera1": {
      "source": "rtsp://192.168.1.101:554/stream1",
      "sourceOnDemand": true,
      "readUser": "admin",
      "readPass": "changeme"
    },
    "camera2": {
      "source": "rtsp://192.168.1.102:554/stream1",
      "sourceOnDemand": true,
      "readUser": "admin",
      "readPass": "changeme"
    }
  }
}
```

**Response:**
```json
{
  "error": ""
}
```

### 2. Path Management

#### List Paths
```http
GET /v3/paths/list
```

**Description:** List all configured camera paths.

**Response:**
```json
{
  "items": [
    {
      "name": "nursery",
      "source": {
        "type": "rtspSource",
        "id": "rtsp://192.168.1.101:554/stream1"
      },
      "ready": true,
      "readyTime": "2024-01-15T10:30:00Z",
      "tracks": ["H264", "AAC"],
      "readers": 1
    },
    {
      "name": "playroom",
      "source": {
        "type": "rtspSource", 
        "id": "rtsp://192.168.1.102:554/stream1"
      },
      "ready": false,
      "tracks": [],
      "readers": 0
    }
  ]
}
```

#### Get Path Info
```http
GET /v3/paths/get/{path-name}
```

**Example:**
```bash
curl -u baby:monitor http://192.168.1.100:9997/v3/paths/get/nursery
```

**Response:**
```json
{
  "name": "nursery",
  "source": {
    "type": "rtspSource",
    "id": "rtsp://192.168.1.101:554/stream1"
  },
  "ready": true,
  "readyTime": "2024-01-15T10:30:00Z",
  "tracks": ["H264", "AAC"],
  "bytesReceived": 1048576,
  "readers": 1
}
```

#### Add Path
```http
POST /v3/config/paths/add/{path-name}
Content-Type: application/json
```

**Request Body:**
```json
{
  "source": "rtsp://192.168.1.103:554/stream1",
  "sourceOnDemand": true,
  "readUser": "baby",
  "readPass": "monitor"
}
```

#### Remove Path
```http
POST /v3/config/paths/remove/{path-name}
```

### 3. WebRTC Management

#### WebRTC Sessions
```http
GET /v3/webrtcsessions/list
```

**Description:** List active WebRTC sessions.

**Response:**
```json
{
  "items": [
    {
      "id": "12345678-1234-1234-1234-123456789abc",
      "created": "2024-01-15T10:30:00Z",
      "remoteAddr": "192.168.1.50:54321",
      "path": "nursery",
      "bytesReceived": 0,
      "bytesSent": 2048576
    }
  ]
}
```

#### Get WebRTC Session
```http
GET /v3/webrtcsessions/get/{session-id}
```

#### Kick WebRTC Session
```http
POST /v3/webrtcsessions/kick/{session-id}
```

### 4. System Information

#### Server Stats
```http
GET /v3/stats
```

**Response:**
```json
{
  "bytesReceived": 10485760,
  "bytesSent": 52428800,
  "webrtcSessionCount": 2,
  "rtspSessionCount": 3,
  "pathCount": 2
}
```

## WebRTC Streaming Endpoints

### WHEP (WebRTC-HTTP Egress Protocol)

#### Initiate WebRTC Stream
```http
POST /{path-name}/whep
Content-Type: application/sdp
Authorization: Basic <base64-credentials>
```

**Request Body:** SDP Offer
```
v=0
o=- 123456789 123456789 IN IP4 0.0.0.0
s=-
t=0 0
a=group:BUNDLE 0
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:abcd
a=ice-pwd:efghijklmnopqrstuvwxyz
...
```

**Response Headers:**
```
HTTP/1.1 201 Created
Content-Type: application/sdp
Location: /nursery/whep/sessions/12345678-1234-1234-1234-123456789abc
```

**Response Body:** SDP Answer
```
v=0
o=- 987654321 987654321 IN IP4 192.168.1.100
s=-
t=0 0
a=group:BUNDLE 0
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 192.168.1.100
...
```

#### ICE Candidate Exchange
```http
PATCH /{path-name}/whep/sessions/{session-id}
Content-Type: application/trickle-ice-sdpfrag
```

**Request Body:**
```
a=candidate:1 1 UDP 2130706431 192.168.1.50 54321 typ host
```

#### Terminate WebRTC Stream
```http
DELETE /{path-name}/whep/sessions/{session-id}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "path 'nonexistent' is not configured"
}
```

### Common HTTP Status Codes
- **200 OK** - Request successful
- **201 Created** - Resource created (WebRTC session)
- **400 Bad Request** - Invalid request format
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Access denied
- **404 Not Found** - Path/resource not found
- **500 Internal Server Error** - Server error

## Usage Examples

### JavaScript/TypeScript

#### Get Camera List
```typescript
async function getCameras(): Promise<string[]> {
  const response = await fetch('/v3/paths/list', {
    headers: {
      'Authorization': `Basic ${btoa('baby:monitor')}`
    }
  });
  
  const data = await response.json();
  return data.items.map(item => item.name);
}
```

#### Check Stream Status
```typescript
async function isStreamReady(path: string): Promise<boolean> {
  try {
    const response = await fetch(`/v3/paths/get/${path}`, {
      headers: {
        'Authorization': `Basic ${btoa('baby:monitor')}`
      }
    });
    
    const data = await response.json();
    return data.ready === true;
  } catch (error) {
    return false;
  }
}
```

#### WebRTC Stream Setup
```typescript
async function startWebRTCStream(path: string, offer: RTCSessionDescription) {
  const response = await fetch(`/${path}/whep`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sdp',
      'Authorization': `Basic ${btoa('baby:monitor')}`
    },
    body: offer.sdp
  });
  
  if (response.status === 201) {
    const answerSdp = await response.text();
    const sessionLocation = response.headers.get('Location');
    
    return {
      answer: new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      }),
      sessionUrl: sessionLocation
    };
  }
  
  throw new Error(`Failed to start stream: ${response.status}`);
}
```

### Bash/cURL Examples

#### Health Check Script
```bash
#!/bin/bash

SERVER="http://192.168.1.100:9997"
CREDS="baby:monitor"

# Check if MediaMTX is responding
if curl -s -u "$CREDS" "$SERVER/v3/config/get" > /dev/null; then
    echo "✓ MediaMTX is running"
else
    echo "✗ MediaMTX is not responding"
    exit 1
fi

# Check camera streams
for camera in nursery playroom; do
    if curl -s -u "$CREDS" "$SERVER/v3/paths/get/$camera" | grep -q '"ready":true'; then
        echo "✓ Camera '$camera' is ready"
    else
        echo "✗ Camera '$camera' is not ready"
    fi
done
```

#### Add New Camera
```bash
#!/bin/bash

SERVER="http://192.168.1.100:9997"
CREDS="baby:monitor"
CAMERA_NAME="kitchen"
CAMERA_URL="rtsp://192.168.1.103:554/stream1"

curl -X POST \
  -u "$CREDS" \
  -H "Content-Type: application/json" \
  -d "{
    \"source\": \"$CAMERA_URL\",
    \"sourceOnDemand\": true,
    \"readUser\": \"baby\",
    \"readPass\": \"monitor\"
  }" \
  "$SERVER/v3/config/paths/add/$CAMERA_NAME"
```

## Rate Limits

MediaMTX doesn't enforce strict rate limits, but consider these guidelines:

- **Configuration changes:** Max 1 request per second
- **Status queries:** Max 10 requests per second
- **WebRTC sessions:** Limited by server resources

## Monitoring Integration

### Prometheus Metrics
MediaMTX exposes Prometheus metrics on port 9998:

```bash
curl http://192.168.1.100:9998/metrics
```

Key metrics:
- `mediamtx_paths_total` - Number of configured paths
- `mediamtx_rtsp_sessions_total` - Active RTSP sessions
- `mediamtx_webrtc_sessions_total` - Active WebRTC sessions
- `mediamtx_bytes_received_total` - Total bytes received
- `mediamtx_bytes_sent_total` - Total bytes sent

### Health Check Endpoint
```bash
# Simple health check
curl -f http://192.168.1.100:9997/v3/config/get && echo "OK" || echo "FAIL"
```

This API reference covers the essential endpoints for managing and monitoring your baby monitor system. For complete API documentation, refer to the [MediaMTX documentation](https://github.com/bluenviron/mediamtx).
