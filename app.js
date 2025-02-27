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
    
    console.log('Piano Chord Progression Trainer initialized successfully');
});