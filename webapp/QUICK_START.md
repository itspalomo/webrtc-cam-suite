# Quick Start Guide - WebRTC Cam Suite v2.0.0

## 🚀 First Launch

### Step 1: Start the Application
```bash
cd webapp
npm install  # If not already done
npm run dev  # Development mode
# OR
npm run build && npm start  # Production mode
```

### Step 2: Navigate to the App
Open your browser: `http://localhost:3000`

### Step 3: First Login
You'll see a **blue notice box** with:
- **Username:** `admin`
- **Password:** `changeme`

Enter these credentials and click **"Sign In to Website"**.

### Step 4: You'll See a Warning
After login, you'll see a **yellow security warning** about using default credentials.
Don't worry - we'll change this next!

## ⚙️ Initial Configuration

### Configure Camera Credentials

1. **Go to Settings** (click Settings in the navigation bar)
2. **Click the "Camera Auth" tab**
3. **Enter your MediaMTX credentials:**
   - Username: (your MediaMTX username)
   - Password: (your MediaMTX password)
4. **Click "Test Credentials Against Server"**
   - ✅ Green = Success
   - ❌ Red = Check your credentials/server
5. **These will be saved automatically if successful**

### Change Site Password (Important!)

1. **Stay in Settings**
2. **Click the "Account" tab**
3. **Enter new credentials:**
   - New Username: (choose a username)
   - New Password: (min 8 characters)
   - Confirm Password: (same as above)
4. **Click "Update Website Credentials"**
5. **You're done!** Next time you login, use your new credentials.

## 🎥 View Your Cameras

1. **Click "Cameras" in the navigation** (or go to home)
2. **See your camera grid**
3. **Click any camera to view the stream**
4. **Enjoy low-latency WebRTC streaming!**

## 📖 Understanding the Two Types of Authentication

### Site Authentication (Website Login)
- **What it does:** Controls who can access THIS web application
- **Credentials:** Default is `admin` / `changeme`, change in Settings → Account
- **Where it's stored:** Your browser (localStorage + sessionStorage)
- **Purpose:** Protect your web interface from unauthorized access

### Camera Authentication (Stream Access)
- **What it does:** Authenticates with your MediaMTX server to view streams
- **Credentials:** Your MediaMTX username/password, set in Settings → Camera Auth
- **Where it's stored:** Your browser (localStorage, separate from site auth)
- **Purpose:** Authenticate with MediaMTX to access camera feeds

**They are SEPARATE!** You can (and should) use different credentials for each.

## 🔐 Security Tips

1. **✅ Change default site credentials immediately**
2. **✅ Use different passwords for site vs camera**
3. **✅ Use strong passwords (8+ characters)**
4. **✅ Don't share credentials publicly**
5. **⚠️  This is designed for local/personal use**
6. **⚠️  Not recommended for public internet without additional security**

## 🎨 Settings Overview

### Server Tab
- MediaMTX server URL
- ICE servers for WebRTC

### Cameras Tab
- Add/remove cameras
- Configure camera names and paths
- Set per-camera credentials (optional)

### Camera Auth Tab ⭐ NEW
- Set global default credentials for MediaMTX
- Test credentials against server
- Security best practices

### Account Tab ⭐ NEW
- Change website login credentials
- Security warnings for default credentials

### Playback Tab
- Auto-play settings
- Start muted option
- Remember credentials

## 🐛 Troubleshooting

### "No camera credentials available"
**Solution:** Go to Settings → Camera Auth and configure your MediaMTX credentials

### "Invalid username or password" (on login)
**Solution:** 
- First launch: Use `admin` / `changeme`
- After changing: Use your new credentials
- Forgot password: Clear browser localStorage and start fresh

### Camera won't connect
**Solutions:**
1. Verify MediaMTX server is running
2. Check server URL in Settings → Server
3. Test camera credentials in Settings → Camera Auth
4. Check browser console for errors

### Changed password but still see warning
**Solution:** Logout and login again, or refresh the page

## 📚 More Documentation

- **Comprehensive Guide:** `AUTHENTICATION_GUIDE.md`
- **What Changed:** `CHANGELOG.md`
- **Technical Details:** `IMPLEMENTATION_SUMMARY.md`

## 🎯 Next Steps

After setup:
1. ✅ Configure all your cameras in Settings → Cameras
2. ✅ Test each camera stream
3. ✅ Set per-camera credentials if needed
4. ✅ Enjoy your low-latency baby monitor!

## 💡 Pro Tips

- **Per-Camera Credentials:** Go to Settings → Cameras and add username/password for individual cameras
- **Test Before Saving:** Use the "Test Credentials" button to verify before saving
- **Organize Cameras:** Give them meaningful names like "Front Door", "Backyard", "Office", etc.
- **Check Stats:** Enable stats overlay to see latency, bitrate, etc.

## 📞 Need Help?

1. Check the comprehensive `AUTHENTICATION_GUIDE.md`
2. Review error messages - they're designed to be helpful!
3. Check browser console (F12) for detailed error logs
4. Verify MediaMTX server is accessible at your configured URL

---

**Welcome to WebRTC Cam Suite v2.0.0!** 🎉

You're all set up with:
- ✅ Secure website authentication
- ✅ Separate camera stream authentication
- ✅ Easy configuration interface
- ✅ Low-latency WebRTC streaming
- ✅ Modern, beautiful UI

Enjoy monitoring your cameras! 👶📹
