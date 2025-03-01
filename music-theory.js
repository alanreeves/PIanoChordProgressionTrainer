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

// Predefined progression patterns in Roman numeral notation
const progressionStyles = {
    'Random': [], // Empty array means use the random generator
    'Common': ['I', 'IV', 'V', 'I'],
    'Pop 1': ['I', 'V', 'vi', 'IV'],
    'Pop 2': ['vi', 'IV', 'I', 'V'],
    'Jazz & Classical Standard': ['ii', 'V', 'I'],
    '12-Bar Blues': ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'],
    'Doo-Wop': ['I', 'vi', 'ii', 'V'],
    'Classic Rock': ['I', 'bVII', 'bVI', 'V'],
    'Basic Circle of Fifths': ['I', 'V', 'II', 'VI', 'III', 'IV', 'I'],
    'Common Major Circle of Fifths': ['I', 'IV', 'vii°', 'iii', 'vi', 'ii', 'V', 'I'],
    'Jazz-Friendly Circle of Fifths': ['ii7', 'V7', 'Imaj7', 'IVmaj7', 'viiø', 'III7', 'vi7', 'II7', 'V7'],
    'Minor Key Circle of Fifths': ['i', 'iv', 'bVII', 'bIII', 'bVI', 'ii°', 'V', 'i'],
    'Harmonic Minor Circle of Fifths': ['i', 'iv', 'bVII', 'bIII', 'bVI', 'ii°', 'V7', 'i']
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

// Function to get note index regardless of using sharp or flat notation
function getNoteIndex(noteName) {
    // Check if noteName is undefined or null
    if (!noteName) {
        console.warn('Warning: Attempted to get note index for undefined or null note name');
        return 0; // Return a default value (C)
    }
    
    // Remove any 'm' for minor keys
    const root = noteName.endsWith('m') ? noteName.slice(0, -1) : noteName;
    
    // Try direct lookup first
    let index = noteNames.indexOf(root);
    
    // If not found, could be a flat notation, try to find the equivalent
    if (index === -1) {
        // Find equivalent sharp name if this is a flat
        for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
            if (flat === root) {
                index = noteNames.indexOf(sharp);
                break;
            }
        }
    }
    
    // If still not found, return a safe default
    if (index === -1) {
        console.warn(`Could not find note index for: ${noteName}`);
        return 0; // Default to C
    }
    
    return index;
}

// Function to normalize note name to maintain the user's chosen notation (sharp or flat)
function normalizeNoteName(root, originalKey) {
    // Determine if original key uses flat notation
    const isMinor = originalKey.endsWith('m');
    const keyRoot = isMinor ? originalKey.slice(0, -1) : originalKey;
    const usesFlat = keyRoot.includes('b');
    
    // If original key uses flat notation and this note has a flat equivalent, use it
    if (usesFlat && enharmonicEquivalents[root]) {
        return enharmonicEquivalents[root];
    }
    
    return root;
}

// Function to convert Roman numeral to chord data
// Function to convert Roman numeral to chord data
function romanNumeralToChord(romanNumeral, keyRoot, isMinorKey) {
    // Parse the Roman numeral to extract degree, quality, and any modifications
    let degree, quality, isSeventh = false, isMajorSeventh = false, isMinorSeventh = false;
    let isDiminished = false, isHalfDiminished = false, isAugmented = false, isSus2 = false, isSus4 = false;
    
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
    const qualitySuffixes = ['7', 'maj7', 'm7', 'ø', '°', 'dim', 'aug', '+', 'sus2', 'sus4'];
    
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
    
    // Determine chord type based on all indicators
    if (hasDiminishedSymbol) {
        quality = 'diminished';
        isDiminished = true;
    } else if (hasHalfDiminishedSymbol) {
        quality = 'diminished'; // Using diminished since we don't have half-diminished
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
    const root = noteNames[rootIndex];
    
    // Choose a random inversion from the selected inversions
    const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
    const inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
    
    return {
        root,
        type: quality,
        inversion,
        degreeIndex: degree
    };
}


// Modified function to generate chord progression based on style
function generateChordProgression(key, length, selectedTypes, selectedInversions, style = 'Random') {
    const progression = [];
    const isMinorKey = key.endsWith('m');
    const keyRoot = isMinorKey ? key.slice(0, -1) : key;
    
    // If a predefined style is selected
    if (style !== 'Random' && progressionStyles[style] && progressionStyles[style].length > 0) {
        const pattern = progressionStyles[style];
        
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
    
    // If Random is selected or no valid style is found, use the original random generator
    // (existing code for random progression generation)
    const keyRootIndex = getNoteIndex(key);
    
    // Use appropriate scale degrees based on key type
    const scaleDegrees = isMinorKey ? minorScaleDegrees : majorScaleDegrees;
    
    // Generate first chord - usually tonic (I or i)
    const firstChord = {
        root: keyRoot,
        type: isMinorKey ? 'minor' : 'major',
        inversion: selectedInversions[Math.floor(Math.random() * selectedInversions.length)]
    };
    progression.push(firstChord);
    
    // Generate remaining chords using existing logic
    for (let i = 1; i < length; i++) {
        // Choose a random scale degree, weighted toward strong harmonic relationships
        let degreeIndex;
        const prevDegreeIndex = progression[i-1].degreeIndex || 0;
        
        // Common chord progressions in Western music
        const commonNextDegrees = {
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
        
        // Calculate the root note for this chord
        const rootOffset = majorScaleIntervals[degreeIndex];
        const rootIndex = (keyRootIndex + rootOffset) % 12;
        let root = noteNames[rootIndex];
        
        // Normalize root note to maintain notation consistency with selected key
        root = normalizeNoteName(root, key);
        
        // Determine chord type (ensure it's in selected types)
        let type = degreeInfo.type;
        if (!selectedTypes.includes(type)) {
            // Fall back to a type from selected types
            type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
        }
        
        // For dominant and leading tones, possibly make them 7th chords
        if (degreeIndex === 4 && selectedTypes.includes('dominant7') && Math.random() < 0.7) {
            type = 'dominant7';
        }
        
        // For tonic, possibly make it major7 in major keys
        if (degreeIndex === 0 && !isMinorKey && selectedTypes.includes('major7') && Math.random() < 0.3) {
            type = 'major7';
        }
        
        // For submediant (vi), possibly make it minor7 if available
        if (degreeIndex === 5 && selectedTypes.includes('minor7') && Math.random() < 0.3) {
            type = 'minor7';
        }
        
        // For dominant (V), occasionally make it a sus4 resolving to dominant
        if (degreeIndex === 4 && selectedTypes.includes('sus4') && Math.random() < 0.15) {
            type = 'sus4';
        }
        
        // For supertonic (ii), occasionally make it a sus2
        if (degreeIndex === 1 && selectedTypes.includes('sus2') && Math.random() < 0.15) {
            type = 'sus2';
        }
        
        // For mediant (III in major or III in minor), occasionally make it augmented
        if (degreeIndex === 2 && selectedTypes.includes('augmented') && Math.random() < 0.1) {
            type = 'augmented';
        }
        
        // Choose inversion based on voice leading
        // Simple rule: try to minimize movement from previous chord
        let inversion;
        if (i > 0 && Math.random() < 0.7) {
            // Pick inversion that creates smoother voice leading
            // This is a simplification - real voice leading is more complex
            const prevRoot = progression[i-1].root;
            const prevType = progression[i-1].type;
            const prevInv = progression[i-1].inversion;
            
            // Approximate the top note of the previous chord
            let prevTopNote;
            if (prevInv === 'root') {
                // In root position, the top note is the 5th
                prevTopNote = (getNoteIndex(prevRoot) + (prevType === 'minor' ? 7 : 7)) % 12;
            } else if (prevInv === 'first') {
                // In first inversion, the top note is often the root
                prevTopNote = getNoteIndex(prevRoot);
            } else {
                // In second inversion, the top note is often the 3rd
                prevTopNote = (getNoteIndex(prevRoot) + (prevType === 'minor' ? 3 : 4)) % 12;
            }
            
            // Calculate distance to possible top notes for each inversion
            const distances = {};
            
            // Filter to only allowed inversions
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
                
                // Calculate smallest distance (accounting for octave wrapping)
                let dist = Math.abs(topNote - prevTopNote);
                dist = Math.min(dist, 12 - dist);
                distances[inv] = dist;
            }
            
            // Choose inversion with smallest distance (or random if tie)
            const minDist = Math.min(...Object.values(distances));
            const bestInversions = Object.keys(distances).filter(inv => distances[inv] === minDist);
            inversion = bestInversions[Math.floor(Math.random() * bestInversions.length)];
        } else {
            // Random inversion
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
            
        default:
            return [0, 4, 7];  // Default to major triad
    }
}

// Calculate starting note based on root, type, inversion, and hand
function getChordStartNote(rootIndex, type, inversion, isRightHand) {
    const octaveOffset = isRightHand ? 4 : 3;  // Right hand: C4, Left hand: C3
    
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