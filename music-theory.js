// Music Theory Constants and Functions

// Maps note indices to note names (sharp notation)
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Mapping for enharmonic equivalents
const enharmonicEquivalents = {
    'C#': 'Db',
    'Db': 'C#',
    'D#': 'Eb',
    'Eb': 'D#',
    'F#': 'Gb', 
    'Gb': 'F#',
    'G#': 'Ab',
    'Ab': 'G#',
    'A#': 'Bb',
    'Bb': 'A#'
};

// Define the correct diatonic chords for all major keys
const diatonicMajorChords = {
    'C': {
        'I': 'C', 'ii': 'Dm', 'iii': 'Em', 'IV': 'F', 'V': 'G', 'vi': 'Am', 'vii°': 'B°'
    },
    'Cb': {
        'I': 'Cb', 'ii': 'Dbm', 'iii': 'Ebm', 'IV': 'Fb', 'V': 'Gb', 'vi': 'Abm', 'vii°': 'Bb°'
    },
    'C#': {
        'I': 'C#', 'ii': 'D#m', 'iii': 'E#m', 'IV': 'F#', 'V': 'G#', 'vi': 'A#m', 'vii°': 'B#°'
    },
    'D': {
        'I': 'D', 'ii': 'Em', 'iii': 'F#m', 'IV': 'G', 'V': 'A', 'vi': 'Bm', 'vii°': 'C#°'
    },
    'Db': {
        'I': 'Db', 'ii': 'Ebm', 'iii': 'Fm', 'IV': 'Gb', 'V': 'Ab', 'vi': 'Bbm', 'vii°': 'C°'
    },
    'D#': {
        'I': 'D#', 'ii': 'E#m', 'iii': 'Fxm', 'IV': 'G#', 'V': 'A#', 'vi': 'B#m', 'vii°': 'Cx°'
    },
    'E': {
        'I': 'E', 'ii': 'F#m', 'iii': 'G#m', 'IV': 'A', 'V': 'B', 'vi': 'C#m', 'vii°': 'D#°'
    },
    'Eb': {
        'I': 'Eb', 'ii': 'Fm', 'iii': 'Gm', 'IV': 'Ab', 'V': 'Bb', 'vi': 'Cm', 'vii°': 'D°'
    },
    'F': {
        'I': 'F', 'ii': 'Gm', 'iii': 'Am', 'IV': 'Bb', 'V': 'C', 'vi': 'Dm', 'vii°': 'E°'
    },
    'F#': {
        'I': 'F#', 'ii': 'G#m', 'iii': 'A#m', 'IV': 'B', 'V': 'C#', 'vi': 'D#m', 'vii°': 'E#°'
    },
    'G': {
        'I': 'G', 'ii': 'Am', 'iii': 'Bm', 'IV': 'C', 'V': 'D', 'vi': 'Em', 'vii°': 'F#°'
    },
    'Gb': {
        'I': 'Gb', 'ii': 'Abm', 'iii': 'Bbm', 'IV': 'Cb', 'V': 'Db', 'vi': 'Ebm', 'vii°': 'F°'
    },
    'G#': {
        'I': 'G#', 'ii': 'A#m', 'iii': 'B#m', 'IV': 'C#', 'V': 'D#', 'vi': 'E#m', 'vii°': 'Fx°'
    },
    'A': {
        'I': 'A', 'ii': 'Bm', 'iii': 'C#m', 'IV': 'D', 'V': 'E', 'vi': 'F#m', 'vii°': 'G#°'
    },
    'Ab': {
        'I': 'Ab', 'ii': 'Bbm', 'iii': 'Cm', 'IV': 'Db', 'V': 'Eb', 'vi': 'Fm', 'vii°': 'G°'
    },
    'A#': {
        'I': 'A#', 'ii': 'B#m', 'iii': 'Cxm', 'IV': 'D#', 'V': 'E#', 'vi': 'Fx', 'vii°': 'Gx°'
    },
    'B': {
        'I': 'B', 'ii': 'C#m', 'iii': 'D#m', 'IV': 'E', 'V': 'F#', 'vi': 'G#m', 'vii°': 'A#°'
    },
    'Bb': {
        'I': 'Bb', 'ii': 'Cm', 'iii': 'Dm', 'IV': 'Eb', 'V': 'F', 'vi': 'Gm', 'vii°': 'A°'
    }
};

// Define the diatonic chords for all minor keys (using natural minor)
const diatonicMinorChords = {
    'Cm': {
        'i': 'Cm', 'ii°': 'D°', 'III': 'Eb', 'iv': 'Fm', 'v': 'Gm', 'VI': 'Ab', 'VII': 'Bb'
    },
    'C#m': {
        'i': 'C#m', 'ii°': 'D#°', 'III': 'E', 'iv': 'F#m', 'v': 'G#m', 'VI': 'A', 'VII': 'B'
    },
    'Dbm': {
        'i': 'Dbm', 'ii°': 'Eb°', 'III': 'Fb', 'iv': 'Gbm', 'v': 'Abm', 'VI': 'Bbb', 'VII': 'Cb'
    },
    'Dm': {
        'i': 'Dm', 'ii°': 'E°', 'III': 'F', 'iv': 'Gm', 'v': 'Am', 'VI': 'Bb', 'VII': 'C'
    },
    'D#m': {
        'i': 'D#m', 'ii°': 'E#°', 'III': 'F#', 'iv': 'G#m', 'v': 'A#m', 'VI': 'B', 'VII': 'C#'
    },
    'Ebm': {
        'i': 'Ebm', 'ii°': 'F°', 'III': 'Gb', 'iv': 'Abm', 'v': 'Bbm', 'VI': 'Cb', 'VII': 'Db'
    },
    'Em': {
        'i': 'Em', 'ii°': 'F#°', 'III': 'G', 'iv': 'Am', 'v': 'Bm', 'VI': 'C', 'VII': 'D'
    },
    'Fm': {
        'i': 'Fm', 'ii°': 'G°', 'III': 'Ab', 'iv': 'Bbm', 'v': 'Cm', 'VI': 'Db', 'VII': 'Eb'
    },
    'F#m': {
        'i': 'F#m', 'ii°': 'G#°', 'III': 'A', 'iv': 'Bm', 'v': 'C#m', 'VI': 'D', 'VII': 'E'
    },
    'Gbm': {
        'i': 'Gbm', 'ii°': 'Ab°', 'III': 'Bbb', 'iv': 'Cbm', 'v': 'Dbm', 'VI': 'Ebb', 'VII': 'Fb'
    },
    'Gm': {
        'i': 'Gm', 'ii°': 'A°', 'III': 'Bb', 'iv': 'Cm', 'v': 'Dm', 'VI': 'Eb', 'VII': 'F'
    },
    'G#m': {
        'i': 'G#m', 'ii°': 'A#°', 'III': 'B', 'iv': 'C#m', 'v': 'D#m', 'VI': 'E', 'VII': 'F#'
    },
    'Abm': {
        'i': 'Abm', 'ii°': 'Bb°', 'III': 'Cb', 'iv': 'Dbm', 'v': 'Ebm', 'VI': 'Fb', 'VII': 'Gb'
    },
    'Am': {
        'i': 'Am', 'ii°': 'B°', 'III': 'C', 'iv': 'Dm', 'v': 'Em', 'VI': 'F', 'VII': 'G'
    },
    'A#m': {
        'i': 'A#m', 'ii°': 'B#°', 'III': 'C#', 'iv': 'D#m', 'v': 'E#m', 'VI': 'F#', 'VII': 'G#'
    },
    'Bbm': {
        'i': 'Bbm', 'ii°': 'C°', 'III': 'Db', 'iv': 'Ebm', 'v': 'Fm', 'VI': 'Gb', 'VII': 'Ab'
    },
    'Bm': {
        'i': 'Bm', 'ii°': 'C#°', 'III': 'D', 'iv': 'Em', 'v': 'F#m', 'VI': 'G', 'VII': 'A'
    }
};

// Maps white key indices (0-based) to note indices (0-based)
const whiteKeyToNote = [0, 2, 4, 5, 7, 9, 11]; // C, D, E, F, G, A, B
const isBlackKey = [false, true, false, true, false, false, true, false, true, false, true, false];

// Music theory - diatonic chord degrees for major and minor keys
const majorScaleDegrees = [
    { degree: 'I', type: 'major' },
    { degree: 'ii', type: 'minor' },
    { degree: 'iii', type: 'minor' },
    { degree: 'IV', type: 'major' },
    { degree: 'V', type: 'major' },
    { degree: 'vi', type: 'minor' },
    { degree: 'vii°', type: 'diminished' }
];

const minorScaleDegrees = [
    { degree: 'i', type: 'minor' },
    { degree: 'ii°', type: 'diminished' },
    { degree: 'III', type: 'major' },
    { degree: 'iv', type: 'minor' },
    { degree: 'v', type: 'minor' },
    { degree: 'VI', type: 'major' },
    { degree: 'VII', type: 'major' }
];

// Maps scale degree indices to semitone offsets from root
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
// Add a natural minor scale intervals array
const naturalMinorScaleIntervals = [0, 2, 3, 5, 7, 8, 10]; // Natural minor: W-H-W-W-H-W-W

// Add common progression patterns for minor keys
const minorKeyNextDegrees = {
    0: [3, 4, 6],  // i → iv, v, VII
    1: [4, 0],     // ii° → v, i
    2: [5, 0],     // III → VI, i
    3: [0, 6],     // iv → i, VII
    4: [0, 2],     // v → i, III
    5: [2, 3],     // VI → III, iv
    6: [0, 4]      // VII → i, v
};


// Predefined progression patterns in Roman numeral notation with default values for length, tempo, and beats per chord
const progressionStyles = {
    'Random': {
        pattern: [], // Empty array means use the random generator
        length: 16,
        tempo: 60,
        beatsPerChord: 4
    },
    'Common': {
        pattern: ['I', 'IV', 'V', 'I'],
        length: 16,
        tempo: 60,
        beatsPerChord: 4
    },
    'Pop 1': {
        pattern: ['I', 'V', 'vi', 'IV'],
        length: 16,
        tempo: 90,
        beatsPerChord: 4
    },
    'Pop 2': {
        pattern: ['vi', 'IV', 'I', 'V'],
        length: 16,
        tempo: 90,
        beatsPerChord: 4
    },
	
    'Jazz & Classical Standard': {
        pattern: ['ii', 'V', 'I'],
        length: 15,
        tempo: 90,
        beatsPerChord: 4
    },
		'Popular Progression Workout': {
			pattern: ['I/3', 'IV', 'V', 'I/3', 'ii/3', 'V', 'I/3',  'I/3','I/3', 'vi/5', 'ii/3', 'V',
			          'I/3', 'iii/3', 'vi', 'IV', 'IV/3', 'vi', 'V',  'I/3','V/5', 'iii', 'IV', 'I/3'],
			length: 24,
			tempo: 90,
			beatsPerChord: 4
		},
	   'Pachelbel': {
			pattern: ['I/5', 'V', 'vi/5', 'iii', 'IV/5', 'I', 'IV', 'V'],
			length: 16,
			tempo: 110,
			beatsPerChord: 2
		},
    '12-Bar Blues': {
        pattern: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'],
        length: 24,
        tempo: 120,
        beatsPerChord: 4
    },
	'Andalusian Cadence ': {
        pattern: ['i', 'VII', 'VI', 'V'],
        length: 16,
        tempo: 80,
        beatsPerChord: 4
    },
    'Doo-Wop': {
        pattern: ['I', 'vi', 'ii', 'V'],
        length: 16,
        tempo: 120,
        beatsPerChord: 2
    },
    'Classic Rock': {
        pattern: ['I', 'bVII', 'bVI', 'V'],
        length: 16,
        tempo: 90,
        beatsPerChord: 4
    },
    'Basic Circle of Fifths': {
        pattern: ['I', 'V', 'II', 'VI', 'III', 'IV', 'I'],
        length: 16,
        tempo: 120,
        beatsPerChord: 4
    },
	'Slash Notation Example': {
			pattern: ['I', 'IV/3', 'ii/5', 'V7', 'I/3', 'vi', 'ii', 'V7/5', 'I'],
			length: 18,
			tempo: 90,
			beatsPerChord: 2
		},
     'Jazz-Friendly Circle of Fifths': {
        pattern: ['ii7', 'V7', 'Imaj7', 'IVmaj7', 'viiø', 'III7', 'vi7', 'II7', 'V7'],
        length: 16,
        tempo: 90,
        beatsPerChord: 4
     }
};

// Function to get name for inversion
function getInversionName(inversion) {
    switch(inversion) {
        case 'root': return 'Root Position';
        case 'first': return 'First Inversion';
        case 'second': return 'Second Inversion';
        default: return '';
    }
}

// Extract root from chord notation (e.g., "Bb" from "Bbm7")
function getChordRoot(chordName) {
    if (!chordName) return '';
    
    // Handle cases like "F#m7", "Bb°", etc.
    if (chordName.includes('m') || chordName.includes('°') || 
        chordName.includes('7') || chordName.includes('maj')) {
        // Extract the root before any modifier
        if (chordName.length > 1 && (chordName[1] === '#' || chordName[1] === 'b')) {
            return chordName.substring(0, 2);
        } else {
            return chordName[0];
        }
    }
    
    // For simple chords like "C", "F#", "Bb"
    if (chordName.length > 1 && (chordName[1] === '#' || chordName[1] === 'b')) {
        return chordName.substring(0, 2);
    } else {
        return chordName[0];
    }
}

// Function to get note index regardless of using sharp or flat notation
function getNoteIndex(noteName) {
    // Check if noteName is undefined or null
    if (!noteName) {
        console.warn('Warning: Attempted to get note index for undefined or null note name');
        return 0; // Return a default value (C)
    }
    
    // Remove any 'm' for minor keys
    const root = noteName.endsWith('m') ? noteName.slice(0, -1) : noteName;
    
    // Try direct lookup first in the noteNames array (which contains sharp names)
    let index = noteNames.indexOf(root);
    
    // If not found directly, it might be a flat notation
    if (index === -1) {
        // Check if it's a flat note by looking through our enharmonic equivalents
        for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
            if (flat === root) {
                // Convert to equivalent sharp for internal processing
                index = noteNames.indexOf(sharp);
                break;
            }
        }
    }
    
    // Additional debugging to help identify issues
    if (index === -1) {
        console.warn(`Could not find note index for: ${noteName} (root: ${root})`);
        console.log('Available note names:', noteNames);
        console.log('Enharmonic equivalents:', enharmonicEquivalents);
        return 0; // Default to C
    }
    
    return index;
}

// Function to normalize note name to maintain the user's chosen notation (sharp or flat)
function normalizeNoteName(root, originalKey) {
    // Determine if original key is minor
    const isMinor = originalKey.endsWith('m');
    const keyRoot = isMinor ? originalKey.slice(0, -1) : originalKey;
    
    // Proper music theory: Keys that use flat notation in their key signatures
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 
                      'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'Gbm', 'Cbm'];
    
    // Keys that use sharp notation in their key signatures
    const sharpKeys = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#',
                       'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];
    
    // Determine if key uses flat or sharp notation
    const usesFlat = flatKeys.includes(originalKey) || flatKeys.includes(keyRoot);
    const usesSharp = sharpKeys.includes(originalKey) || sharpKeys.includes(keyRoot);
    
    // Special case: Force sharp notation for all notes in sharp keys
    if (usesSharp) {
        // If the note is a flat name, convert it to its sharp equivalent
        for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
            if (flat === root) {
                return sharp;
            }
        }
    }
    
    // Special case: Force flat notation for all notes in flat keys
    if (usesFlat) {
        // Special case for A#/Bb in F major and other flat keys
        if (root === 'A#') {
            return 'Bb';
        }
        
        // If the note is a sharp name that has a flat equivalent, use the flat
        if (enharmonicEquivalents[root]) {
            return enharmonicEquivalents[root];
        }
    }
    
    // For keys with flats in their name but not in our explicit lists
    if (!usesSharp && !usesFlat && keyRoot.includes('b')) {
        if (enharmonicEquivalents[root]) {
            return enharmonicEquivalents[root];
        }
    }
    
    // For keys with sharps in their name but not in our explicit lists
    if (!usesSharp && !usesFlat && keyRoot.includes('#')) {
        for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
            if (flat === root) {
                return sharp;
            }
        }
    }
    
    // Default to original root if no conversion applied
    return root;
}

// Function to convert Roman numeral to chord data with optional slash notation support
function romanNumeralToChord(romanNumeral, keyRoot, isMinorKey) {
    // Check if there's slash notation for inversions
    let specifiedInversion = null;
    
    // Check for slash notation (e.g., "I/3" for first inversion)
    if (romanNumeral.includes('/')) {
        const [baseNumeral, inversionPart] = romanNumeral.split('/');
        romanNumeral = baseNumeral; // Remove inversion part for normal parsing
        
        // Parse the inversion part
        if (inversionPart === '3' || inversionPart.toLowerCase() === 'first') {
            specifiedInversion = 'first';
        } else if (inversionPart === '5' || inversionPart.toLowerCase() === 'second') {
            specifiedInversion = 'second';
        } else if (inversionPart === '1' || inversionPart.toLowerCase() === 'root') {
            specifiedInversion = 'root';
        }
    }
    
    // If we have a minor key, we'll use the diatonic minor chord table
    if (isMinorKey) {
        // Extract base Roman numeral without quality/7th/etc. indicators
        let baseNumeral = romanNumeral;
        // Remove everything after number, so we get i, ii°, III, iv, v, VI, vii°
        baseNumeral = baseNumeral.replace(/([IiVv]+)[^IiVv].*/g, '$1');
        
        // Check if it has a flat symbol
        const hasFlat = baseNumeral.startsWith('b');
        if (hasFlat) {
            baseNumeral = baseNumeral.substring(1);
        }
        
        // Determine chord quality and embellishments from the roman numeral
        let isSeventh = romanNumeral.includes('7');
        let isMajorSeventh = romanNumeral.includes('maj7');
        let isMinorSeventh = romanNumeral.toLowerCase().includes('m7');
        let isDiminished = romanNumeral.includes('°') || romanNumeral.includes('dim');
        let isHalfDiminished = romanNumeral.includes('ø');
        let isAugmented = romanNumeral.includes('+') || romanNumeral.includes('aug');
        let isSus2 = romanNumeral.includes('sus2');
        let isSus4 = romanNumeral.includes('sus4');
        let isAdd9 = romanNumeral.includes('add9');
        
        // Clean up the base Roman numeral for lookup
        const lookupNumeral = baseNumeral.replace(/dim|°|\d+/g, ''); // Remove diminished symbol and numbers
        
        let lookupKey = keyRoot + 'm'; // Add 'm' to indicate minor key
        
        // Convert to standard notation for lookup if needed
        if (lookupKey === 'A#m') lookupKey = 'Bbm';
        if (lookupKey === 'D#m') lookupKey = 'Ebm';
        if (lookupKey === 'G#m') lookupKey = 'Abm';
        
        // Handle flattened scale degrees
        let adjustedNumeral = lookupNumeral;
        if (hasFlat) {
            // Handle special cases for flattened degrees if needed
            // For minor keys, this might be less common but still possible
        }
        
        // Find chord in the diatonic minor table
        if (diatonicMinorChords[lookupKey] && 
            diatonicMinorChords[lookupKey][adjustedNumeral]) {
            
            // Get the base chord from the table
            let chordFromTable = diatonicMinorChords[lookupKey][adjustedNumeral];
            
            // Extract the root and determine if it's minor or diminished by default
            let root = chordFromTable;
            let type = 'major';
            
            if (chordFromTable.includes('m')) {
                root = chordFromTable.replace('m', '');
                type = 'minor';
            } else if (chordFromTable.includes('°')) {
                root = chordFromTable.replace('°', '');
                type = 'diminished';
            }
            
            // Apply any specified embellishments from the original roman numeral
            if (isMajorSeventh) {
                type = 'major7';
            } else if (isMinorSeventh) {
                type = 'minor7';
            } else if (isSeventh) {
                type = 'dominant7';
            } else if (isDiminished) {
                type = 'diminished';
            } else if (isHalfDiminished) {
                type = 'half-diminished'; 
            } else if (isAugmented) {
                type = 'augmented';
            } else if (isSus2) {
                type = 'sus2';
            } else if (isSus4) {
                type = 'sus4';
            } else if (isAdd9) {
                type = 'add9';
            }
            
            // If inversion is specified in the slash notation, use it
            let inversion;
            if (specifiedInversion) {
                inversion = specifiedInversion;
            } else {
                // Otherwise choose a random inversion from the selected inversions
                const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
                inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
            }
            
            // Count steps from key root to determine proper degree index
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const keyRootIndex = getNoteIndex(keyRoot);
            let chordRootIndex = getNoteIndex(root);
            
            // Determine the degree index (0-6) by counting semitones from key root
            // For minor keys, the pattern is different from major
            let semitoneDistance = (chordRootIndex - keyRootIndex + 12) % 12;
            let degreeIndex;
            
            // Map semitone distances to minor scale degrees
            switch (semitoneDistance) {
                case 0: degreeIndex = 0; break;  // i
                case 2: degreeIndex = 1; break;  // ii
                case 3: degreeIndex = 2; break;  // III
                case 5: degreeIndex = 3; break;  // iv
                case 7: degreeIndex = 4; break;  // v
                case 8: degreeIndex = 5; break;  // VI
                case 10: degreeIndex = 6; break; // vii
                default: degreeIndex = 0; // Fallback
            }
            
            return {
                root,
                type,
                inversion,
                degreeIndex
            };
        }
    }
    
    // If we have a major key, we'll use the diatonic chord table for accurate names
    if (!isMinorKey) {
        // Extract base Roman numeral without quality/7th/etc. indicators
        let baseNumeral = romanNumeral;
        // Remove everything after number, so we get I, ii, iii, IV, V, vi, vii
        baseNumeral = baseNumeral.replace(/([IiVv]+)[^IiVv].*/g, '$1');
        
        // Check if it has a flat symbol
        const hasFlat = baseNumeral.startsWith('b');
        if (hasFlat) {
            baseNumeral = baseNumeral.substring(1);
        }
        
        // Determine chord quality and embellishments from the roman numeral
        let isSeventh = romanNumeral.includes('7');
        let isMajorSeventh = romanNumeral.includes('maj7');
        let isMinorSeventh = romanNumeral.toLowerCase().includes('m7');
        let isDiminished = romanNumeral.includes('°') || romanNumeral.includes('dim');
        let isHalfDiminished = romanNumeral.includes('ø');
        let isAugmented = romanNumeral.includes('+') || romanNumeral.includes('aug');
        let isSus2 = romanNumeral.includes('sus2');
        let isSus4 = romanNumeral.includes('sus4');
        let isAdd9 = romanNumeral.includes('add9'); // Added this line
        
        // Clean up the base Roman numeral for lookup
        // Convert to standard form (I, ii, iii, IV, V, vi, vii°)
        const lookupNumeral = baseNumeral.replace(/dim|°|\d+/g, ''); // Remove diminished symbol and numbers
        
        let lookupKey = keyRoot;
        
        // Convert to standard notation for lookup (use Bb instead of A#, etc.)
        if (lookupKey === 'A#') lookupKey = 'Bb';
        if (lookupKey === 'D#') lookupKey = 'Eb';
        if (lookupKey === 'G#') lookupKey = 'Ab';
        
        // Handle flattened scale degrees
        let adjustedNumeral = lookupNumeral;
        if (hasFlat) {
            // Handle special cases for flattened degrees
            if (lookupNumeral === 'VII') adjustedNumeral = 'vii°';
            else if (lookupNumeral === 'VI') adjustedNumeral = 'vi';
            else if (lookupNumeral === 'III') adjustedNumeral = 'iii';
            // Additional logic for other flattened degrees if needed
        }
        
        // Find chord in the diatonic table
        if (diatonicMajorChords[lookupKey] && 
            diatonicMajorChords[lookupKey][adjustedNumeral]) {
            
            // Get the base chord from the table
            let chordFromTable = diatonicMajorChords[lookupKey][adjustedNumeral];
            
            // Extract the root and determine if it's minor or diminished by default
            let root = chordFromTable;
            let type = 'major';
            
            if (chordFromTable.includes('m')) {
                root = chordFromTable.replace('m', '');
                type = 'minor';
            } else if (chordFromTable.includes('°')) {
                root = chordFromTable.replace('°', '');
                type = 'diminished';
            }
            
            // Apply any specified embellishments from the original roman numeral
            if (isMajorSeventh) {
                type = 'major7';
            } else if (isMinorSeventh) {
                type = 'minor7';
            } else if (isSeventh) {
                type = 'dominant7';
            } else if (isDiminished) {
                type = 'diminished';
            } else if (isHalfDiminished) {
                type = 'half-diminished'; 
            } else if (isAugmented) {
                type = 'augmented';
            } else if (isSus2) {
                type = 'sus2';
            } else if (isSus4) {
                type = 'sus4';
            } else if (isAdd9) {
                type = 'add9'; // Added this line
            }
            
            // If inversion is specified in the slash notation, use it
            let inversion;
            if (specifiedInversion) {
                inversion = specifiedInversion;
            } else {
                // Otherwise choose a random inversion from the selected inversions
                const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
                inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
            }
            
            // Count steps from key root to determine proper degree index
            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const keyRootIndex = getNoteIndex(keyRoot);
            let chordRootIndex = getNoteIndex(root);
            
            // Determine the degree index (0-6) by counting semitones from key root
            let semitoneDistance = (chordRootIndex - keyRootIndex + 12) % 12;
            let degreeIndex;
            
            // Map semitone distances to diatonic scale degrees
            switch (semitoneDistance) {
                case 0: degreeIndex = 0; break;  // I
                case 2: degreeIndex = 1; break;  // ii
                case 4: degreeIndex = 2; break;  // iii
                case 5: degreeIndex = 3; break;  // IV
                case 7: degreeIndex = 4; break;  // V
                case 9: degreeIndex = 5; break;  // vi
                case 11: degreeIndex = 6; break; // vii
                default: degreeIndex = 0; // Fallback
            }
            
            return {
                root,
                type,
                inversion,
                degreeIndex
            };
        }
    }
    
    // Fall back to original implementation for minor keys or if no match found
    // Parse the Roman numeral to extract degree, quality, and any modifications
    let degree, quality, isSeventh = false, isMajorSeventh = false, isMinorSeventh = false;
    let isDiminished = false, isHalfDiminished = false, isAugmented = false, isSus2 = false, isSus4 = false;
    let isAdd9 = false; // Added this line
    
    // Create a copy of the romanNumeral for parsing
    let parsedNumeral = romanNumeral;
    
    // Check for flat symbol before Roman numeral
    const hasFlat = parsedNumeral.startsWith('b');
    if (hasFlat) {
        parsedNumeral = parsedNumeral.substring(1); // Remove the flat symbol for parsing
    }
    
    // First extract any non-Roman numeral suffixes like 7, maj7, etc.
    // Store the base Roman numeral part
    let baseNumeral = parsedNumeral;
    let suffix = '';
    
    // Common chord quality indicators
    const qualitySuffixes = ['7', 'maj7', 'm7', 'ø', '°', 'dim', 'aug', '+', 'sus2', 'sus4', 'add9']; // Updated this line
    
    // Extract the quality suffix
    for (const qualitySuffix of qualitySuffixes) {
        if (parsedNumeral.includes(qualitySuffix)) {
            // Find where the quality suffix starts
            const suffixIndex = parsedNumeral.indexOf(qualitySuffix);
            // Extract the base Roman numeral and the suffix
            baseNumeral = parsedNumeral.substring(0, suffixIndex);
            suffix = parsedNumeral.substring(suffixIndex);
            break;
        }
    }
    
    // If no baseNumeral remains (e.g., if the entire string was "7"), 
    // use the whole thing as the baseNumeral
    if (!baseNumeral) {
        baseNumeral = parsedNumeral;
    }
    
    // Now parse the base Roman numeral to get the degree
    // Extract the base degree (I, II, III, IV, V, VI, VII)
    // Check for exact matches first to avoid issues with substrings (like IV vs I)
    if (baseNumeral === 'IV' || baseNumeral === 'iv') {
        degree = 3; // 0-based index for the 4th degree
    } else if (baseNumeral === 'I' || baseNumeral === 'i') {
        degree = 0; // 0-based index for the 1st degree
    } else if (baseNumeral === 'V' || baseNumeral === 'v') {
        degree = 4; // 0-based index for the 5th degree
    } else if (baseNumeral.startsWith('vii')) {
        degree = 6; // 0-based index for the 7th degree
    } else if (baseNumeral.startsWith('vi')) {
        degree = 5; // 0-based index for the 6th degree
    } else if (baseNumeral.startsWith('iv')) {
        degree = 3; // 0-based index for the 4th degree
    } else if (baseNumeral.startsWith('iii')) {
        degree = 2; // 0-based index for the 3rd degree
    } else if (baseNumeral.startsWith('ii')) {
        degree = 1; // 0-based index for the 2nd degree
    } else if (baseNumeral.startsWith('VII')) {
        degree = 6; // 0-based index for the 7th degree
    } else if (baseNumeral.startsWith('VI')) {
        degree = 5; // 0-based index for the 6th degree
    } else if (baseNumeral.startsWith('IV')) {
        degree = 3; // 0-based index for the 4th degree
    } else if (baseNumeral.startsWith('III')) {
        degree = 2; // 0-based index for the 3rd degree
    } else if (baseNumeral.startsWith('II')) {
        degree = 1; // 0-based index for the 2nd degree
    } else if (baseNumeral.startsWith('I')) {
        degree = 0; // 0-based index for the 1st degree
    }
    
    // Determine quality based on case, symbols, and suffix
    // Uppercase = major, lowercase = minor for the base triad
    const isUpperCase = /^[A-Z]/.test(baseNumeral);
    
    // Check for special symbols in the suffix
    const hasDiminishedSymbol = suffix.includes('°') || suffix.includes('dim');
    const hasHalfDiminishedSymbol = suffix.includes('ø');
    const hasAugmentedSymbol = suffix.includes('+') || suffix.includes('aug');
    const hasSus2Symbol = suffix.includes('sus2');
    const hasSus4Symbol = suffix.includes('sus4');
    const hasAdd9Symbol = suffix.includes('add9'); // Added this line
    
    // Check for 7th chords
    if (suffix.includes('7')) {
        isSeventh = true;
        // Check if it's a major 7th specifically
        if (suffix.includes('maj7')) {
            isMajorSeventh = true;
        }
        // Check if it's a minor 7th specifically
        else if (suffix.toLowerCase().includes('m7') || (!isUpperCase && suffix.includes('7'))) {
            isMinorSeventh = true;
        }
    }
    
    // Check for add9 
    if (hasAdd9Symbol) {
        isAdd9 = true;
    }
    
    // Determine chord type based on all indicators
    if (hasDiminishedSymbol) {
        quality = 'diminished';
        isDiminished = true;
    } else if (hasHalfDiminishedSymbol) {
        quality = 'half-diminished'; 
        isHalfDiminished = true;
    } else if (hasAugmentedSymbol) {
        quality = 'augmented';
        isAugmented = true;
    } else if (hasSus2Symbol) {
        quality = 'sus2';
        isSus2 = true;
    } else if (hasSus4Symbol) {
        quality = 'sus4';
        isSus4 = true;
    } else if (isMajorSeventh) {
        quality = 'major7';
    } else if (isMinorSeventh) {
        quality = 'minor7';
    } else if (isSeventh) {
        // If it has a 7 but no other specifications, it's a dominant 7th
        quality = 'dominant7';
    } else if (isAdd9) {
        quality = 'add9'; // Added this line
    } else {
        // Basic triads
        quality = isUpperCase ? 'major' : 'minor';
    }
    
    // Calculate the root note
    let rootIndex = getNoteIndex(keyRoot);
    
    // Adjust for minor key if needed
    const scaleIntervals = isMinorKey ? 
        [0, 2, 3, 5, 7, 8, 10] : // Natural minor scale intervals
        majorScaleIntervals;     // Major scale intervals
    
    // Apply flat modification if present
    if (hasFlat) {
        // Flatten the degree (lower by one semitone)
        const normalDegreeNote = (rootIndex + scaleIntervals[degree]) % 12;
        rootIndex = (normalDegreeNote - 1 + 12) % 12; // Ensure positive result with modulo
    } else {
        // Use the scale degree directly
        rootIndex = (rootIndex + scaleIntervals[degree]) % 12;
    }
    
    // Get the note name
    let root = noteNames[rootIndex];
    
    // Normalize the note name based on key signature (choose flat vs sharp)
    const fullKeyName = isMinorKey ? keyRoot + 'm' : keyRoot;
    root = normalizeNoteName(root, fullKeyName);
    
    // If inversion is specified in the slash notation, use it
    let inversion;
    if (specifiedInversion) {
        inversion = specifiedInversion;
    } else {
        // Otherwise choose a random inversion from the selected inversions
        const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
        inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
    }
    
    return {
        root,
        type: quality,
        inversion,
        degreeIndex: degree
    };
}


// Modify the generateChordProgression function to correctly handle minor keys
function generateChordProgression(key, length, selectedTypes, selectedInversions, style = 'Random') {
    const progression = [];
    const isMinorKey = key.endsWith('m');
    const keyRoot = isMinorKey ? key.slice(0, -1) : key;
    
    // If a predefined style is selected
    if (style !== 'Random' && progressionStyles[style] && progressionStyles[style].pattern.length > 0) {
        const pattern = progressionStyles[style].pattern;
        
        // Generate the pattern and repeat it to meet the desired length
        for (let i = 0; i < length; i++) {
            const romanNumeral = pattern[i % pattern.length];
            
            // Convert Roman numeral to actual chord data without modifying the type
            const chord = romanNumeralToChord(romanNumeral, keyRoot, isMinorKey);
            
            // We'll respect the exact chord type from the progression style
            // and not modify it based on selectedTypes
            progression.push(chord);
        }
        
        return progression;
    }
    
    // If Random is selected or no valid style is found, use the improved random generator
    const keyRootIndex = getNoteIndex(keyRoot);
    
    // Use appropriate scale degrees based on key type
    const scaleDegrees = isMinorKey ? minorScaleDegrees : majorScaleDegrees;
    
    // Generate first chord - usually tonic (I or i)
    const firstChord = {
        root: keyRoot,
        type: isMinorKey ? 'minor' : 'major',
        inversion: selectedInversions[Math.floor(Math.random() * selectedInversions.length)],
        degreeIndex: 0 // Tonic is degree 0
    };
    progression.push(firstChord);
    
    // Generate remaining chords using improved logic
    for (let i = 1; i < length; i++) {
        // Choose a random scale degree, weighted toward strong harmonic relationships
        let degreeIndex;
        const prevDegreeIndex = progression[i-1].degreeIndex || 0;
        
        // Use appropriate common next degrees based on key type
        const commonNextDegrees = isMinorKey ? minorKeyNextDegrees : {
            0: [3, 4, 5],  // I → IV, V, vi
            1: [4, 6],     // ii → V, vii°
            2: [5, 3],     // iii → vi, IV
            3: [4, 0],     // IV → V, I
            4: [0, 5],     // V → I, vi
            5: [3, 1],     // vi → IV, ii
            6: [0]         // vii° → I
        };
        
        // Select from common next degrees, or fall back to random selection
        if (commonNextDegrees[prevDegreeIndex] && Math.random() < 0.8) {
            const nextOptions = commonNextDegrees[prevDegreeIndex];
            degreeIndex = nextOptions[Math.floor(Math.random() * nextOptions.length)];
        } else {
            degreeIndex = Math.floor(Math.random() * scaleDegrees.length);
        }
        
        // Get chord info for this degree
        const degreeInfo = scaleDegrees[degreeIndex];
        
        // Calculate the root note for this chord using the appropriate scale intervals
        const scaleIntervals = isMinorKey ? naturalMinorScaleIntervals : majorScaleIntervals;
        const rootOffset = scaleIntervals[degreeIndex];
        const rootIndex = (keyRootIndex + rootOffset) % 12;
        let root = noteNames[rootIndex];
        
        // Normalize root note to maintain notation consistency with selected key
        root = normalizeNoteName(root, key);
        
        // Determine chord type based on diatonic structure
        let type = degreeInfo.type;
        
        // Check if the diatonic type is in the selected types
        const isDiatonicTypeSelected = selectedTypes.includes(type);
        
        // If the diatonic type isn't selected, use a more appropriate fallback logic
        if (!isDiatonicTypeSelected) {
            // For minor keys, more appropriately map chord types
            if (isMinorKey) {
                if (type === 'minor') {
                    // If minor isn't selected, prefer major or dominant7
                    if (selectedTypes.includes('major')) type = 'major';
                    else if (selectedTypes.includes('dominant7')) type = 'dominant7';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                } else if (type === 'major') {
                    // If major isn't selected, prefer minor or major7
                    if (selectedTypes.includes('minor')) type = 'minor';
                    else if (selectedTypes.includes('major7')) type = 'major7';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                } else if (type === 'diminished') {
                    // If diminished isn't selected, try half-diminished or minor
                    if (selectedTypes.includes('half-diminished')) type = 'half-diminished';
                    else if (selectedTypes.includes('minor')) type = 'minor';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                }
            } else {
                // For major keys, similar appropriate mappings
                if (type === 'major') {
                    if (selectedTypes.includes('dominant7')) type = 'dominant7';
                    else if (selectedTypes.includes('major7')) type = 'major7';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                } else if (type === 'minor') {
                    if (selectedTypes.includes('minor7')) type = 'minor7';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                } else if (type === 'diminished') {
                    if (selectedTypes.includes('half-diminished')) type = 'half-diminished';
                    else type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
                }
            }
        }
        
        // Enhancements for more musical chord selections in minor keys
        if (isMinorKey) {
            // For minor v chord, sometimes make it a dominant V if selected
            if (degreeIndex === 4 && selectedTypes.includes('dominant7') && Math.random() < 0.4) {
                type = 'dominant7';
            }
            
            // For III chord, occasionally make it major7 if selected
            if (degreeIndex === 2 && selectedTypes.includes('major7') && Math.random() < 0.3) {
                type = 'major7';
            }
            
            // For iv chord, occasionally make it minor7 if selected
            if (degreeIndex === 3 && selectedTypes.includes('minor7') && Math.random() < 0.3) {
                type = 'minor7';
            }
        } else {
            // Existing major key enhancements
            if (degreeIndex === 4 && selectedTypes.includes('dominant7') && Math.random() < 0.7) {
                type = 'dominant7';
            }
            
            if (degreeIndex === 0 && selectedTypes.includes('major7') && Math.random() < 0.3) {
                type = 'major7';
            }
            
            if (degreeIndex === 5 && selectedTypes.includes('minor7') && Math.random() < 0.3) {
                type = 'minor7';
            }
        }
        
        // Choose inversion based on voice leading (existing code)
        let inversion;
        if (i > 0 && Math.random() < 0.7) {
            // Voice leading code remains unchanged
            const prevRoot = progression[i-1].root;
            const prevType = progression[i-1].type;
            const prevInv = progression[i-1].inversion;
            
            let prevTopNote;
            if (prevInv === 'root') {
                prevTopNote = (getNoteIndex(prevRoot) + (prevType === 'minor' ? 7 : 7)) % 12;
            } else if (prevInv === 'first') {
                prevTopNote = getNoteIndex(prevRoot);
            } else {
                prevTopNote = (getNoteIndex(prevRoot) + (prevType === 'minor' ? 3 : 4)) % 12;
            }
            
            const distances = {};
            const allowedInversions = selectedInversions.filter(inv => inv);
            
            for (const inv of allowedInversions) {
                let topNote;
                if (inv === 'root') {
                    topNote = (rootIndex + (type === 'minor' ? 7 : 7)) % 12; // 5th
                } else if (inv === 'first') {
                    topNote = rootIndex; // Root
                } else {
                    topNote = (rootIndex + (type === 'minor' ? 3 : 4)) % 12; // 3rd
                }
                
                let dist = Math.abs(topNote - prevTopNote);
                dist = Math.min(dist, 12 - dist);
                distances[inv] = dist;
            }
            
            const minDist = Math.min(...Object.values(distances));
            const bestInversions = Object.keys(distances).filter(inv => distances[inv] === minDist);
            inversion = bestInversions[Math.floor(Math.random() * bestInversions.length)];
        } else {
            inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
        }
        
        progression.push({
            root,
            type,
            inversion,
            degreeIndex
        });
    }
    
    return progression;
}

// Get chord intervals based on type and inversion
function getChordIntervals(type, inversion) {
    switch(type) {
        case 'major':
            switch(inversion) {
                case 'root':   return [0, 4, 7];       // 1-3-5
                case 'first':  return [0, 3, 8];       // 3-5-8
                case 'second': return [0, 5, 9];       // 5-8-10
                default: return [0, 4, 7];
            }
        
        case 'minor':
            switch(inversion) {
                case 'root':   return [0, 3, 7];       // 1-b3-5
                case 'first':  return [0, 4, 9];       // b3-5-8
                case 'second': return [0, 5, 8];       // 5-8-b10
                default: return [0, 3, 7];
            }
            
        case 'dominant7':
            switch(inversion) {
                case 'root':   return [0, 4, 7, 10];   // 1-3-5-b7
                case 'first':  return [0, 3, 6, 8];    // 3-5-b7-8
                case 'second': return [0, 3, 5, 9];    // 5-b7-8-10
                default: return [0, 4, 7, 10];
            }
        
        case 'major7':
            switch(inversion) {
                case 'root':   return [0, 4, 7, 11];   // 1-3-5-7
                case 'first':  return [0, 3, 7, 8];    // 3-5-7-8
                case 'second': return [0, 4, 5, 9];    // 5-7-8-10
                default: return [0, 4, 7, 11];
            }
            
        case 'minor7':
            switch(inversion) {
                case 'root':   return [0, 3, 7, 10];   // 1-b3-5-b7
                case 'first':  return [0, 4, 7, 9];    // b3-5-b7-8
                case 'second': return [0, 3, 5, 8];    // 5-b7-8-b10
                default: return [0, 3, 7, 10];
            }
            
        case 'diminished':
            switch(inversion) {
                case 'root':   return [0, 3, 6];       // 1-b3-b5
                case 'first':  return [0, 3, 9];       // b3-b5-1
                case 'second': return [0, 6, 9];       // b5-1-b3
                default: return [0, 3, 6];
            }
			
		case 'half-diminished':
			switch(inversion) {
				case 'root':   return [0, 3, 6, 10];   // 1-b3-b5-b7
				case 'first':  return [0, 3, 7, 9];    // b3-b5-b7-8
				case 'second': return [0, 4, 6, 9];    // b5-b7-8-b10
				default: return [0, 3, 6, 10];
			}
            
        case 'augmented':
            switch(inversion) {
                case 'root':   return [0, 4, 8];       // 1-3-#5
                case 'first':  return [0, 4, 8];       // 3-#5-1 (enharmonically equivalent)
                case 'second': return [0, 4, 8];       // #5-1-3 (enharmonically equivalent)
                default: return [0, 4, 8];
            }
            
        case 'sus2':
            switch(inversion) {
                case 'root':   return [0, 2, 7];       // 1-2-5
                case 'first':  return [0, 5, 10];      // 2-5-8
                case 'second': return [0, 5, 7];       // 5-8-10
                default: return [0, 2, 7];
            }
            
        case 'sus4':
            switch(inversion) {
                case 'root':   return [0, 5, 7];       // 1-4-5
                case 'first':  return [0, 2, 7];       // 4-5-8
                case 'second': return [0, 5, 10];      // 5-8-11
                default: return [0, 5, 7];
            }
		// Corrected getChordIntervals case for add9 chords
		case 'add9':
			switch(inversion) {
				case 'root':   return [0, 4, 7, 14];   // 1-3-5-9 (9th is an octave + 2nd)
				case 'first':  return [0, 3, 10, 8];   // 3-5-1-9 (from 3rd base)
				case 'second': return [0, 7, 5, 12];   // 5-1-3-9 (from 5th base)
				default: return [0, 4, 7, 14];
			}
            
        default:
            return [0, 4, 7];  // Default to major triad
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
    
    // Base octave offset on hand selection and the user-selected octave
    // Right hand: selectedOctave, Left hand: selectedOctave-1
    const octaveOffset = isRightHand ? selectedOctave : selectedOctave - 1;
    
    // If rootIndex is a string (a note name), convert it to an index
    if (typeof rootIndex === 'string') {
        rootIndex = getNoteIndex(rootIndex);
    }
    
    switch(inversion) {
        case 'root':
            return rootIndex + (octaveOffset * 12);
        case 'first':
            if (type === 'major' || type === 'dominant7' || type === 'major7' || type === 'augmented') {
                return (rootIndex + 4) % 12 + (octaveOffset * 12); // Major 3rd
            } else if (type === 'minor' || type === 'minor7' || type === 'diminished') {
                return (rootIndex + 3) % 12 + (octaveOffset * 12); // Minor 3rd
            } else if (type === 'sus2') {
                return (rootIndex + 2) % 12 + (octaveOffset * 12); // Major 2nd
            } else if (type === 'sus4') {
                return (rootIndex + 5) % 12 + (octaveOffset * 12); // Perfect 4th
            } else {
                return (rootIndex + 4) % 12 + (octaveOffset * 12); // Default to Major 3rd
            }
        case 'second':
            if (type === 'diminished') {
                return (rootIndex + 6) % 12 + (octaveOffset * 12); // Diminished 5th
            } else if (type === 'augmented') {
                return (rootIndex + 8) % 12 + (octaveOffset * 12); // Augmented 5th
            } else {
                return (rootIndex + 7) % 12 + (octaveOffset * 12); // Perfect 5th
            }
        default:
            return rootIndex + (octaveOffset * 12);
    }
}

// Function to get the bass note for slash notation
function getBassNote(root, type, inversion) {
    const rootIndex = getNoteIndex(root);
    
    if (inversion === 'root') {
        return root;
    } else if (inversion === 'first') {
        // First inversion - bass note is the interval specific to chord type
        let interval;
        switch(type) {
            case 'major':
            case 'dominant7':
            case 'major7':
            case 'augmented':
			case 'add9':
                interval = 4; // Major 3rd
                break;
            case 'minor':
            case 'minor7':
            case 'diminished':
                interval = 3; // Minor 3rd
                break;
			case 'half-diminished':
				interval = 3; // Minor 3rd
				break;
            case 'sus2':
                interval = 2; // Major 2nd
                break;
            case 'sus4':
                interval = 5; // Perfect 4th
                break;
            default:
                interval = 4; // Default to Major 3rd
        }
        const bassIndex = (rootIndex + interval) % 12;
        return noteNames[bassIndex];
    } else if (inversion === 'second') {
        // Second inversion - bass note is the 5th (perfect, diminished, or augmented)
        let interval;
        switch(type) {
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
        return noteNames[bassIndex];
    }
    
    return root;
}