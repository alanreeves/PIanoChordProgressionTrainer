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

// Generate chord progression
function generateChordProgression(key, length, selectedTypes, selectedInversions) {
    const progression = [];
    const isMinorKey = key.endsWith('m');
    const keyRoot = isMinorKey ? key.slice(0, -1) : key;
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
    
    // Generate remaining chords
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
            
        case 'diminished':
            switch(inversion) {
                case 'root':   return [0, 3, 6];       // 1-b3-b5
                case 'first':  return [0, 3, 9];       // b3-b5-1
                case 'second': return [0, 6, 9];       // b5-1-b3
                default: return [0, 3, 6];
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
            if (type === 'major' || type === 'dominant7' || type === 'major7') {
                return (rootIndex + 4) % 12 + (octaveOffset * 12); // Major 3rd
            } else {
                return (rootIndex + 3) % 12 + (octaveOffset * 12); // Minor 3rd
            }
        case 'second':
            if (type === 'diminished') {
                return (rootIndex + 6) % 12 + (octaveOffset * 12); // Diminished 5th
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
        // First inversion - bass note is the 3rd (major or minor)
        const interval = type === 'minor' || type === 'diminished' ? 3 : 4; // Minor 3rd or Major 3rd
        const bassIndex = (rootIndex + interval) % 12;
        return noteNames[bassIndex];
    } else if (inversion === 'second') {
        // Second inversion - bass note is the 5th (perfect or diminished)
        const interval = type === 'diminished' ? 6 : 7; // Diminished 5th or Perfect 5th
        const bassIndex = (rootIndex + interval) % 12;
        return noteNames[bassIndex];
    }
    
    return root;
}