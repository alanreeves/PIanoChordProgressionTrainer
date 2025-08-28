// PWA Helper Module
// Handles service worker registration, version checking, and update notifications

class PWAManager {
    constructor() {
        this.currentVersion = null;
        this.updateAvailable = false;
        this.swRegistration = null;
        this.isOnline = navigator.onLine;
        
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
                }
                break;
            case 'VERSION_INFO':
                this.currentVersion = version;
                this.displayVersion();
                break;
        }
    }

    showUpdateNotification(message = 'App updated successfully!') {
        // Create update notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="alert alert-success alert-dismissible fade show m-2" role="alert">
                <i class="bi bi-arrow-clockwise"></i> 
                <strong>Updated!</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Add to top of main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(notification, mainContent.firstChild);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
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