// Enhanced Roman Numeral Parser
// This extends the existing romanNumeralToChord function to support
// slash notation, secondary dominants, and embellishments

// Enhanced function to convert Roman numeral to chord data
function enhancedRomanNumeralToChord(romanNumeral, keyRoot, isMinorKey, selectedInversions, selectedTypes) {
    // Basic parsing to handle the different parts of the chord notation
    let basePart = romanNumeral;
    let bassNote = null;
    let secondaryOf = null;
    let fixedInversion = null;
    
    // Check for varychord setting on the current style
    const currentStyle = document.getElementById('progression-style').value;
    const canVaryChord = progressionStyles[currentStyle] && 
                         progressionStyles[currentStyle].varychord !== "no";
    
    // Parse secondary dominant notation (e.g., V/V)
    if (romanNumeral.includes('/') && !romanNumeral.includes('/3') && 
        !romanNumeral.includes('/5') && !romanNumeral.includes('/7')) {
        const parts = romanNumeral.split('/');
        basePart = parts[0];
        secondaryOf = parts[1];
    }
    
    // Parse slash notation for inversions (e.g., I/3, V/5)
    if (romanNumeral.includes('/3') || romanNumeral.includes('/5') || romanNumeral.includes('/7')) {
        const parts = romanNumeral.split('/');
        basePart = parts[0];
        
        // Determine inversion based on the bass note
        if (parts[1] === '3') {
            fixedInversion = 'first';
        } else if (parts[1] === '5') {
            fixedInversion = 'second';
        } else if (parts[1] === '7') {
            fixedInversion = 'third'; // For seventh chords
        }
    }
    
    // Parse the Roman numeral to extract degree, quality, and any modifications
    let degree, quality;
    let isDiminished = false, isHalfDiminished = false, isAugmented = false;
    let isSus2 = false, isSus4 = false, isSeventh = false, isMajorSeventh = false, isMinorSeventh = false;
    let hasAdd9 = false;
    
    // Create a copy of the basePart for parsing
    let parsedNumeral = basePart;
    
    // Check for flat symbol before Roman numeral
    const hasFlat = parsedNumeral.startsWith('b');
    if (hasFlat) {
        parsedNumeral = parsedNumeral.substring(1); // Remove the flat symbol for parsing
    }
    
    // Extract chord quality and embellishments
    let baseNumeral = '';
    let embellishments = '';
    
    // Extract the base Roman numeral (I, ii, V, etc.)
    let romanPattern = /^([IViv]+)/;
    let match = parsedNumeral.match(romanPattern);
    if (match) {
        baseNumeral = match[0];
        embellishments = parsedNumeral.substring(match[0].length);
    } else {
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
    
    // Determine quality based on case, symbols, and embellishments
    // Uppercase = major, lowercase = minor for the base triad
    const isUpperCase = /^[A-Z]/.test(baseNumeral);
    
    // Check for special symbols and embellishments
    isDiminished = embellishments.includes('°') || embellishments.includes('dim');
    isHalfDiminished = embellishments.includes('ø');
    isAugmented = embellishments.includes('+') || embellishments.includes('aug');
    isSus2 = embellishments.includes('sus2');
    isSus4 = embellishments.includes('sus4');
    hasAdd9 = embellishments.includes('add9');
    
    // Check for 7th chords
    if (embellishments.includes('7')) {
        isSeventh = true;
        
        // Check if it's a major 7th specifically
        if (embellishments.includes('maj7')) {
            isMajorSeventh = true;
        }
        // Check if it's a minor 7th specifically
        else if (embellishments.toLowerCase().includes('m7') || (!isUpperCase && embellishments.includes('7'))) {
            isMinorSeventh = true;
        }
    }
    
    // Determine chord type
    if (isDiminished) {
        quality = 'diminished';
    } else if (isHalfDiminished) {
        quality = 'diminished'; // Using diminished as a best approximation
    } else if (isAugmented) {
        quality = 'augmented';
    } else if (isSus2) {
        quality = 'sus2';
    } else if (isSus4) {
        quality = 'sus4';
    } else if (isMajorSeventh) {
        quality = 'major7';
    } else if (isMinorSeventh) {
        quality = 'minor7';
    } else if (isSeventh) {
        quality = 'dominant7';
    } else {
        // Basic triads
        quality = isUpperCase ? 'major' : 'minor';
    }
    
    // Handle secondary dominants
    if (secondaryOf) {
        // Get the degree of the secondary target
        let secondaryDegree;
        if (secondaryOf === 'V' || secondaryOf === 'v') {
            secondaryDegree = 4;
        } else if (secondaryOf === 'IV' || secondaryOf === 'iv') {
            secondaryDegree = 3;
        } else if (secondaryOf === 'vi' || secondaryOf === 'VI') {
            secondaryDegree = 5;
        } else if (secondaryOf === 'ii' || secondaryOf === 'II') {
            secondaryDegree = 1;
        } else {
            // Default to V if we don't recognize the target
            secondaryDegree = 4;
        }
        
        // Calculate the root note for the secondary dominant
        const scaleIntervals = isMinorKey ? 
            [0, 2, 3, 5, 7, 8, 10] : // Natural minor scale intervals
            [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
        
        // Get the root of the target chord
        const targetRoot = (getNoteIndex(keyRoot) + scaleIntervals[secondaryDegree]) % 12;
        
        // The secondary dominant is a fifth above that
        const secondaryRoot = (targetRoot + 7) % 12;
        
        // Override the rootIndex with the secondary dominant
        degree = null; // Not using scale degree anymore
        keyRoot = noteNames[secondaryRoot];
        
        // Secondary dominants are typically dominant 7th chords
        if (!quality.includes('7')) {
            quality = 'dominant7';
        }
    }
    
    // Calculate the root note if using scale degree
    let rootIndex;
    if (degree !== null) {
        rootIndex = getNoteIndex(keyRoot);
        
        // Adjust for minor key if needed
        const scaleIntervals = isMinorKey ? 
            [0, 2, 3, 5, 7, 8, 10] : // Natural minor scale intervals
            [0, 2, 4, 5, 7, 9, 11]; // Major scale intervals
        
        // Apply flat modification if present
        if (hasFlat) {
            // Flatten the degree (lower by one semitone)
            const normalDegreeNote = (rootIndex + scaleIntervals[degree]) % 12;
            rootIndex = (normalDegreeNote - 1 + 12) % 12; // Ensure positive result with modulo
        } else {
            // Use the scale degree directly
            rootIndex = (rootIndex + scaleIntervals[degree]) % 12;
        }
    } else {
        // For secondary dominants or explicit root notes
        rootIndex = getNoteIndex(keyRoot);
    }
    
    // Get the note name
    const root = noteNames[rootIndex];
    
    // Choose inversion based on the notation or randomly if allowed
    let inversion;
    if (fixedInversion) {
        inversion = fixedInversion;
    } else if (canVaryChord) {
        // Choose a random inversion from the selected inversions
        inversion = selectedInversions[Math.floor(Math.random() * selectedInversions.length)];
    } else {
        // Default to root position if no variation allowed and no inversion specified
        inversion = 'root';
    }
    
    // If varychord is "no", enforce the exact chord quality from the notation
    // Otherwise, we might adjust based on selected types
    if (!canVaryChord) {
        // Use the quality parsed from the notation
    } else if (!selectedTypes.includes(quality)) {
        // Fall back to a type from selected types
        quality = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];
    }
    
    return {
        root,
        type: quality,
        inversion,
        degreeIndex: degree,
        hasAdd9: hasAdd9 // Additional property for extended chords
    };
}

// Replace the original romanNumeralToChord function with this enhanced version
// This should be done after the original function is defined in music-theory.js
function replaceRomanNumeralParser() {
    // Store the original function for reference
    if (!window.originalRomanNumeralToChord) {
        window.originalRomanNumeralToChord = window.romanNumeralToChord;
    }
    
    // Replace with enhanced version
    window.romanNumeralToChord = function(romanNumeral, keyRoot, isMinorKey) {
        // Get selected inversions and chord types from UI
        const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
        const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
        
        // Use the enhanced parser
        return enhancedRomanNumeralToChord(romanNumeral, keyRoot, isMinorKey, selectedInversions, selectedTypes);
    };
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // This will be called after the music-theory.js file is loaded
    setTimeout(replaceRomanNumeralParser, 200);
});