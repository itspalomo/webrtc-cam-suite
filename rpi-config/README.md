# Raspberry Pi Configuration

This directory contains MediaMTX server configuration and setup scripts for your Raspberry Pi camera streaming system.

## Files

- **`mediamtx.yml`** - MediaMTX server configuration with camera streaming optimized settings
- **`install.sh`** - Complete installation script for Raspberry Pi
- **`update.sh`** - Script to update MediaMTX to the latest version

## Quick Setup

1. **Copy files to your Raspberry Pi:**
   ```bash
   scp -r rpi-config/ pi@your-pi-ip:~/camera-suite/
   ```

2. **Run the installation script:**
   ```bash
   cd ~/camera-suite/rpi-config
   chmod +x install.sh update.sh
   ./install.sh
   ```

3. **Configure your cameras:**
   Edit `/etc/mediamtx/mediamtx.yml` and update the camera IP addresses:
   ```yaml
   paths:
     camera1:
       source: rtsp://192.168.1.101:554/stream1  # Update this IP
   ```

4. **Restart the service:**
   ```bash
   sudo systemctl restart mediamtx
   ```

## Configuration Details

### Default Settings

- **WebRTC Port:** 8889
- **HLS Port:** 8888
- **RTSP Port:** 8554
- **API Port:** 9997
- **Default Username:** admin
- **Default Password:** changeme

### Camera Paths

The configuration includes these default camera paths:
- `/camera1` - First camera
- `/camera2` - Second camera
- `/camera3` - Third camera (optional)
- `/test` - Test stream for development

### Security Features

- HTTP Basic Authentication enabled
- User isolation with dedicated `mediamtx` system user
- Systemd service with security restrictions
- Firewall rules for required ports

## Service Management

```bash
# Start/stop/restart service
sudo systemctl start mediamtx
sudo systemctl stop mediamtx
sudo systemctl restart mediamtx

# Check status
sudo systemctl status mediamtx

# View logs
sudo journalctl -u mediamtx -f

# View configuration
sudo cat /etc/mediamtx/mediamtx.yml
```

## Updating MediaMTX

To update to the latest version:

```bash
./update.sh
```

## Troubleshooting

### Check if MediaMTX is running
```bash
curl http://localhost:9997/v3/config/get
```

### Test camera streams
```bash
# Check if camera path exists
curl http://localhost:8889/camera1/

# Test with authentication
curl -u admin:changeme http://localhost:8889/camera1/
```

### Common Issues

1. **Service won't start:**
   - Check logs: `sudo journalctl -u mediamtx`
   - Verify configuration: `sudo mediamtx /etc/mediamtx/mediamtx.yml --check`

2. **Camera not connecting:**
   - Verify camera IP address in configuration
   - Test RTSP stream directly: `ffplay rtsp://camera-ip:554/stream1`

3. **WebRTC connection fails:**
   - Check firewall settings
   - Verify ports 8889 is accessible
   - Check browser console for WebRTC errors

## Hardware Requirements

### Minimum Requirements
- Raspberry Pi 3B+ or newer
- 16GB microSD card (Class 10 or better)
- Reliable power supply (5V 3A recommended)
- Ethernet connection (Wi-Fi works but wired is preferred)

### Recommended Setup
- Raspberry Pi 4B (4GB RAM or more)
- 32GB microSD card (SanDisk Extreme Pro recommended)
- Official Raspberry Pi power supply
- Gigabit Ethernet connection
- Heat sinks or fan for cooling

## Network Configuration

### Port Forwarding (for remote access)
If you want to access your camera system remotely, configure your router to forward these ports:

- **8889** → Pi IP:8889 (WebRTC)
- **8888** → Pi IP:8888 (HLS - optional)

### Static IP Address
Set a static IP for your Pi to ensure consistent access:

1. Edit `/etc/dhcpcd.conf`:
   ```
   interface eth0
   static ip_address=192.168.1.100/24
   static routers=192.168.1.1
   static domain_name_servers=192.168.1.1 8.8.8.8
   ```

2. Reboot: `sudo reboot`

## Security Considerations

### Change Default Credentials
Edit `/etc/mediamtx/mediamtx.yml` and update:
```yaml
pathDefaults:
  readUser: your-username
  readPass: your-secure-password
```

### Enable Firewall
```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update MediaMTX
./update.sh
```

## Performance Optimization

### For Multiple Cameras
If running multiple cameras, consider these optimizations:

1. **Increase GPU memory split:**
   ```bash
   sudo raspi-config
   # Advanced Options → Memory Split → 128
   ```

2. **Optimize MediaMTX settings:**
   ```yaml
   # Reduce segment duration for lower latency
   hlsSegmentDuration: 500ms
   hlsPartDuration: 100ms
   ```

3. **Use H.264 hardware encoding on cameras when possible**

### Monitoring Resources
```bash
# Check CPU and memory usage
htop

# Monitor disk space
df -h

# Check service resource usage
sudo systemctl status mediamtx
```
