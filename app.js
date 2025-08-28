// Main Application Initialization

document.addEventListener('DOMContentLoaded', function() {
    // Function to check authorization and continue initialization
    function checkAuthAndInitialize() {
        // Check if user is authorized
        if (window.securityModule.checkAuthorization()) {
            // User is authorized, continue with initialization
            initializeApp();
        } else {
            // User is not authorized, show access key dialog
            window.securityModule.showAccessKeyDialog();
        }
    }
    
    // Function to initialize the rest of the app
    window.initializeApp = function() {
        // Initialize PWA Manager if available
        if (typeof window.pwaManager !== 'undefined' && window.pwaManager) {
            console.log('PWA Manager available, version:', window.pwaManager.getVersion());
        }
        
		// Display initial welcome message
		const progressionDisplay = document.getElementById('progression-display');
		if (progressionDisplay) {
			progressionDisplay.innerHTML = '<div class="welcome-message">Chords will show here when you press "Play" or "Step"</div>';
		}
        // Build the piano keyboard initially
        buildPiano();
        
        // Handle window resize to adjust piano
        window.addEventListener('resize', function() {
            buildPiano();
        });
        
        // Add event listeners to control buttons
        document.getElementById('start-btn').addEventListener('click', startPractice);
        document.getElementById('stop-btn').addEventListener('click', stopPractice);
        document.getElementById('rewind-btn').addEventListener('click', rewindChord);
        document.getElementById('step-btn').addEventListener('click', stepChord);
        
        // Set initial default values based on the selected progression style
        const initialStyle = document.getElementById('progression-style').value;
        
        // Set the initial style display
        const styleDisplay = document.getElementById('style-display');
        if (styleDisplay) {
            const styleOption = document.querySelector(`#progression-style option[value="${initialStyle}"]`);
            if (styleOption) {
                styleDisplay.textContent = styleOption.textContent;
            } else {
                styleDisplay.textContent = initialStyle;
            }
        }
        
        if (progressionStyles[initialStyle]) {
            const styleDefaults = progressionStyles[initialStyle];
            document.getElementById('length').value = styleDefaults.length;
            document.getElementById('tempo').value = styleDefaults.tempo;
            document.getElementById('beats').value = styleDefaults.beatsPerChord;
            
            // Set minimum length based on pattern if applicable
            if (initialStyle !== 'Random' && styleDefaults.pattern && styleDefaults.pattern.length > 0) {
                document.getElementById('length').setAttribute('min', styleDefaults.pattern.length);
            }
        }
        
        // Initialize audio
        initAudio();
        
        // Show Android audio help if needed
        if (/Android/i.test(navigator.userAgent)) {
            setTimeout(() => {
                if (typeof window.pwaManager !== 'undefined' && window.pwaManager && 
                    typeof window.pwaManager.showAndroidAudioHelp === 'function') {
                    window.pwaManager.showAndroidAudioHelp();
                }
            }, 2000); // Show after 2 seconds to let app load
        }
        
        // Load saved octave preference if it exists
        const savedOctave = localStorage.getItem('selectedOctave');
        if (savedOctave) {
            document.getElementById('octave-selector').value = savedOctave;
        } else {
            // Ensure default is 4 (Middle) if no saved preference
            document.getElementById('octave-selector').value = '4';
            localStorage.setItem('selectedOctave', '4');
        }
        
        // Add change listener to octave selector to save preference
        document.getElementById('octave-selector').addEventListener('change', function() {
            localStorage.setItem('selectedOctave', this.value);
            
            // Force refresh of current chord display and audio
            // This ensures the octave change is immediately applied
            if (currentChordIndex >= 0 && currentProgression.length > 0) {
                const chord = currentProgression[currentChordIndex];
                
                // Stop any currently playing chord
                if (typeof stopCurrentChord === 'function') {
                    stopCurrentChord();
                }
                
                // Re-highlight and play with new octave setting
                highlightChordOnPiano(chord.root, chord.type, chord.inversion);
                
                // Play chord sound if enabled
                if (document.getElementById('play-sound').checked) {
                    playChordSound(chord.root, chord.type, chord.inversion);
                }
            }
        });
        
        // Add change listener to slash notation for live update of chord notation
        document.getElementById('slash-notation').addEventListener('change', function() {
            if (currentProgression.length > 0) {
                displayProgressionPills(currentProgression);
                if (currentChordIndex >= 0) {
                    updateActivePill(currentChordIndex);
                }
            }
        });
        
        // Track if Tone.js has been started
        let toneStarted = false;
        
        // Add event listeners for volume sliders
        document.getElementById('chord-volume').addEventListener('input', function() {
            updateChordVolume(this.value);
        });
        
        document.getElementById('metronome-volume').addEventListener('input', function() {
            updateMetronomeVolume(this.value);
        });
        
        // Add event listener for play-sound toggle with enhanced Android support
        document.getElementById('play-sound').addEventListener('change', async function() {
            if (this.checked && !toneStarted) {
                // Show loading state
                const originalText = this.nextElementSibling.innerHTML;
                this.nextElementSibling.innerHTML = '<span class="fw-bold">Initializing Audio...</span>';
                this.disabled = true;
                
                try {
                    // Start Tone.js when checkbox is checked for the first time
                    await Tone.start();
                    console.log('Tone.js started successfully');
                    toneStarted = true;
                    
                    // Initialize audio components for Android
                    if (typeof isAndroidDevice !== 'undefined' && isAndroidDevice()) {
                        console.log('Android device - initializing audio components');
                        if (typeof initializeAudioComponents !== 'undefined') {
                            await initializeAudioComponents();
                        }
                    }
                    
                    // Play a test sound to confirm audio works
                    if (typeof pianoSampler !== 'undefined' && pianoSampler) {
                        try {
                            console.log('Playing test sound...');
                            pianoSampler.triggerAttackRelease('C4', 0.5);
                        } catch (error) {
                            console.error('Error playing test sound:', error);
                        }
                    }
                    
                    // Restore original text
                    this.nextElementSibling.innerHTML = originalText;
                    this.disabled = false;
                    
                } catch (error) {
                    console.error('Error starting Tone.js:', error);
                    // Show error and uncheck the box
                    this.checked = false;
                    this.nextElementSibling.innerHTML = originalText;
                    this.disabled = false;
                    
                    // Show user-friendly error message
                    alert('Audio initialization failed. Please try again or check your device\'s audio settings.');
                }
            }
            
            // Sync header toggle with settings toggle
            document.getElementById('header-play-sound').checked = this.checked;
        });
        
        // Add event listener for header play-sound toggle
        document.getElementById('header-play-sound').addEventListener('change', function() {
            // Sync the settings panel toggle
            const settingsToggle = document.getElementById('play-sound');
            settingsToggle.checked = this.checked;
            
            // Trigger the change event on the settings toggle to handle audio initialization
            const event = new Event('change');
            settingsToggle.dispatchEvent(event);
        });
		// Add event listener for header metronome toggle
		document.getElementById('header-metronome').addEventListener('change', function() {
			// Sync the settings panel toggle
			const settingsToggle = document.getElementById('metronome');
			settingsToggle.checked = this.checked;
			
			// Trigger the change event on the settings toggle
			const event = new Event('change');
			settingsToggle.dispatchEvent(event);
		});

		// Also add listener to sync header metronome toggle with settings panel
		document.getElementById('metronome').addEventListener('change', function() {
			// Sync the header toggle
			const headerToggle = document.getElementById('header-metronome');
			headerToggle.checked = this.checked;
		});
        
        // Function to clear the progression display
        function clearProgressionDisplay() {
            const progressionDisplay = document.getElementById('progression-display');
            if (progressionDisplay) {
                progressionDisplay.innerHTML = '';
            }
            // Reset progression state
            currentProgression = [];
            currentChordIndex = -1;
            progressionGenerated = false;
        }
        
        // Add event listener for progression style changes
        document.getElementById('progression-style').addEventListener('change', function() {
            // Clear progression display when style changes
            clearProgressionDisplay();
            
            const style = this.value;
            const lengthInput = document.getElementById('length');
            const tempoInput = document.getElementById('tempo');
            const beatsInput = document.getElementById('beats');
            
            // Update the style display
            const styleDisplay = document.getElementById('style-display');
            if (styleDisplay) {
                const styleOption = document.querySelector(`#progression-style option[value="${style}"]`);
                if (styleOption) {
                    styleDisplay.textContent = styleOption.textContent;
                } else {
                    styleDisplay.textContent = style;
                }
            }
            
            // Apply default values from the progression style
            if (progressionStyles[style]) {
                const styleDefaults = progressionStyles[style];
                
                // Update length input
                lengthInput.value = styleDefaults.length;
                
                // Update tempo input
                tempoInput.value = styleDefaults.tempo;
                
                // Update beats per chord input
                beatsInput.value = styleDefaults.beatsPerChord;
                
                // Set minimum length based on pattern if applicable
                if (style !== 'Random' && styleDefaults.pattern && styleDefaults.pattern.length > 0) {
                    // Set a data attribute for minimum length based on the pattern
                    lengthInput.setAttribute('min', styleDefaults.pattern.length);
                } else {
                    // For random style, keep the minimum at 2
                    lengthInput.setAttribute('min', '2');
                }
                
                // Make sure the length input is enabled
                lengthInput.disabled = false;
            } else {
                // Fallback to defaults if style not found
                lengthInput.setAttribute('min', '2');
                lengthInput.disabled = false;
            }

            // Update the BPM slider to match the new tempo
            const bpmSlider = document.getElementById('bpm-slider');
            const bpmValue = document.getElementById('bpm-value');
            if (bpmSlider && bpmValue && tempoInput) {
                bpmSlider.value = tempoInput.value;
                bpmValue.textContent = tempoInput.value;
            }
        });
        
        // Add event listeners for chord type checkboxes
        document.querySelectorAll('.chord-type-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', clearProgressionDisplay);
        });

        // Add event listeners for inversion checkboxes
        document.querySelectorAll('.inversion-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', clearProgressionDisplay);
        });

        // Add event listener for key selection changes
        document.getElementById('key-select').addEventListener('change', clearProgressionDisplay);

        // Add event listener for hand selection changes
        document.querySelectorAll('.hand-radio').forEach(radio => {
            radio.addEventListener('change', clearProgressionDisplay);
        });
        
        // Initialize the BPM slider
        initBpmSlider();
        
        // Settings Dropdown Functionality
        function initSettingsDropdown() {
            const settingsPanel = document.querySelector('.settings-dropdown-container');
            const settingsDropdown = document.querySelector('.settings-dropdown');
            const settingsToggleBtn = document.getElementById('settings-btn');
            const settingsCloseBtn = document.querySelector('.settings-close-btn');
            const settingsOverlay = document.querySelector('.settings-overlay');
            const mainContent = document.querySelector('.main-content');

            // Function to toggle the settings dropdown
            function toggleSettingsPanel() {
                settingsPanel.classList.toggle('active');
                settingsDropdown.classList.toggle('active');
                settingsOverlay.classList.toggle('active');
                
                // Save state to localStorage
                const isPanelOpen = settingsPanel.classList.contains('active');
                localStorage.setItem('settingsPanelOpen', isPanelOpen ? 'true' : 'false');
            }

            // Toggle button click handler
            if (settingsToggleBtn) {
                settingsToggleBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleSettingsPanel();
                });
            }

            // Close button click handler
            if (settingsCloseBtn) {
                settingsCloseBtn.addEventListener('click', function() {
                    toggleSettingsPanel();
                });
            }

            // Close panel when clicking overlay
            if (settingsOverlay) {
                settingsOverlay.addEventListener('click', function() {
                    toggleSettingsPanel();
                });
            }

            // Close panel when Escape key is pressed
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && settingsPanel.classList.contains('active')) {
                    toggleSettingsPanel();
                }
            });
        }

        // Initialize the settings dropdown functionality
        initSettingsDropdown();
        
        // Initialize PWA controls with a small delay to ensure PWA Manager is ready
        setTimeout(() => {
            initPWAControls();
        }, 500);
            
        // Side panel functionality
        const sidePanel = document.querySelector('.side-panel');
        const panelToggleBtn = document.querySelector('.panel-toggle-btn');
        const panelOverlay = document.querySelector('.panel-overlay');
        const mainContent = document.querySelector('.main-content');

        // Function to toggle the side panel
        function toggleSidePanel() {
            sidePanel.classList.toggle('open');
            panelOverlay.classList.toggle('active');
            mainContent.classList.toggle('panel-open');
            
            // Save state to localStorage
            const isPanelOpen = sidePanel.classList.contains('open');
            localStorage.setItem('sidePanelOpen', isPanelOpen ? 'true' : 'false');
        }

        // Toggle button click handler
        if (panelToggleBtn) {
            panelToggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleSidePanel();
            });
        }

        // Close panel when clicking overlay
        if (panelOverlay) {
            panelOverlay.addEventListener('click', function() {
                toggleSidePanel();
            });
        }

        // Close panel when Escape key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidePanel.classList.contains('open')) {
                toggleSidePanel();
            }
        });

        // Set panel to open by default
        sidePanel.classList.add('open');
        panelOverlay.classList.add('active');
        mainContent.classList.add('panel-open');
        localStorage.setItem('sidePanelOpen', 'true');

        // For touch devices, add swipe detection
        let touchStartX = 0;
        let touchEndX = 0;

        // Listen for touch start
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        // Listen for touch end
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, false);

        // Handle the swipe
        function handleSwipe() {
            const swipeThreshold = 100; // Minimum distance for a swipe
            
            // Left to right swipe (open panel)
            if (touchEndX - touchStartX > swipeThreshold && !sidePanel.classList.contains('open')) {
                toggleSidePanel();
            }
            
            // Right to left swipe (close panel)
            if (touchStartX - touchEndX > swipeThreshold && sidePanel.classList.contains('open')) {
                toggleSidePanel();
            }
        }
        
        console.log('Piano Chord Progression Trainer initialized successfully');
    }
    
        // Function to initialize PWA controls
        function initPWAControls() {
            // Update version display
            async function updateVersionDisplay() {
                const versionDisplay = document.getElementById('app-version-display');
                const connectionStatus = document.getElementById('connection-status');
                const installStatus = document.getElementById('install-status');
                
                // Try to get version from PWA Manager first
                if (typeof window.pwaManager !== 'undefined' && window.pwaManager) {
                    const version = window.pwaManager.getVersion();
                    if (versionDisplay) {
                        versionDisplay.textContent = version || 'Loading...';
                    }
                    
                    // Update connection status
                    if (connectionStatus) {
                        connectionStatus.textContent = navigator.onLine ? 'Online' : 'Offline';
                        connectionStatus.className = navigator.onLine ? 'small text-success' : 'small text-warning';
                    }
                    
                    // Update install status
                    if (installStatus) {
                        const isPWA = window.pwaManager.isPWA();
                        installStatus.textContent = isPWA ? 'Installed' : 'Not Installed';
                        installStatus.className = isPWA ? 'text-success' : 'text-muted';
                    }
                } else {
                    // PWA Manager not available, try to fetch version directly
                    if (versionDisplay) {
                        try {
                            const response = await fetch('/version.json');
                            const versionData = await response.json();
                            versionDisplay.textContent = versionData.version || '1.0.0';
                        } catch (error) {
                            console.error('Failed to load version:', error);
                            versionDisplay.textContent = '1.0.0';
                        }
                    }
                    
                    // Update connection status
                    if (connectionStatus) {
                        connectionStatus.textContent = navigator.onLine ? 'Online' : 'Offline';
                        connectionStatus.className = navigator.onLine ? 'small text-success' : 'small text-warning';
                    }
                    
                    // Update install status
                    if (installStatus) {
                        const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                                     window.navigator.standalone === true;
                        installStatus.textContent = isPWA ? 'Installed' : 'Not Installed';
                        installStatus.className = isPWA ? 'text-success' : 'text-muted';
                    }
                }
            }
            
            // Check for updates button handler
            const updateBtn = document.getElementById('check-update-btn');
            if (updateBtn) {
                updateBtn.addEventListener('click', function() {
                    if (typeof window.pwaManager !== 'undefined' && window.pwaManager) {
                        this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Checking...';
                        this.disabled = true;
                        
                        window.pwaManager.checkForUpdates();
                        
                        setTimeout(() => {
                            this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Check for Updates';
                            this.disabled = false;
                            updateVersionDisplay();
                        }, 2000);
                    } else {
                        // PWA Manager not available, try manual update check
                        this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Checking...';
                        this.disabled = true;
                        
                        // Force service worker update if available
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.getRegistration().then(registration => {
                                if (registration) {
                                    registration.update().then(() => {
                                        console.log('Service worker update triggered');
                                    });
                                }
                            });
                        }
                        
                        setTimeout(() => {
                            this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Check for Updates';
                            this.disabled = false;
                            updateVersionDisplay();
                        }, 2000);
                    }
                });
            }
            
            // Install app button handler
            const installBtn = document.getElementById('install-app-btn');
            if (installBtn) {
                installBtn.addEventListener('click', function() {
                    if (typeof window.pwaManager !== 'undefined' && window.pwaManager) {
                        this.innerHTML = '<i class="bi bi-hourglass-split"></i> Installing...';
                        this.disabled = true;
                        
                        window.pwaManager.triggerInstall().then(success => {
                            if (success) {
                                this.style.display = 'none';
                                updateVersionDisplay();
                            } else {
                                this.innerHTML = '<i class="bi bi-download"></i> Install App';
                                this.disabled = false;
                            }
                        }).catch(() => {
                            this.innerHTML = '<i class="bi bi-download"></i> Install App';
                            this.disabled = false;
                        });
                    } else {
                        alert('PWA Manager not available');
                    }
                });
            }
            
            // Initial version display with retry
            updateVersionDisplay();
            
            // Retry version display after a short delay if PWA Manager wasn't ready
            setTimeout(() => {
                updateVersionDisplay();
            }, 1000);
            
            // Update version display periodically
            setInterval(updateVersionDisplay, 10000); // Every 10 seconds
            
            // Listen for online/offline events
            window.addEventListener('online', updateVersionDisplay);
            window.addEventListener('offline', updateVersionDisplay);
            
            // Listen for PWA installation events
            window.addEventListener('appinstalled', updateVersionDisplay);
        }
    
    // Function to initialize and sync BPM slider with tempo input
    function initBpmSlider() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');
        const tempoInput = document.getElementById('tempo');
        
        // Set initial slider value from tempo input
        if (tempoInput && bpmSlider && bpmValue) {
            bpmSlider.value = tempoInput.value;
            bpmValue.textContent = tempoInput.value;
            
            // Update slider when tempo input changes
            tempoInput.addEventListener('change', function() {
                bpmSlider.value = this.value;
                bpmValue.textContent = this.value;
            });
            
            // Update tempo input when slider changes
            bpmSlider.addEventListener('input', function() {
                tempoInput.value = this.value;
                bpmValue.textContent = this.value;
                
                // If there's an active practice session, this will affect the timing
                // No need to manually trigger beat changes as they'll happen on the next beat
            });
        }
    }
    
    // Start the app directly
    checkAuthAndInitialize();
});