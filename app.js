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
        
        // Load saved octave preference if it exists
        const savedOctave = localStorage.getItem('selectedOctave');
        if (savedOctave) {
            document.getElementById('octave-selector').value = savedOctave;
        }
        
        // Add change listener to octave selector to save preference
        document.getElementById('octave-selector').addEventListener('change', function() {
            localStorage.setItem('selectedOctave', this.value);
            
            // If a chord is currently highlighted, update its display
            if (currentChordIndex >= 0 && currentProgression.length > 0) {
                const chord = currentProgression[currentChordIndex];
                highlightChordOnPiano(chord.root, chord.type, chord.inversion);
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
        
        // Add event listener for play-sound toggle with Tone.js starter functionality
        document.getElementById('play-sound').addEventListener('change', function() {
            if (this.checked && !toneStarted) {
                // Start Tone.js when checkbox is checked for the first time
                Tone.start().then(() => {
                    console.log("Tone.js started successfully");
                    toneStarted = true;
                    
                    // Play a test sound to confirm audio works
                    if (typeof pianoSampler !== 'undefined') {
                        try {
                            console.log("Playing test sound...");
                            pianoSampler.triggerAttackRelease("C4", 0.5);
                        } catch (error) {
                            console.error("Error playing test sound:", error);
                        }
                    }
                }).catch(error => {
                    console.error("Error starting Tone.js:", error);
                    // Uncheck the box if there was an error
                    this.checked = false;
                });
            }
        });
        
        // Add event listener for progression style changes
        document.getElementById('progression-style').addEventListener('change', function() {
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
        });
        
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
    
    // Start the app directly
    checkAuthAndInitialize();
});