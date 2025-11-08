# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Piano Chord Progression Trainer is a client-side Progressive Web App (PWA) for interactive music education. It requires no build process—vanilla ES6+ JavaScript runs directly in modern browsers. Bootstrap 5 and Tone.js are loaded from CDNs.

## Development Commands

### Local Development Server

Start a local server to develop and test:

```bash
# Python 3
python -m http.server 8000

# Node.js http-server
npx serve .
```

Then navigate to `http://localhost:8000`. Note: PWA features require HTTPS in production but work over `localhost` for development.

### Test Chord Generation

Verify the music theory engine generates all chord types correctly:

```bash
node verify-chord-types.js
```

This tests chord generation with all 11 supported types across random progressions and outputs a report of type distribution.

### Version Management

The app uses semantic versioning with automatic service worker cache invalidation.

**Automatic patch increment:**
```bash
./update-version.sh
```

**Explicit version with description:**
```bash
./update-version.sh 1.1.0 "Added inversions, improved audio on Android"
```

This updates `version.json` (which drives service worker cache invalidation). After updating the version, you must manually commit changes with `git commit`.

## Architecture Overview

### Module Interaction Flow

The application follows a layered architecture:

```
UI Layer (index.html + styles.css)
    ↓
App Orchestration (app.js)
    ↓
Practice Logic (practice-logic.js) — Manages session state & timing
    ↓
Music Theory (music-theory.js) ← Chord generation
    ↓
Tone Audio Engine (tone-audio-engine.js) — Audio synthesis & playback
    ↓
Piano Display (piano-display.js) — Visual keyboard highlighting
```

### Core Modules

**music-theory.js**
- Maintains diatonic chord mappings for all 24 major and minor keys
- Implements chord type system: major, minor, dominant7, major7, minor7, diminished, half-diminished, augmented, sus2, sus4, add9
- Handles enharmonic note spelling based on key context (e.g., F# vs Gb)
- Provides chord progression generation using Roman numeral analysis
- Contains 15+ predefined progression patterns (Pop, Jazz, Blues, etc.) plus random generation

**practice-logic.js**
- Implements state machine for practice sessions: stopped → lead-in countdown → playing → (step mode or continuous)
- Calculates timing using BPM, time signature (2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8, 12/8), and note values
- Manages metronome scheduling and beat tracking
- Handles lead-in beats, practice beats between chords, and chord repetitions
- Tracks alternating hands mode for left/right hand switching

**tone-audio-engine.js**
- Wraps Tone.js for Web Audio API access
- Loads Salamander Grand Piano samples from CDN (27 key samples across 7 octaves)
- Creates audio effect chain: Piano Sampler → Reverb (2.5s decay, 30% wet) → Destination
- Manages separate volume controls for chord and metronome channels
- Handles audio context initialization with special Android device handling
- Implements arpeggiation option for chord playback

**piano-display.js**
- Renders 3-octave visual keyboard (starts at C3 or C4 depending on octave selection)
- Highlights keys based on current chord and selected hand (right, left, both)
- Displays fingering numbers for piano technique guidance
- Responds to window resize to maintain responsive layout

**app.js**
- Single entry point triggered by DOMContentLoaded
- Orchestrates initialization: authorization check → PWA setup → audio init → event wiring
- Syncs header toggles with settings panel toggles
- Persists octave preference to localStorage
- Manages progression style defaults (loads pattern-specific settings when style changes)

**pwa-manager.js**
- Registers service worker and monitors installation status
- Detects version changes by polling version.json
- Triggers update notifications and install prompts to users
- Handles iOS full-screen mode (Safe Area, status bar styling, manual install instructions)
- Manages install button visibility based on PWA capability and installation status

**sw.js** (Service Worker)
- Runs cache-first strategy for offline functionality
- Caches app files plus Bootstrap 5, Bootstrap Icons, and Tone.js from CDNs
- Continuously monitors version.json for changes
- On version mismatch, invalidates old cache and triggers update notifications
- Maintains cache versioning using version.json's cacheVersion field

### Practice Session State Flow

1. **Initialization** - User configures settings (key, inversions, progression style, tempo, etc.)
2. **Play Button** - Generates progression, displays pills, enters lead-in beats countdown
3. **Lead-in Beats** - Plays metronome clicks (if enabled) for preparation
4. **Chord Playback** - 
   - If continuous mode: plays each chord for calculated duration (BPM + time signature + note value)
   - If step mode: waits for Step button press before advancing
   - Highlights piano keys and displays fingering
   - Plays audio through reverb chain (if Audio enabled)
5. **Practice Beats** - If Practice Beats button pressed, extends current chord duration
6. **Stop/Rewind** - User can stop session or go back to previous chord
7. **Metronome** - Optional click track with configurable volume, plays on chord changes and during lead-in

### Data Persistence

- **localStorage**: Settings (octave preference, volume levels for chord and metronome)
- **No backend**: All computation client-side; no user accounts or server-side storage
- **No database**: Progressive is generated on-the-fly or loaded from hardcoded patterns

### Security System

The app includes optional access control via security.js:
- Checks authorization on app load
- Shows access key dialog if user is not authorized
- Can enforce access keys for deployment scenarios

---

## Development Workflow

### Making Code Changes

1. Edit source files directly (no build step required)
2. Refresh browser to test changes
3. After significant changes, run chord verification: `node verify-chord-types.js`

### Versioning & Deployment

1. Make code changes
2. Test locally at `http://localhost:8000`
3. Increment version: `./update-version.sh` or `./update-version.sh X.Y.Z "description"`
4. Manually commit: `git add -A && git commit -m "Release version X.Y.Z: description"`
5. Deploy all files (including updated version.json)
6. Service worker detects version change on user's next visit → automatic cache invalidation → update prompt

### PWA Deployment Requirements

- **HTTPS required** for production (localhost works for development)
- **Correct MIME types**: Ensure `.json` files serve as `application/json`, `.js` as `application/javascript`
- **Service worker path**: sw.js must be in root or scope must be set appropriately
- **Icons**: manifest.json references PNG icons (72x72 through 512x512) in `/icons/` directory
- **Manifest valid**: manifest.json must be accessible and valid JSON

---

## Key Technical Patterns

### Audio Context Lifecycle

Android devices require special handling:
1. Audio context is **not** started during app initialization
2. On first Audio toggle or chord playback, `ensureAudioContext()` is called
3. This allows Android to properly initialize audio permissions
4. PC/Mac start audio context immediately during app init

### Chord Generation Algorithm

For random progressions:
1. Generate random scale degrees using next-chord probabilities
2. Look up corresponding chord name in diatonic mappings
3. Apply selected chord type (if diatonic chord type differs from selected type, substitute)
4. Choose random inversion from selected inversions
5. Append to progression array

### Version Detection

Service worker checks version.json:
- On every app load (via cache + background fetch)
- Periodically (5-minute intervals)
- On app focus/visibility changes
- PWA Manager displays update notification with install button

---

## Song Library Feature (Great American Song Book)

The app includes a dedicated Song Library mode for practicing Great American Song Book standards with realistic chord timing.

### Song Library Architecture

**songs-library.json**
- Contains 50 public domain songs from the Great American Song Book
- Each song entry includes: `id`, `title`, `composer`, `key`, `timeSignature`, `tempo`
- Chord array with individual timing: each chord has `root`, `type`, `inversion`, and `duration` (in milliseconds)
- Realistic durations reflect actual song structure (e.g., some chords lasting 2 beats, others 8 beats)

**song-player.html**
- Dedicated page for song library practice mode
- Nearly identical layout to `index.html` but with song selection instead of progression settings
- Displays song metadata (title, composer, original key, time signature, tempo)
- Key transposition selector allows practicing songs in different keys
- Chord pills include duration badges showing how long each chord plays

**song-player-logic.js**
- Song library loading and selector management
- Song selection and metadata display
- Chord transposition engine: calculates semitone offsets and transposes all chords
- Playback timing engine: honors individual chord durations instead of uniform timing
- Lead-in countdown, step mode, continuous mode, and stop/rewind functionality
- All playback controls sync with existing audio engine

**song-player-audio.js**
- Optional module for precise Tone.js Transport scheduling
- Provides functions to schedule individual chords with exact timing
- Supports queue-based playback with sample-accurate timing
- Can be extended in future for advanced features (swing, arpeggiation patterns, etc.)

### Song Playback Flow

1. **User loads song-player.html** → Initializes audio, piano display, song library
2. **User selects song** → Song metadata displays, chords render with duration badges
3. **User selects transposition key** (optional) → All chords transpose, display updates
4. **User presses Play** → Lead-in countdown begins (if configured)
5. **Lead-in complete** → First chord plays with its specific duration
6. **Chord advances** → Next chord plays for its duration (continuous mode) or waits for Step (step mode)
7. **Navigation** → User can Step forward, go Back to previous chord, or Stop
8. **End of song** → Playback automatically stops at last chord

### Key Differences from Random Practice Mode

- **Timing**: Song mode uses individual per-chord durations; random mode uses uniform calculated timing
- **Progression source**: Song mode loads from JSON file; random mode generates algorithmically
- **Transposition**: Song mode supports key changes; random mode generates in selected key
- **UI layout**: Separate pages with different settings panels
- **Metadata**: Song mode displays title, composer, original key; random mode shows progression style

### Adding Songs to Library

To add new songs:
1. Edit `songs-library.json`
2. Add new entry with id, title, composer, key, timeSignature, tempo
3. Populate `chords` array with root, type, inversion, and duration for each chord
4. Duration should reflect actual song bar structure (typical quarter note = 500ms at 120 BPM)
5. Test by loading song-player.html and selecting the new song

---

## Conventions

- **No transpilation**: Use ES6+ but avoid modern syntax unsupported in target browsers
- **Event-driven UI**: UI state changes trigger event listeners that update display
- **Music notation**: Roman numerals (I, IV, V) for diatonic degrees; note names for absolute pitches
- **Volume values**: 0-1 float range for Tone.js, converted to dB with `Tone.gainToDb()`
- **Time format**: All timing in milliseconds calculated from BPM and time signature
- **Song data structure**: Chords include duration in milliseconds for realistic playback timing
