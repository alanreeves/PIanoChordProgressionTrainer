// Improved Audio Engine for Piano Chord Progression Trainer

// Variables to track audio state
let audioInitialized = false;
let chordVolume = parseFloat(localStorage.getItem('chordVolume') || 0.7); // Increased default volume
let metronomeVolume = parseFloat(localStorage.getItem('metronomeVolume') || 0.8); // Increased default volume

// Create piano synthesizer
let pianoSynth;
let metronomeChannel;

// Store currently playing notes to allow stopping them
let currentlyPlayingNotes = [];

// Initialize audio context and instruments
function initAudio() {
    if (!audioInitialized) {
        console.log("Initializing audio engine");
        
        try {
            // Create a more piano-like synth
            const options = {
                oscillator: {
                    type: "triangle", // More harmonics for fuller sound
                    count: 3,    // Multiple oscillators for richness
                    spread: 30   // Spread to create natural chorusing effect
                },
                envelope: {
                    attack: 0.002,
                    decay: 0.15,
                    sustain: 0.08, // Lower sustain for more piano-like decay
                    release: 0.4
                },
                volume: 2 // Increased volume
            };
            
            pianoSynth = new Tone.PolySynth(Tone.Synth, options).toDestination();
            
            // Add a small amount of reverb for realism
            const reverb = new Tone.Reverb({
                decay: 1.5,
                wet: 0.2 // 20% wet signal
            }).toDestination();
            
            pianoSynth.connect(reverb);
            
            // Set piano volume - higher value for louder sound
            pianoSynth.volume.value = Tone.gainToDb(chordVolume + 0.3); // Add +0.3 for extra volume
            
            // Create a louder metronome channel
            metronomeChannel = new Tone.Channel({
                volume: Tone.gainToDb(metronomeVolume + 0.3), // Add +0.3 for extra volume
                pan: 0.3 // Slightly panned right for differentiation
            }).toDestination();
            
            // Mark as initialized
            audioInitialized = true;
            
            console.log("Improved audio engine initialized");
            
            // Play a test note
            pianoSynth.triggerAttackRelease("C4", 0.5, undefined, 0.8);
        } catch (error) {
            console.error("Error initializing audio:", error);
        }
    }
}

// Function to update chord volume
function updateChordVolume(value) {
    chordVolume = parseFloat(value);
    if (pianoSynth) {
        pianoSynth.volume.value = Tone.gainToDb(chordVolume + 0.3); // Add boost
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
function playMetronomeClick(isDownbeat = false) {
    if (!audioInitialized) return;
    
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
}

// Function to convert MIDI note number to note name with octave
function midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return noteName + octave;
}

// Function to play a chord with Tone.js
function playChord(notes, duration = 2.0, arpeggiate = false) {
    if (!audioInitialized || !pianoSynth) {
        console.error("Piano synth not initialized");
        return;
    }
    
    // Convert MIDI note numbers to note names
    const noteNames = notes.map(note => midiToNoteName(note));
    console.log("Playing notes:", noteNames, "duration:", duration);
    
    // Store the currently playing notes
    currentlyPlayingNotes = noteNames;
    
    // Slight randomization of velocities for more natural sound
    const velocities = notes.map(() => 0.7 + (Math.random() * 0.2));
    
    // Different handling for arpeggiated vs. block chords
    if (arpeggiate) {
        const arpeggioDelay = 0.12; // 120ms between notes
        
        // Play each note with a staggered start time
        noteNames.forEach((note, index) => {
            const noteDuration = duration * 0.8; // Shorter duration for more separation
            const velocity = velocities[index];
            
            pianoSynth.triggerAttackRelease(
                note, 
                noteDuration, 
                Tone.now() + (index * arpeggioDelay), 
                velocity
            );
        });
    } else {
        // Each note gets slightly different velocity for more natural sound
        noteNames.forEach((note, index) => {
            const velocity = velocities[index];
            pianoSynth.triggerAttackRelease(note, duration, Tone.now(), velocity);
        });
    }
}

// Function to immediately stop all currently playing notes
function stopCurrentChord() {
    if (pianoSynth && currentlyPlayingNotes.length > 0) {
        pianoSynth.triggerRelease(currentlyPlayingNotes);
        currentlyPlayingNotes = [];
    }
}

// Function to play a chord based on root, type, and inversion
function playChordSound(root, type, inversion) {
    // Calculate MIDI note numbers for the chord
    const rootIndex = noteNames.indexOf(root);
    if (rootIndex === -1) return;
    
    // Get octave offset based on hand selection
    const isRightHand = document.getElementById('right-hand').checked;
    
    // Calculate the starting MIDI note
    const startNote = getChordStartNote(rootIndex, type, inversion, isRightHand);
    
    // Get the chord intervals
    const intervals = getChordIntervals(type, inversion);
    
    // Calculate actual MIDI notes
    const notes = intervals.map(interval => startNote + interval);
    
    // Check if arpeggiation is enabled
    const arpeggiate = document.getElementById('arpeggiate-chord').checked;
    
    // Calculate chord duration in seconds based on BPM
    // Default to 2 seconds if not in a practice session
    let duration = 2.0;
    
    if (document.getElementById('beats') && document.getElementById('tempo')) {
        const bpm = parseInt(document.getElementById('tempo').value, 10);
        const beatsPerChord = parseInt(document.getElementById('beats').value, 10);
        
        // Duration in seconds = (beats per chord * 60) / BPM
        duration = (beatsPerChord * 60) / bpm;
    }
    
    // Play the chord (apply 50% duration for staccato)
    playChord(notes, duration * 0.5, arpeggiate);
}