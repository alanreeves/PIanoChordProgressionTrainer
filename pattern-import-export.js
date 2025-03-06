// Pattern Import/Export Functionality with Storage Fix

// Key for storing patterns in local storage
const PATTERNS_STORAGE_KEY = "piano_chord_patterns";

// Flag to track if patterns have been loaded from storage
let patternsLoadedFromStorage = false;

// Function to initialize the progression import/export functionality
function initProgressionImportExport() {
    // Load any saved patterns from local storage
    // This needs to happen before other initialization steps
    loadPatternsFromStorage();
    
    // Add the UI elements to the settings panel
    addImportExportUI();
    
    // Add event listeners for the import/export buttons
    setupImportExportListeners();
    
    console.log("Pattern import/export functionality initialized");
}

// Function to add the import/export UI elements to the settings panel
function addImportExportUI() {
    // Find the settings dropdown content
    const settingsContent = document.querySelector('.settings-dropdown-content');
    
    if (settingsContent) {
        // Create a container for the import/export options
        const importExportContainer = document.createElement('div');
        importExportContainer.className = 'row';
        importExportContainer.innerHTML = `
            <div class="col-12 mb-3">
                <h5 class="text-primary mb-2">Progression Patterns</h5>
                <div class="d-flex justify-content-between">
                    <button id="import-patterns" class="btn btn-primary btn-sm">
                        <i class="bi bi-file-earmark-arrow-down"></i> Import Patterns
                    </button>
                    <button id="export-patterns" class="btn btn-info btn-sm">
                        <i class="bi bi-file-earmark-arrow-up"></i> Export Patterns
                    </button>
                </div>
                <input type="file" id="pattern-file-input" accept=".json" style="display: none;">
                <div id="import-status" class="mt-2" style="display: none;"></div>
            </div>
        `;
        
        // Append to the settings panel
        settingsContent.appendChild(importExportContainer);
    }
}

// Function to load patterns from local storage
function loadPatternsFromStorage() {
    // Skip if already loaded
    if (patternsLoadedFromStorage) {
        return;
    }
    
    try {
        const savedPatterns = localStorage.getItem(PATTERNS_STORAGE_KEY);
        
        if (savedPatterns) {
            // Ensure progressionStyles is defined
            if (typeof progressionStyles === 'undefined') {
                console.error("progressionStyles is not defined yet. Cannot load patterns from storage.");
                // We'll try again later when music-theory.js is loaded
                setTimeout(loadPatternsFromStorage, 500);
                return;
            }
            
            console.log("Loading patterns from local storage");
            const parsedPatterns = JSON.parse(savedPatterns);
            
            // Validate the loaded patterns
            if (validatePatterns(parsedPatterns)) {
                // Merge with existing progression styles
                mergeProgressionPatterns(parsedPatterns);
                
                // Update the UI
                updateProgressionStyleDropdown();
                
                console.log("Successfully loaded patterns from local storage");
                patternsLoadedFromStorage = true;
            } else {
                console.error("Invalid pattern data in local storage");
            }
        } else {
            console.log("No saved patterns found in local storage");
            patternsLoadedFromStorage = true;
        }
    } catch (error) {
        console.error("Error loading progression patterns from storage:", error);
    }
}

// Function to set up event listeners for import/export
function setupImportExportListeners() {
    // Import button click handler
    const importBtn = document.getElementById('import-patterns');
    const fileInput = document.getElementById('pattern-file-input');
    const importStatus = document.getElementById('import-status');
    
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(event) {
            if (event.target.files.length > 0) {
                const file = event.target.files[0];
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    try {
                        const patterns = JSON.parse(e.target.result);
                        
                        // Validate the pattern data
                        if (validatePatterns(patterns)) {
                            // Clear any previously imported patterns from localStorage
                            // but keep the default patterns in memory
                            const defaultPatterns = extractDefaultPatterns();
                            
                            // Merge with default patterns
                            mergeProgressionPatterns(patterns);
                            
                            // Save the complete set to local storage
                            savePatterns();
                            
                            // Update the UI
                            updateProgressionStyleDropdown();
                            
                            // Show success message
                            if (importStatus) {
                                importStatus.textContent = "Patterns imported successfully!";
                                importStatus.style.color = "var(--accent1)";
                                importStatus.style.display = "block";
                                setTimeout(() => {
                                    importStatus.style.display = "none";
                                }, 3000);
                            }
                        } else {
                            throw new Error("Invalid pattern format");
                        }
                    } catch (error) {
                        console.error("Error importing patterns:", error);
                        if (importStatus) {
                            importStatus.textContent = "Error importing patterns. Please check file format.";
                            importStatus.style.color = "var(--accent2)";
                            importStatus.style.display = "block";
                            setTimeout(() => {
                                importStatus.style.display = "none";
                            }, 3000);
                        }
                    }
                    
                    // Reset file input
                    fileInput.value = '';
                };
                
                reader.readAsText(file);
            }
        });
    }
    
    // Export button click handler
    const exportBtn = document.getElementById('export-patterns');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportPatterns();
        });
    }
}

// Function to extract default patterns (ones that come with the app)
function extractDefaultPatterns() {
    const defaultPatterns = {};
    
    // List of default pattern names (these should match the keys in the progressionStyles object)
    const defaultPatternNames = [
        'Random', 'Common', 'Pop 1', 'Pop 2', 'Jazz & Classical Standard',
        '12-Bar Blues', 'Doo-Wop', 'Classic Rock', 'Basic Circle of Fifths',
        'Common Major Circle of Fifths', 'Jazz-Friendly Circle of Fifths',
        'Minor Key Circle of Fifths', 'Harmonic Minor Circle of Fifths'
    ];
    
    // Copy default patterns
    for (const name of defaultPatternNames) {
        if (progressionStyles[name]) {
            defaultPatterns[name] = { ...progressionStyles[name] };
            
            // Add varychord property if not present
            if (defaultPatterns[name].varychord === undefined) {
                defaultPatterns[name].varychord = "yes";
            }
        }
    }
    
    return defaultPatterns;
}

// Function to validate imported patterns
function validatePatterns(patterns) {
    if (!patterns || typeof patterns !== 'object') {
        return false;
    }
    
    // Check each pattern
    for (const name in patterns) {
        const pattern = patterns[name];
        
        // Check required properties
        if (!pattern.pattern || !Array.isArray(pattern.pattern) ||
            typeof pattern.length !== 'number' || 
            typeof pattern.tempo !== 'number' ||
            typeof pattern.beatsPerChord !== 'number') {
            console.error(`Invalid pattern: ${name}`, pattern);
            return false;
        }
        
        // Add varychord property if it doesn't exist
        if (pattern.varychord === undefined) {
            pattern.varychord = "yes";
        }
    }
    
    return true;
}

// Function to merge imported patterns with existing progression styles
function mergeProgressionPatterns(patterns) {
    // Add new patterns to the existing progressionStyles object
    for (const name in patterns) {
        progressionStyles[name] = patterns[name];
    }
}

// Function to save patterns to local storage
function savePatterns() {
    try {
        localStorage.setItem(PATTERNS_STORAGE_KEY, JSON.stringify(progressionStyles));
        console.log("Saved patterns to local storage");
    } catch (error) {
        console.error("Error saving patterns to local storage:", error);
    }
}

// Function to update the progression style dropdown
function updateProgressionStyleDropdown() {
    const dropdown = document.getElementById('progression-style');
    
    if (dropdown) {
        // Save current selection
        const currentSelection = dropdown.value;
        
        // Clear dropdown
        dropdown.innerHTML = '';
        
        // Add options for each progression style
        for (const name in progressionStyles) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            dropdown.appendChild(option);
        }
        
        // Restore selection if it still exists
        if (progressionStyles[currentSelection]) {
            dropdown.value = currentSelection;
        }
    }
}

// Function to export patterns to a file
function exportPatterns() {
    // Create a JSON string of the current progression styles
    const patternsJSON = JSON.stringify(progressionStyles, null, 2);
    
    // Create a blob and a URL for it
    const blob = new Blob([patternsJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'piano_chord_progressions.json';
    
    // Add to document, click it, and remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up the URL
    URL.revokeObjectURL(url);
}

// Initialize when the document is loaded and progressionStyles is available
document.addEventListener('DOMContentLoaded', function() {
    // We need to make sure music-theory.js has loaded and defined progressionStyles
    function checkAndInitialize() {
        if (typeof progressionStyles !== 'undefined') {
            initProgressionImportExport();
        } else {
            console.log("Waiting for progressionStyles to be defined...");
            setTimeout(checkAndInitialize, 200);
        }
    }
    
    // Start checking
    setTimeout(checkAndInitialize, 200);
});

// Add a backup initialization for when the app.js file calls window.initializeApp
if (typeof window.initializeApp === 'function') {
    const originalInitializeApp = window.initializeApp;
    window.initializeApp = function() {
        // Call the original initialization
        const result = originalInitializeApp.apply(this, arguments);
        
        // Make sure patterns are loaded after app initialization
        if (!patternsLoadedFromStorage) {
            loadPatternsFromStorage();
        }
        
        return result;
    };
} else {
    // If initializeApp doesn't exist yet, we'll set up a watcher for it
    Object.defineProperty(window, 'initializeApp', {
        configurable: true,
        get: function() {
            return this._initializeApp;
        },
        set: function(newFunc) {
            // Store the original function
            this._initializeApp = newFunc;
            
            // Create an enhanced version
            const enhancedFunc = function() {
                // Call the original function
                const result = newFunc.apply(this, arguments);
                
                // Make sure patterns are loaded after app initialization
                if (!patternsLoadedFromStorage) {
                    loadPatternsFromStorage();
                }
                
                return result;
            };
            
            // Return the enhanced version
            return enhancedFunc;
        }
    });
}