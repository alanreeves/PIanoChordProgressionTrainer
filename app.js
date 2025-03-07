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
            
            // Sync header toggle with settings toggle
            document.getElementById('header-play-sound').checked = this.checked;
        });
        
        // Add event listener for header play-sound toggle
        document.getElementById('header-play-sound').addEventListener('change', function() {
            // Sync the settings panel toggle
            const settingsToggle = document.getElementById('play-sound');
            settingsToggle.checked = this.checked;
            
            // Trigger the change event on the settings toggle to handle Tone.js initialization
            const event = new Event('change');
            settingsToggle.dispatchEvent(event);
        });
        
        // Function to update progression display in real-time
        function updateProgressionDisplay() {
            // First clear the current display
            const progressionDisplay = document.getElementById('progression-display');
            if (progressionDisplay) {
                progressionDisplay.innerHTML = '';
            }
            
            // Get settings
            const key = document.getElementById('key-select').value;
            const length = parseInt(document.getElementById('length').value, 10);
            const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
            const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
            const style = document.getElementById('progression-style').value;
            
            // Validate settings
            if (selectedTypes.length === 0 && style === 'Random') {
                // Don't generate a progression if no chord types are selected for Random style
                currentProgression = [];
                currentChordIndex = -1;
                progressionGenerated = false;
                return;
            }
            
            if (selectedInversions.length === 0) {
                // Don't generate a progression if no inversions are selected
                currentProgression = [];
                currentChordIndex = -1;
                progressionGenerated = false;
                return;
            }
            
            // Generate a new progression
            currentProgression = generateChordProgression(key, length, selectedTypes, selectedInversions, style);
            progressionGenerated = true;
            currentChordIndex = -1; // Reset current chord index
            
            // Display the new progression
            displayProgressionPills(currentProgression);
        }
        
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

            // Update the BPM slider to match the new tempo
            const bpmSlider = document.getElementById('bpm-slider');
            const bpmValue = document.getElementById('bpm-value');
            if (bpmSlider && bpmValue && tempoInput) {
                bpmSlider.value = tempoInput.value;
                bpmValue.textContent = tempoInput.value;
            }
            
            // Update progression display after settings have been changed
            updateProgressionDisplay();
        });
        
        // Update the event listeners for chord types, inversions, key, and hand selection
        document.querySelectorAll('.chord-type-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateProgressionDisplay);
        });

        document.querySelectorAll('.inversion-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateProgressionDisplay);
        });

        document.getElementById('key-select').addEventListener('change', updateProgressionDisplay);

        document.querySelectorAll('.hand-radio').forEach(radio => {
            radio.addEventListener('change', updateProgressionDisplay);
        });

        // Add event listener for length changes
        document.getElementById('length').addEventListener('change', updateProgressionDisplay);
        
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
        
			// Modified generateDefaultProgression function with delayed execution
			function generateDefaultProgression() {
				console.log('Preparing to generate default progression...');
				
				// Use setTimeout to ensure all scripts are loaded
				setTimeout(function() {
					console.log('Now generating default progression...');
					
					try {
						// Get current settings
						const key = document.getElementById('key-select').value;
						const length = parseInt(document.getElementById('length').value, 10) || 8; // Default to 8 if NaN
						
						// Get selected chord types, making sure at least one is selected
						let selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
						if (selectedTypes.length === 0) {
							// If no chord types are selected, default to Major, Minor, and Dominant7
							console.log('No chord types selected, selecting defaults...');
							document.getElementById('type-major').checked = true;
							document.getElementById('type-minor').checked = true;
							document.getElementById('type-dominant7').checked = true;
							selectedTypes = ['major', 'minor', 'dominant7'];
						}
						
						// Get selected inversions, making sure at least one is selected
						let selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
						if (selectedInversions.length === 0) {
							// If no inversions are selected, default to Root Position
							console.log('No inversions selected, selecting root position...');
							document.getElementById('inv-root').checked = true;
							selectedInversions = ['root'];
						}
						
						// Force Random style for initial progression
						const initialStyle = 'Random';
						
						console.log('Generating progression with settings:', {
							key, length, selectedTypes, selectedInversions, initialStyle
						});
						
						// Generate the progression
						currentProgression = generateChordProgression(key, length, selectedTypes, selectedInversions, initialStyle);
						progressionGenerated = true;
						
						// Display the progression
						displayProgressionPills(currentProgression);
						
						console.log('Default progression successfully generated');
					} catch (error) {
						console.error('Error generating default progression:', error);
					}
				}, 500); // 500ms delay to ensure scripts are loaded
			}

			// When calling generateDefaultProgression, use:
			// generateDefaultProgression();

        // Generate initial default progression
        generateDefaultProgression();
        
        console.log('Piano Chord Progression Trainer initialized successfully');
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