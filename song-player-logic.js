// Song Player Logic Module - Core functionality for Great American Song Book songs

// Global state variables for song player
let songLibrary = [];
let currentSong = null;
let currentSongOriginalKey = null;
let currentTransposedKey = null;
let currentSongChords = [];
let songIsRunning = false;
let songCurrentChordIndex = -1;
let songLeadInRemaining = 0;
let songPlaybackInterval = null;
let songStepMode = false;
let songWaitingForStep = false;

// Function to load songs from JSON library
async function loadSongLibrary() {
    try {
        const response = await fetch('songs-library.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        songLibrary = data.songs || [];
        populateSongSelector();
        console.log(`Loaded ${songLibrary.length} songs from library`);
        return true;
    } catch (error) {
        console.error('Error loading song library:', error);
        displayError('Failed to load song library');
        return false;
    }
}

// Populate song selector dropdown
function populateSongSelector() {
    const selector = document.getElementById('song-select');
    if (!selector || !songLibrary || songLibrary.length === 0) return;
    
    // Clear existing options (keep placeholder)
    selector.innerHTML = '<option value="">-- Choose a song --</option>';
    
    // Add songs sorted by title
    const sortedSongs = [...songLibrary].sort((a, b) => a.title.localeCompare(b.title));
    sortedSongs.forEach(song => {
        const option = document.createElement('option');
        option.value = song.id;
        option.textContent = song.title;
        selector.appendChild(option);
    });
}

// Find song by ID
function findSongById(songId) {
    return songLibrary.find(song => song.id === songId);
}

// Handle song selection
function selectSong(songId) {
    currentSong = findSongById(songId);
    if (!currentSong) {
        displayError('Song not found');
        return false;
    }
    
    // Store original key and set transpose key to original
    currentSongOriginalKey = currentSong.key;
    currentTransposedKey = extractRootNote(currentSong.key);
    
    // Display song information
    showSongInfo();
    
    // Enable transposition selector and set it to original key
    const transposeSelect = document.getElementById('transpose-key');
    if (transposeSelect) {
        transposeSelect.disabled = false;
        transposeSelect.value = currentTransposedKey;
    }
    
    // Prepare chords (use original for now)
    prepareChordProgression();
    
    // Update display
    updateSongDisplay();
    
    return true;
}

// Extract root note from key string (e.g., "C Major" -> "C")
function extractRootNote(keyString) {
    if (!keyString) return 'C';
    // Handle keys like "C Major", "C minor", "C#", etc.
    const match = keyString.match(/^([A-G]#?b?)/);
    return match ? match[1] : 'C';
}

// Show song metadata
function showSongInfo() {
    if (!currentSong) return;
    
    const songInfo = document.getElementById('song-info');
    const songTitle = document.getElementById('song-title');
    const songComposer = document.getElementById('song-composer');
    const songKey = document.getElementById('song-key');
    const songTimeSig = document.getElementById('song-time-sig');
    const songTempo = document.getElementById('song-tempo');
    
    if (songInfo && songTitle && songComposer && songKey && songTimeSig && songTempo) {
        songTitle.textContent = currentSong.title;
        songComposer.textContent = currentSong.composer;
        songKey.textContent = currentSong.key;
        songTimeSig.textContent = currentSong.timeSignature;
        songTempo.textContent = currentSong.tempo;
        songInfo.style.display = 'block';
    }
}

// Update song display at bottom
function updateSongDisplay() {
    if (!currentSong) {
        document.getElementById('song-display').textContent = 'Select a song';
        return;
    }
    
    const keyIndicator = currentTransposedKey !== extractRootNote(currentSong.key) 
        ? ` (in ${currentTransposedKey})`
        : '';
    document.getElementById('song-display').textContent = currentSong.title + keyIndicator;
    
    // Update BPM display
    document.getElementById('bpm-slider').disabled = false;
    document.getElementById('bpm-slider').value = currentSong.tempo;
    document.getElementById('bpm-value').textContent = currentSong.tempo;
}

// Prepare chord progression (with transposition if needed)
function prepareChordProgression() {
    if (!currentSong || !currentSong.chords) return;
    
    // Get selected transposition key
    const transposeSelect = document.getElementById('transpose-key');
    const targetKey = transposeSelect ? transposeSelect.value : currentTransposedKey;
    
    // Transpose chords if needed
    const originalRoot = extractRootNote(currentSong.key);
    if (targetKey && targetKey !== originalRoot) {
        currentSongChords = transposeSongChords(currentSong.chords, originalRoot, targetKey);
        currentTransposedKey = targetKey;
    } else {
        currentSongChords = JSON.parse(JSON.stringify(currentSong.chords)); // Deep copy
        currentTransposedKey = originalRoot;
    }
    
    // Display chord progression with duration badges
    displaySongProgressionPills(currentSongChords, currentSong.tempo, currentSong.timeSignature);
}

// Transpose song chords from one key to another
function transposeSongChords(chords, fromKey, toKey) {
    if (!chords || chords.length === 0) return [];
    
    // Calculate semitone offset
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const fromIndex = noteNames.indexOf(fromKey);
    const toIndex = noteNames.indexOf(toKey);
    
    if (fromIndex === -1 || toIndex === -1) {
        console.error('Invalid key for transposition:', fromKey, toKey);
        return JSON.parse(JSON.stringify(chords));
    }
    
    const semitoneOffset = (toIndex - fromIndex + 12) % 12;
    
    // Transpose each chord
    return chords.map(chord => {
        const rootIndex = noteNames.indexOf(chord.root);
        if (rootIndex === -1) return chord; // Keep original if not found
        
        const newRootIndex = (rootIndex + semitoneOffset) % 12;
        return {
            ...chord,
            root: noteNames[newRootIndex]
        };
    });
}

// Display chord progression pills with duration badges
function displaySongProgressionPills(chords, tempo, timeSignature) {
    const display = document.getElementById('progression-display');
    if (!display || !chords) return;
    
    const beatsPerBar = getBeatsPerBar(timeSignature);
    const msPerBeat = (60 * 1000) / tempo;
    
    display.innerHTML = '';
    chords.forEach((chord, index) => {
        // Calculate beats for this chord
        const beats = chord.duration / msPerBeat;
        const beatsDisplay = beats.toFixed(1);
        
        // Create pill element
        const pill = document.createElement('span');
        pill.className = 'progression-pill chord-pill';
        pill.id = `chord-pill-${index}`;
        
        // Format chord display
        let chordDisplay = chord.root + (chord.type !== 'major' ? formatChordType(chord.type) : '');
        if (chord.inversion !== 'root' && document.getElementById('slash-notation').checked) {
            const bassNote = getInversionBassNote(chord.root, chord.type, chord.inversion);
            chordDisplay += `/${bassNote}`;
        }
        
        // Create badge for duration
        const badge = document.createElement('span');
        badge.className = 'badge bg-secondary duration-badge';
        badge.textContent = `${beatsDisplay}♩`;
        badge.title = `${chord.duration}ms`;
        
        pill.innerHTML = chordDisplay;
        pill.appendChild(badge);
        pill.setAttribute('data-toggle', 'tooltip');
        pill.title = `${chordDisplay}: ${beatsDisplay} beats`;
        
        display.appendChild(pill);
    });
}

// Format chord type for display
function formatChordType(type) {
    const typeMap = {
        'major': '',
        'minor': 'm',
        'dominant7': '7',
        'major7': 'Δ7',
        'minor7': 'm7',
        'diminished': '°',
        'half-diminished': 'ø',
        'augmented': '+',
        'sus2': 'sus2',
        'sus4': 'sus4',
        'add9': 'add9'
    };
    return typeMap[type] || '';
}

// Get bass note for inversion
function getInversionBassNote(root, type, inversion) {
    // This is a simplified version; full implementation would use music-theory.js
    if (inversion === 'first') {
        // Third of the chord
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = noteNames.indexOf(root);
        return noteNames[(rootIndex + 4) % 12]; // Third is 4 semitones up
    } else if (inversion === 'second') {
        // Fifth of the chord
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootIndex = noteNames.indexOf(root);
        return noteNames[(rootIndex + 7) % 12]; // Fifth is 7 semitones up
    }
    return root;
}

// Start song playback
function startSongPlayback() {
    if (!currentSong || !currentSongChords || currentSongChords.length === 0) {
        alert('Please select a song first');
        return;
    }
    
    // Initialize audio if needed
    initAudio();
    
    // Reset state
    songIsRunning = true;
    songCurrentChordIndex = -1;
    songStepMode = false;
    songWaitingForStep = false;
    
    // Update button states
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
    
    // Set transport BPM
    setSongTransportBPM(currentSong.tempo);
    
    // Handle lead-in beats
    const leadInBeats = parseInt(document.getElementById('lead-in-beats').value, 10);
    if (leadInBeats > 0) {
        startLeadInCountdown(leadInBeats);
    } else {
        playNextSongChord();
    }
}

// Start lead-in countdown
function startLeadInCountdown(leadInBeats) {
    clearInterval(songPlaybackInterval);
    
    const countdownDisplay = document.getElementById('countdown-display');
    countdownDisplay.classList.remove('hidden');
    
    const msPerBeat = (60 * 1000) / currentSong.tempo;
    let remainingBeats = leadInBeats;
    
    countdownDisplay.querySelector('.countdown').textContent = remainingBeats;
    
    // Play first metronome click
    if (document.getElementById('metronome').checked) {
        playMetronomeClick(true);
    }
    
    songPlaybackInterval = setInterval(() => {
        remainingBeats--;
        if (remainingBeats <= 0) {
            clearInterval(songPlaybackInterval);
            countdownDisplay.classList.add('hidden');
            playNextSongChord();
        } else {
            countdownDisplay.querySelector('.countdown').textContent = remainingBeats;
            if (document.getElementById('metronome').checked) {
                playMetronomeClick(false);
            }
        }
    }, msPerBeat);
}

// Play next chord in song
function playNextSongChord() {
    if (!songIsRunning || !currentSongChords) return;
    
    songCurrentChordIndex++;
    
    if (songCurrentChordIndex >= currentSongChords.length) {
        stopSongPlayback();
        return;
    }
    
    const chord = currentSongChords[songCurrentChordIndex];
    const msPerBeat = (60 * 1000) / currentSong.tempo;
    const chordDurationMs = chord.duration;
    
    // Update display
    updateActiveSongPill(songCurrentChordIndex);
    
    // Play chord sound
    if (document.getElementById('play-sound').checked) {
        playChordSound(chord.root, chord.type, chord.inversion);
    }
    
    // Highlight on piano
    highlightChordOnPiano(chord.root, chord.type, chord.inversion);
    
    // Play metronome click
    if (document.getElementById('metronome').checked) {
        playMetronomeClick(true);
    }
    
    // Schedule next chord if in continuous mode
    if (!songStepMode && songIsRunning) {
        clearInterval(songPlaybackInterval);
        songPlaybackInterval = setTimeout(() => {
            playNextSongChord();
        }, chordDurationMs);
    } else {
        songWaitingForStep = true;
        document.getElementById('step-btn').classList.add('step-active');
    }
}

// Update active chord pill styling
function updateActiveSongPill(chordIndex) {
    // Remove active class from all pills
    document.querySelectorAll('.chord-pill').forEach(pill => {
        pill.classList.remove('active');
    });
    
    // Add active class to current pill
    const activePill = document.getElementById(`chord-pill-${chordIndex}`);
    if (activePill) {
        activePill.classList.add('active');
    }
}

// Step to next chord
function stepSongChord() {
    if (!songIsRunning) {
        startSongPlayback();
    } else if (songWaitingForStep) {
        playNextSongChord();
    }
}

// Rewind to previous chord
function rewindSongChord() {
    if (!currentSongChords || songCurrentChordIndex <= 0) return;
    
    songCurrentChordIndex--;
    const chord = currentSongChords[songCurrentChordIndex];
    
    // Update display
    updateActiveSongPill(songCurrentChordIndex);
    
    // Play chord sound
    if (document.getElementById('play-sound').checked) {
        playChordSound(chord.root, chord.type, chord.inversion);
    }
    
    // Highlight on piano
    highlightChordOnPiano(chord.root, chord.type, chord.inversion);
}

// Stop song playback
function stopSongPlayback() {
    songIsRunning = false;
    songCurrentChordIndex = -1;
    songWaitingForStep = false;
    clearInterval(songPlaybackInterval);
    
    // Update button states
    document.getElementById('start-btn').disabled = false;
    document.getElementById('stop-btn').disabled = true;
    document.getElementById('step-btn').classList.remove('step-active');
    
    // Clear displays
    clearPianoHighlights();
    document.querySelectorAll('.chord-pill').forEach(pill => pill.classList.remove('active'));
    document.getElementById('countdown-display').classList.add('hidden');
}

// Handle transposition key change
function handleTranspositionChange(newKey) {
    if (!currentSong) return;
    
    currentTransposedKey = newKey;
    prepareChordProgression();
    updateSongDisplay();
}

// Display error message to user
function displayError(message) {
    console.error(message);
    alert('Error: ' + message);
}

// Initialize song player on DOMContentLoaded
async function initSongPlayer() {
    // Check authorization first
    if (!window.securityModule || !window.securityModule.checkAuthorization()) {
        window.securityModule.showAccessKeyDialog();
        return;
    }
    
    // Initialize audio engine
    initAudio();
    
    // Initialize piano display
    buildPiano();
    
    // Load song library
    await loadSongLibrary();
    
    // Wire up event listeners
    document.getElementById('random-practice-btn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('song-select').addEventListener('change', (e) => {
        if (e.target.value) {
            selectSong(e.target.value);
        }
    });
    
    document.getElementById('transpose-key').addEventListener('change', (e) => {
        handleTranspositionChange(e.target.value);
    });
    
    document.getElementById('start-btn').addEventListener('click', startSongPlayback);
    document.getElementById('stop-btn').addEventListener('click', stopSongPlayback);
    document.getElementById('step-btn').addEventListener('click', stepSongChord);
    document.getElementById('rewind-btn').addEventListener('click', rewindSongChord);
    
    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.querySelector('.settings-dropdown-container').classList.toggle('active');
    });
    
    document.querySelector('.settings-close-btn').addEventListener('click', () => {
        document.querySelector('.settings-dropdown-container').classList.remove('active');
    });
    
    document.querySelector('.settings-overlay').addEventListener('click', () => {
        document.querySelector('.settings-dropdown-container').classList.remove('active');
    });
    
    // Audio and metronome toggles
    document.getElementById('play-sound').addEventListener('change', function() {
        document.getElementById('header-play-sound').checked = this.checked;
    });
    
    document.getElementById('header-play-sound').addEventListener('change', function() {
        document.getElementById('play-sound').checked = this.checked;
    });
    
    document.getElementById('metronome').addEventListener('change', function() {
        document.getElementById('header-metronome').checked = this.checked;
    });
    
    document.getElementById('header-metronome').addEventListener('change', function() {
        document.getElementById('metronome').checked = this.checked;
    });
    
    // Volume controls
    document.getElementById('chord-volume').addEventListener('input', function() {
        updateChordVolume(this.value);
    });
    
    document.getElementById('metronome-volume').addEventListener('input', function() {
        updateMetronomeVolume(this.value);
    });
    
    // Octave selector
    document.getElementById('octave-selector').addEventListener('change', function() {
        localStorage.setItem('selectedOctave', this.value);
        buildPiano();
    });
    
    // Load saved preferences
    const savedOctave = localStorage.getItem('selectedOctave');
    if (savedOctave) {
        document.getElementById('octave-selector').value = savedOctave;
    }
    
    console.log('Song player initialized');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSongPlayer);
} else {
    initSongPlayer();
}
