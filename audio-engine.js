// Audio Engine for Piano Chord Progression Trainer

// Audio context and master gain node
let audioContext = null;
let masterGainNode = null;

// Create gain nodes for separate volume control
let chordGainNode = null;
let metronomeGainNode = null;

// Initialize volume settings with default values from local storage or defaults
let chordVolume = parseFloat(localStorage.getItem('chordVolume') || 0.5);
let metronomeVolume = parseFloat(localStorage.getItem('metronomeVolume') || 0.5);

// Initialize audio context (must be done in response to a user action)
function initAudio() {
    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = 0.5; // Reduced master volume from 0.7 to 0.5 for quieter piano sounds
        
        // Create separate gain nodes for chords and metronome
        chordGainNode = audioContext.createGain();
        metronomeGainNode = audioContext.createGain();
        
        // Set initial volumes from saved values
        chordGainNode.gain.value = chordVolume;
        metronomeGainNode.gain.value = metronomeVolume;
        
        // Add a simple compressor for better dynamics
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -15;
        compressor.knee.value = 10;
        compressor.ratio.value = 3;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.1;
        
        // Connect chord and metronome gain nodes to master gain
        chordGainNode.connect(masterGainNode);
        metronomeGainNode.connect(masterGainNode);
        
        // Connect master gain to compressor and then to output
        masterGainNode.connect(compressor);
        compressor.connect(audioContext.destination);
    }
}

// Function to update chord volume
function updateChordVolume(value) {
    if (!audioContext) initAudio();
    chordVolume = parseFloat(value);
    chordGainNode.gain.value = chordVolume;
    localStorage.setItem('chordVolume', chordVolume);
}

// Function to update metronome volume
function updateMetronomeVolume(value) {
    if (!audioContext) initAudio();
    metronomeVolume = parseFloat(value);
    metronomeGainNode.gain.value = metronomeVolume;
    localStorage.setItem('metronomeVolume', metronomeVolume);
}

// Function to play a metronome click
function playMetronomeClick(isDownbeat = false) {
    if (!audioContext) initAudio();
    
    // Create an oscillator for the click sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Use different frequencies for downbeat vs regular beats
    oscillator.type = 'sine';
    oscillator.frequency.value = isDownbeat ? 1000 : 800; // Higher pitch for downbeat
    
    // Set up the gain envelope for a short click
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.001); // Increased from 0.3 to 0.5 for louder metronome
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Quick decay
    
    // Connect and start - connect to metronome gain node instead of master
    oscillator.connect(gainNode);
    gainNode.connect(metronomeGainNode);
    
    oscillator.start(now);
    oscillator.stop(now + 0.1);
    
    return oscillator;
}

// Function to play a note with more realistic piano sound
function playNote(frequency, duration, delay = 0, velocity = 0.6) { // Reduced default velocity from 0.8 to 0.6
    // Create multiple oscillators for richer harmonics
    const oscillators = [];
    const gainNodes = [];
    
    // Main frequency (fundamental)
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine'; // Use sine for clearer fundamental
    osc1.frequency.value = frequency;
    oscillators.push(osc1);
    gainNodes.push(gain1);
    
    // Overtone 1 (one octave up)
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2;
    gain2.gain.value = 0.25; // Reduced from 0.35 to 0.25 for quieter overtones
    oscillators.push(osc2);
    gainNodes.push(gain2);
    
    // Overtone 2 (perfect fifth above octave)
    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = frequency * 3;
    gain3.gain.value = 0.1; // Reduced from 0.15 to 0.1 for quieter overtones
    oscillators.push(osc3);
    gainNodes.push(gain3);
    
    // Add slight detuning for a more natural sound
    osc1.detune.value = Math.random() * 4 - 2; // Random detune between -2 and +2 cents
    
    // Apply ADSR envelope for a piano-like sound
    const now = audioContext.currentTime + delay;
    const attackTime = 0.002; // Extremely short attack for clarity
    const decayTime = 0.1;
    const sustainLevel = 0.25; // Reduced from 0.3 to 0.25 for quieter sustain
    const releaseTime = duration > 1 ? 1.2 : 0.6; // Adjusted release
    
    // Connect all oscillators through their gain nodes to the chord gain node
    oscillators.forEach((osc, i) => {
        osc.connect(gainNodes[i]);
        gainNodes[i].connect(chordGainNode);
        
        // Apply envelope to each gain node
        gainNodes[i].gain.setValueAtTime(0, now);
        gainNodes[i].gain.linearRampToValueAtTime(velocity, now + attackTime);
        gainNodes[i].gain.exponentialRampToValueAtTime(sustainLevel * velocity, now + attackTime + decayTime);
        gainNodes[i].gain.setValueAtTime(sustainLevel * velocity, now + duration - releaseTime);
        gainNodes[i].gain.exponentialRampToValueAtTime(0.001, now + duration); // Can't go to 0 with exponentialRampToValueAtTime
        gainNodes[i].gain.linearRampToValueAtTime(0, now + duration + 0.01);
        
        // Start and stop oscillators
        osc.start(now);
        osc.stop(now + duration + releaseTime);
    });
    
    return oscillators;
}

// Function to play a chord with improved piano sound
function playChord(notes, duration = 2.0, arpeggiate = false) {
    if (!audioContext) initAudio();
    
    // Convert note numbers to frequencies
    const frequencies = notes.map(note => {
        const octave = Math.floor(note / 12);
        const noteIndex = note % 12;
        return 440 * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));
    });
    
    // Variable velocity for more natural sound
    const baseVelocity = 0.5; // Reduced from 0.7 to 0.5 for quieter chords
    
    // For arpeggiated chords, we need to stagger notes with a noticeable delay
    const arpeggioDelay = arpeggiate ? 0.2 : 0.01; // 200ms between notes if arpeggiating, 10ms if not
    
    // Slight staggering of notes for more natural sound
    // Emphasize melody note (usually the highest note)
    const allOscillators = frequencies.map((freq, index) => {
        // Slightly emphasize the top note for melody
        let velocity = baseVelocity;
        if (index === frequencies.length - 1) velocity = baseVelocity * 1.1; // Reduced emphasis from 1.2 to 1.1
        
        // Calculate delay based on whether we're arpeggiating
        const noteDelay = index * arpeggioDelay;
        
        // For arpeggiated chords, use a shorter note duration except for the last note
        const noteDuration = arpeggiate ? 
            (index < frequencies.length - 1 ? duration * 0.8 : duration) : 
            duration;
        
        return playNote(freq, noteDuration, noteDelay, velocity);
    });
    
    return allOscillators.flat();
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
    
    // Play the chord
    playChord(notes, duration, arpeggiate);
}