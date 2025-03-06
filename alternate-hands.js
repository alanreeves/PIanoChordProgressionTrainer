// Alternate Hands Feature Implementation

// Add this variable to track which hand is currently active during alternating
let currentHand = 'right'; // Start with right hand by default

// Function to toggle the current hand when alternating
function toggleCurrentHand() {
    currentHand = currentHand === 'right' ? 'left' : 'right';
    // Update a visual indicator if desired
    updateHandIndicator();
    return currentHand;
}

// Function to reset the hand alternation to start with right hand
function resetHandAlternation() {
    currentHand = 'right';
    updateHandIndicator();
}

// Function to update visual indicator for current hand
function updateHandIndicator() {
    // Only show indicator if we're in alternate hands mode
    const isAlternateMode = document.getElementById('alternate-hands').checked;
    
    // Create or update the hand indicator
    let handIndicator = document.getElementById('hand-indicator');
    
    if (isAlternateMode) {
        if (!handIndicator) {
            // Create indicator if it doesn't exist
            handIndicator = document.createElement('div');
            handIndicator.id = 'hand-indicator';
            handIndicator.className = 'hand-indicator';
            
            // Find a good place to add it (next to the piano container)
            const pianoContainer = document.querySelector('.piano-container');
            if (pianoContainer && pianoContainer.parentNode) {
                pianoContainer.parentNode.insertBefore(handIndicator, pianoContainer);
            }
        }
        
        // Update indicator text and styling
        handIndicator.textContent = `Current Hand: ${currentHand === 'right' ? 'Right' : 'Left'}`;
        handIndicator.className = `hand-indicator ${currentHand}-active`;
        handIndicator.style.display = 'block';
    } else if (handIndicator) {
        // Hide indicator if not in alternate mode
        handIndicator.style.display = 'none';
    }
}

// Modify the highlightChordOnPiano function to use the current hand when in alternate mode
function enhanceHighlightChordOnPiano() {
    // Store original function
    const originalHighlightChordOnPiano = window.highlightChordOnPiano;
    
    // Replace with enhanced version
    window.highlightChordOnPiano = function(key, type, inversion) {
        // Check if we're in alternate hands mode
        const isAlternateMode = document.getElementById('alternate-hands').checked;
        
        // Clear existing highlights
        clearPianoHighlights();
        
        // Find base note index
        const noteIndex = noteNames.indexOf(key);
        if (noteIndex === -1) return;
        
        // Determine which hand to use
        let isRightHand;
        
        if (isAlternateMode) {
            // Use the current toggled hand
            isRightHand = currentHand === 'right';
        } else {
            // Use the selected hand from radio buttons
            isRightHand = document.getElementById('right-hand').checked;
        }
        
        // Get octave offset based on hand selection
        const octaveOffset = isRightHand ? 1 : 0;  // Right hand: middle octave, Left hand: lower octave
        
        // Get intervals and start note based on chord type and inversion
        const intervals = getChordIntervals(type, inversion);
        let startNote = noteIndex + octaveOffset * 12;
        
        // Adjust start note for inversions
        if (inversion === 'first') {
            if (type === 'major' || type === 'dominant7' || type === 'major7' || type === 'augmented') {
                startNote = (noteIndex + 4) % 12 + octaveOffset * 12; // Major 3rd
            } else if (type === 'minor' || type === 'minor7' || type === 'diminished') {
                startNote = (noteIndex + 3) % 12 + octaveOffset * 12; // Minor 3rd
            } else if (type === 'sus2') {
                startNote = (noteIndex + 2) % 12 + octaveOffset * 12; // Major 2nd
            } else if (type === 'sus4') {
                startNote = (noteIndex + 5) % 12 + octaveOffset * 12; // Perfect 4th
            }
        } else if (inversion === 'second') {
            if (type === 'diminished') {
                startNote = (noteIndex + 6) % 12 + octaveOffset * 12; // Diminished 5th
            } else if (type === 'augmented') {
                startNote = (noteIndex + 8) % 12 + octaveOffset * 12; // Augmented 5th
            } else {
                startNote = (noteIndex + 7) % 12 + octaveOffset * 12; // Perfect 5th
            }
        }
        
        // Determine fingering pattern based on hand and chord type
        const is7thChord = ['dominant7', 'major7', 'minor7'].includes(type);
        const fingeringPattern = getFingeringPattern(is7thChord, inversion, isRightHand);
        
        // Highlight the keys and add fingering numbers
        intervals.forEach((interval, index) => {
            let noteToHighlight = (startNote + interval);
            
            // Ensure the note is within our keyboard range (3 octaves)
            while (noteToHighlight >= 36) {
                noteToHighlight -= 12;
            }
            
            const keys = document.querySelectorAll(`[data-note="${noteToHighlight}"]`);
            
            keys.forEach(key => {
                // Add highlighting
                key.classList.add('highlight');
                
                // Add finger number if we have a fingering pattern for this index
                if (index < fingeringPattern.length) {
                    const fingerNumber = document.createElement('div');
                    fingerNumber.className = 'finger-number';
                    fingerNumber.textContent = fingeringPattern[index];
                    
                    // Check if this is a black key and position differently if needed
                    if (key.classList.contains('black-key')) {
                        // For black keys, position finger number on the visible part
                        fingerNumber.style.left = '50%';
                        fingerNumber.style.transform = 'translateX(-50%)';
                    }
                    
                    key.appendChild(fingerNumber);
                }
            });
        });
    };
}

// Modify the playChordSound function to use the current hand when in alternate mode
function enhancePlayChordSound() {
    // Store original function
    const originalPlayChordSound = window.playChordSound;
    
    // Replace with enhanced version
    window.playChordSound = function(root, type, inversion) {
        // Calculate MIDI note numbers for the chord
        const rootIndex = noteNames.indexOf(root);
        if (rootIndex === -1) return;
        
        // Check if we're in alternate hands mode
        const isAlternateMode = document.getElementById('alternate-hands').checked;
        
        // Determine which hand to use
        let isRightHand;
        
        if (isAlternateMode) {
            // Use the current toggled hand
            isRightHand = currentHand === 'right';
        } else {
            // Use the selected hand from radio buttons
            isRightHand = document.getElementById('right-hand').checked;
        }
        
        // Calculate the starting MIDI note
        const startNote = getChordStartNote(rootIndex, type, inversion, isRightHand);
        
        // Get the chord intervals
        const intervals = getChordIntervals(type, inversion);
        
        // Calculate actual MIDI notes
        const notes = intervals.map(interval => startNote + interval);
        
        // Check if arpeggiation is enabled
        const arpeggiate = document.getElementById('arpeggiate-chord').checked;
        
        // Calculate chord duration in seconds based on BPM
        // Default to 2 seconds if not in a practice session
        let duration = 2.0;
        
        if (document.getElementById('beats') && document.getElementById('tempo')) {
            const bpm = parseInt(document.getElementById('tempo').value, 10);
            const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
            
            // Duration in seconds = (beats per chord * 60) / BPM
            duration = (beatsPerChord * 60) / bpm;
        }
        
        // Play the chord (apply 50% duration for staccato)
        playChord(notes, duration * 0.5, arpeggiate);
    };
}

// Modify the playNextChord function to toggle hands when in alternate mode
function enhancePlayNextChord() {
    // Store original function
    const originalPlayNextChord = window.playNextChord;
    
    // Replace with enhanced version
    window.playNextChord = function() {
        // Check if we're in the middle of practice beats
        if (window.isPracticeBeat !== undefined && window.isPracticeBeat) {
            // Call original function without toggling hands during practice beats
            return originalPlayNextChord.apply(this, arguments);
        }
        
        // Check if we're in alternate hands mode before changing to a new chord
        const isAlternateMode = document.getElementById('alternate-hands') && 
                               document.getElementById('alternate-hands').checked;
        
        // Toggle the current hand before playing the next chord when in alternate mode
        if (isAlternateMode) {
            toggleCurrentHand();
        }
        
        // Call the original function
        return originalPlayNextChord.apply(this, arguments);
    };
}

// Add CSS for the hand indicator
function addHandIndicatorStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .hand-indicator {
            position: absolute;
            top: 10px;
            right: 15px;
            background-color: var(--dark-input);
            color: var(--light-text);
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.9rem;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .hand-indicator.right-active {
            border-left: 4px solid var(--accent1);
        }
        
        .hand-indicator.left-active {
            border-left: 4px solid var(--accent2);
        }
    `;
    document.head.appendChild(style);
}

// Initialize Alternate Hands feature
function initAlternateHandsFeature() {
    // Add styles for the hand indicator
    addHandIndicatorStyles();
    
    // Enhance core functions to support alternate hands
    enhanceHighlightChordOnPiano();
    enhancePlayChordSound();
    enhancePlayNextChord();
    
    // Add event listener for hand selection changes
    document.querySelectorAll('.hand-radio').forEach(radio => {
        radio.addEventListener('change', function() {
            // Reset the alternation when switching between modes
            resetHandAlternation();
            updateHandIndicator();
            
            // If a chord is currently highlighted, update it with the new hand
            if (window.currentChordIndex >= 0 && window.currentProgression && window.currentProgression.length > 0) {
                const chord = window.currentProgression[window.currentChordIndex];
                // Re-highlight with the new hand setting
                window.highlightChordOnPiano(chord.root, chord.type, chord.inversion);
            }
        });
    });
    
    // Reset alternate hands when stopping practice
    const originalStopPractice = window.stopPractice;
    window.stopPractice = function() {
        // Reset to right hand for next session
        resetHandAlternation();
        // Call original stop function
        return originalStopPractice.apply(this, arguments);
    };
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after the main app initialization
    setTimeout(initAlternateHandsFeature, 300);
});