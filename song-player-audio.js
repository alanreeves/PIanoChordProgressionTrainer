// Song Player Audio Module - Precise timing for individual chords using Tone.js Transport

// State variables for song playback
let songPlaybackQueue = [];
let songPlaybackStarted = false;
let songCurrentTime = 0;
let songIsScheduled = false;

// Schedule a song's chords with individual timing
function scheduleSongChords(chords, callback) {
    if (!chords || chords.length === 0) {
        console.error('No chords to schedule');
        return;
    }

    // Clear any existing schedule
    Tone.Transport.cancel();
    songPlaybackQueue = [];
    
    let currentTime = 0;
    let chordIndex = 0;
    
    // Schedule each chord to play at its specific time
    chords.forEach((chord, index) => {
        // Schedule the chord display and playback
        const timeInBeats = (currentTime / 1000) * (Tone.Transport.bpm.value / 60);
        
        Tone.Transport.schedule((time) => {
            if (typeof callback === 'function') {
                callback(index, time);
            }
        }, timeInBeats);
        
        // Add to queue for reference
        songPlaybackQueue.push({
            index: index,
            duration: chord.duration,
            startTime: currentTime,
            timeInBeats: timeInBeats
        });
        
        // Accumulate time
        currentTime += chord.duration;
    });
    
    songIsScheduled = true;
}

// Start song playback
function startSongPlayback() {
    if (!songIsScheduled) {
        console.error('Song not scheduled');
        return;
    }
    
    try {
        Tone.Transport.start();
        songPlaybackStarted = true;
    } catch (error) {
        console.error('Error starting song playback:', error);
    }
}

// Pause song playback
function pauseSongPlayback() {
    try {
        Tone.Transport.pause();
        songPlaybackStarted = false;
    } catch (error) {
        console.error('Error pausing song playback:', error);
    }
}

// Stop song playback
function stopSongPlayback() {
    try {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        songPlaybackStarted = false;
        songIsScheduled = false;
        songPlaybackQueue = [];
    } catch (error) {
        console.error('Error stopping song playback:', error);
    }
}

// Seek to specific chord in playback
function seekToChord(chordIndex, chords) {
    if (!chords || chordIndex < 0 || chordIndex >= chords.length) {
        console.error('Invalid chord index');
        return;
    }
    
    // Calculate time position for this chord
    let timeMs = 0;
    for (let i = 0; i < chordIndex; i++) {
        timeMs += chords[i].duration;
    }
    
    // Convert to beats
    const timeInBeats = (timeMs / 1000) * (Tone.Transport.bpm.value / 60);
    
    try {
        Tone.Transport.position = timeInBeats;
    } catch (error) {
        console.error('Error seeking to chord:', error);
    }
}

// Get current playback position in chord index
function getCurrentChordIndex(chords) {
    if (!chords || chords.length === 0) return -1;
    
    // Get current time in milliseconds from Tone.Transport
    const transportTimeInBeats = Tone.Transport.position;
    const bpmFactor = Tone.Transport.bpm.value / 60;
    const transportTimeMs = (transportTimeInBeats / bpmFactor) * 1000;
    
    // Find which chord we're currently in
    let accumulatedTime = 0;
    for (let i = 0; i < chords.length; i++) {
        accumulatedTime += chords[i].duration;
        if (transportTimeMs < accumulatedTime) {
            return i;
        }
    }
    
    return chords.length - 1;
}

// Calculate total duration of song in milliseconds
function calculateSongDurationMs(chords) {
    if (!chords || chords.length === 0) return 0;
    return chords.reduce((total, chord) => total + chord.duration, 0);
}

// Initialize Tone.js Transport if needed
async function ensureSongTransportInitialized() {
    try {
        if (Tone.Transport.state === 'stopped') {
            await Tone.start();
        }
        
        // Set Transport BPM (will be updated per song)
        Tone.Transport.bpm.value = 120; // Default
        
        return true;
    } catch (error) {
        console.error('Error initializing Tone Transport:', error);
        return false;
    }
}

// Create a callback system for chord advancement
function createChordAdvanceCallback(onChordReady) {
    return (chordIndex, toneTime) => {
        if (typeof onChordReady === 'function') {
            // Schedule the visual/audio update for this chord
            // Use Tone.Draw for synchronization with audio context
            Tone.Draw.schedule(() => {
                onChordReady(chordIndex);
            }, toneTime);
        }
    };
}

// Optional: Helper to set song transport BPM
function setSongTransportBPM(bpm) {
    try {
        Tone.Transport.bpm.value = bpm;
    } catch (error) {
        console.error('Error setting transport BPM:', error);
    }
}

// Optional: Get Tone.js Transport state for debugging
function getSongTransportState() {
    return {
        state: Tone.Transport.state,
        position: Tone.Transport.position,
        bpm: Tone.Transport.bpm.value,
        isScheduled: songIsScheduled,
        isPlaybackStarted: songPlaybackStarted,
        queueLength: songPlaybackQueue.length
    };
}
