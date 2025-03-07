// default-progression.js
// Script to ensure a default progression is shown on startup

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other scripts to initialize
    setTimeout(function() {
        console.log('Initializing default progression...');
        
        try {
            // Check if a progression already exists
            if (!window.currentProgression || window.currentProgression.length === 0) {
                console.log('No existing progression found, generating default...');
                
                // Get current settings
                const key = document.getElementById('key-select').value;
                const length = parseInt(document.getElementById('length').value, 10) || 8; // Default to 8 if NaN
                
                // Get selected chord types, making sure at least one is selected
                let selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
                if (selectedTypes.length === 0) {
                    // If no chord types are selected, default to Major, Minor, and Dominant7
                    console.log('No chord types selected, selecting defaults...');
                    document.getElementById('type-major').checked = true;
                    document.getElementById('type-minor').checked = true;
                    document.getElementById('type-dominant7').checked = true;
                    selectedTypes = ['major', 'minor', 'dominant7'];
                }
                
                // Get selected inversions, making sure at least one is selected
                let selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
                if (selectedInversions.length === 0) {
                    // If no inversions are selected, default to Root Position
                    console.log('No inversions selected, selecting root position...');
                    document.getElementById('inv-root').checked = true;
                    selectedInversions = ['root'];
                }
                
                // Force Random style for initial progression
                const initialStyle = 'Random';
                
                console.log('Generating progression with settings:', {
                    key, length, selectedTypes, selectedInversions, initialStyle
                });
                
                // Generate the progression
                window.currentProgression = window.generateChordProgression(key, length, selectedTypes, selectedInversions, initialStyle);
                window.progressionGenerated = true;
                window.currentChordIndex = -1;
                
                // Display the progression
                window.displayProgressionPills(window.currentProgression);
                
                console.log('Default progression successfully generated');
            } else {
                console.log('Existing progression found, no need to generate default');
            }
        } catch (error) {
            console.error('Error generating default progression:', error);
        }
    }, 1000); // 1 second delay to ensure all scripts are loaded
});