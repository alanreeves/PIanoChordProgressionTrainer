// Piano Chord Progression Trainer Service Worker
// Handles caching, version detection, and automatic updates

const CACHE_NAME_PREFIX = 'piano-chords-';
let CURRENT_VERSION = null;
let CACHE_NAME = null;

// Files to cache for offline functionality
const CACHE_FILES = [
  '/',
  '/index.html',
  '/help.html',
  '/manifest.json',
  '/styles.css',
  '/app.js',
  '/music-theory.js',
  '/piano-display.js',
  '/practice-logic.js',
  '/security.js',
  '/tone-audio-engine.js',
  '/version.json',
  // External CDN resources
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.5/font/bootstrap-icons.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'
];

// Initialize version and cache name
async function initializeVersion() {
  try {
    const versionResponse = await fetch('/version.json');
    const versionData = await versionResponse.json();
    CURRENT_VERSION = versionData.version;
    CACHE_NAME = CACHE_NAME_PREFIX + versionData.cacheVersion;
    console.log('Service Worker initialized with version:', CURRENT_VERSION);
  } catch (error) {
    console.error('Failed to fetch version:', error);
    CURRENT_VERSION = '1.0.0';
    CACHE_NAME = CACHE_NAME_PREFIX + 'v1.0.0';
  }
}

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    initializeVersion().then(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(CACHE_FILES.map(url => {
          // Handle both relative and absolute URLs
          return new Request(url, { mode: 'cors' });
        }));
      });
    }).then(() => {
      console.log('Service Worker: Installation complete');
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_NAME_PREFIX) && cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
      // Notify all clients about the update
      return notifyClientsOfUpdate();
    })
  );
});

// Fetch event - serve cached content with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        // For version.json, always check for updates in the background
        if (event.request.url.includes('/version.json')) {
          checkForUpdates();
        }
        return cachedResponse;
      }

      // Fetch from network if not in cache
      return fetch(event.request).then((response) => {
        // Don't cache if not a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();
        
        if (CACHE_NAME) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // If network fails, try to serve a cached version of the main page
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Check for version updates
async function checkForUpdates() {
  try {
    const response = await fetch('/version.json', { 
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    const newVersionData = await response.json();
    
    if (newVersionData.version !== CURRENT_VERSION) {
      console.log('New version detected:', newVersionData.version, 'Current:', CURRENT_VERSION);
      
      // Update the service worker
      self.registration.update().then(() => {
        console.log('Service Worker: Update triggered');
      });
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

// Notify clients of updates
async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SW_UPDATE',
      version: CURRENT_VERSION,
      message: 'App has been updated to version ' + CURRENT_VERSION
    });
  });
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CHECK_VERSION') {
    checkForUpdates();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: CURRENT_VERSION
    });
  }
});

// Periodic version check (every 5 minutes when service worker is active)
setInterval(() => {
  checkForUpdates();
}, 5 * 60 * 1000);

console.log('Service Worker: Loaded and ready');