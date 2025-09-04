#!/bin/bash

# Baby Monitor Raspberry Pi Setup Script
# This script installs and configures MediaMTX on Raspberry Pi OS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MEDIAMTX_VERSION="1.8.4"
MEDIAMTX_USER="mediamtx"
INSTALL_DIR="/opt/mediamtx"
CONFIG_DIR="/etc/mediamtx"
LOG_DIR="/var/log/mediamtx"
SERVICE_NAME="mediamtx"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Run as regular user with sudo privileges."
   exit 1
fi

print_status "Starting Baby Monitor Raspberry Pi setup..."

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
print_status "Installing dependencies..."
sudo apt install -y curl wget unzip systemctl

# Create mediamtx user
print_status "Creating MediaMTX user..."
if ! id "$MEDIAMTX_USER" &>/dev/null; then
    sudo useradd -r -s /bin/false -d /nonexistent $MEDIAMTX_USER
    print_success "Created user: $MEDIAMTX_USER"
else
    print_warning "User $MEDIAMTX_USER already exists"
fi

# Create directories
print_status "Creating directories..."
sudo mkdir -p $INSTALL_DIR $CONFIG_DIR $LOG_DIR
sudo chown $MEDIAMTX_USER:$MEDIAMTX_USER $INSTALL_DIR $LOG_DIR
sudo chmod 755 $CONFIG_DIR

# Detect architecture
ARCH=$(uname -m)
case $ARCH in
    armv7l)
        MEDIAMTX_ARCH="linux_armv7"
        ;;
    aarch64)
        MEDIAMTX_ARCH="linux_arm64v8"
        ;;
    x86_64)
        MEDIAMTX_ARCH="linux_amd64"
        ;;
    *)
        print_error "Unsupported architecture: $ARCH"
        exit 1
        ;;
esac

print_status "Detected architecture: $ARCH -> $MEDIAMTX_ARCH"

# Download and install MediaMTX
print_status "Downloading MediaMTX v$MEDIAMTX_VERSION..."
DOWNLOAD_URL="https://github.com/bluenviron/mediamtx/releases/download/v$MEDIAMTX_VERSION/mediamtx_v${MEDIAMTX_VERSION}_${MEDIAMTX_ARCH}.tar.gz"

cd /tmp
wget -O mediamtx.tar.gz "$DOWNLOAD_URL"
tar -xzf mediamtx.tar.gz

# Install binary
print_status "Installing MediaMTX binary..."
sudo cp mediamtx $INSTALL_DIR/
sudo chown $MEDIAMTX_USER:$MEDIAMTX_USER $INSTALL_DIR/mediamtx
sudo chmod 755 $INSTALL_DIR/mediamtx

# Install configuration
print_status "Installing configuration..."
if [[ -f "$(dirname "$0")/mediamtx.yml" ]]; then
    sudo cp "$(dirname "$0")/mediamtx.yml" $CONFIG_DIR/
    print_success "Installed custom MediaMTX configuration"
else
    sudo cp mediamtx.yml $CONFIG_DIR/
    print_warning "Using default MediaMTX configuration"
fi

sudo chown root:$MEDIAMTX_USER $CONFIG_DIR/mediamtx.yml
sudo chmod 640 $CONFIG_DIR/mediamtx.yml

# Create systemd service
print_status "Creating systemd service..."
sudo tee /etc/systemd/system/$SERVICE_NAME.service > /dev/null <<EOF
[Unit]
Description=MediaMTX Baby Monitor Server
After=network.target
Wants=network.target

[Service]
Type=simple
User=$MEDIAMTX_USER
Group=$MEDIAMTX_USER
ExecStart=$INSTALL_DIR/mediamtx $CONFIG_DIR/mediamtx.yml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mediamtx
KillMode=mixed
KillSignal=SIGTERM

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$LOG_DIR
CapabilityBoundingSet=CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
print_status "Enabling and starting MediaMTX service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# Configure firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    sudo ufw allow 8889/tcp comment "MediaMTX WebRTC"
    sudo ufw allow 8888/tcp comment "MediaMTX HLS"
    sudo ufw allow 8554/tcp comment "MediaMTX RTSP"
    sudo ufw allow 1935/tcp comment "MediaMTX RTMP"
    sudo ufw allow 9997/tcp comment "MediaMTX API"
    print_success "Firewall rules added"
fi

# Clean up
rm -f /tmp/mediamtx.tar.gz /tmp/mediamtx /tmp/mediamtx.yml

# Check service status
sleep 2
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    print_success "MediaMTX is running successfully!"
else
    print_error "MediaMTX failed to start. Check logs with: sudo journalctl -u $SERVICE_NAME"
    exit 1
fi

# Display status information
print_status "Installation completed!"
echo
echo "=== Baby Monitor Setup Complete ==="
echo "MediaMTX Version: $MEDIAMTX_VERSION"
echo "Install Directory: $INSTALL_DIR"
echo "Config Directory: $CONFIG_DIR"
echo "Log Directory: $LOG_DIR"
echo
echo "=== Service Management ==="
echo "Start:   sudo systemctl start $SERVICE_NAME"
echo "Stop:    sudo systemctl stop $SERVICE_NAME"
echo "Restart: sudo systemctl restart $SERVICE_NAME"
echo "Status:  sudo systemctl status $SERVICE_NAME"
echo "Logs:    sudo journalctl -u $SERVICE_NAME -f"
echo
echo "=== Access URLs ==="
echo "WebRTC:  http://$(hostname -I | awk '{print $1}'):8889"
echo "HLS:     http://$(hostname -I | awk '{print $1}'):8888"
echo "RTSP:    rtsp://$(hostname -I | awk '{print $1}'):8554"
echo "API:     http://$(hostname -I | awk '{print $1}'):9997"
echo
echo "=== Default Credentials ==="
echo "Username: baby"
echo "Password: monitor"
echo
print_warning "Remember to:"
print_warning "1. Update camera IP addresses in $CONFIG_DIR/mediamtx.yml"
print_warning "2. Change default credentials for production use"
print_warning "3. Configure your cameras to stream to the RTSP endpoints"
print_warning "4. Test the setup with the webapp"

print_success "Baby Monitor Raspberry Pi setup completed successfully!"
