// Piano Display Functions

// Piano setup constants
const piano = document.getElementById('piano');
const numKeys = 36; // 3 octaves
const notesPerOctave = 12;
const whiteKeysPerOctave = 7;

// Variable to track the current hand when alternating
let currentAlternatingHand = 'right'; // Start with right hand by default

// Add midiToNoteName function if not already present
function midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return noteName + octave;
}

// Build the piano keyboard
function buildPiano() {
    piano.innerHTML = '';
    const numOctaves = numKeys / notesPerOctave;
    const numWhiteKeys = numOctaves * whiteKeysPerOctave;
    
    // Create white keys first
    for (let i = 0; i < numWhiteKeys; i++) {
        const key = document.createElement('div');
        key.className = 'white-key';
        
        // Calculate the note index for this white key
        const octave = Math.floor(i / whiteKeysPerOctave);
        const whiteKeyIndex = i % whiteKeysPerOctave;
        const noteIndex = octave * notesPerOctave + whiteKeyToNote[whiteKeyIndex];
        
        key.dataset.note = noteIndex;
        key.dataset.noteName = noteNames[noteIndex % notesPerOctave];
        key.dataset.octave = octave;
        
        piano.appendChild(key);
    }
    
    // Create black keys
    let whiteKeyWidth = document.querySelector('.white-key').offsetWidth;
    
    // For each octave
    for (let octave = 0; octave < numOctaves; octave++) {
        // For each possible black key position in the octave
        for (let i = 0; i < whiteKeysPerOctave - 1; i++) {
            // Get the note index for this position
            const noteIndex = octave * notesPerOctave + whiteKeyToNote[i] + 1;
            
            // Skip if this isn't a black key
            if (!isBlackKey[noteIndex % notesPerOctave]) continue;
            
            const key = document.createElement('div');
            key.className = 'black-key';
            
            // Position the black key between the white keys
            const whiteKeyIndex = octave * whiteKeysPerOctave + i;
            const leftOffset = (whiteKeyIndex * whiteKeyWidth) + (whiteKeyWidth * 0.7);
            key.style.left = leftOffset + 'px';
            
            key.dataset.note = noteIndex;
            key.dataset.noteName = noteNames[noteIndex % notesPerOctave];
            key.dataset.octave = octave;
            
            piano.appendChild(key);
        }
    }
}

// Highlight chord on piano
function highlightChordOnPiano(key, type, inversion) {
    clearPianoHighlights();
    
    // Find base note index using our conversion function that handles enharmonics
    const noteIndex = getNoteIndex(key);
    // Log for debugging
    console.log(`Highlighting chord: ${key} ${type} ${inversion} - note index: ${noteIndex}`);
    
    // Check which hand is selected
    let isRightHand;
    
    // Handle alternating hands option
    if (document.getElementById('alternate-hands').checked) {
        isRightHand = currentAlternatingHand === 'right';
        // Toggle the hand for next chord
        currentAlternatingHand = isRightHand ? 'left' : 'right';
    } else {
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
}

// Get fingering pattern for a chord
function getFingeringPattern(is7thChord, inversion, isRightHand) {
    if (isRightHand) {
        // Right hand fingering (1=thumb, 5=pinky)
        if (is7thChord) {
            switch(inversion) {
                case 'root':   return [1, 2, 3, 5];
                case 'first':  return [1, 2, 4, 5];
                case 'second': return [1, 2, 3, 5];
                default:       return [1, 2, 3, 5];
            }
        } else {
            switch(inversion) {
                case 'root':   return [1, 3, 5];
                case 'first':  return [1, 2, 5];
                case 'second': return [1, 3, 5];
                default:       return [1, 3, 5];
            }
        }
    } else {
        // Left hand fingering (5=pinky, 1=thumb)
        if (is7thChord) {
            switch(inversion) {
                case 'root':   return [5, 3, 2, 1]; // Standard 7th chord root position
                case 'first':  return [5, 3, 2, 1]; // First inversion
                case 'second': return [5, 4, 2, 1]; // Second inversion
                default:       return [5, 3, 2, 1]; // Default to root position
            }
        } else {
            switch(inversion) {
                case 'root':   return [5, 3, 1]; // Standard triad root position
                case 'first':  return [5, 2, 1]; // First inversion
                case 'second': return [5, 3, 1]; // Second inversion
                default:       return [5, 3, 1]; // Default to root position
            }
        }
    }
}

// Calculate starting note based on root, type, inversion, and hand
function getChordStartNote(rootIndex, type, inversion, isRightHand) {
    // Use the selected octave if available, otherwise use default
    let selectedOctave = 4; // Default to middle C octave
    const octaveSelector = document.getElementById('octave-selector');
    if (octaveSelector) {
        selectedOctave = parseInt(octaveSelector.value, 10);
    }
    
    // Convert rootIndex to a number if it's a string (a note name)
    if (typeof rootIndex === 'string') {
        rootIndex = getNoteIndex(rootIndex);
    }
    
    // Adjust octave offset calculation to raise the sound by 2 octaves from previous calculation
    // Adding 1 to selectedOctave to raise the pitch
    // Right hand: selectedOctave+1, Left hand: selectedOctave
    const octaveOffset = isRightHand ? selectedOctave + 1 : selectedOctave;
    
    // Define the result variable
    let result;
    
    switch(inversion) {
        case 'root':
            result = rootIndex + (octaveOffset * 12);
            break;
        case 'first':
            if (type === 'major' || type === 'dominant7' || type === 'major7' || type === 'augmented') {
                result = (rootIndex + 4) % 12 + (octaveOffset * 12); // Major 3rd
            } else if (type === 'minor' || type === 'minor7' || type === 'diminished') {
                result = (rootIndex + 3) % 12 + (octaveOffset * 12); // Minor 3rd
            } else if (type === 'sus2') {
                result = (rootIndex + 2) % 12 + (octaveOffset * 12); // Major 2nd
            } else if (type === 'sus4') {
                result = (rootIndex + 5) % 12 + (octaveOffset * 12); // Perfect 4th
            } else {
                result = (rootIndex + 4) % 12 + (octaveOffset * 12); // Default to Major 3rd
            }
            break;
        case 'second':
            if (type === 'diminished') {
                result = (rootIndex + 6) % 12 + (octaveOffset * 12); // Diminished 5th
            } else if (type === 'augmented') {
                result = (rootIndex + 8) % 12 + (octaveOffset * 12); // Augmented 5th
            } else {
                result = (rootIndex + 7) % 12 + (octaveOffset * 12); // Perfect 5th
            }
            break;
        default:
            result = rootIndex + (octaveOffset * 12);
    }
    
    return result;
}

// Clear all piano highlights
function clearPianoHighlights() {
    document.querySelectorAll('.white-key, .black-key').forEach(key => {
        key.classList.remove('highlight');
        // Remove any finger number elements
        const fingerNumbers = key.querySelectorAll('.finger-number');
        fingerNumbers.forEach(el => el.remove());
    });
}

// Display chord progression as pills
// Display chord progression as pills
function displayProgressionPills(progression) {
    const progressionDisplay = document.getElementById('progression-display');
    progressionDisplay.innerHTML = '';
    const useSlashNotation = document.getElementById('slash-notation').checked;
    
    // Get key information to determine flat/sharp preference
    const originalKey = document.getElementById('key-select').value;
    const isMinor = originalKey.endsWith('m');
    const keyRoot = isMinor ? originalKey.slice(0, -1) : originalKey;
    
    // Proper music theory: Keys that use flat notation in their key signatures
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 
                      'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'Gbm', 'Cbm'];
    
    // Keys that use sharp notation in their key signatures
    const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#',
                       'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];
                       
    // Determine if key uses flat or sharp notation
    const usesFlat = flatKeys.includes(originalKey);
    const usesSharp = sharpKeys.includes(originalKey);
    
    // Display all chord pills, they will wrap naturally
    progression.forEach((chord, index) => {
        let chordText;
        
        // Normalize the root note based on key signature
        let normalizedRoot = chord.root;
        
        // Special case: Force sharp notation for all notes in sharp keys
        if (usesSharp) {
            // If the note is a flat name, convert it to its sharp equivalent
            for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
                if (flat === normalizedRoot) {
                    normalizedRoot = sharp;
                    break;
                }
            }
        }
        // Special case: Force flat notation for all notes in flat keys
        else if (usesFlat) {
            // If the note is a sharp name that has a flat equivalent, use the flat
            if (enharmonicEquivalents[normalizedRoot]) {
                normalizedRoot = enharmonicEquivalents[normalizedRoot];
            }
        }
        // For keys not in our explicit lists
        else if (keyRoot.includes('b')) {
            if (enharmonicEquivalents[normalizedRoot]) {
                normalizedRoot = enharmonicEquivalents[normalizedRoot];
            }
        }
        else if (keyRoot.includes('#')) {
            for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
                if (flat === normalizedRoot) {
                    normalizedRoot = sharp;
                    break;
                }
            }
        }
        
        // Base chord symbol without inversion notation
        // Updated to include new chord types
        const baseChord = `${normalizedRoot}${
            chord.type === 'minor' ? 'm' : 
            chord.type === 'diminished' ? '°' : 
            chord.type === 'dominant7' ? '7' : 
            chord.type === 'major7' ? 'maj7' : 
            chord.type === 'minor7' ? 'm7' : 
            chord.type === 'augmented' ? '+' : 
            chord.type === 'sus2' ? 'sus2' : 
            chord.type === 'sus4' ? 'sus4' : 
            ''
        }`;
        
        if (useSlashNotation && chord.inversion !== 'root') {
            // Calculate the bass note
            const rootIndex = getNoteIndex(chord.root);
            let bassNote;
            
            if (chord.inversion === 'first') {
                // First inversion - bass note is the interval specific to chord type
                let interval;
                switch(chord.type) {
                    case 'major':
                    case 'dominant7':
                    case 'major7':
                    case 'augmented':
                        interval = 4; // Major 3rd
                        break;
                    case 'minor':
                    case 'minor7':
                    case 'diminished':
                        interval = 3; // Minor 3rd
                        break;
                    case 'sus2':
                        interval = 2; // Major 2nd
                        break;
                    case 'sus4':
                        interval = 5; // Perfect 4th
                        break;
                    default:
                        interval = 4;
                }
                const bassIndex = (rootIndex + interval) % 12;
                bassNote = noteNames[bassIndex];
            } else if (chord.inversion === 'second') {
                // Second inversion - bass note is the 5th (perfect, diminished, or augmented)
                let interval;
                switch(chord.type) {
                    case 'diminished':
                        interval = 6; // Diminished 5th
                        break;
                    case 'augmented':
                        interval = 8; // Augmented 5th
                        break;
                    default:
                        interval = 7; // Perfect 5th
                }
                const bassIndex = (rootIndex + interval) % 12;
                bassNote = noteNames[bassIndex];
            }
            
            // Normalize bass note to match key notation (sharp or flat)
            // Apply the same normalization logic to the bass note
            if (usesSharp) {
                // If the note is a flat name, convert it to its sharp equivalent
                for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
                    if (flat === bassNote) {
                        bassNote = sharp;
                        break;
                    }
                }
            } else if (usesFlat) {
                if (enharmonicEquivalents[bassNote]) {
                    bassNote = enharmonicEquivalents[bassNote];
                }
            } else if (keyRoot.includes('b')) {
                if (enharmonicEquivalents[bassNote]) {
                    bassNote = enharmonicEquivalents[bassNote];
                }
            } else if (keyRoot.includes('#')) {
                for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
                    if (flat === bassNote) {
                        bassNote = sharp;
                        break;
                    }
                }
            }
            
            chordText = `${baseChord}/${bassNote}`;
        } else {
            // Use number notation if slash notation is not selected
            const inversionDisplay = chord.inversion === 'root' ? '' : chord.inversion === 'first' ? ' (1)' : ' (2)';
            chordText = `${baseChord}${inversionDisplay}`;
        }
        
        const pill = document.createElement('div');
        pill.className = 'chord-pill';
        pill.textContent = chordText;
        pill.dataset.index = index;
        progressionDisplay.appendChild(pill);
    });
}

// Update active pill highlighting
function updateActivePill(index) {
    // Remove active class from all pills
    document.querySelectorAll('.chord-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Add active class to current pill
    const activePill = document.querySelector(`.chord-pill[data-index="${index}"]`);
    if (activePill) {
        activePill.classList.add('active');
        
        // Ensure the active pill is visible by scrolling if needed
        activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}