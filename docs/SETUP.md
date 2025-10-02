# Camera Suite Setup Guide

This guide walks you through setting up your complete camera streaming system with Raspberry Pi and the web viewer.

## Overview

The WebRTC Camera Suite consists of:
- **Raspberry Pi** running MediaMTX server for video streaming
- **IP Cameras** connected to your network
- **Web Application** for viewing streams on any device

## System Requirements

### Raspberry Pi
- Raspberry Pi 3B+ or newer (Pi 4B 4GB+ recommended)
- 16GB+ microSD card (Class 10 or better)
- Reliable power supply (5V 3A)
- Network connection (Ethernet preferred)

### IP Cameras
- RTSP-compatible IP cameras
- Network connectivity (Wi-Fi or Ethernet)
- H.264 video encoding support

### Viewing Devices
- Modern web browser with WebRTC support
- Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

## Step 1: Prepare Your Raspberry Pi

### 1.1 Install Raspberry Pi OS
1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Flash Raspberry Pi OS Lite (64-bit) to your microSD card
3. Enable SSH during setup or create `ssh` file in boot partition
4. Insert card and boot your Pi

### 1.2 Initial Pi Configuration
```bash
# Connect via SSH
ssh pi@your-pi-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Configure basics
sudo raspi-config
# - Enable SSH (if not already)
# - Set timezone
# - Expand filesystem
# - Set GPU memory split to 128MB (Advanced Options)
```

### 1.3 Set Static IP (Recommended)
```bash
sudo nano /etc/dhcpcd.conf

# Add these lines (adjust for your network):
interface eth0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8

# Reboot to apply changes
sudo reboot
```

## Step 2: Install MediaMTX on Raspberry Pi

### 2.1 Copy Installation Files
From your development machine:
```bash
# Clone this repository
git clone <your-repo-url>
cd pi-baby-monitor

# Copy files to Pi
scp -r rpi-config/ pi@192.168.1.100:~/baby-monitor/
```

### 2.2 Run Installation
On your Raspberry Pi:
```bash
cd ~/baby-monitor/rpi-config
chmod +x install.sh update.sh
./install.sh
```

The installation script will:
- Download and install MediaMTX
- Create system user and directories
- Configure systemd service
- Set up firewall rules
- Start the MediaMTX service

### 2.3 Verify Installation
```bash
# Check service status
sudo systemctl status mediamtx

# Test API endpoint
curl http://localhost:9997/v3/config/get

# View logs
sudo journalctl -u mediamtx -f
```

## Step 3: Configure IP Cameras

### 3.1 Camera Network Setup
1. Connect cameras to your network
2. Note their IP addresses (check router admin panel)
3. Enable RTSP streaming on each camera
4. Set up authentication if required

### 3.2 Test Camera Streams
```bash
# Test RTSP stream (install ffmpeg if needed)
ffplay rtsp://camera-ip:554/stream1

# Or use VLC media player
vlc rtsp://camera-ip:554/stream1
```

### 3.3 Update MediaMTX Configuration
```bash
sudo nano /etc/mediamtx/mediamtx.yml

# Update camera sources:
paths:
  nursery:
    source: rtsp://192.168.1.101:554/stream1  # Your camera IP
    sourceOnDemand: true
  playroom:
    source: rtsp://192.168.1.102:554/stream1  # Second camera IP
    sourceOnDemand: true

# Restart service after changes
sudo systemctl restart mediamtx
```

## Step 4: Set Up Web Application

### 4.1 Install Dependencies
On your development machine:
```bash
cd webapp
npm install
```

### 4.2 Configure Environment
```bash
cp .env.example .env.local

# Edit .env.local:
BABYCAM_SERVER_URL=http://192.168.1.100:8889  # Your Pi IP
BABYCAM_CAMERAS=nursery,playroom
BABYCAM_DEFAULT_USERNAME=baby
```

### 4.3 Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000 to access the baby monitor interface.

### 4.4 Production Deployment
For production, you can:

1. **Build and serve locally:**
   ```bash
   npm run build
   npm start
   ```

2. **Deploy to Vercel/Netlify:**
   - Connect your repository
   - Set environment variables
   - Deploy automatically

3. **Self-host on the Pi:**
   ```bash
   # Build the app
   npm run build

   # Copy build to Pi
   scp -r .next/standalone pi@192.168.1.100:~/webapp/
   
   # Run on Pi with PM2 or similar
   ```

## Step 5: Test the Complete System

### 5.1 Verify MediaMTX Streams
```bash
# Check camera endpoints
curl -u baby:monitor http://192.168.1.100:8889/nursery/
curl -u baby:monitor http://192.168.1.100:8889/playroom/
```

### 5.2 Test Web Application
1. Open http://localhost:3000
2. Login with credentials (baby/monitor)
3. Click on a camera to start streaming
4. Test controls: play/pause, mute, fullscreen
5. Check stream statistics overlay

### 5.3 Mobile Testing
1. Connect phone/tablet to same network
2. Access web app via Pi's IP: http://192.168.1.100:3000
3. Test touch controls and responsiveness

## Step 6: Security Configuration

### 6.1 Change Default Credentials
```bash
sudo nano /etc/mediamtx/mediamtx.yml

# Update authentication:
pathDefaults:
  readUser: your-secure-username
  readPass: your-secure-password

sudo systemctl restart mediamtx
```

### 6.2 Enable Firewall
```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 8889/tcp  # WebRTC
```

### 6.3 SSL/HTTPS Setup (Optional)
For remote access, set up reverse proxy with SSL:
```bash
# Install nginx
sudo apt install nginx certbot python3-certbot-nginx

# Configure reverse proxy
sudo nano /etc/nginx/sites-available/baby-monitor

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## Step 7: Remote Access (Optional)

### 7.1 Port Forwarding
Configure your router to forward:
- Port 8889 → Pi IP:8889 (WebRTC)
- Port 3000 → Pi IP:3000 (Web app, if self-hosted)

### 7.2 Dynamic DNS (Optional)
Set up dynamic DNS service (like No-IP, DuckDNS) to access your system via domain name.

### 7.3 VPN Access (Recommended)
For security, consider VPN access instead of port forwarding:
- Set up WireGuard or OpenVPN on Pi
- Access baby monitor through VPN tunnel

## Troubleshooting

### Common Issues

1. **MediaMTX won't start:**
   ```bash
   sudo journalctl -u mediamtx
   # Check configuration syntax
   ```

2. **Camera not connecting:**
   ```bash
   # Test RTSP stream directly
   ffplay rtsp://camera-ip:554/stream1
   ```

3. **WebRTC connection fails:**
   - Check firewall settings
   - Verify browser WebRTC support
   - Check network connectivity

4. **High latency:**
   - Use wired connections when possible
   - Reduce camera resolution/bitrate
   - Optimize MediaMTX settings

### Getting Help

1. Check logs: `sudo journalctl -u mediamtx -f`
2. Test API: `curl http://pi-ip:9997/v3/config/get`
3. Verify camera streams: `ffplay rtsp://camera-ip:554/stream1`
4. Check browser console for WebRTC errors

## Maintenance

### Regular Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update MediaMTX
cd ~/baby-monitor/rpi-config
./update.sh

# Check disk space
df -h

# Monitor service health
sudo systemctl status mediamtx
```

### Backup Configuration
```bash
# Backup MediaMTX config
sudo cp /etc/mediamtx/mediamtx.yml ~/backup/

# Backup web app environment
cp webapp/.env.local ~/backup/
```

## Next Steps

Once your system is running:
1. Customize the web interface in `webapp/src/`
2. Add more cameras by updating MediaMTX config
3. Set up recording functionality (optional)
4. Configure alerts and notifications (future feature)
5. Add user management (future feature)

Your baby monitor system is now ready for use! 👶📹
