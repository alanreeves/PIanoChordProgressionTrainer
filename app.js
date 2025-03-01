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

        // Restore panel state from localStorage on page load
        const savedPanelState = localStorage.getItem('sidePanelOpen');
        if (savedPanelState === 'true') {
            sidePanel.classList.add('open');
            panelOverlay.classList.add('active');
            mainContent.classList.add('panel-open');
        }

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