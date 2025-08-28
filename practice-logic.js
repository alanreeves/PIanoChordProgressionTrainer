// Practice Session Logic

// State variables
let practiceInterval;
let delayTimeout;
let countdownInterval;
let beatInterval;
let metronomeInterval; // Variable for the standalone metronome
let isRunning = false;
let currentProgression = [];
let currentChordIndex = -1;
let currentBeat = 0;
let stepMode = false; // Track if we're in step mode
let waitingForStep = false; // Track if we're waiting for next step
let progressionGenerated = false; // Track if a progression has been generated
let isPracticeBeat = false; // Track if we're in a practice beat period
let practiceBeatsRemaining = 0; // Counter for remaining practice beats
let currentChordRepetitions = 0; // Track how many times current chord has been played
let totalChordRepetitions = 1; // Total times current chord should be played based on note value

// DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const rewindBtn = document.getElementById('rewind-btn');
const countdownDisplay = document.getElementById('countdown-display');

// Function to calculate milliseconds from BPM using time signature and note value
function getMillisecondsFromBPM(bpm, timeSignature, noteValue) {
    // Calculate milliseconds per beat: (60,000 ms / BPM)
    const msPerBeat = (60 * 1000) / bpm;
    
    // Calculate chord duration in beats based on time signature and note value
    const chordDurationInBeats = calculateChordDurationInBeats(timeSignature, noteValue);
    
    // Calculate total chord duration in milliseconds
    return msPerBeat * chordDurationInBeats;
}

// New function to start the standalone metronome
function startMetronome() {
    // Clear any existing metronome interval
    clearInterval(metronomeInterval);
    
    // Only start if metronome is enabled
    const metronomeEnabled = document.getElementById('metronome').checked;
    if (!metronomeEnabled) return;
    
    // Get the tempo from the interface
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    const timeSignature = document.getElementById('time-signature').value;
    const noteValue = parseInt(document.getElementById('note-value').value, 10);
    
    // Calculate beat interval duration in milliseconds
    const msPerBeat = (60 * 1000) / bpm;
    
    // Get beats per bar for the metronome pattern
    const beatsPerBar = getBeatsPerBar(timeSignature);
    
    // We'll sync metronome with the main beat of each chord
    playMetronomeClick(true); // Play initial downbeat
    
    // Setup interval for subsequent beats
    metronomeInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(metronomeInterval);
            return;
        }
        
        // This will be in sync with the beat counter
        // true for first beat of bar (downbeat), false for others
        playMetronomeClick(currentBeat % beatsPerBar === 0);
    }, msPerBeat);
}

// Function to stop the metronome
function stopMetronome() {
    clearInterval(metronomeInterval);
}

function startPractice() {
    const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
    const style = document.getElementById('progression-style').value;
    
    // Only validate chord types if using Random progression
    if (style === 'Random') {
        const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
        if (selectedTypes.length === 0) {
            alert('Please select at least one chord type for random progressions.');
            return;
        }
    }
    
    if (selectedInversions.length === 0) {
        alert('Please select at least one inversion to practice.');
        return;
    }
    
    // Reset alternating hands to start with right hand
    if (typeof currentAlternatingHand !== 'undefined') {
        currentAlternatingHand = 'right';
    }
    
    // Initialize audio on first user interaction
    initAudio();
    
    // Get settings
    const key = document.getElementById('key-select').value;
    const length = parseInt(document.getElementById('length').value, 10);
    const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
    
    // Generate chord progression with the selected style
    currentProgression = generateChordProgression(key, length, selectedTypes, selectedInversions, style);
    progressionGenerated = true;
    
    // Display progression 
    displayProgressionPills(currentProgression);
    
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    // Reset chord repetition counters
    currentChordIndex = -1;
    currentChordRepetitions = 0;
    totalChordRepetitions = 1;
    
    // If Start is pressed explicitly, disable step mode
    if (!stepMode) {
        waitingForStep = false;
        document.getElementById('step-btn').classList.remove('step-active');
    } else {
        document.getElementById('step-btn').classList.add('step-active');
    }
    
    // Reset chord index and beat
    currentChordIndex = -1;
    currentBeat = 0;
    
    // Start with lead-in beats or play next chord directly
    const leadInBeats = parseInt(document.getElementById('lead-in-beats').value, 10);
    if (leadInBeats <= 0) {
        // Start metronome immediately if there are no lead-in beats
        startMetronome();
        playNextChord();
    } else {
        // Start with lead-in beats before the first chord
        startLeadInBeats();
    }
}

// Start lead-in beats before playing
function startLeadInBeats() {
    const leadInBeats = parseInt(document.getElementById('lead-in-beats').value, 10);
    if (leadInBeats <= 0) {
        startMetronome(); // Start metronome first
        playNextChord();
        return;
    }
    
    // Clear any existing beat interval
    clearInterval(beatInterval);
    clearInterval(countdownInterval);
    
    // Clear piano highlights and display countdown
    clearPianoHighlights();
    countdownDisplay.classList.remove('hidden');
    
    // Get the tempo
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    const msPerBeat = (60 * 1000) / bpm; // Convert BPM to milliseconds per beat
    
    // Set remaining beats
    let remainingBeats = leadInBeats;
    countdownDisplay.querySelector('.countdown').textContent = remainingBeats;
    
    // Play first beat immediately with metronome click
    if (document.getElementById('metronome').checked) {
        const timeSignature = document.getElementById('time-signature').value;
        const beatsPerBar = getBeatsPerBar(timeSignature);
        playMetronomeClick(true); // Play as downbeat
    }
    
    // Visual feedback for beat
    countdownDisplay.classList.add('beat-highlight');
    setTimeout(() => {
        countdownDisplay.classList.remove('beat-highlight');
    }, 200);
    
    // Set interval for remaining beats
    countdownInterval = setInterval(() => {
        remainingBeats--;
        countdownDisplay.querySelector('.countdown').textContent = remainingBeats;
        
        // Visual feedback for beat
        countdownDisplay.classList.add('beat-highlight');
        setTimeout(() => {
            countdownDisplay.classList.remove('beat-highlight');
        }, 200);
        
        // Play metronome click if enabled
        if (document.getElementById('metronome').checked) {
            const timeSignature = document.getElementById('time-signature').value;
            const beatsPerBar = getBeatsPerBar(timeSignature);
            playMetronomeClick(remainingBeats === 0); // True for last beat as downbeat
        }
        
        if (remainingBeats <= 0) {
            clearInterval(countdownInterval);
            startMetronome(); // Start the regular metronome
            playNextChord();
        }
    }, msPerBeat);
}

// Modified startBeatCounter function for Tone.js compatibility
function startBeatCounter() {
    // Clear any existing beat interval
    clearInterval(beatInterval);
    
    // Get settings
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    const timeSignature = document.getElementById('time-signature').value;
    const noteValue = parseInt(document.getElementById('note-value').value, 10);
    
    // Calculate beats per chord from time signature and note value
    let beatsPerChord;
    if (isPracticeBeat) {
        beatsPerChord = 1;
    } else {
        beatsPerChord = calculateChordDurationInBeats(timeSignature, noteValue);
    }
    
    // Calculate beat interval duration in milliseconds
    const msPerBeat = (60 * 1000) / bpm; // Convert BPM to milliseconds per beat
    
    // Show beat counter if not visible
    countdownDisplay.classList.remove('hidden');
    
    // Modify display based on whether we're in practice mode
    if (isPracticeBeat) {
        // Show "Practice" instead of beat number during practice beats
        countdownDisplay.querySelector('.countdown').textContent = "P";
    } else {
        countdownDisplay.querySelector('.countdown').textContent = currentBeat + 1;
    }
    
    // Visual feedback for beat
    countdownDisplay.classList.add('beat-highlight');
    setTimeout(() => {
        countdownDisplay.classList.remove('beat-highlight');
    }, 200);
    
    // Stop any existing metronome and restart it to sync with this beat
    stopMetronome();
    startMetronome();
    
    // Start beat interval
    beatInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(beatInterval);
            return;
        }
        
        currentBeat = (currentBeat + 1) % beatsPerChord;
        
        if (isPracticeBeat) {
            // Keep showing "Practice" during practice beats
            countdownDisplay.querySelector('.countdown').textContent = "P";
        } else {
            countdownDisplay.querySelector('.countdown').textContent = currentBeat + 1;
        }
        
        // Visual feedback only
        countdownDisplay.classList.add('beat-highlight');
        setTimeout(() => {
            countdownDisplay.classList.remove('beat-highlight');
        }, 200);
    }, msPerBeat);
}

function stepChord() {
    // Reset practice beat mode if active
    isPracticeBeat = false;
    practiceBeatsRemaining = 0;
    
    // Reset alternating hands if this is the first step in a new session
    if (!isRunning && typeof currentAlternatingHand !== 'undefined') {
        currentAlternatingHand = 'right';
    }

    // If no progression generated or previous one was stopped, generate a new one
    if (!progressionGenerated || !isRunning) {
        // First, we'll ensure there's a progression to step through
        const selectedInversions = Array.from(document.querySelectorAll('.inversion-checkbox:checked')).map(cb => cb.value);
        const style = document.getElementById('progression-style').value;
        
        // Only validate chord types if using Random progression
        if (style === 'Random') {
            const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
            if (selectedTypes.length === 0) {
                alert('Please select at least one chord type for random progressions.');
                return;
            }
        }
        
        if (selectedInversions.length === 0) {
            alert('Please select at least one inversion to practice.');
            return;
        }
        
        // Initialize audio on first user interaction
        initAudio();
        
        // Get settings
        const key = document.getElementById('key-select').value;
        const length = parseInt(document.getElementById('length').value, 10);
        const selectedTypes = Array.from(document.querySelectorAll('.chord-type-checkbox:checked')).map(cb => cb.value);
        
        // Generate chord progression with the selected style
        currentProgression = generateChordProgression(key, length, selectedTypes, selectedInversions, style);
        progressionGenerated = true;
        
        // Display progression 
        displayProgressionPills(currentProgression);
        
        isRunning = true;
        stopBtn.disabled = false;
        stepMode = true;
        document.getElementById('step-btn').classList.add('step-active');
        
        // Reset chord repetition counters
        currentChordIndex = -1;
        currentChordRepetitions = 0;
        totalChordRepetitions = 1;
        waitingForStep = false;
        
        // Start metronome if enabled
        startMetronome();
    }
    
    // Immediately stop any currently playing chord sound
    stopCurrentChord();
    
    // Clear any existing timeout to cancel current chord timing
    clearTimeout(delayTimeout);
    clearInterval(beatInterval);
    
    // If we're waiting for a step, proceed to next chord
    if (waitingForStep) {
        waitingForStep = false;
    }
    
    // Proceed to the next chord
    playNextChord();
}

// Modified playNextChord function with practice beats functionality
function playNextChord() {
    if (!isRunning) return;
    
    // Check if we have a valid progression
    if (!currentProgression || currentProgression.length === 0) {
        console.warn('No chord progression available');
        return;
    }
    
    // Check if we're in a practice beat period
    if (isPracticeBeat) {
        if (practiceBeatsRemaining > 0) {
            // Continue practice beats
            practiceBeatsRemaining--;
            
            // Reset beat counter for next practice beat
            currentBeat = 0;
            startBeatCounter();
            
            // Schedule next beat - use proper time signature and note value
            const bpm = parseInt(document.getElementById('tempo').value, 10);
            const timeSignature = document.getElementById('time-signature').value;
            const noteValue = parseInt(document.getElementById('note-value').value, 10);
            const chordDuration = getMillisecondsFromBPM(bpm, timeSignature, noteValue) / calculateChordDurationInBeats(timeSignature, noteValue); // 1 beat at a time
            
            delayTimeout = setTimeout(() => {
                if (isRunning) {
                    playNextChord(); // This will continue practice beats or move to next chord
                }
            }, chordDuration);
            
            return;
        } else {
            // End of practice beats, move to next chord
            isPracticeBeat = false;
        }
    }
    
    // Handle initial state when currentChordIndex is -1
    if (currentChordIndex === -1) {
        currentChordIndex = 0;
        currentChordRepetitions = 1;
        // Update active chord pill
        updateActivePill(currentChordIndex);
    } else {
        // Check if we need to play the same chord again (based on note value)
        if (currentChordRepetitions < totalChordRepetitions) {
            // Increment repetition counter
            currentChordRepetitions++;
        } else {
            // Move to next chord or loop back to beginning
            currentChordIndex = (currentChordIndex + 1) % currentProgression.length;
            
            // Reset repetition counter for new chord
            currentChordRepetitions = 1;
            
            // Update active chord pill
            updateActivePill(currentChordIndex);
        }
    }
    
    // Get current chord
    const chord = currentProgression[currentChordIndex];
    
    // Highlight on piano
    highlightChordOnPiano(chord.root, chord.type, chord.inversion);
    
    // Play chord sound if enabled
    if (document.getElementById('play-sound').checked) {
        playChordSound(chord.root, chord.type, chord.inversion);
    }
    
    // Reset beat counter
    currentBeat = 0;
    startBeatCounter();
    
    // Get settings
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    const timeSignature = document.getElementById('time-signature').value;
    const noteValue = parseInt(document.getElementById('note-value').value, 10);
    
    // Calculate how many times each chord should be played based on note value
    totalChordRepetitions = noteValue;
    
    // Calculate chord duration based on time signature and note value
    const chordDuration = getMillisecondsFromBPM(bpm, timeSignature, noteValue);
    
    // Check if practice beats are enabled
    const practiceModeEnabled = document.getElementById('practice-beats') && 
                               document.getElementById('practice-beats').checked;
    
    // In step mode, wait for next step after chord plays
    if (stepMode) {
        delayTimeout = setTimeout(() => {
            waitingForStep = true;
            // If we're at the end of the progression, handle looping
            if (currentChordIndex === currentProgression.length - 1 && currentChordRepetitions >= totalChordRepetitions) {
                clearInterval(beatInterval);
                // Don't automatically start countdown - wait for step
            }
        }, chordDuration);
    } else {
        // Regular playback - schedule next chord or practice beats
        delayTimeout = setTimeout(() => {
            if (isRunning) {
                if (practiceModeEnabled) {
                    // Set up for practice beats
                    isPracticeBeat = true;
                    practiceBeatsRemaining = calculateChordDurationInBeats(timeSignature, noteValue); // Full number of practice beats
                    playNextChord(); // Continue with practice beats
                } else if (currentChordIndex === currentProgression.length - 1 && currentChordRepetitions >= totalChordRepetitions) {
                    // End of progression, start lead-in beats for next repetition
                    clearInterval(beatInterval);
                    startLeadInBeats();
                } else {
                    // Regular progression to next chord or repeat current chord
                    playNextChord();
                }
            }
        }, chordDuration);
    }
}

// Rewind to previous chord
function rewindChord() {
    // If no progression has been generated, do nothing
    if (!progressionGenerated || !currentProgression || currentProgression.length === 0) {
        return;
    }
    
    // Reset practice beat mode if active
    isPracticeBeat = false;
    practiceBeatsRemaining = 0;
    
    // If progression exists but not running, restart in step mode with the last chord
    if (!isRunning) {
        isRunning = true;
        stepMode = true;
        document.getElementById('step-btn').classList.add('step-active');
        waitingForStep = false;
        stopBtn.disabled = false;
        
        // Start metronome if enabled
        startMetronome();
        
        // Set to the last chord
        currentChordIndex = currentProgression.length - 1;
        
        // Reset repetition counter
        currentChordRepetitions = 0;
        
        // Now rewind to the previous (or last) chord
        if (currentChordIndex > 0) {
            currentChordIndex = currentChordIndex - 1;
            currentChordRepetitions = 0; // Reset repetitions for new chord
        }
    } else {
        // If we're in the middle of repeating a chord, go back to the start of that chord's repetitions
        if (currentChordRepetitions > 1) {
            currentChordRepetitions = 1; // Reset to first repetition of current chord
        } else {
            // If currently on the first repetition, go to the previous chord
            if (currentChordIndex > 0) {
                currentChordIndex = currentChordIndex - 1;
                currentChordRepetitions = 0; // Will be set to 1 in playNextChord
            } else {
                // If currently on the first chord, loop to the last chord
                currentChordIndex = currentProgression.length - 1;
                currentChordRepetitions = 0; // Will be set to 1 in playNextChord
            }
        }
    }
    
    // Clear any pending timers
    clearTimeout(delayTimeout);
    clearInterval(beatInterval);
    
    // Update active pill
    updateActivePill(currentChordIndex);
    
    // Get current chord
    const chord = currentProgression[currentChordIndex];
    
    // Highlight chord on piano
    highlightChordOnPiano(chord.root, chord.type, chord.inversion);
    
    // Play chord sound if enabled
    if (document.getElementById('play-sound').checked) {
        playChordSound(chord.root, chord.type, chord.inversion);
    }
    
    // Reset beat counter
    currentBeat = 0;
    startBeatCounter();
    
    // In step mode, wait for next step
    if (stepMode) {
        waitingForStep = true;
    } else {
        // Schedule next chord - get total duration from BPM, time signature, and note value
        const bpm = parseInt(document.getElementById('tempo').value, 10);
        const timeSignature = document.getElementById('time-signature').value;
        const noteValue = parseInt(document.getElementById('note-value').value, 10);
        const chordDuration = getMillisecondsFromBPM(bpm, timeSignature, noteValue);
        
        delayTimeout = setTimeout(() => {
            if (isRunning) {
                playNextChord();
            }
        }, chordDuration);
    }
}

// Stop practice session
function stopPractice() {
    isRunning = false;
    clearTimeout(delayTimeout);
    clearInterval(countdownInterval);
    clearInterval(beatInterval);
    stopMetronome(); // Stop the metronome
    countdownDisplay.classList.add('hidden');
    
    // Reset all mode flags
    stepMode = false;
    waitingForStep = false;
    isPracticeBeat = false;
    practiceBeatsRemaining = 0;
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
}