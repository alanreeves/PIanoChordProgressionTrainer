// Simple verification script to test that all chord types are being generated

// Mock the required DOM functions
global.document = {
    querySelectorAll: function() {
        return [
            { value: 'root' },
            { value: 'first' },
            { value: 'second' }
        ];
    }
};

// Import the music theory functions
const fs = require('fs');

// Read the music-theory.js file
const musicTheoryCode = fs.readFileSync('./music-theory.js', 'utf8');

// Execute the code in our context
eval(musicTheoryCode);

console.log('Testing chord type generation...');

// Test with all chord types selected
const selectedTypes = ['major', 'minor', 'dominant7', 'major7', 'minor7', 'diminished', 'half-diminished', 'augmented', 'sus2', 'sus4', 'add9'];
const selectedInversions = ['root', 'first', 'second'];
const length = 32; // Longer progression to increase chances of getting all types

const progression = generateChordProgression('C', length, selectedTypes, selectedInversions, 'Random');

// Count occurrences of each chord type
const typeCount = {};
progression.forEach(chord => {
    typeCount[chord.type] = (typeCount[chord.type] || 0) + 1;
});

console.log('\nGenerated progression:');
progression.forEach((chord, index) => {
    console.log(`Chord ${index + 1}: ${chord.root} ${chord.type} (${chord.inversion}) - Scale Degree: ${chord.degreeIndex}`);
});

console.log('\nChord Type Distribution:');
Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`${type}: ${count} chord(s)`);
});

// Check if all selected types were generated
const missingTypes = selectedTypes.filter(type => !typeCount[type]);
if (missingTypes.length > 0) {
    console.log(`\nWarning: The following chord types were not generated: ${missingTypes.join(', ')}`);
} else {
    console.log('\nSuccess: All selected chord types were generated!');
}

console.log('\nTesting complete!');