// Main Application Initialization

document.addEventListener('DOMContentLoaded', function() {
    // Create a simple overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    
    const button = document.createElement('button');
    button.textContent = 'Click to Start Audio';
    button.style.padding = '20px 40px';
    button.style.fontSize = '20px';
    button.style.backgroundColor = '#7e57c2';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    overlay.appendChild(button);
    document.body.appendChild(overlay);
    
    // When the button is clicked
    button.addEventListener('click', function() {
        // Start Tone.js
        Tone.start().then(() => {
            console.log("Tone.js started successfully");
            document.body.removeChild(overlay);
            
            // After Tone.js is started, continue with initialization
            initializeApp();
        });
    });
    
    // Function to initialize the rest of the app
    function initializeApp() {
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
        
        // Initialize audio
        initAudio();
        
        // Add change listener to slash notation for live update of chord notation
        document.getElementById('slash-notation').addEventListener('change', function() {
            if (currentProgression.length > 0) {
                displayProgressionPills(currentProgression);
                if (currentChordIndex >= 0) {
                    updateActivePill(currentChordIndex);
                }
            }
        });
        
        // Add event listeners for volume sliders
        document.getElementById('chord-volume').addEventListener('input', function() {
            updateChordVolume(this.value);
        });
        
        document.getElementById('metronome-volume').addEventListener('input', function() {
            updateMetronomeVolume(this.value);
        });
        
        // Add event listener for progression style changes
        document.getElementById('progression-style').addEventListener('change', function() {
            const style = this.value;
            const lengthInput = document.getElementById('length');
            
            // All progression styles should respect the length input
            // We'll just suggest a minimum length for predefined styles
            if (style !== 'Random' && progressionStyles[style] && progressionStyles[style].length > 0) {
                // If the current length is less than pattern length, suggest the pattern length as minimum
                if (parseInt(lengthInput.value) < progressionStyles[style].length) {
                    lengthInput.value = progressionStyles[style].length;
                }
                
                // Set a data attribute for minimum length based on the pattern
                lengthInput.setAttribute('min', progressionStyles[style].length);
                
                // Make sure the length input is enabled
                lengthInput.disabled = false;
            } else {
                // For random style, keep the minimum at 2
                lengthInput.setAttribute('min', '2');
                
                // Make sure the length input is enabled
                lengthInput.disabled = false;
            }
        });
        
        // Add event listener for collapsible settings panel
        const settingsPanel = document.getElementById('settings-panel');
        const collapseToggle = document.querySelector('.collapse-toggle');
        
        // Make sure settingsPanel starts collapsed
        if (settingsPanel.classList.contains('show')) {
            settingsPanel.classList.remove('show');
        }
        if (!collapseToggle.classList.contains('collapsed')) {
            collapseToggle.classList.add('collapsed');
        }
        
        // When settings panel state changes
        settingsPanel.addEventListener('hidden.bs.collapse', function () {
            // Make the entire card clickable to expand
            const card = settingsPanel.closest('.card');
            card.style.cursor = 'pointer';
            
            // Add click event to the entire card when collapsed
            card.addEventListener('click', function(e) {
                // Only expand if settings are currently collapsed
                if (settingsPanel.classList.contains('collapse') && !settingsPanel.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(settingsPanel);
                    bsCollapse.show();
                }
            });
        });
        
        settingsPanel.addEventListener('show.bs.collapse', function () {
            // Remove clickable style when expanded
            const card = settingsPanel.closest('.card');
            card.style.cursor = 'default';
            
            // Clean up event listeners
            card.removeEventListener('click', null);
        });
        
        // Make the right chevron functional (if it exists)
        const rightChevron = document.querySelector('.right-chevron');
        if (rightChevron) {
            rightChevron.addEventListener('click', function() {
                const collapseToggle = document.querySelector('.collapse-toggle');
                collapseToggle.click(); // Trigger the collapse toggle when right chevron is clicked
            });
        }
        
        // Initial state check - position right in relation to collapse state
        const updateRightChevron = function() {
            const collapseToggle = document.querySelector('.collapse-toggle');
            const rightChevron = document.querySelector('.right-chevron');
            
            if (collapseToggle && rightChevron) {
                if (collapseToggle.classList.contains('collapsed')) {
                    rightChevron.classList.add('collapsed');
                } else {
                    rightChevron.classList.remove('collapsed');
                }
            }
        };
        
        // Update right chevron when collapse state changes (if it exists)
        if (rightChevron) {
            settingsPanel.addEventListener('shown.bs.collapse', updateRightChevron);
            settingsPanel.addEventListener('hidden.bs.collapse', updateRightChevron);
            
            // Initial update
            updateRightChevron();
        }
        
        // Play a test sound to confirm audio works
        if (typeof pianoSampler !== 'undefined') {
            try {
                console.log("Playing test sound...");
                pianoSampler.triggerAttackRelease("C4", 0.5);
            } catch (error) {
                console.error("Error playing test sound:", error);
            }
        }
        
        console.log('Piano Chord Progression Trainer initialized successfully');
    }
});