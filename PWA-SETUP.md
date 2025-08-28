# Progressive Web App (PWA) Setup Guide

## Overview

The Piano Chord Progression Trainer has been upgraded to a full Progressive Web App (PWA) with automatic versioning, service worker caching, and iOS full-screen support.

## Features Added

### 🚀 PWA Capabilities
- **Installable**: Users can install the app on their devices
- **Offline Support**: App works offline after initial load
- **App-like Experience**: Full-screen mode on mobile devices
- **Automatic Updates**: Service worker detects and applies updates automatically

### 📱 iOS Full-Screen Support
- **Standalone Mode**: Runs in full-screen without browser UI
- **Safe Area Support**: Respects iPhone notch and home indicator
- **Status Bar Styling**: Proper status bar appearance
- **Installation Hints**: Prompts iOS users to add to home screen

### 🔄 Automatic Versioning
- **Version Detection**: Automatically detects version changes
- **Cache Management**: Updates cache when new version is available
- **Update Notifications**: Shows user-friendly update messages
- **Install Prompts**: Shows install button when version changes are detected
- **Force Updates**: Option to manually check for updates

## Files Added

### Core PWA Files
- `manifest.json` - PWA manifest with app metadata
- `sw.js` - Service worker for caching and updates
- `version.json` - Version configuration file
- `pwa-manager.js` - PWA functionality manager
- `icons/` - Directory with app icons (various sizes)

### Utility Files
- `update-version.sh` - Script to update app version
- `generate-icons.html` - Tool to generate PNG icons from SVG
- `PWA-SETUP.md` - This setup guide

## Installation Instructions

### 1. Server Requirements
- **HTTPS**: PWA requires HTTPS (or localhost for development)
- **Proper MIME Types**: Ensure `.json` files serve as `application/json`
- **Service Worker**: Must be served from same origin as app

### 2. Icon Setup
The app includes an SVG icon that works as a fallback. For best results:

1. **Generate PNG Icons**: Open `generate-icons.html` in a browser
2. **Download Icons**: Use the generator to create proper PNG files
3. **Replace Placeholders**: Replace the SVG files with generated PNGs

### 3. Version Management

#### Manual Version Update
```bash
# Update to specific version
./update-version.sh 1.1.0 "Added new features"

# Auto-increment patch version
./update-version.sh
```

#### Version File Format
```json
{
  "version": "1.0.0",
  "buildTime": "2025-01-28T00:00:00Z",
  "description": "Version description",
  "cacheVersion": "v1.0.0"
}
```

### 4. Deployment Process

1. **Update Version** (if needed):
   ```bash
   ./update-version.sh 1.0.1 "Bug fixes and improvements"
   ```

2. **Test Locally**:
   - Serve over HTTPS or use `localhost`
   - Check service worker registration in DevTools
   - Verify manifest in Application tab

3. **Deploy to Server**:
   - Upload all files including new PWA files
   - Ensure proper MIME types are set
   - Test PWA features on deployed version

4. **Verify Installation**:
   - Check for "Add to Home Screen" prompt
   - Test offline functionality
   - Verify automatic updates work

## How Automatic Updates Work

### Update Detection
1. **Service Worker Checks**: Periodically checks `version.json` for changes
2. **Version Comparison**: Compares current version with server version
3. **Cache Update**: Downloads new files when version changes
4. **User Notification**: Shows update notification to user

### Update Flow
```
User visits app → Service worker checks version → 
New version found → Downloads updates → 
Notifies user → Shows install button (if not installed) → App updated
```

### Install Button Behavior
- **Version Changes**: Install button appears automatically when new version is detected
- **Settings Panel**: Persistent install button in PWA controls section
- **Update Notifications**: Install button included in update notifications for non-installed users
- **iOS Support**: Falls back to manual instructions for iOS devices
- **Installation Success**: Button disappears and shows success notification after install

### Force Update
Users can manually trigger updates via:
- Settings panel "Check for Updates" button
- App automatically checks on focus/visibility change
- Periodic background checks every 5 minutes

## iOS Installation

### For Users
1. **Open in Safari**: Navigate to the app URL
2. **Share Menu**: Tap the share button (square with arrow)
3. **Add to Home Screen**: Select "Add to Home Screen"
4. **Install**: Tap "Add" to install the PWA

### Features in iOS PWA Mode
- **Full Screen**: Runs without Safari UI
- **Splash Screen**: Shows app icon during launch
- **Status Bar**: Proper status bar styling
- **Safe Areas**: Respects iPhone notch and home indicator

## Development Workflow

### Local Testing
```bash
# Serve with HTTPS (required for PWA)
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js http-server with SSL
npx http-server -S -C cert.pem -K key.pem

# Option 3: Use localhost (works without HTTPS)
# Open file:// URLs won't work for PWA features
```

### Version Updates During Development
```bash
# Quick patch version bump
./update-version.sh

# Major feature release
./update-version.sh 2.0.0 "Major update with new features"

# Bug fix release
./update-version.sh 1.0.1 "Fixed audio synchronization issue"
```

### Testing PWA Features

#### Service Worker
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Active service workers:', registrations);
});

// Force update check
if (window.pwaManager) {
    window.pwaManager.checkForUpdates();
}
```

#### Installation Status
```javascript
// Check if running as PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
console.log('Running as PWA:', isPWA);

// Check installation capability
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('App can be installed');
});
```

## Troubleshooting

### Common Issues

#### Service Worker Not Registering
- **Check HTTPS**: Ensure serving over HTTPS or localhost
- **Check Console**: Look for registration errors in DevTools
- **Clear Cache**: Clear browser cache and try again

#### Icons Not Showing
- **File Paths**: Ensure icon files exist at specified paths
- **MIME Types**: Check server serves PNG files correctly
- **Size Requirements**: Ensure all required icon sizes exist

#### Updates Not Working
- **Cache Headers**: Check server cache headers aren't too aggressive
- **Version File**: Ensure `version.json` is accessible and updated
- **Service Worker**: Check service worker is active in DevTools

#### iOS Installation Issues
- **Safari Only**: PWA installation only works in Safari on iOS
- **Add to Home Screen**: Option may not appear if already installed
- **Manifest Validation**: Check manifest.json is valid

### Debug Commands

```javascript
// Check current version
console.log('App version:', window.pwaManager?.getVersion());

// Check PWA status
console.log('Is PWA:', window.pwaManager?.isPWA());

// Force service worker update
navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) reg.update();
});

// Clear all caches (for testing)
caches.keys().then(names => {
    names.forEach(name => caches.delete(name));
});
```

## Best Practices

### Version Management
- **Semantic Versioning**: Use major.minor.patch format
- **Meaningful Descriptions**: Include clear update descriptions
- **Test Updates**: Always test version updates before deployment

### Performance
- **Cache Strategy**: Service worker uses cache-first for static assets
- **Update Timing**: Updates check periodically but don't interrupt user
- **Bandwidth**: Icons and cached files reduce repeat downloads

### User Experience
- **Update Notifications**: Clear, non-intrusive update messages
- **Offline Support**: App remains functional when offline
- **Installation Prompts**: Helpful but not pushy installation hints

## Monitoring

### Analytics to Track
- **Installation Rate**: How many users install the PWA
- **Update Adoption**: How quickly users get new versions
- **Offline Usage**: How often app is used offline
- **Error Rates**: Service worker and PWA-related errors

### Logs to Monitor
```javascript
// Service worker logs
console.log('Service Worker: [event] [message]');

// PWA manager logs
console.log('PWA Manager: [action] [details]');

// Version check logs
console.log('Version check: current vs server');
```

## Advanced Configuration

### Manifest Customization
Edit `manifest.json` to customize:
- **App Name**: Change display name
- **Theme Colors**: Match your brand colors
- **Display Mode**: fullscreen, standalone, minimal-ui
- **Orientation**: portrait, landscape, any

### Service Worker Caching
Modify `sw.js` to adjust:
- **Cache Strategy**: Cache-first, network-first, etc.
- **Update Frequency**: How often to check for updates
- **Cached Files**: Which files to cache offline

### Version Automation
Integrate version updates with your build process:
```bash
# In CI/CD pipeline
./update-version.sh $BUILD_VERSION "Automated build $BUILD_NUMBER"
```

## Support

For issues with PWA functionality:
1. **Check Browser Support**: Ensure browser supports PWA features
2. **Validate Manifest**: Use browser DevTools to check manifest
3. **Test Service Worker**: Verify service worker registration
4. **Check Console**: Look for JavaScript errors
5. **Contact Support**: Email pianochordsuk@gmail.com for help

---

**Note**: PWA features require modern browsers. The app gracefully degrades for older browsers while maintaining core functionality.