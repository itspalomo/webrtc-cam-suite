# Camera Suite Architecture

This document describes the technical architecture of the WebRTC Camera Suite.

## System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IP Cameras    │    │  Raspberry Pi   │    │  Client Device  │
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │┌───────────────┐│    │┌───────────────┐│
│  │   Camera 1  ││    ││   MediaMTX    ││    ││ Web Browser   ││
│  │   (RTSP)    ││────▶││   Server      ││◀───▶││ (WebRTC)      ││
│  └─────────────┘│    │└───────────────┘│    │└───────────────┘│
│                 │    │                 │    │                 │
│  ┌─────────────┐│    │┌───────────────┐│    │┌───────────────┐│
│  │   Camera 2  ││    ││   System      ││    ││ React App     ││
│  │   (RTSP)    ││────▶││   Services    ││    ││ (Next.js)     ││
│  └─────────────┘│    │└───────────────┘│    │└───────────────┘│
└─────────────────┘    └─────────────────┘    └─────────────────┘
       RTSP                   HTTP/WebRTC              HTTPS/WSS
```

## Components

### 1. IP Cameras
**Role:** Video source and capture
**Protocol:** RTSP (Real-Time Streaming Protocol)
**Encoding:** H.264 video, AAC audio (optional)

**Key Features:**
- Network-based video capture
- RTSP stream output
- Motion detection (camera-dependent)
- Night vision (IR illumination)
- Pan/tilt/zoom (model-dependent)

### 2. MediaMTX Server (Raspberry Pi)
**Role:** Media streaming server and protocol converter
**Protocols:** RTSP → WebRTC, HLS, RTMP
**Platform:** Go-based media server

**Key Features:**
- **Protocol Conversion:** RTSP to WebRTC for low-latency browser streaming
- **Authentication:** HTTP Basic Auth for secure access
- **Multi-format Support:** WebRTC, HLS, RTSP, RTMP outputs
- **On-demand Streaming:** Cameras activated only when needed
- **API Interface:** RESTful API for configuration and monitoring
- **Resource Efficient:** Optimized for ARM processors

**Ports:**
- 8889: WebRTC streaming
- 8888: HLS streaming  
- 8554: RTSP input/output
- 1935: RTMP streaming
- 9997: HTTP API

### 3. Web Application (Client)
**Role:** User interface and stream consumption
**Framework:** Next.js 14 with React 18
**Protocol:** WebRTC WHEP (WebRTC-HTTP Egress Protocol)

**Architecture Layers:**
```
┌─────────────────────────────────────┐
│           Presentation Layer        │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Components  │ │ Pages (Routes)  ││
│  │ - Player    │ │ - Login         ││
│  │ - Controls  │ │ - Viewer        ││
│  │ - Camera    │ │ - Settings      ││
│  │   Grid      │ │ - Privacy       ││
│  └─────────────┘ └─────────────────┘│
├─────────────────────────────────────┤
│            Business Layer           │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ Hooks       │ │ State Mgmt      ││
│  │ - useAuth   │ │ - localStorage  ││
│  │ - useWHEP   │ │ - sessionStorage││
│  │ - useCamera │ │ - React State   ││
│  └─────────────┘ └─────────────────┘│
├─────────────────────────────────────┤
│             Service Layer           │
│  ┌─────────────┐ ┌─────────────────┐│
│  │ WHEP Client │ │ Auth Service    ││
│  │ - WebRTC    │ │ - Credentials   ││
│  │ - ICE       │ │ - Session Mgmt  ││
│  │ - Stats     │ │ - Validation    ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
```

## Data Flow

### 1. Stream Initialization
```
Client                    MediaMTX                 Camera
  │                         │                        │
  │ 1. HTTP Auth Request    │                        │
  ├────────────────────────▶│                        │
  │ 2. Auth Success         │                        │
  │◀────────────────────────┤                        │
  │                         │                        │
  │ 3. WHEP Offer (SDP)     │                        │
  ├────────────────────────▶│                        │
  │                         │ 4. RTSP Connect        │
  │                         ├───────────────────────▶│
  │                         │ 5. RTSP Stream         │
  │                         │◀───────────────────────┤
  │ 6. WHEP Answer (SDP)    │                        │
  │◀────────────────────────┤                        │
  │                         │                        │
  │ 7. ICE Candidates       │                        │
  │◀───────────────────────▶│                        │
  │                         │                        │
  │ 8. WebRTC Media Stream  │                        │
  │◀════════════════════════│                        │
```

### 2. Authentication Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   MediaMTX      │    │   Storage       │
│                 │    │                 │    │                 │
│ 1. Login Form   │    │                 │    │                 │
│ ┌─────────────┐ │    │                 │    │                 │
│ │ Username    │ │    │                 │    │                 │
│ │ Password    │ │    │                 │    │                 │
│ │ Remember Me │ │    │                 │    │                 │
│ └─────────────┘ │    │                 │    │                 │
│       │         │    │                 │    │                 │
│ 2. Submit       │    │                 │    │                 │
│       │         │    │                 │    │                 │
│       ▼         │    │                 │    │                 │
│ 3. Store Creds  │────┼─────────────────┼───▶│ localStorage/   │
│                 │    │                 │    │ sessionStorage  │
│                 │    │                 │    │                 │
│ 4. API Request  │    │                 │    │                 │
│    (Basic Auth) │───▶│ 5. Validate     │    │                 │
│                 │    │    Credentials  │    │                 │
│ 6. Response     │    │                 │    │                 │
│   (Success/Fail)│◀───│                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Technology Stack

### Backend (Raspberry Pi)
- **OS:** Raspberry Pi OS (Debian-based Linux)
- **Media Server:** MediaMTX (Go-based)
- **Service Management:** systemd
- **Process Isolation:** Dedicated system user
- **Security:** UFW firewall, HTTP Basic Auth

### Frontend (Web Application)
- **Framework:** Next.js 14 (App Router)
- **Runtime:** React 18 with Server Components
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui (Radix UI)
- **State Management:** React hooks + localStorage
- **Animation:** Framer Motion
- **WebRTC:** Native WebRTC APIs

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript
- **Build Tool:** Turbopack (Next.js)
- **Version Control:** Git

## Network Protocols

### RTSP (Real-Time Streaming Protocol)
**Usage:** Camera to MediaMTX communication
**Port:** 8554 (default)
**Features:**
- Reliable video transport
- Session management
- Codec negotiation
- Authentication support

### WebRTC (Web Real-Time Communication)
**Usage:** MediaMTX to browser streaming
**Protocol:** WHEP (WebRTC-HTTP Egress Protocol)
**Features:**
- Ultra-low latency (< 500ms)
- Peer-to-peer communication
- NAT traversal via ICE
- DTLS encryption
- Adaptive bitrate

### HTTP/HTTPS
**Usage:** API communication and authentication
**Features:**
- RESTful API endpoints
- Basic Authentication
- JSON data exchange
- CORS support

## Security Architecture

### Authentication Layers
```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│ 1. Network Security                                     │
│    ├─ Firewall (UFW)                                   │
│    ├─ Private Network (LAN)                            │
│    └─ VPN Access (Optional)                            │
├─────────────────────────────────────────────────────────┤
│ 2. Application Security                                 │
│    ├─ HTTP Basic Authentication                        │
│    ├─ CORS Policy                                      │
│    └─ Input Validation                                 │
├─────────────────────────────────────────────────────────┤
│ 3. System Security                                      │
│    ├─ Dedicated User (mediamtx)                        │
│    ├─ File Permissions                                 │
│    └─ Process Isolation                                │
├─────────────────────────────────────────────────────────┤
│ 4. Transport Security                                   │
│    ├─ DTLS (WebRTC)                                    │
│    ├─ HTTPS (Optional)                                 │
│    └─ SRTP (Media Encryption)                          │
└─────────────────────────────────────────────────────────┘
```

### Credential Storage Options
1. **Session Storage** (Default)
   - Stored in browser memory
   - Cleared on browser close
   - Most secure for shared devices

2. **Local Storage** (Optional)
   - Persistent across sessions
   - Base64 encoded (not encrypted)
   - Convenient but less secure

## Performance Characteristics

### Latency Targets
- **Camera to MediaMTX:** < 100ms (RTSP)
- **MediaMTX to Browser:** < 500ms (WebRTC)
- **Total End-to-End:** < 600ms

### Throughput
- **Single Camera:** 1-5 Mbps (depending on resolution)
- **Multiple Cameras:** Limited by Pi's network/CPU
- **Recommended:** 2-3 cameras max on Pi 4B

### Resource Usage (Raspberry Pi 4B)
- **CPU:** 10-30% per camera stream
- **Memory:** 50-100MB base + 20MB per camera
- **Network:** Inbound = camera bitrates, Outbound = viewer bitrates
- **Storage:** Minimal (no recording by default)

## Scalability Considerations

### Horizontal Scaling
- Multiple Pi devices for different camera zones
- Load balancing via DNS or reverse proxy
- Separate recording vs streaming servers

### Vertical Scaling
- Pi 4B 8GB for more concurrent streams
- Dedicated GPU for hardware encoding
- NVMe storage for better I/O performance

### Cloud Integration
- Hybrid architecture with edge Pi + cloud processing
- CDN distribution for remote access
- Cloud recording and analytics

## Monitoring and Observability

### System Metrics
- **MediaMTX:** Built-in Prometheus metrics (port 9998)
- **System:** CPU, memory, disk, network via standard tools
- **Application:** Custom performance monitoring

### Logging
- **MediaMTX:** systemd journal (`journalctl -u mediamtx`)
- **System:** syslog, kern.log
- **Web App:** Browser console, server logs

### Health Checks
- **Service Status:** `systemctl status mediamtx`
- **API Health:** `curl http://localhost:9997/v3/config/get`
- **Stream Test:** Automated WebRTC connection tests

## Future Architecture Enhancements

### Planned Features
1. **Multi-user Support:** User management and permissions
2. **Recording:** Local and cloud storage options
3. **AI Integration:** Motion detection, face recognition
4. **Mobile Apps:** Native iOS/Android applications
5. **Push Notifications:** Real-time alerts
6. **Cloud Sync:** Configuration and footage backup

### Technical Improvements
1. **Container Deployment:** Docker/Podman for easier deployment
2. **Configuration Management:** Web-based MediaMTX configuration
3. **Automatic Discovery:** Camera auto-detection and setup
4. **Load Balancing:** Multiple MediaMTX instances
5. **Edge Computing:** Local AI processing capabilities

This architecture provides a solid foundation for a secure, performant, and scalable baby monitor system while maintaining simplicity and cost-effectiveness.
