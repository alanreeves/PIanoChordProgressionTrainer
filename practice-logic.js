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

// DOM elements
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const rewindBtn = document.getElementById('rewind-btn');
const countdownDisplay = document.getElementById('countdown-display');

// Function to calculate milliseconds from BPM
function getMillisecondsFromBPM(bpm, beatsPerChord) {
    // Calculate milliseconds per beat: (60,000 ms / BPM)
    const msPerBeat = (60 * 1000) / bpm;
    
    // Calculate total chord duration in milliseconds
    return msPerBeat * beatsPerChord;
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
    const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
    
    // Calculate beat interval duration in milliseconds
    const msPerBeat = (60 * 1000) / bpm;
    
    // We'll sync metronome with the main beat of each chord
    playMetronomeClick(true); // Play initial downbeat
    
    // Setup interval for subsequent beats
    metronomeInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(metronomeInterval);
            return;
        }
        
        // This will be in sync with the beat counter
        // true for first beat of chord (downbeat), false for others
        playMetronomeClick(currentBeat % beatsPerChord === 0);
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
    
    // Start with countdown or play next chord directly
    const delayTime = parseInt(document.getElementById('delay-time').value, 10);
    if (delayTime <= 0) {
        // Start metronome immediately if there's no delay
        startMetronome();
        playNextChord();
    } else {
        // For countdown, metronome will start when playNextChord runs
        startCountdown();
    }
}

// Start countdown before playing
function startCountdown() {
    const delayTime = parseInt(document.getElementById('delay-time').value, 10);
    if (delayTime <= 0) {
        startMetronome(); // Start metronome first
        playNextChord();
        return;
    }
    
    // Clear any existing beat interval
    clearInterval(beatInterval);
    
    let count = delayTime;
    countdownDisplay.querySelector('.countdown').textContent = count;
    countdownDisplay.classList.remove('hidden');
    clearPianoHighlights();
    
    countdownInterval = setInterval(() => {
        count--;
        countdownDisplay.querySelector('.countdown').textContent = count;
        
        if (count <= 0) {
            clearInterval(countdownInterval);
            startMetronome(); // Start metronome right before the first chord
            playNextChord();
        }
    }, 1000);
}

// Modified startBeatCounter function for Tone.js compatibility
function startBeatCounter() {
    // Clear any existing beat interval
    clearInterval(beatInterval);
    
    // Get settings
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    
    // In practice beat mode, we always use 1 beat at a time
    let beatsPerChord;
    if (isPracticeBeat) {
        beatsPerChord = 1;
    } else {
        beatsPerChord = parseInt(document.getElementById('beats').value, 10);
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
        
        // Reset chord index to -1 so next step will show first chord
        currentChordIndex = -1;
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
    
    // Check if we're in a practice beat period
    if (isPracticeBeat) {
        if (practiceBeatsRemaining > 0) {
            // Continue practice beats
            practiceBeatsRemaining--;
            
            // Reset beat counter for next practice beat
            currentBeat = 0;
            startBeatCounter();
            
            // Schedule next beat
            const bpm = parseInt(document.getElementById('tempo').value, 10);
            const chordDuration = getMillisecondsFromBPM(bpm, 1); // 1 beat at a time
            
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
    
    // Move to next chord or loop back to beginning
    currentChordIndex = (currentChordIndex + 1) % currentProgression.length;
    
    // Update active chord pill
    updateActivePill(currentChordIndex);
    
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
    const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
    const chordDuration = getMillisecondsFromBPM(bpm, beatsPerChord);
    
    // Check if practice beats are enabled
    const practiceModeEnabled = document.getElementById('practice-beats') && 
                               document.getElementById('practice-beats').checked;
    
    // In step mode, wait for next step after chord plays
    if (stepMode) {
        delayTimeout = setTimeout(() => {
            waitingForStep = true;
            // If we're at the end of the progression, handle looping
            if (currentChordIndex === currentProgression.length - 1) {
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
                    practiceBeatsRemaining = beatsPerChord; // Full number of practice beats
                    playNextChord(); // Continue with practice beats
                } else if (currentChordIndex === currentProgression.length - 1) {
                    // End of progression, start countdown for next repetition
                    clearInterval(beatInterval);
                    startCountdown();
                } else {
                    // Regular progression to next chord
                    playNextChord();
                }
            }
        }, chordDuration);
    }
}

// Rewind to previous chord
function rewindChord() {
    // If no progression has been generated, do nothing
    if (!progressionGenerated) {
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
        
        // Now rewind to the previous (or last) chord
        currentChordIndex = Math.max(0, currentChordIndex - 1);
    } else {
        // If currently on the first chord, loop to the last chord
        if (currentChordIndex <= 0) {
            currentChordIndex = currentProgression.length;
        }
        
        // Go back one chord
        currentChordIndex = (currentChordIndex - 1) % currentProgression.length;
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
        // Schedule next chord - get total duration from BPM and beats per chord
        const bpm = parseInt(document.getElementById('tempo').value, 10);
        const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
        const chordDuration = getMillisecondsFromBPM(bpm, beatsPerChord);
        
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

// This function doesn't exist in the original code, removing it to prevent duplication issues