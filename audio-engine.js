// Audio Engine for Piano Chord Progression Trainer

// Audio context and master gain node
let audioContext = null;
let masterGainNode = null;
let currentOscillators = [];


// Create gain nodes for separate volume control
let chordGainNode = null;
let metronomeGainNode = null;

// Initialize volume settings with default values from local storage or defaults
let chordVolume = parseFloat(localStorage.getItem('chordVolume') || 0.5);
let metronomeVolume = parseFloat(localStorage.getItem('metronomeVolume') || 0.5);

function initAudio() {
    if (audioContext === null) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create master gain node
        masterGainNode = audioContext.createGain();
        masterGainNode.gain.value = 0.5;
        
        // Create separate gain nodes for chords and metronome
        chordGainNode = audioContext.createGain();
        metronomeGainNode = audioContext.createGain();
        
        // Set initial volumes from saved values
        chordGainNode.gain.value = chordVolume;
        metronomeGainNode.gain.value = metronomeVolume;
        
        // Add a compressor that preserves transients better
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;  // Lower threshold to catch more peaks
        compressor.knee.value = 10;        // Moderate knee
        compressor.ratio.value = 3;        // Lower ratio to preserve transients
        compressor.attack.value = 0.003;   // Slightly slower attack to let transients through
        compressor.release.value = 0.1;    // Quick release
        
        // Create a much subtler reverb
        const convolver = createReverb(audioContext, 1.5, 0.7); // Shorter, drier reverb
        
        // Create a dry/wet mix with much less wet signal
        const reverbGain = audioContext.createGain();
        reverbGain.gain.value = 0.06; // Just 6% wet (much less reverb)
        
        const dryGain = audioContext.createGain();
        dryGain.gain.value = 0.94; // 94% dry signal
        
        // Connect chord and metronome gain nodes to master gain
        chordGainNode.connect(compressor);
        metronomeGainNode.connect(masterGainNode);
        
        // Connect compressor to both dry chain and reverb chain
        compressor.connect(dryGain);
        compressor.connect(reverbGain);
        reverbGain.connect(convolver);
        
        // Connect both dry and wet paths to master
        dryGain.connect(masterGainNode);
        convolver.connect(masterGainNode);
        
        // Connect master gain to output
        masterGainNode.connect(audioContext.destination);
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

function playNote(frequency, duration, delay = 0, velocity = 0.7) {
    // Create oscillators for a richer sound profile
    const oscillators = [];
    const gainNodes = [];
    
    // Fundamental frequency - using sine for cleaner bass
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine'; // Back to sine for cleaner sound
    osc1.frequency.value = frequency;
    oscillators.push(osc1);
    gainNodes.push(gain1);
    
    // First harmonic (octave up) - strong in piano but not as strong as in organs
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 2;
    gain2.gain.value = 0.25; // Reduced from 0.4 to make less organ-like
    oscillators.push(osc2);
    gainNodes.push(gain2);
    
    // Second harmonic (octave + fifth)
    const osc3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = frequency * 3;
    gain3.gain.value = 0.08; // Reduced from 0.15
    oscillators.push(osc3);
    gainNodes.push(gain3);
    
    // Third harmonic (2 octaves up)
    const osc4 = audioContext.createOscillator();
    const gain4 = audioContext.createGain();
    osc4.type = 'sine';
    osc4.frequency.value = frequency * 4;
    gain4.gain.value = 0.05; // Reduced from 0.1
    oscillators.push(osc4);
    gainNodes.push(gain4);
    
    // Add higher harmonics for brightness
    const osc5 = audioContext.createOscillator();
    const gain5 = audioContext.createGain();
    osc5.type = 'sine';
    osc5.frequency.value = frequency * 5;
    gain5.gain.value = 0.02; // Reduced from 0.05
    oscillators.push(osc5);
    gainNodes.push(gain5);
    
    // Add inharmonicity for low notes (stretched harmonics)
    // Real pianos have stretched harmonics due to string stiffness
    if (frequency < 200) {
        const stretchFactor = 1 + (0.0004 * (200 - frequency));
        osc2.frequency.value = frequency * 2 * stretchFactor;
        osc3.frequency.value = frequency * 3 * stretchFactor;
        osc4.frequency.value = frequency * 4 * stretchFactor;
        osc5.frequency.value = frequency * 5 * stretchFactor;
    }
    
    // Add enhanced attack noise - crucial for piano character vs organ
    const noiseLength = 0.03; // Longer attack noise
    const noiseNode = audioContext.createBufferSource();
    const noiseGain = audioContext.createGain();
    const noiseFilter = audioContext.createBiquadFilter();
    
    // Create a noise buffer
    const bufferSize = audioContext.sampleRate * 0.1;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    
    // Fill with filtered noise
    for (let i = 0; i < bufferSize; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    
    // Set up noise filter - key for piano vs organ distinction
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = frequency * 2; // Center around the first harmonic
    noiseFilter.Q.value = 1.0; // Not too resonant
    
    noiseNode.buffer = noiseBuffer;
    noiseGain.gain.value = 0.09 * velocity; // Increased noise for more hammer sound
    
    // Connect and set up envelope for noise
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(chordGainNode);
    
    // Configure the noise envelope - crucial for piano attack
    const now = audioContext.currentTime + delay;
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.09 * velocity, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + noiseLength);
    
    noiseNode.start(now);
    noiseNode.stop(now + noiseLength);
    
    // Apply piano-specific ADSR envelope
    // Pianos have very fast attack, quick initial decay, then gradual decay
    // Organs have slower attack and sustained notes without decay
    const attackTime = 0.002; // Extremely fast attack (piano vs organ)
    const initialDecayTime = 0.04; // Very quick initial decay (crucial for piano sound)
    const initialDecayLevel = 0.3; // Initial decay level
    const decayTime = frequency < 200 ? 0.08 : 0.05; // Shorter decay times
    const sustainLevel = 0.05; // Very low sustain (piano vs organ)
    const releaseTime = frequency < 200 ? 0.4 : 0.2; // Shorter release times
    
    // Connect all oscillators through their gain nodes
    oscillators.forEach((osc, i) => {
        osc.connect(gainNodes[i]);
        gainNodes[i].connect(chordGainNode);
        
        // Apply two-stage decay envelope (crucial for piano vs organ)
        gainNodes[i].gain.setValueAtTime(0, now);
        
        // Fast attack
        gainNodes[i].gain.linearRampToValueAtTime(velocity, now + attackTime);
        
        // Initial rapid decay - critical for piano character
        gainNodes[i].gain.exponentialRampToValueAtTime(initialDecayLevel * velocity, now + attackTime + initialDecayTime);
        
        // Second slower decay phase
        gainNodes[i].gain.exponentialRampToValueAtTime(sustainLevel * velocity, now + attackTime + initialDecayTime + decayTime);
        
        // Release
        gainNodes[i].gain.setValueAtTime(sustainLevel * velocity, now + duration - releaseTime);
        gainNodes[i].gain.exponentialRampToValueAtTime(0.001, now + duration);
        gainNodes[i].gain.linearRampToValueAtTime(0, now + duration + 0.01);
        
        // Add slight detuning to each oscillator for less organ-like precision
        osc.detune.setValueAtTime(Math.random() * 6 - 3, now); // -3 to +3 cents
        
        // Start and stop oscillators
        osc.start(now);
        osc.stop(now + duration + releaseTime);
    });
    
    return oscillators;
}

function playChord(notes, duration = 2.0, arpeggiate = false) {
    if (!audioContext) initAudio();
    
    // Convert note numbers to frequencies
    const frequencies = notes.map(note => {
        const octave = Math.floor(note / 12);
        const noteIndex = note % 12;
        return 440 * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));
    });
    
    // Variable velocity for more natural sound
    const baseVelocity = 0.5;
    
    // For arpeggiated chords, we need to stagger notes with a noticeable delay
    const arpeggioDelay = arpeggiate ? 0.2 : 0.01;
    
    // Slight staggering of notes for more natural sound
    // Emphasize melody note (usually the highest note)
    const allOscillators = frequencies.map((freq, index) => {
        // Slightly emphasize the top note for melody
        let velocity = baseVelocity;
        if (index === frequencies.length - 1) velocity = baseVelocity * 1.1;
        
        // Calculate delay based on whether we're arpeggiating
        const noteDelay = index * arpeggioDelay;
        
        // For arpeggiated chords, use a shorter note duration except for the last note
        const noteDuration = arpeggiate ? 
            (index < frequencies.length - 1 ? duration * 0.8 : duration) : 
            duration;
        
        // Reduce effective duration to half to create staccato effect
        const effectiveDuration = noteDuration * 0.5;
        
        return playNote(freq, effectiveDuration, noteDelay, velocity);
    });
    
    // Store current oscillators for potential immediate stopping
    currentOscillators = allOscillators.flat();
    
    return currentOscillators;
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

// Add this function to audio-engine.js to stop all current oscillators
function stopCurrentChord() {
    if (currentOscillators && currentOscillators.length > 0) {
        // Stop all oscillators immediately
        const now = audioContext.currentTime;
        currentOscillators.forEach(osc => {
            try {
                osc.stop(now);
            } catch (e) {
                // Ignore errors if oscillator already stopped
            }
        });
        
        // Clear current oscillators array
        currentOscillators = [];
    }
}

// Updated stepChord function with immediate sound stopping
function stepChord() {
    // If practice is not running at all, start in step mode
    if (!isRunning) {
        stepMode = true;
        document.getElementById('step-btn').classList.add('step-active');
        startPractice();
        return;
    }
    
    // If a chord is currently playing, stop the sound immediately
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

// Function to create a reverb effect
function createReverb(audioContext, duration, decay) {
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);
    
    // Generate the reverb impulse response
    for (let i = 0; i < length; i++) {
        const n = i / length;
        // Exponential decay with some randomness for diffusion
        const amplitude = Math.pow(1 - n, decay) * (Math.random() * 2 - 1);
        
        // Stereo reverb with slight differences between left and right
        impulseL[i] = amplitude * (1 - (0.1 * Math.random()));
        impulseR[i] = amplitude * (1 - (0.1 * Math.random()));
    }
    
    const convolver = audioContext.createConvolver();
    convolver.buffer = impulse;
    return convolver;
}

F