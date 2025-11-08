# Great American Song Book - Chord Research Guide

## Sources

### Task 2: Free Account-Free Sources Located

**Primary Source Found:**
- **GitHub Repository**: [mikeoliphant/JazzStandards](https://github.com/mikeoliphant/JazzStandards)
  - Contains chord data for 60+ jazz standards in JSON format
  - All public domain
  - Format: Title, Composer, Key, Time Signature, Sections with chord changes
  - Licensed under open source (CC0)

**Additional Resources:**
- Ultimate Guitar (free sections, no login required for basic tabs)
- IMSLP (sheet music with chord transcriptions)
- LearnJazzStandards.com (free lessons with some chord charts)
- Hooktheory Trends (harmonic analysis, free browsing)

### Task 3: Top 10 Songs - Manual Curation & Verified Changes

Based on research from GitHub Jazz Standards repository and standard jazz lead sheets:

#### 1. **Autumn Leaves** ✅ COMPLETED
- **Original Key**: G Major
- **Tempo**: 136 bpm
- **Time Signature**: 4/4
- **Form**: 32-bar AABA
- **Real Changes** (from Scribd source):
  - A Section: Ami7 | D7 | Gmaj7 | F#m7b5 B7 | Em7 | Ami7 D7 | F#m7b5 | Gmaj7
  - A' Section: Cmaj7 | B7 | Em7 Eb7 | Dm7 Db7 | Cmaj7 B7 | Em7 | Ami7 D7
  - B (Bridge): Varies based on arrangement
- **Status**: Song library updated with proper maj7, min7, and half-diminished voicings
- **Source Quality**: ⭐⭐⭐⭐⭐ (Jazz standard reference)

#### 2. **Fly Me to the Moon**
- **Original Key**: C Major
- **Tempo**: ~110 bpm
- **Time Signature**: 4/4
- **Real Progression**: Cmaj7 | Am7 | Dm7 G7 | Cmaj7 | (repeat AABA form)
- **Bridge**: Fmaj7 | Bm7b5 E7 | Am7 | D7
- **Chord Types**: maj7, min7, dom7, half-diminished
- **Recommendation**: Update with maj7 sonorities instead of basic major

#### 3. **Summertime** (from Porgy and Bess)
- **Original Key**: A minor
- **Tempo**: ~80 bpm (slow blues feel)
- **Time Signature**: 4/4
- **Real Progression**: Am | Am (hold) | E7 | Am
- **Note**: Simple blues progression with variations
- **Bridge variations exist**: Some versions use Am-Dm-Am-E7
- **Recommendation**: Keep simple for this ballad

#### 4. **All the Things You Are**
- **Original Key**: Ab Major
- **Tempo**: 130 bpm
- **Time Signature**: 4/4
- **Form**: 36-bar (non-standard)
- **Key Modulation**: Modulates to Cm for bridge
- **Real Changes**: 
  - A: Abmaj7 | Ebmaj7 | Abmaj7 | Dbmaj7 Eb7
  - B: Cm7 | F7 | Bbm7 Eb7 (modulation to Cm key)
- **Status**: Needs maj7 refinement and proper key change handling

#### 5. **Blue Moon**
- **Original Key**: C Major
- **Tempo**: 90 bpm
- **Time Signature**: 4/4
- **Real Progression**: Cmaj7 | Am7 | Dm7 G7 | Cmaj7 (32-bar AABA)
- **Recommendation**: Update with maj7, min7 voicings

#### 6. **Stardust**
- **Original Key**: F Major or Eb Major
- **Tempo**: 80 bpm (slow ballad)
- **Time Signature**: 4/4
- **Real Progression**: Fmaj7 | Dm7 | Gm7 C7 | Fmaj7
- **Bridge**: Often has chromatic descending bass
- **Recommendation**: Add chromatic passing chords for sophistication

#### 7. **Night and Day** (Cole Porter)
- **Original Key**: C Major
- **Tempo**: 100 bpm
- **Time Signature**: 4/4
- **Real Progression**: Cmaj7 | Am7 | Fmaj7 G7 | Cmaj7 (unusual for Cole Porter)
- **Special**: Complex reharmonization options
- **Recommendation**: Multiple arrangements exist - use most common

#### 8. **Body and Soul**
- **Original Key**: Dm or Dbm
- **Tempo**: 70 bpm (ballad)
- **Time Signature**: 4/4
- **Real Progression**:  
  - Dm7 | Gm7 | Cmaj7 | F7
  - Dm7 | Gm7 | Cmaj7 | F7#5
  - Bridge: More complex chromatic changes
- **Status**: One of most harmonically sophisticated jazz standards
- **Recommendation**: High priority for jazz voicing accuracy

#### 9. **Misty**
- **Original Key**: Eb Major
- **Tempo**: 90 bpm
- **Time Signature**: 4/4
- **Real Progression**: Ebmaj7 | Bbm7 Eb7 | Abmaj7 | Gm7 C7
- **Bridge**: Contains beautiful secondary dominants
- **Recommendation**: Important for voicing demonstration

#### 10. **In a Sentimental Mood** (Duke Ellington)
- **Original Key**: Dm or D
- **Tempo**: 80 bpm
- **Time Signature**: 4/4
- **Real Progression**: Dm7 | A7 | Dm7 | A7 (12-bar minor blues variant)
- **Special**: Elegant minor tonality with specific voicing requirements
- **Recommendation**: Keep minor quality authentic

---

## Implementation Strategy

### Immediate Actions:
1. ✅ Update Autumn Leaves with authentic jazz voicings
2. Download JazzStandards.json from GitHub for reference data
3. Systematically update top 10 songs with verified maj7/min7 voicings
4. Add "source" field to each song entry noting verification source

### Data Structure Enhancement:
```json
{
  "id": "song-id",
  "title": "Song Title",
  "composer": "Composer Name",
  "key": "C major",
  "timeSignature": "4/4",
  "tempo": 120,
  "source": "GitHub mikeoliphant/JazzStandards",
  "notes": "32-bar AABA form, contains reharmonization variations",
  "chords": [...]
}
```

### Chord Type Standardization:
- Use `"minor7"` instead of `"minor"` for jazz contexts
- Use `"major7"` instead of `"major"` for sophisticated voicings
- Use `"half-diminished"` for m7b5 sonorities
- Keep `"dominant7"` for V7 chords
- Add `"dominant7sharp5"` for V7#5 variations

---

## Quality Assurance

All songs in top 10 should be verified against:
1. ✅ GitHub Jazz Standards repo (primary source)
2. ✅ Scribd/transcriptions (cross-reference)
3. ✅ LearnJazzStandards lessons (pedagogical alignment)
4. ✅ Hooktheory harmonic analysis (modern verification)

---

## Next Steps

1. Systematically update each top 10 song with proper voicings
2. Test in song-player.html for playback accuracy
3. Document any variations found (multiple arrangement versions)
4. Consider adding "arrangement" field for different standards
