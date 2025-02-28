// Main Application Initialization - with simplified volume control code

document.addEventListener('DOMContentLoaded', function() {
    // Build the piano keyboard initially
    buildPiano();
    
    // Handle window resize to adjust piano
    window.addEventListener('resize', function() {
        buildPiano();
    });
    
    // Add event listeners to control buttons
    startBtn.addEventListener('click', startPractice);
    stopBtn.addEventListener('click', stopPractice);
    rewindBtn.addEventListener('click', rewindChord);
    
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
    
    console.log('Piano Chord Progression Trainer initialized successfully');
});