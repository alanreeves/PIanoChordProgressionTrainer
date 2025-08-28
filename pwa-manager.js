// PWA Helper Module
// Handles service worker registration, version checking, and update notifications

class PWAManager {
    constructor() {
        this.currentVersion = null;
        this.updateAvailable = false;
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        this.installPrompt = null; // Store the install prompt event
        this.isInstalled = false;
        
        this.init();
    }

    async init() {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            try {
                await this.registerServiceWorker();
                await this.loadVersion();
                this.setupEventListeners();
                this.displayVersion();
                this.checkForUpdates();
            } catch (error) {
                console.error('PWA initialization failed:', error);
            }
        } else {
            console.warn('Service Workers not supported');
            await this.loadVersion(); // Still load version for display
            this.displayVersion();
        }
        
        // Setup online/offline detection
        this.setupOnlineDetection();
        
        // Setup install prompt detection
        this.setupInstallPrompt();
        
        // Setup iOS full-screen mode
        this.setupIOSFullScreen();
    }

    async registerServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully:', this.swRegistration.scope);

            // Listen for updates
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('New service worker installing...');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New service worker installed, update available');
                        this.showUpdateNotification();
                    }
                });
            });

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event);
            });

        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }

    async loadVersion() {
        try {
            const response = await fetch('/version.json');
            const versionData = await response.json();
            this.currentVersion = versionData.version;
            console.log('Current version:', this.currentVersion);
        } catch (error) {
            console.error('Failed to load version:', error);
            this.currentVersion = '1.0.0'; // Fallback version
        }
    }

    displayVersion() {
        // Create or update version display in the footer
        let versionDisplay = document.getElementById('version-display');
        if (!versionDisplay) {
            versionDisplay = document.createElement('span');
            versionDisplay.id = 'version-display';
            versionDisplay.className = 'version-info';
            
            // Add to footer
            const footer = document.querySelector('.footer-bar');
            if (footer) {
                const footerText = footer.innerHTML;
                footer.innerHTML = `${footerText} <span class="ms-2">v${this.currentVersion}</span>`;
                footer.appendChild(versionDisplay);
            }
        }
        
        // Also add to header if there's space
        this.addVersionToHeader();
    }

    addVersionToHeader() {
        const headerRight = document.querySelector('.app-header .col-8.text-end, .app-header .col-lg-6.text-end');
        if (headerRight) {
            let headerVersion = document.getElementById('header-version');
            if (!headerVersion) {
                headerVersion = document.createElement('span');
                headerVersion.id = 'header-version';
                headerVersion.className = 'version-badge';
                headerVersion.innerHTML = `<small class="badge bg-secondary ms-1">v${this.currentVersion}</small>`;
                headerRight.appendChild(headerVersion);
            }
        }
    }

    setupEventListeners() {
        // Listen for app visibility changes to check for updates
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkForUpdates();
            }
        });

        // Listen for focus events
        window.addEventListener('focus', () => {
            this.checkForUpdates();
        });
    }

    setupInstallPrompt() {
        // Check if already installed
        this.isInstalled = this.isPWA();
        
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Install prompt available');
            e.preventDefault(); // Prevent automatic prompt
            this.installPrompt = e;
            this.showInstallButton();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            console.log('App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccessNotification();
        });
        
        // Check if install button should be shown on load
        setTimeout(() => {
            if (!this.isInstalled && !this.installPrompt) {
                // For browsers that don't fire beforeinstallprompt
                this.showInstallButton(true);
            }
        }, 2000);
    }

    showInstallButton(fallback = false) {
        const installButton = document.getElementById('install-app-btn');
        if (installButton) {
            installButton.style.display = 'inline-block';
            if (fallback) {
                installButton.innerHTML = '<i class="bi bi-download"></i> Add to Home Screen';
                installButton.title = 'Add this app to your home screen for easy access';
            }
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('install-app-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async triggerInstall() {
        if (!this.installPrompt) {
            // Fallback for iOS or browsers without install prompt
            this.showManualInstallInstructions();
            return false;
        }

        try {
            // Show the install prompt
            const result = await this.installPrompt.prompt();
            console.log('Install prompt result:', result.outcome);
            
            if (result.outcome === 'accepted') {
                console.log('User accepted install prompt');
                this.installPrompt = null;
                return true;
            } else {
                console.log('User dismissed install prompt');
                return false;
            }
        } catch (error) {
            console.error('Install prompt failed:', error);
            this.showManualInstallInstructions();
            return false;
        }
    }

    showManualInstallInstructions() {
        const isIOS = this.isIOSDevice();
        const instructions = isIOS ? 
            'Tap the Share button <i class="bi bi-share"></i> then "Add to Home Screen"' :
            'Use your browser\'s "Add to Home Screen" or "Install App" option in the menu';
            
        const notification = document.createElement('div');
        notification.className = 'install-instructions';
        notification.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-info-circle"></i> 
                <strong>Install Instructions:</strong> ${instructions}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(notification, mainContent.firstChild);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 8000);
        }
    }

    showInstallSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'install-success';
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-check-circle"></i> 
                <strong>Installed!</strong> Piano Chords app has been added to your device.
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(notification, mainContent.firstChild);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showConnectionStatus('back online', 'success');
            this.checkForUpdates();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showConnectionStatus('offline - cached version available', 'warning');
        });
    }

    setupIOSFullScreen() {
        // Add iOS-specific meta tags and behavior
        if (this.isIOSDevice()) {
            // Handle iOS status bar
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    viewport.getAttribute('content') + ', viewport-fit=cover'
                );
            }

            // Add safe area padding for iOS devices
            document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 20px)');
            document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 20px)');
            
            // Add iOS-specific class to body
            document.body.classList.add('ios-device');

            // Handle PWA installation prompt for iOS
            this.setupIOSInstallPrompt();
        }
    }

    isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    isAndroidDevice() {
        return /Android/i.test(navigator.userAgent);
    }

    showAndroidAudioHelp() {
        const helpNotification = document.createElement('div');
        helpNotification.className = 'android-audio-help';
        helpNotification.innerHTML = `
            <div class="alert alert-warning alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-volume-mute"></i> 
                <strong>Android Audio Tips:</strong> 
                <br>• Make sure media volume is turned up
                <br>• Try toggling Audio On/Off in settings
                <br>• Check if your device is in silent mode
                <br>• Some Android browsers may require interaction first
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(helpNotification, mainContent.firstChild);
            
            setTimeout(() => {
                if (helpNotification.parentNode) {
                    helpNotification.remove();
                }
            }, 12000);
        }
    }

    setupIOSInstallPrompt() {
        // Check if running as PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone === true;
        
        if (!isStandalone) {
            // Show iOS installation instructions
            this.showIOSInstallHint();
        } else {
            // Running as PWA, enable full-screen features
            document.body.classList.add('pwa-mode');
        }
    }

    showIOSInstallHint() {
        // Create a subtle hint for iOS users to add to home screen
        const installHint = document.createElement('div');
        installHint.className = 'ios-install-hint';
        installHint.innerHTML = `
            <div class="alert alert-info alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-phone"></i> 
                <strong>Tip:</strong> Add to Home Screen for the best experience! 
                Tap <i class="bi bi-share"></i> then "Add to Home Screen"
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Add after header
        const header = document.querySelector('.app-header');
        if (header) {
            header.insertAdjacentElement('afterend', installHint);
            
            // Auto-hide after 10 seconds
            setTimeout(() => {
                if (installHint.parentNode) {
                    installHint.remove();
                }
            }, 10000);
        }
    }

    async checkForUpdates() {
        if (!this.isOnline || !this.swRegistration) return;

        try {
            // Tell service worker to check for updates
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'CHECK_VERSION'
                });
            }

            // Also trigger service worker update
            await this.swRegistration.update();
        } catch (error) {
            console.error('Update check failed:', error);
        }
    }

    handleServiceWorkerMessage(event) {
        const { type, version, message } = event.data;

        switch (type) {
            case 'SW_UPDATE':
                if (version !== this.currentVersion) {
                    this.currentVersion = version;
                    this.displayVersion();
                    this.showUpdateNotification(message);
                    
                    // Show install button if not already installed
                    if (!this.isInstalled) {
                        this.showInstallButtonForUpdate(version);
                    }
                }
                break;
            case 'VERSION_INFO':
                this.currentVersion = version;
                this.displayVersion();
                break;
        }
    }

    showUpdateNotification(message = 'App updated successfully!') {
        // Create update notification with install button
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        
        const installButtonHtml = !this.isInstalled ? 
            `<button id="update-install-btn" class="btn btn-sm btn-light ms-2">
                <i class="bi bi-download"></i> Install Update
            </button>` : '';
            
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-arrow-clockwise"></i> 
                <strong>Updated!</strong> ${message}
                ${installButtonHtml}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(notification, mainContent.firstChild);
            
            // Add event listener to install button if present
            const updateInstallBtn = notification.querySelector('#update-install-btn');
            if (updateInstallBtn) {
                updateInstallBtn.addEventListener('click', () => {
                    this.triggerInstall().then(success => {
                        if (success) {
                            notification.remove();
                        }
                    });
                });
            }

            // Auto-hide after 8 seconds (longer for install option)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 8000);
        }
    }

    showInstallButtonForUpdate(version) {
        // Create a persistent install notification for version updates
        const installNotification = document.createElement('div');
        installNotification.className = 'version-install-notification';
        installNotification.innerHTML = `
            <div class="alert alert-primary alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-download"></i> 
                <strong>New Version Available!</strong> 
                Install Piano Chords v${version} for the best experience.
                <button id="version-install-btn" class="btn btn-sm btn-light ms-2">
                    <i class="bi bi-plus-circle"></i> Install Now
                </button>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Remove any existing version install notifications
            const existing = mainContent.querySelector('.version-install-notification');
            if (existing) {
                existing.remove();
            }
            
            mainContent.insertBefore(installNotification, mainContent.firstChild);
            
            // Add event listener to install button
            const versionInstallBtn = installNotification.querySelector('#version-install-btn');
            if (versionInstallBtn) {
                versionInstallBtn.addEventListener('click', () => {
                    versionInstallBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Installing...';
                    versionInstallBtn.disabled = true;
                    
                    this.triggerInstall().then(success => {
                        if (success) {
                            installNotification.remove();
                        } else {
                            versionInstallBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Install Now';
                            versionInstallBtn.disabled = false;
                        }
                    });
                });
            }
        }
    }

    showConnectionStatus(status, type = 'info') {
        const statusNotification = document.createElement('div');
        statusNotification.className = 'connection-status';
        statusNotification.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-wifi"></i> 
                Connection: ${status}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(statusNotification, mainContent.firstChild);

            setTimeout(() => {
                if (statusNotification.parentNode) {
                    statusNotification.remove();
                }
            }, 3000);
        }
    }

    // Method to manually trigger update
    forceUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }

    // Get current version
    getVersion() {
        return this.currentVersion;
    }

    // Check if running as PWA
    isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Get install status
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled,
            canInstall: !!this.installPrompt,
            isStandalone: this.isPWA()
        };
    }
}

// Initialize PWA Manager when DOM is loaded
let pwaManager;

document.addEventListener('DOMContentLoaded', () => {
    pwaManager = new PWAManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}

// Make available globally
window.PWAManager = PWAManager;
window.pwaManager = pwaManager;