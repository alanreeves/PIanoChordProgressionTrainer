// Rhythm Patterns Module - Musical rhythmic patterns for song player chord playback
// Each pattern breaks a chord into multiple note events (comping pattern) for authentic rhythm feel

/**
 * Rhythm Pattern Structure:
 * Each pattern contains 'noteTiming' array that defines how to break up a chord across a measure.
 * - offset: Time in seconds from measure start (calculated as fraction of total duration)
 * - velocityMultiplier: Note strength (1.0 = normal, 0.8 = soft, 0.6 = very soft)
 * - durationMultiplier: How long note sustains (shorter = more staccato/percussive)
 * - noteIndex: Which note to play (0=bass/root, 1=second, 2=third, etc., or -1 for full chord)
 * 
 * When noteIndex is -1, the entire chord plays. Otherwise, individual notes are played
 * in a rhythmic pattern to simulate authentic comping/accompaniment styles.
 */

const RHYTHM_PATTERNS = {
  none: {
    name: "None",
    description: "Straight timing - full chord plays once at start",
    noteTiming: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 1.0, noteIndex: -1 }
    ]
  },
  swing: {
    name: "Swing",
    description: "Jazz swing comping - broken chord with triplet feel (1-and-a, 3-and-a pattern)",
    noteTiming: [
      // Measure broken into 8th note triplets (swing feel): beat 1 = 1-trip-let, beat 2 = 2-trip-let, etc
      // Beat 1 (triplet subdivision): on-beat, off-beat, on-beat
      { offset: 0.00, velocityMultiplier: 1.0, durationMultiplier: 0.4, noteIndex: 0 },      // Root on beat 1
      { offset: 0.10, velocityMultiplier: 0.7, durationMultiplier: 0.3, noteIndex: -1 },    // Full chord (swing-delayed)
      { offset: 0.20, velocityMultiplier: 0.8, durationMultiplier: 0.3, noteIndex: 1 },     // Third (if exists)
      
      // Beat 2 (off-beat/syncopated)
      { offset: 0.35, velocityMultiplier: 0.6, durationMultiplier: 0.3, noteIndex: -1 },    // Soft full chord
      { offset: 0.50, velocityMultiplier: 0.9, durationMultiplier: 0.4, noteIndex: 0 },     // Root reinforcement
      
      // Beat 3 (similar to beat 1)
      { offset: 0.65, velocityMultiplier: 1.0, durationMultiplier: 0.4, noteIndex: 0 },     // Root on beat 3
      { offset: 0.75, velocityMultiplier: 0.7, durationMultiplier: 0.3, noteIndex: -1 },    // Full chord (swing-delayed)
      { offset: 0.85, velocityMultiplier: 0.8, durationMultiplier: 0.3, noteIndex: 1 },     // Third
      
      // Beat 4 (syncopated)
      { offset: 0.95, velocityMultiplier: 0.6, durationMultiplier: 0.3, noteIndex: -1 }     // Soft full chord
    ]
  },
  bossaNova: {
    name: "Bossa Nova",
    description: "Brazilian bossa nova - syncopated samba-influenced pattern (3+2+1 rhythm)",
    noteTiming: [
      // Classic bossa nova clave rhythm: downbeat, offbeat syncopation
      // Strong hits on 1 and 3, with syncopated offbeats
      { offset: 0.00, velocityMultiplier: 1.0, durationMultiplier: 0.35, noteIndex: 0 },    // Strong: beat 1 root
      { offset: 0.15, velocityMultiplier: 0.8, durationMultiplier: 0.3, noteIndex: -1 },    // 1-and: full chord
      { offset: 0.30, velocityMultiplier: 0.5, durationMultiplier: 0.25, noteIndex: 1 },    // Light: offbeat third
      
      { offset: 0.42, velocityMultiplier: 0.6, durationMultiplier: 0.3, noteIndex: -1 },    // 2-and: soft full chord
      { offset: 0.58, velocityMultiplier: 0.5, durationMultiplier: 0.25, noteIndex: 2 },    // Light: fifth
      
      { offset: 0.67, velocityMultiplier: 1.0, durationMultiplier: 0.35, noteIndex: 0 },    // Strong: beat 3 root
      { offset: 0.82, velocityMultiplier: 0.8, durationMultiplier: 0.3, noteIndex: -1 },    // 3-and: full chord
      { offset: 0.92, velocityMultiplier: 0.7, durationMultiplier: 0.25, noteIndex: 1 }     // Light: third
    ]
  },
  rock: {
    name: "Rock",
    description: "Rock/Pop - power-chord rhythm with strong backbeats and off-beat stabs",
    noteTiming: [
      // Typical rock pattern: strong on 1, soft punctuation on 2-and, strong on 3, accent 4
      { offset: 0.00, velocityMultiplier: 1.0, durationMultiplier: 0.4, noteIndex: 0 },     // Beat 1: strong root
      { offset: 0.08, velocityMultiplier: 0.8, durationMultiplier: 0.35, noteIndex: -1 },   // Beat 1-and: full chord
      
      { offset: 0.25, velocityMultiplier: 0.5, durationMultiplier: 0.25, noteIndex: -1 },   // Beat 2: soft stab
      { offset: 0.37, velocityMultiplier: 0.9, durationMultiplier: 0.3, noteIndex: -1 },    // Beat 2-and: strong (backbeat)
      
      { offset: 0.50, velocityMultiplier: 1.0, durationMultiplier: 0.4, noteIndex: 0 },     // Beat 3: root
      { offset: 0.58, velocityMultiplier: 0.8, durationMultiplier: 0.35, noteIndex: -1 },   // Beat 3-and: full chord
      
      { offset: 0.75, velocityMultiplier: 0.5, durationMultiplier: 0.25, noteIndex: -1 },   // Beat 4: soft stab
      { offset: 0.87, velocityMultiplier: 1.0, durationMultiplier: 0.3, noteIndex: -1 }     // Beat 4-and: accent (leading to 1)
    ]
  },
  jazzWaltz: {
    name: "Jazz Waltz",
    description: "3/4 jazz waltz - comping pattern emphasizing beat 1 with rhythmic fills",
    noteTiming: [
      // 3/4 time: beats are at 0, 0.33, 0.67 of the measure
      { offset: 0.00, velocityMultiplier: 1.0, durationMultiplier: 0.4, noteIndex: 0 },     // Beat 1: strong root
      { offset: 0.08, velocityMultiplier: 0.8, durationMultiplier: 0.35, noteIndex: -1 },   // 1-and: full chord
      { offset: 0.16, velocityMultiplier: 0.6, durationMultiplier: 0.3, noteIndex: 1 },     // 1-trip: third
      
      { offset: 0.33, velocityMultiplier: 0.7, durationMultiplier: 0.35, noteIndex: -1 },   // Beat 2: softer chord
      { offset: 0.42, velocityMultiplier: 0.5, durationMultiplier: 0.25, noteIndex: 2 },    // 2-and: light fifth
      
      { offset: 0.67, velocityMultiplier: 0.7, durationMultiplier: 0.35, noteIndex: -1 },   // Beat 3: softer chord
      { offset: 0.75, velocityMultiplier: 0.6, durationMultiplier: 0.3, noteIndex: 0 }      // 3-and: root
    ]
  }
};

/**
 * Get a rhythm pattern by name
 * @param {string} rhythmName - Name of the rhythm pattern
 * @returns {object} Rhythm pattern object
 */
function getRhythmPattern(rhythmName) {
  return RHYTHM_PATTERNS[rhythmName] || RHYTHM_PATTERNS.none;
}

/**
 * Apply rhythm pattern to notes with timing offsets and articulation
 * @param {array} notes - Array of note objects to apply rhythm to
 * @param {string} rhythmName - Name of the rhythm pattern to apply
 * @param {number} baseTime - Tone.js time to start the rhythm
 * @returns {array} Notes with rhythm modifications applied
 */
function applyRhythmToNotes(notes, rhythmName, baseTime) {
  const pattern = getRhythmPattern(rhythmName);
  
  if (rhythmName === 'none' || !pattern) {
    // No rhythm modification - return notes with baseline timing
    return notes.map(note => ({
      ...note,
      time: baseTime,
      velocity: note.velocity || 0.8,
      duration: note.duration || 1.0
    }));
  }

  // New pattern format with noteTiming array and noteIndex selection
  if (pattern.noteTiming) {
    const result = [];
    
    // For each timing event in the pattern
    pattern.noteTiming.forEach(timing => {
      if (timing.noteIndex === -1) {
        // -1 means play all notes (full chord)
        notes.forEach((note, index) => {
          result.push({
            ...note,
            time: baseTime + timing.offset,
            velocity: (note.velocity || 0.8) * timing.velocityMultiplier,
            duration: (note.duration || 1.0) * timing.durationMultiplier
          });
        });
      } else if (timing.noteIndex < notes.length) {
        // Play specific note by index
        const note = notes[timing.noteIndex];
        result.push({
          ...note,
          time: baseTime + timing.offset,
          velocity: (note.velocity || 0.8) * timing.velocityMultiplier,
          duration: (note.duration || 1.0) * timing.durationMultiplier
        });
      }
    });
    
    return result;
  }

  // Fallback to old pattern format (for backwards compatibility)
  if (pattern.notePattern) {
    return notes.map((note, index) => {
      const patternIndex = index % pattern.notePattern.length;
      const rhythmData = pattern.notePattern[patternIndex];
      
      return {
        ...note,
        time: baseTime + rhythmData.offset,
        velocity: (note.velocity || 0.8) * rhythmData.velocityMultiplier,
        duration: (note.duration || 1.0) * rhythmData.durationMultiplier
      };
    });
  }
  
  return notes;
}

/**
 * Get all available rhythm pattern names and descriptions
 * @returns {array} Array of {name, key, description} objects
 */
function getAvailableRhythms() {
  return Object.entries(RHYTHM_PATTERNS).map(([key, pattern]) => ({
    key: key,
    name: pattern.name,
    description: pattern.description
  }));
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RHYTHM_PATTERNS,
    getRhythmPattern,
    applyRhythmToNotes,
    getAvailableRhythms
  };
}
