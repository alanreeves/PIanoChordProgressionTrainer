// Rhythm Patterns Module - Musical rhythmic patterns for song player chord playback

// Rhythm pattern definitions
// Each pattern includes timing offsets, velocity multipliers, and duration multipliers
// Patterns apply cyclically to notes within each chord (bass note, then chord tones)
const RHYTHM_PATTERNS = {
  none: {
    name: "None",
    description: "Straight timing with no rhythmic variation",
    notePattern: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 1.0 }
    ]
  },
  swing: {
    name: "Swing",
    description: "Jazz swing feel with eighth note triplet timing",
    notePattern: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 0.9 },
      { offset: 0.05, velocityMultiplier: 0.85, durationMultiplier: 0.85 },
      { offset: 0.10, velocityMultiplier: 0.75, durationMultiplier: 0.80 }
    ]
  },
  bossaNova: {
    name: "Bossa Nova",
    description: "Brazilian bossa nova rhythmic pattern",
    notePattern: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 0.7 },
      { offset: 0.15, velocityMultiplier: 0.6, durationMultiplier: 0.6 },
      { offset: 0.35, velocityMultiplier: 0.8, durationMultiplier: 0.7 }
    ]
  },
  rock: {
    name: "Rock",
    description: "Driving rock rhythm with strong downbeats",
    notePattern: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 0.85 },
      { offset: 0.08, velocityMultiplier: 0.9, durationMultiplier: 0.80 },
      { offset: 0.12, velocityMultiplier: 0.7, durationMultiplier: 0.75 }
    ]
  },
  jazzWaltz: {
    name: "Jazz Waltz",
    description: "3/4 jazz waltz feel with emphasis on beat 1",
    notePattern: [
      { offset: 0, velocityMultiplier: 1.0, durationMultiplier: 0.9 },
      { offset: 0.10, velocityMultiplier: 0.7, durationMultiplier: 0.8 },
      { offset: 0.18, velocityMultiplier: 0.75, durationMultiplier: 0.8 }
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

  // Apply rhythm pattern cyclically to notes
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
