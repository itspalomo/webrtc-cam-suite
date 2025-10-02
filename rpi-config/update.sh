#!/bin/bash

# MediaMTX Update Script for Camera Suite
# This script updates MediaMTX to the latest version

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MEDIAMTX_USER="mediamtx"
INSTALL_DIR="/opt/mediamtx"
CONFIG_DIR="/etc/mediamtx"
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

# Get latest version from GitHub API
print_status "Fetching latest MediaMTX version..."
LATEST_VERSION=$(curl -s https://api.github.com/repos/bluenviron/mediamtx/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')
if [[ -z "$LATEST_VERSION" ]]; then
    print_error "Failed to fetch latest version"
    exit 1
fi

MEDIAMTX_VERSION=${LATEST_VERSION#v}  # Remove 'v' prefix
print_status "Latest version: $MEDIAMTX_VERSION"

# Check current version
if [[ -f "$INSTALL_DIR/mediamtx" ]]; then
    CURRENT_VERSION=$($INSTALL_DIR/mediamtx --version 2>/dev/null | grep -oP 'v\K[0-9.]+' || echo "unknown")
    print_status "Current version: $CURRENT_VERSION"
    
    if [[ "$CURRENT_VERSION" == "$MEDIAMTX_VERSION" ]]; then
        print_success "MediaMTX is already up to date!"
        exit 0
    fi
else
    print_warning "MediaMTX not found. This will perform a fresh installation."
fi

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

print_status "Architecture: $ARCH -> $MEDIAMTX_ARCH"

# Stop service
print_status "Stopping MediaMTX service..."
sudo systemctl stop $SERVICE_NAME

# Backup current binary
if [[ -f "$INSTALL_DIR/mediamtx" ]]; then
    print_status "Backing up current binary..."
    sudo cp "$INSTALL_DIR/mediamtx" "$INSTALL_DIR/mediamtx.backup"
fi

# Download and install new version
print_status "Downloading MediaMTX v$MEDIAMTX_VERSION..."
DOWNLOAD_URL="https://github.com/bluenviron/mediamtx/releases/download/v$MEDIAMTX_VERSION/mediamtx_v${MEDIAMTX_VERSION}_${MEDIAMTX_ARCH}.tar.gz"

cd /tmp
wget -O mediamtx.tar.gz "$DOWNLOAD_URL"
tar -xzf mediamtx.tar.gz

# Install new binary
print_status "Installing new binary..."
sudo cp mediamtx $INSTALL_DIR/
sudo chown $MEDIAMTX_USER:$MEDIAMTX_USER $INSTALL_DIR/mediamtx
sudo chmod 755 $INSTALL_DIR/mediamtx

# Start service
print_status "Starting MediaMTX service..."
sudo systemctl start $SERVICE_NAME

# Check service status
sleep 2
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    print_success "MediaMTX updated and running successfully!"
    print_success "Updated from $CURRENT_VERSION to $MEDIAMTX_VERSION"
else
    print_error "MediaMTX failed to start after update. Restoring backup..."
    if [[ -f "$INSTALL_DIR/mediamtx.backup" ]]; then
        sudo cp "$INSTALL_DIR/mediamtx.backup" "$INSTALL_DIR/mediamtx"
        sudo systemctl start $SERVICE_NAME
        print_warning "Restored previous version. Check logs with: sudo journalctl -u $SERVICE_NAME"
    fi
    exit 1
fi

# Clean up
rm -f /tmp/mediamtx.tar.gz /tmp/mediamtx
if [[ -f "$INSTALL_DIR/mediamtx.backup" ]]; then
    sudo rm "$INSTALL_DIR/mediamtx.backup"
fi

print_success "MediaMTX update completed successfully!"
