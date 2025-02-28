// Practice Session Logic

// State variables
let practiceInterval;
let delayTimeout;
let countdownInterval;
let beatInterval;
let isRunning = false;
let currentProgression = [];
let currentChordIndex = -1;
let currentBeat = 0;
let stepMode = false; // Track if we're in step mode
let waitingForStep = false; // Track if we're waiting for next step

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
    
    // Display progression 
    displayProgressionPills(currentProgression);
    
    isRunning = true;
    startBtn.disabled = true;
    document.getElementById('step-btn').disabled = false;
    stopBtn.disabled = false;
    rewindBtn.disabled = false;
    
    // If Start is pressed explicitly, disable step mode
    if (!stepMode) {
        waitingForStep = false;
        document.getElementById('step-btn').classList.remove('step-active');
    } else {
        document.getElementById('step-btn').classList.add('step-active');
    }
    
    // Reset chord index
    currentChordIndex = -1;
    
    // Start with countdown
    startCountdown();
}

// Start countdown before playing
function startCountdown() {
    const delayTime = parseInt(document.getElementById('delay-time').value, 10);
    if (delayTime <= 0) {
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
    const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
    const metronomeEnabled = document.getElementById('metronome').checked;
    
    // Calculate beat interval duration in milliseconds
    const msPerBeat = (60 * 1000) / bpm; // Convert BPM to milliseconds per beat
    
    // Show beat counter if not visible
    countdownDisplay.classList.remove('hidden');
    countdownDisplay.querySelector('.countdown').textContent = currentBeat + 1;
    
    // Play metronome for first beat (downbeat)
    if (metronomeEnabled) {
        playMetronomeClick(true); // true for downbeat
        countdownDisplay.classList.add('beat-highlight');
        setTimeout(() => {
            countdownDisplay.classList.remove('beat-highlight');
        }, 200);
    }
    
    // Start beat interval
    beatInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(beatInterval);
            return;
        }
        
        currentBeat = (currentBeat + 1) % beatsPerChord;
        countdownDisplay.querySelector('.countdown').textContent = currentBeat + 1;
        
        // Play metronome click if enabled
        if (metronomeEnabled) {
            playMetronomeClick(currentBeat === 0); // Only true for first beat
            countdownDisplay.classList.add('beat-highlight');
            setTimeout(() => {
                countdownDisplay.classList.remove('beat-highlight');
            }, 200);
        }
    }, msPerBeat);
}

function stepChord() {
    // If practice is not running at all, start in step mode
    if (!isRunning) {
        stepMode = true;
        document.getElementById('step-btn').classList.add('step-active');
        startPractice();
        return;
    }
    
    // Immediately stop any currently playing chord sound
    stopCurrentChord();
    
    // Clear any existing timeout to cancel current chord timing
    clearTimeout(delayTimeout);
    clearInterval(beatInterval);
    
    // If a chord is currently playing (and we're not already waiting for step),
    // immediately proceed to the next chord
    if (isRunning && !waitingForStep) {
        playNextChord();
        return;
    }
    
    // If we're waiting for a step, proceed to next chord
    if (waitingForStep) {
        waitingForStep = false;
        playNextChord();
    }
    
    // If regular practice was running, switch to step mode
    if (isRunning && !stepMode) {
        stepMode = true;
        document.getElementById('step-btn').classList.add('step-active');
    }
}

// Modified playNextChord function for Tone.js compatibility
function playNextChord() {
    if (!isRunning) return;
    
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
    
    // Schedule next chord - get total duration from BPM and beats per chord
    const bpm = parseInt(document.getElementById('tempo').value, 10);
    const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
    const chordDuration = getMillisecondsFromBPM(bpm, beatsPerChord);
    
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
        // Regular playback - schedule next chord
        delayTimeout = setTimeout(() => {
            if (isRunning) {
                if (currentChordIndex === currentProgression.length - 1) {
                    // End of progression, start countdown for next repetition
                    clearInterval(beatInterval);
                    startCountdown();
                } else {
                    playNextChord();
                }
            }
        }, chordDuration);
    }
}

// Rewind to previous chord
function rewindChord() {
    if (!isRunning || currentChordIndex <= 0) return;
    
    // Clear any pending timers
    clearTimeout(delayTimeout);
    clearInterval(beatInterval);
    
    // Go back one chord
    currentChordIndex = (currentChordIndex - 1 + currentProgression.length) % currentProgression.length;
    
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

// Stop practice session
function stopPractice() {
    isRunning = false;
    clearTimeout(delayTimeout);
    clearInterval(countdownInterval);
    clearInterval(beatInterval);
    countdownDisplay.classList.add('hidden');
    
    // Reset step mode flags
    stepMode = false;
    waitingForStep = false;
    
    startBtn.disabled = false;
    document.getElementById('step-btn').disabled = false;
    stopBtn.disabled = true;
    rewindBtn.disabled = true;
}