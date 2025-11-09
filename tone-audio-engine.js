// Enhanced Audio Engine for Piano Chord Progression Trainer with Sampled Piano

// Variables to track audio state
let audioInitialized = false;
let toneStarted = false; // Track if Tone.js has been started
let chordVolume = parseFloat(localStorage.getItem('chordVolume') || 0.7);
let metronomeVolume = parseFloat(localStorage.getItem('metronomeVolume') || 0.8);

// Create piano sampler and audio components
let pianoSampler;
let metronomeChannel;
let pianoReverb;

// Store currently playing notes to allow stopping them
let currentlyPlayingNotes = [];

// Detect Android devices
function isAndroidDevice() {
    return /Android/i.test(navigator.userAgent);
}

// Enhanced audio initialization for Android compatibility
async function ensureAudioContext() {
    if (!toneStarted) {
        try {
            await Tone.start();
            toneStarted = true;
            console.log('Tone.js audio context started successfully');
            return true;
        } catch (error) {
            console.error('Failed to start Tone.js audio context:', error);
            return false;
        }
    }
    return true;
}

// Initialize audio context and instruments
async function initAudio() {
    if (!audioInitialized) {
        console.log('Initializing sampled piano audio engine');
        
        try {
            // For Android devices, don't start audio context until user interaction
            if (isAndroidDevice()) {
                console.log('Android device detected - deferring audio context creation');
                // Just mark as initialized, audio context will start on first play
                audioInitialized = true;
                return;
            }
            
            // For other devices, try to initialize normally
            await initializeAudioComponents();
            
        } catch (error) {
            console.error('Error initializing audio:', error);
            // Mark as initialized anyway to prevent repeated attempts
            audioInitialized = true;
        }
    }
}

// Separate function to initialize audio components
async function initializeAudioComponents() {
    // Ensure audio context is started
    const contextStarted = await ensureAudioContext();
    if (!contextStarted) {
        throw new Error('Failed to start audio context');
    }
    
    // Create a reverb for the piano
    pianoReverb = new Tone.Reverb({
        decay: 2.5,
        wet: 0.3 // 30% wet signal for natural room ambience
    }).toDestination();
    
    // Load grand piano samples
    // Using Salamander Grand Piano samples
    pianoSampler = new Tone.Sampler({
        urls: {
            // Core octaves for the Salamander Grand Piano samples
            "A0": "A0.mp3",
            "C1": "C1.mp3",
            "D#1": "Ds1.mp3",
            "F#1": "Fs1.mp3",
            "A1": "A1.mp3",
            "C2": "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            "A2": "A2.mp3",
            "C3": "C3.mp3",
            "D#3": "Ds3.mp3",
            "F#3": "Fs3.mp3",
            "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            "A6": "A6.mp3",
            "C7": "C7.mp3",
            "D#7": "Ds7.mp3",
            "F#7": "Fs7.mp3",
            "A7": "A7.mp3"
        },
        release: 1,
        baseUrl: "https://tonejs.github.io/audio/salamander/",
        onload: () => {
            console.log("Piano samples loaded successfully");
            // Play a test note only if not on Android (to avoid permission issues)
            if (!isAndroidDevice()) {
                try {
                    pianoSampler.triggerAttackRelease("C4", 0.5, undefined, 0.8);
                } catch (error) {
                    console.warn('Test note failed:', error);
                }
            }
        }
    }).connect(pianoReverb);
    
    // Set piano volume
    pianoSampler.volume.value = Tone.gainToDb(chordVolume + 0.3);
    
    // Create a louder metronome channel
    metronomeChannel = new Tone.Channel({
        volume: Tone.gainToDb(metronomeVolume + 0.3),
        pan: 0.3 // Slightly panned right for differentiation
    }).toDestination();
    
    // Mark as initialized
    audioInitialized = true;
    
    console.log('Sampled piano audio engine initialized successfully');
}

// Function to update chord volume
function updateChordVolume(value) {
    chordVolume = parseFloat(value);
    if (pianoSampler) {
        pianoSampler.volume.value = Tone.gainToDb(chordVolume + 0.3); // Add boost
    }
    localStorage.setItem('chordVolume', chordVolume);
}

// Function to update metronome volume
function updateMetronomeVolume(value) {
    metronomeVolume = parseFloat(value);
    if (metronomeChannel) {
        metronomeChannel.volume.value = Tone.gainToDb(metronomeVolume + 0.3); // Add boost
    }
    localStorage.setItem('metronomeVolume', metronomeVolume);
}

// Function to play a metronome click
async function playMetronomeClick(isDownbeat = false) {
    // Ensure audio context is started (critical for Android)
    if (!toneStarted) {
        const started = await ensureAudioContext();
        if (!started) {
            console.error('Cannot play metronome: Audio context failed to start');
            return;
        }
    }
    
    // Initialize audio components if not already done
    if (!metronomeChannel && audioInitialized) {
        try {
            await initializeAudioComponents();
        } catch (error) {
            console.error('Failed to initialize metronome components:', error);
            return;
        }
    }
    
    if (!audioInitialized || !metronomeChannel) {
        console.error('Metronome not initialized');
        return;
    }
    
    try {
        // Create synth for metronome sounds - louder with more attack
        const synth = new Tone.MembraneSynth({
            pitchDecay: 0.01,
            octaves: 3,
            oscillator: {
                type: "sine"
            },
            envelope: {
                attack: 0.001,
                decay: 0.2,
                sustain: 0,
                release: 0.1
            }
        }).connect(metronomeChannel);
        
        // Use different notes for downbeat vs regular beats
        const note = isDownbeat ? "C3" : "G2";
        const velocity = isDownbeat ? 0.9 : 0.7; // Increased velocities
        
        // Play the click
        synth.triggerAttackRelease(note, "16n", undefined, velocity);
        
        // Dispose synth after use
        setTimeout(() => {
            synth.dispose();
        }, 500);
        
    } catch (error) {
        console.error('Error playing metronome click:', error);
    }
}

// Function to convert MIDI note number to note name with octave
function midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return noteName + octave;
}

// Function to play a chord with Tone.js using the piano sampler
async function playChord(notes, duration = 2.0, arpeggiate = false) {
    // Ensure audio context is started (critical for Android)
    if (!toneStarted) {
        const started = await ensureAudioContext();
        if (!started) {
            console.error('Cannot play chord: Audio context failed to start');
            return;
        }
    }
    
    // Initialize audio components if not already done (especially for Android)
    if (!pianoSampler && audioInitialized) {
        try {
            await initializeAudioComponents();
        } catch (error) {
            console.error('Failed to initialize audio components:', error);
            return;
        }
    }
    
    if (!audioInitialized || !pianoSampler) {
        console.error('Piano sampler not initialized');
        return;
    }
    
    // Convert MIDI note numbers to note names
    const noteNames = notes.map(note => midiToNoteName(note));
    console.log('Playing sampled notes:', noteNames, 'duration:', duration);
    
    // Store the currently playing notes
    currentlyPlayingNotes = noteNames;
    
    // Adjust velocities for a more dynamic, realistic piano
    // Lower notes slightly louder, higher notes slightly softer
    const velocities = notes.map(note => {
        // Base velocity with musical expression variation
        const baseVelocity = 0.7 + (Math.random() * 0.15);
        // Adjust based on note range (lower = louder, higher = softer)
        const noteValue = parseInt(note);
        if (noteValue < 60) { // Below middle C
            return Math.min(baseVelocity * 1.15, 1.0); // Slightly louder
        } else if (noteValue > 72) { // Above C5
            return baseVelocity * 0.9; // Slightly softer
        }
        return baseVelocity;
    });
    
    // Different handling for arpeggiated vs. block chords
    if (arpeggiate) {
        const arpeggioDelay = 0.13; // 130ms between notes for graceful arpeggiation
        
        // Play each note with a staggered start time
        noteNames.forEach((note, index) => {
            const noteDuration = duration * 0.9; // Allow notes to sustain for musical phrasing
            const velocity = velocities[index];
            
            // Slight crescendo in velocity for ascending arpeggios
            const arpVelocity = velocity * (1 + (index * 0.05));
            
            try {
                pianoSampler.triggerAttackRelease(
                    note, 
                    noteDuration, 
                    Tone.now() + (index * arpeggioDelay), 
                    arpVelocity
                );
            } catch (error) {
                console.error('Error playing arpeggiated note:', error);
            }
        });
    } else {
        // For block chords, play within a few milliseconds for natural variation
        noteNames.forEach((note, index) => {
            const velocity = velocities[index];
            // Small timing offsets (5-15ms) to simulate a more natural chord attack
            const microTiming = Math.random() * 0.01; // 0-10ms variation
            
            try {
                pianoSampler.triggerAttackRelease(
                    note, 
                    duration, 
                    Tone.now() + microTiming, 
                    velocity
                );
            } catch (error) {
                console.error('Error playing chord note:', error);
            }
        });
    }
}

// Function to immediately stop all currently playing notes
function stopCurrentChord() {
    if (pianoSampler && currentlyPlayingNotes.length > 0) {
        pianoSampler.triggerRelease(currentlyPlayingNotes);
        currentlyPlayingNotes = [];
    }
}

// Function to play a chord based on root, type, and inversion
function playChordSound(root, type, inversion) {
    // Calculate MIDI note numbers for the chord using our conversion function
    const rootIndex = getNoteIndex(root);
    // Log for debugging
    console.log(`Playing chord sound: ${root} ${type} ${inversion} - root index: ${rootIndex}`);
    
    // Get hand selection
    let isRightHand;
    
    // Handle alternating hands option
    if (document.getElementById('alternate-hands') && document.getElementById('alternate-hands').checked) {
        // Since currentAlternatingHand is already toggled in highlightChordOnPiano before this function is called,
        // we need to use the opposite of what it currently is (since it represents the NEXT chord's hand)
        isRightHand = currentAlternatingHand === 'left'; // Use the opposite of next hand
    } else {
        isRightHand = document.getElementById('right-hand').checked;
    }
    
    // Calculate the starting MIDI note
    const startNote = getChordStartNote(rootIndex, type, inversion, isRightHand);
    
    // Get the chord intervals
    const intervals = getChordIntervals(type, inversion);
    
    // Calculate actual MIDI notes
    const notes = intervals.map(interval => startNote + interval);
    
    // Check if arpeggiation is enabled
    const arpeggiate = document.getElementById('arpeggiate-chord').checked;
    
    // Calculate chord duration in seconds based on BPM, time signature, and note value
    // Default to 2 seconds if not in a practice session
    let duration = 2.0;
    
    if (document.getElementById('time-signature') && document.getElementById('tempo') && document.getElementById('note-value')) {
        const bpm = parseInt(document.getElementById('tempo').value, 10);
        const timeSignature = document.getElementById('time-signature').value;
        const noteValue = parseInt(document.getElementById('note-value').value, 10);
        
        // Calculate chord duration in beats
        const chordDurationInBeats = calculateChordDurationInBeats(timeSignature, noteValue);
        
        // Duration in seconds = (chord duration in beats * 60) / BPM
        duration = (chordDurationInBeats * 60) / bpm;
    }
    
    // Play the chord (apply 50% duration for staccato)
    playChord(notes, duration * 0.5, arpeggiate);
}

// Function to play a chord based on root, type, and inversion with explicit duration (for song player)
// durationMs is in milliseconds, rhythmPattern is optional rhythm pattern name
function playChordSoundWithDuration(root, type, inversion, durationMs, rhythmPattern = 'none') {
    // Convert milliseconds to seconds
    const durationSeconds = durationMs / 1000;
    
    // Calculate MIDI note numbers for the chord using our conversion function
    const rootIndex = getNoteIndex(root);
    console.log(`Playing chord sound with duration: ${root} ${type} ${inversion} - duration: ${durationSeconds}s - rhythm: ${rhythmPattern}`);
    
    // Get hand selection (default to right hand in song player)
    let isRightHand = true;
    if (document.getElementById('right-hand')) {
        isRightHand = document.getElementById('right-hand').checked;
    }
    if (document.getElementById('left-hand') && document.getElementById('left-hand').checked) {
        isRightHand = false;
    }
    
    // Calculate the starting MIDI note
    const startNote = getChordStartNote(rootIndex, type, inversion, isRightHand);
    
    // Get the chord intervals
    const intervals = getChordIntervals(type, inversion);
    
    // Calculate actual MIDI notes
    const notes = intervals.map(interval => startNote + interval);
    
    // Check if arpeggiation is enabled (if available)
    const arpeggiate = document.getElementById('arpeggiate-chord') ? document.getElementById('arpeggiate-chord').checked : false;
    
    // Play the chord with rhythm pattern applied
    playChordWithRhythm(notes, durationSeconds, arpeggiate, rhythmPattern);
}

// Function to play a chord with rhythm pattern applied
async function playChordWithRhythm(notes, durationSeconds, arpeggiate = false, rhythmPattern = 'none') {
    // Ensure audio context is started
    if (!toneStarted) {
        const started = await ensureAudioContext();
        if (!started) {
            console.error('Cannot play chord: Audio context failed to start');
            return;
        }
    }
    
    // Initialize audio components if not already done
    if (!pianoSampler && audioInitialized) {
        try {
            await initializeAudioComponents();
        } catch (error) {
            console.error('Failed to initialize audio components:', error);
            return;
        }
    }
    
    if (!pianoSampler) {
        console.error('Piano sampler not initialized');
        return;
    }
    
    const now = Tone.now();
    
    // Convert MIDI note numbers to note names for Tone.js
    const noteNames = notes.map(midiNote => {
        const octave = Math.floor(midiNote / 12) - 1;
        const noteIndex = midiNote % 12;
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes[noteIndex] + octave;
    });
    
    // Apply rhythm pattern if available
    let playableNotes = noteNames.map(noteName => ({
        note: noteName,
        velocity: 0.8,
        duration: durationSeconds
    }));
    
    // Apply rhythm modifications using the rhythm patterns module
    if (typeof applyRhythmToNotes === 'function' && rhythmPattern && rhythmPattern !== 'none') {
        playableNotes = applyRhythmToNotes(playableNotes, rhythmPattern, now);
    } else {
        // No rhythm - just use baseline timing
        playableNotes = playableNotes.map(note => ({
            ...note,
            time: now
        }));
    }
    
    // Play notes with their rhythm timing
    if (arpeggiate) {
        // Arpeggiation: add delay between notes
        const arpeggiateDelay = 0.05; // 50ms between notes
        playableNotes.forEach((noteData, index) => {
            const arpTime = noteData.time + (index * arpeggiateDelay);
            try {
                pianoSampler.triggerAttackRelease(
                    noteData.note,
                    noteData.duration,
                    arpTime,
                    noteData.velocity
                );
            } catch (error) {
                console.error('Error playing arpeggiated note with rhythm:', error);
            }
        });
    } else {
        // Block chord: play all notes with rhythm timing
        playableNotes.forEach(noteData => {
            try {
                pianoSampler.triggerAttackRelease(
                    noteData.note,
                    noteData.duration,
                    noteData.time,
                    noteData.velocity
                );
            } catch (error) {
                console.error('Error playing chord note with rhythm:', error);
            }
        });
    }
}
