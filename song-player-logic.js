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
let songMetronomeInterval = null;  // Track metronome interval for cleanup
let songStepMode = false;
let songWaitingForStep = false;
let currentRhythm = 'none';  // Track selected rhythm pattern

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

// Get current rhythm pattern
function getCurrentRhythm() {
    return currentRhythm;
}

// Initialize rhythm selector event listener
function initializeRhythmSelector() {
    const rhythmSelector = document.getElementById('rhythm-selector');
    if (rhythmSelector) {
        rhythmSelector.addEventListener('change', (e) => {
            currentRhythm = e.target.value;
            console.log(`[Rhythm] Pattern changed to: ${currentRhythm}`);
        });
        // Initialize with default value
        currentRhythm = rhythmSelector.value || 'none';
    }
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
    
    // Apply intelligent inversions to the chord progression
    applyIntelligentInversions(currentSongChords);
    
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

// Display chord progression pills with bar structure
function displaySongProgressionPills(chords, tempo, timeSignature) {
    const display = document.getElementById('progression-display');
    if (!display || !chords) return;
    
    const beatsPerBar = getBeatsPerBar(timeSignature);
    // At 120 BPM reference: 60000ms/min ÷ 120 BPM = 500ms per beat
    // Bar duration = beats per bar × 500ms (calculated at 120 BPM reference)
    const standardBarDuration = beatsPerBar * (60 * 1000) / 120;  // Dynamic based on time signature
    
    display.innerHTML = '';
    
    let barStartIndex = 0;
    let currentBarDuration = 0;
    let barAccumulator = [];
    
    chords.forEach((chord, index) => {
        const chordDuration = chord.duration;
        
        // Check if adding this chord would exceed bar duration (with 15% tolerance)
        const wouldExceedBar = (currentBarDuration + chordDuration) > standardBarDuration * 1.15;
        const isNewBar = wouldExceedBar && currentBarDuration > 0;
        
        if (isNewBar) {
            // Render previous bar
            renderBar(display, barAccumulator, barStartIndex);
            
            // Add bar separator
            const separator = document.createElement('span');
            separator.className = 'bar-separator';
            separator.textContent = ' | ';
            display.appendChild(separator);
            
            // Reset for new bar
            barAccumulator = [chord];
            barStartIndex = index;
            currentBarDuration = chordDuration;
        } else {
            barAccumulator.push(chord);
            currentBarDuration += chordDuration;
        }
    });
    
    // Render last bar
    if (barAccumulator.length > 0) {
        renderBar(display, barAccumulator, barStartIndex);
    }
}

// Helper function to render a single bar of chords
function renderBar(display, chords, startIndex) {
    chords.forEach((chord, barChordIndex) => {
        const chordIndex = startIndex + barChordIndex;
        
        // Create pill element
        const pill = document.createElement('span');
        pill.className = 'progression-pill chord-pill';
        pill.id = `chord-pill-${chordIndex}`;
        
        // Format chord display
        let chordDisplay = chord.root + (chord.type !== 'major' ? formatChordType(chord.type) : '');
        if (chord.inversion !== 'root' && document.getElementById('slash-notation') && document.getElementById('slash-notation').checked) {
            const bassNote = getInversionBassNote(chord.root, chord.type, chord.inversion);
            chordDisplay += `/${bassNote}`;
        }
        
        pill.textContent = chordDisplay;
        pill.setAttribute('data-toggle', 'tooltip');
        pill.title = chordDisplay;
        
        display.appendChild(pill);
        
        // Add separator between chords in same bar
        if (barChordIndex < chords.length - 1) {
            const separator = document.createElement('span');
            separator.className = 'chord-separator';
            separator.textContent = ' / ';
            display.appendChild(separator);
        }
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

// Apply intelligent inversions to entire chord progression
function applyIntelligentInversions(chords) {
    // Check if inversions are enabled
    const firstInvEnabled = document.getElementById('inv-first') && document.getElementById('inv-first').checked;
    const secondInvEnabled = document.getElementById('inv-second') && document.getElementById('inv-second').checked;
    
    // If neither inversion is enabled, keep all chords in root position
    if (!firstInvEnabled && !secondInvEnabled) {
        console.log('[Voice Leading] No inversions enabled - keeping all chords in root position');
        chords.forEach(chord => chord.inversion = 'root');
        return;
    }
    
    console.log(`[Voice Leading] Applying intelligent inversions - First: ${firstInvEnabled}, Second: ${secondInvEnabled}`);
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    chords.forEach((chord, index) => {
        const intelligentInversion = getIntelligentInversion(index, chords, firstInvEnabled, secondInvEnabled);
        if (intelligentInversion) {
            chord.inversion = intelligentInversion;
            console.log(`  Chord ${index}: ${chord.root} → ${intelligentInversion} inversion`);
        } else {
            chord.inversion = 'root';
        }
    });
}

// Determine intelligent inversion for voice leading
function getIntelligentInversion(currentIndex, chords, firstInvEnabled, secondInvEnabled) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const currentChord = chords[currentIndex];
    
    // Get previous chord if exists
    const previousChord = currentIndex > 0 ? chords[currentIndex - 1] : null;
    
    // Get current chord tones (normalize root note)
    const normalizedCurrentRoot = normalizeNoteName(currentChord.root);
    const currentRootIndex = noteNames.indexOf(normalizedCurrentRoot);
    if (currentRootIndex === -1) {
        console.warn(`Cannot compute inversion for ${currentChord.root}`);
        return 'root';
    }
    const currentRoot = currentChord.root;
    const currentThird = noteNames[(currentRootIndex + 4) % 12];
    const currentFifth = noteNames[(currentRootIndex + 7) % 12];
    
    // Get previous bass note (the lowest note to minimize voice leading distance)
    let previousBass = previousChord ? getNoteNameForBassPosition(previousChord, noteNames) : currentRoot;
    
    // Calculate distance for each possible inversion (in semitones)
    const rootDistance = calculateNoteDistance(previousBass, currentRoot);
    const firstInvDistance = firstInvEnabled ? calculateNoteDistance(previousBass, currentThird) : Infinity;
    const secondInvDistance = secondInvEnabled ? calculateNoteDistance(previousBass, currentFifth) : Infinity;
    
    // Find the best inversion (minimum distance)
    let bestInversion = 'root';
    let minDistance = rootDistance;
    
    if (firstInvDistance < minDistance) {
        bestInversion = 'first';
        minDistance = firstInvDistance;
    }
    if (secondInvDistance < minDistance) {
        bestInversion = 'second';
        minDistance = secondInvDistance;
    }
    
    return bestInversion;
}

// Helper function to get the bass note for a chord based on its current inversion
function getNoteNameForBassPosition(chord, noteNames) {
    const normalizedRoot = normalizeNoteName(chord.root);
    const rootIndex = noteNames.indexOf(normalizedRoot);
    
    if (rootIndex === -1) {
        console.warn(`Invalid root note: ${chord.root}`);
        return chord.root;
    }
    
    if (chord.inversion === 'first') {
        return noteNames[(rootIndex + 4) % 12];  // Third is bass
    } else if (chord.inversion === 'second') {
        return noteNames[(rootIndex + 7) % 12];  // Fifth is bass
    }
    return chord.root;  // Root is bass
}

// Helper function to normalize note names (convert flats to sharps for consistent lookup)
function normalizeNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatToSharp = {
        'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
    };
    
    // If it's a flat notation, convert to sharp
    if (flatToSharp[note]) {
        return flatToSharp[note];
    }
    return note;
}

// Helper function to calculate minimum distance between two notes (in semitones)
function calculateNoteDistance(fromNote, toNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const normalizedFrom = normalizeNoteName(fromNote);
    const normalizedTo = normalizeNoteName(toNote);
    
    const fromIndex = noteNames.indexOf(normalizedFrom);
    const toIndex = noteNames.indexOf(normalizedTo);
    
    if (fromIndex === -1 || toIndex === -1) {
        console.warn(`Invalid notes for distance calculation: ${normalizedFrom} (${fromIndex}), ${normalizedTo} (${toIndex})`);
        return Infinity;
    }
    
    // Calculate both upward and downward distances
    const upDistance = (toIndex - fromIndex + 12) % 12;
    const downDistance = (fromIndex - toIndex + 12) % 12;
    
    // Return the minimum distance
    return Math.min(upDistance, downDistance);
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
    
    // Set transport BPM from slider (or use song's tempo if slider not set)
    const bpmSlider = document.getElementById('bpm-slider');
    const effectiveBPM = bpmSlider ? parseInt(bpmSlider.value, 10) : currentSong.tempo;
    setSongTransportBPM(effectiveBPM);
    
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
    
    // Use BPM slider value if available, otherwise use song's tempo
    const bpmSlider = document.getElementById('bpm-slider');
    const effectiveBPM = bpmSlider ? parseInt(bpmSlider.value, 10) : currentSong.tempo;
    const msPerBeat = (60 * 1000) / effectiveBPM;
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
    
    // Loop back to start instead of stopping at the end
    if (songCurrentChordIndex >= currentSongChords.length) {
        songCurrentChordIndex = 0;
    }
    
    const chord = currentSongChords[songCurrentChordIndex];
    // Get effective BPM from slider, use that to calculate chord duration
    const bpmSlider = document.getElementById('bpm-slider');
    const effectiveBPM = bpmSlider ? parseInt(bpmSlider.value, 10) : currentSong.tempo;
    const msPerBeat = (60 * 1000) / effectiveBPM;
    
    // Chord duration is stored at 120 BPM (2000ms per 4-beat bar)
    // When BPM changes, scale the duration accordingly
    // Example: at 100 BPM, a 2000ms chord should play for 2400ms (slower)
    // Formula: stored_duration * (120 / effectiveBPM)
    const chordDurationMs = chord.duration * (120 / effectiveBPM);
    
    // Update display with stored inversion (already calculated during load)
    updateActiveSongPill(songCurrentChordIndex);
    
    // Play chord sound with duration matching the chord duration
    if (document.getElementById('play-sound').checked) {
        const rhythmPattern = getCurrentRhythm();
        playChordSoundWithDuration(chord.root, chord.type, chord.inversion, chordDurationMs, rhythmPattern);
    }
    
    // Highlight on piano
    highlightChordOnPiano(chord.root, chord.type, chord.inversion);
    
    // Schedule next chord if in continuous mode
    // Also schedule metronome clicks on every beat within the chord duration
    if (!songStepMode && songIsRunning) {
        clearInterval(songPlaybackInterval);
        
        // Get beats per bar from time signature
        const beatsPerBar = getBeatsPerBar(currentSong.timeSignature);
        const msPerBarAtStandardTempo = beatsPerBar * (60 * 1000) / 120;  // Duration at 120 BPM
        const msPerBeatAtEffectiveTempo = msPerBeat;  // Duration at effective BPM
        const beatsInThisChord = chordDurationMs / msPerBeatAtEffectiveTempo;
        
        // Schedule metronome clicks every beat
        let beatCounter = 0;
        // Clear any existing metronome interval
        if (songMetronomeInterval) clearInterval(songMetronomeInterval);
        
        songMetronomeInterval = setInterval(() => {
            beatCounter++;
            if (beatCounter <= beatsInThisChord && document.getElementById('metronome').checked) {
                // First beat of chord is downbeat, others are regular beats
                const isDownbeat = beatCounter === 1;
                playMetronomeClick(isDownbeat);
            }
            if (beatCounter >= beatsInThisChord) {
                clearInterval(songMetronomeInterval);
                songMetronomeInterval = null;
            }
        }, msPerBeatAtEffectiveTempo);
        
        // Schedule next chord at the end of this chord's duration
        songPlaybackInterval = setTimeout(() => {
            if (songMetronomeInterval) clearInterval(songMetronomeInterval);
            songMetronomeInterval = null;
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
    
    // Update display with stored inversion (already calculated during load)
    updateActiveSongPill(songCurrentChordIndex);
    
    // Play chord sound with persistent duration
    if (document.getElementById('play-sound').checked) {
        const bpmSlider = document.getElementById('bpm-slider');
        const effectiveBPM = bpmSlider ? parseInt(bpmSlider.value, 10) : currentSong.tempo;
        // Duration is stored at 120 BPM, scale based on current BPM
        const chordDurationMs = chord.duration * (120 / effectiveBPM);
        const rhythmPattern = getCurrentRhythm();
        playChordSoundWithDuration(chord.root, chord.type, chord.inversion, chordDurationMs, rhythmPattern);
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
    if (songMetronomeInterval) clearInterval(songMetronomeInterval);
    songMetronomeInterval = null;
    
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

// Load and display version
async function loadAndDisplayVersion() {
    try {
        const response = await fetch('version.json');
        if (response.ok) {
            const data = await response.json();
            const versionElement = document.getElementById('version-number');
            if (versionElement) {
                versionElement.textContent = data.version;
            }
        }
    } catch (error) {
        console.warn('Could not load version:', error);
    }
}

// Initialize song player on DOMContentLoaded
async function initSongPlayer() {
    // Load version first
    await loadAndDisplayVersion();
    
    // Check authorization first (if security module exists)
    if (window.securityModule && typeof window.securityModule.checkAuthorization === 'function') {
        if (!window.securityModule.checkAuthorization()) {
            window.securityModule.showAccessKeyDialog();
            return;
        }
    }
    
    // Initialize audio engine
    initAudio();
    
    // Initialize piano display
    buildPiano();
    
    // Load song library
    await loadSongLibrary();
    
    // Initialize rhythm selector
    initializeRhythmSelector();
    
    // Wire up event listeners with null checks
    // Random Practice button is now an <a> link, no event listener needed
    
    const songSelect = document.getElementById('song-select');
    if (songSelect) {
        songSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                selectSong(e.target.value);
            }
        });
    }
    
    const transposeKey = document.getElementById('transpose-key');
    if (transposeKey) {
        transposeKey.addEventListener('change', (e) => {
            handleTranspositionChange(e.target.value);
        });
    }
    
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startSongPlayback);
    }
    
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', stopSongPlayback);
    }
    
    const stepBtn = document.getElementById('step-btn');
    if (stepBtn) {
        stepBtn.addEventListener('click', stepSongChord);
    }
    
    const rewindBtn = document.getElementById('rewind-btn');
    if (rewindBtn) {
        rewindBtn.addEventListener('click', rewindSongChord);
    }
    
    // Settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            const container = document.querySelector('.settings-dropdown-container');
            const dropdown = document.querySelector('.settings-dropdown');
            if (container && dropdown) {
                container.classList.toggle('active');
                dropdown.classList.toggle('active');
            }
        });
    }
    
    const closeBtn = document.querySelector('.settings-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const container = document.querySelector('.settings-dropdown-container');
            const dropdown = document.querySelector('.settings-dropdown');
            if (container && dropdown) {
                container.classList.remove('active');
                dropdown.classList.remove('active');
            }
        });
    }
    
    const overlay = document.querySelector('.settings-overlay');
    if (overlay) {
        overlay.addEventListener('click', () => {
            const container = document.querySelector('.settings-dropdown-container');
            const dropdown = document.querySelector('.settings-dropdown');
            if (container && dropdown) {
                container.classList.remove('active');
                dropdown.classList.remove('active');
            }
        });
    }
    
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
    
    // BPM slider functionality
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmValue = document.getElementById('bpm-value');
    if (bpmSlider && bpmValue) {
        bpmSlider.addEventListener('input', function() {
            const newBPM = parseInt(this.value, 10);
            bpmValue.textContent = newBPM;
            
            // Update the current song's effective tempo
            if (currentSong) {
                currentSong.effectiveTempo = newBPM;
                // Update transport BPM if currently playing
                if (typeof setSongTransportBPM === 'function') {
                    setSongTransportBPM(newBPM);
                }
                // Recalculate and redisplay chord progression with new timing
                if (currentSongChords && currentSongChords.length > 0) {
                    displaySongProgressionPills(currentSongChords, newBPM, currentSong.timeSignature);
                }
            }
        });
    }
    
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
