# BabyCam Viewer

A modern, secure WebRTC-based live streaming viewer for MediaMTX camera feeds. Built with Next.js, TypeScript, and Tailwind CSS for a beautiful, responsive baby monitor experience.

![BabyCam Viewer](https://img.shields.io/badge/WebRTC-WHEP-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 🚀 Features

- **🔐 Secure Authentication**: HTTP Basic Auth with configurable credential storage
- **📱 Mobile-First Design**: Touch-friendly controls optimized for phones and tablets
- **⚡ Low-Latency Streaming**: WebRTC WHEP protocol for real-time video
- **📊 Stream Statistics**: Live bitrate, latency, FPS, and packet loss monitoring
- **🔄 Auto-Reconnection**: Intelligent reconnection with exponential backoff
- **🎛️ Advanced Controls**: Play/pause, mute, fullscreen, picture-in-picture
- **⌨️ Keyboard Shortcuts**: Desktop shortcuts for camera switching and controls
- **🎨 Modern UI**: Clean, calming interface perfect for baby monitoring
- **⚙️ Flexible Configuration**: Easy setup for LAN or remote server access

## 📋 Requirements

- **Node.js**: 18.0 or higher
- **MediaMTX Server**: 1.0+ with WebRTC and authentication enabled
- **Modern Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **WebRTC Support**: Required for video streaming

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd baby-monitor-webapp
npm install
```

### 2. Configure Environment

Copy the example environment file and customize it:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your MediaMTX server details:

```env
# Your MediaMTX server URL
BABYCAM_SERVER_URL=http://192.168.1.100:8889

# Camera stream paths (comma-separated)
BABYCAM_CAMERAS=nursery,playroom,kitchen

# Optional: Default credentials (pre-fill login form)
BABYCAM_DEFAULT_USERNAME=baby

# Optional: ICE servers for WebRTC
BABYCAM_ICE_SERVERS=stun:stun.l.google.com:19302
```

### 3. Configure MediaMTX Server

Ensure your MediaMTX server is configured with:

```yaml
# mediamtx.yml
api: true
webrtc: true
authMethod: basic
```

Create camera streams in your MediaMTX configuration or via API:

```yaml
paths:
  nursery:
    source: rtmp://camera-ip/live
    sourceOnDemand: true
  playroom:
    source: rtsp://camera-ip:554/stream
    sourceOnDemand: true
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### First Time Setup

1. **Login**: Enter your MediaMTX credentials
2. **Choose Storage**: Select session-only or persistent credential storage
3. **Configure Cameras**: Go to Settings to add/remove camera streams
4. **Start Monitoring**: Click on any camera card to begin streaming

### Camera Controls

- **Play/Pause**: Click the play button or video area
- **Mute/Unmute**: Click the speaker icon
- **Volume**: Drag the volume slider
- **Fullscreen**: Click the expand icon
- **Picture-in-Picture**: Click the PiP button (supported browsers)
- **Camera Switching**: Use the camera switcher or keyboard shortcuts

### Keyboard Shortcuts (Desktop)

- **1-9**: Switch to camera 1-9
- **Space**: Play/pause current stream
- **M**: Mute/unmute
- **F**: Toggle fullscreen
- **Arrow Left/Right**: Previous/next camera

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BABYCAM_SERVER_URL` | MediaMTX server URL | `http://localhost:8889` | Yes |
| `BABYCAM_CAMERAS` | Camera paths (comma-separated) | `nursery,playroom` | Yes |
| `BABYCAM_DEFAULT_USERNAME` | Pre-fill username | - | No |
| `BABYCAM_DEFAULT_REMEMBER` | Default "Remember Me" | `false` | No |
| `BABYCAM_ICE_SERVERS` | WebRTC ICE servers | Google STUN | No |

### In-App Settings

Access Settings (`/settings`) to configure:

- **Server Connection**: Update MediaMTX URL and test connectivity
- **Camera Management**: Add, remove, or modify camera streams
- **Playback Preferences**: Auto-play, mute settings, and controls
- **ICE Servers**: Configure STUN/TURN servers for complex networks

## 🔒 Security Considerations

### Credential Storage

BabyCam Viewer offers two credential storage options:

1. **Session Storage** (Recommended):
   - Credentials stored in browser memory only
   - Automatically cleared when browser closes
   - Most secure for shared devices

2. **Persistent Storage**:
   - Credentials saved in encrypted localStorage
   - Survives browser restarts
   - Convenient but requires secure device

### Network Security

- **HTTPS Recommended**: Use HTTPS for encrypted communication
- **Local Network**: Restrict MediaMTX access to your local network
- **VPN**: Use VPN for remote access to local cameras
- **Firewall**: Configure proper firewall rules

### Authentication

- Uses HTTP Basic Authentication with MediaMTX
- Credentials sent only to your configured server
- No external data collection or analytics
- WebRTC streams are DTLS encrypted

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Server not reachable"
```bash
# Check if MediaMTX is running
curl http://your-server:8889/

# Verify WebRTC is enabled
curl http://your-server:8889/v3/config/get
```

**Problem**: "Stream not found"
```bash
# Check if camera path exists
curl http://your-server:8889/nursery/

# Verify authentication
curl -u username:password http://your-server:8889/nursery/
```

**Problem**: "WebRTC not supported"
- Update your browser to the latest version
- Ensure you're not using an outdated mobile browser
- Check if WebRTC is disabled in browser settings

### Performance Issues

**High Latency**:
- Check Wi-Fi signal strength
- Reduce distance between device and router
- Configure MediaMTX bitrate settings
- Use wired connection when possible

**Video Freezing**:
- Reduce MediaMTX bitrate and resolution
- Check network congestion
- Ensure stable power to cameras
- Update browser and clear cache

### CORS Errors

If you see CORS errors, configure MediaMTX:

```yaml
# mediamtx.yml
corsOrigins: ["http://localhost:3000", "https://yourdomain.com"]
```

## 📱 Mobile Optimization

BabyCam Viewer is optimized for mobile devices:

- **Touch Controls**: Large, easy-to-tap buttons
- **Responsive Design**: Adapts to any screen size
- **Gesture Support**: Swipe to navigate between cameras
- **Battery Optimization**: Efficient WebRTC streaming
- **Display Wake Lock**: Keeps screen awake during monitoring

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Animations**: Framer Motion
- **State Management**: React hooks + localStorage
- **Streaming**: WebRTC WHEP protocol
- **Authentication**: HTTP Basic Auth

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── login/             # Authentication page
│   ├── viewer/[cameraId]/ # Dynamic camera viewer
│   ├── settings/          # Configuration page
│   └── privacy/           # Security information
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/ui base components
│   ├── forms/            # Form components
│   ├── player/           # Video player components
│   ├── layout/           # Layout components
│   └── camera-*.tsx      # Camera-related components
├── lib/                  # Utility libraries
│   ├── whep/            # WebRTC WHEP utilities
│   ├── auth/            # Authentication helpers
│   └── config/          # Configuration management
└── types/               # TypeScript type definitions
```

### Key Components

- **AuthGate**: Route protection and authentication
- **Player**: WebRTC video player with controls
- **CameraGrid**: Responsive camera card layout
- **SettingsForm**: Configuration management
- **WHEP Utils**: WebRTC session management

## 🔧 Development

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Mock Data

The app includes mock data for development:

```typescript
import { MOCK_CAMERAS, MOCK_CREDENTIALS } from '@/lib/mock-data';
```

## 📈 Performance Optimization

- **Code Splitting**: Dynamic imports for large components
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Efficient caching strategies for static assets
- **WebRTC Optimization**: Low-latency streaming configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing component structure
- Add proper error handling
- Include mobile-first responsive design
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MediaMTX](https://github.com/bluenviron/mediamtx) for the excellent WebRTC server
- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [Next.js](https://nextjs.org/) for the React framework

## 📞 Support

For issues and questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review MediaMTX [documentation](https://github.com/bluenviron/mediamtx)
3. Create an issue on GitHub
4. Check browser console for WebRTC errors

---

**Happy Monitoring! 👶📹**