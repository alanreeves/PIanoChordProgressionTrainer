# Piano Chord Progression Trainer Documentation

## Overview

The Piano Chord Progression Trainer (pianochords.uk) is a comprehensive web-based application designed to help piano students and musicians practice chord progressions interactively. The app combines visual piano keyboard display, professional-quality audio synthesis, and extensive music theory implementation to create an effective learning environment for chord practice.

## Core Features

### 🎹 Interactive Piano Keyboard
- **Visual Display**: 3-octave piano keyboard with white and black keys
- **Chord Highlighting**: Real-time visual feedback showing which keys to press
- **Fingering Numbers**: Displays recommended fingering for both hands
- **Responsive Design**: Adapts to different screen sizes (desktop, tablet, mobile)

### 🎵 Professional Audio Engine
- **Sampled Piano**: Uses high-quality Salamander Grand Piano samples
- **Realistic Sound**: Includes reverb and natural timing variations
- **Arpeggiation**: Option to play chords as arpeggios or block chords
- **Volume Control**: Separate volume controls for chords and metronome

### 🎼 Comprehensive Music Theory
- **All Keys**: Support for all 24 major and minor keys
- **Chord Types**: Major, minor, 7th chords, diminished, augmented, sus chords, add9
- **Inversions**: Root position, first inversion, second inversion
- **Proper Enharmonics**: Correct note spelling based on key context

### 📚 Predefined Progressions
- **Popular Styles**: Pop, Jazz, Blues, Classical progressions
- **Famous Patterns**: Pachelbel's Canon, 12-bar blues, circle of fifths
- **Educational Value**: Learn common chord progressions used in various musical styles

### ⏱️ Practice Tools
- **Multiple Modes**: Continuous play, step-by-step, manual control
- **Metronome**: Built-in metronome with tempo control
- **Lead-in Beats**: Preparation time before progression starts
- **Practice Beats**: Extra time between chords for practice

## User Interface Components

### Header Bar
- **App Title**: "pianochords.uk" branding
- **Quick Controls**: Audio and metronome toggle switches
- **Settings Button**: Access to detailed configuration options
- **Help Button**: Built-in help documentation

### Settings Panel
Comprehensive configuration options including:

#### Playback Controls
- **Audio On/Off**: Enable/disable chord playback
- **Volume Sliders**: Separate controls for chord and metronome volume
- **Arpeggiate**: Toggle between block chords and arpeggiation
- **Octave Selection**: Choose pitch range (Low, Middle, High)
- **Metronome**: Enable/disable click track

#### Musical Settings
- **Key Selection**: All 24 major and minor keys
- **Hand Selection**: Right hand, left hand, or alternating hands
- **Chord Types**: Multiple checkboxes for different chord qualities
- **Inversions**: Root position, first inversion, second inversion
- **Slash Notation**: Display inversions using slash chord notation

#### Progression Settings
- **Style Selection**: Choose from predefined progressions or random generation
- **Length**: Number of chords in progression (2-64)
- **Tempo**: Speed in BPM (30-240)
- **Beats per Chord**: Duration of each chord (1-16 beats)
- **Lead-in Beats**: Preparation time before starting (0-16 beats)

### Main Controls
- **Play**: Start continuous progression playback
- **Step**: Advance one chord at a time
- **Back**: Return to previous chord
- **Stop**: End practice session
- **Practice Beats**: Add extra practice time between chords

### Display Areas
- **Chord Progression**: Visual "pills" showing current progression
- **Piano Keyboard**: Interactive visual representation
- **Beat Counter**: Shows current beat and provides visual feedback
- **Style Display**: Current progression style name
- **BPM Slider**: Quick tempo adjustment

## How to Use the App

### Getting Started

1. **Open the App**: Navigate to the web application
2. **Configure Settings**: Click the Settings button to access options
3. **Select Key**: Choose the musical key you want to practice
4. **Choose Chord Types**: Select which types of chords to include
5. **Set Inversions**: Enable the inversions you want to practice
6. **Pick a Style**: Choose a progression pattern or use Random

### Basic Practice Session

1. **Enable Audio**: Turn on the Audio toggle to hear the chords
2. **Set Tempo**: Use the BPM slider to choose a comfortable speed
3. **Start Playing**: Click the Play button to begin
4. **Watch the Display**: Follow the highlighted piano keys and fingering numbers
5. **Listen and Learn**: Hear how the chords sound in context

### Advanced Practice Options

#### Step-by-Step Learning
- Use the **Step** button to advance manually through chords
- Perfect for learning difficult chord transitions
- Take time to position hands correctly before advancing

#### Hand Alternation
- Select "Alternate Hands" to practice coordination
- Helps develop independence between hands
- Useful for more advanced pianists

#### Inversion Practice
- Enable multiple inversions for comprehensive practice
- Learn to play chords in different positions
- Improves finger dexterity and chord knowledge

#### Custom Progressions
- Use "Random" style with specific chord type selections
- Create focused practice on particular chord qualities
- Adjust length for shorter or longer practice sessions

## Technical Implementation

### Architecture
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Audio**: Tone.js library for audio synthesis
- **UI Framework**: Bootstrap 5 for responsive design
- **Icons**: Bootstrap Icons

### Audio System
- **Sample Library**: Salamander Grand Piano samples
- **Audio Context**: Web Audio API through Tone.js
- **Effects**: Reverb for natural piano ambience
- **Timing**: Precise scheduling for musical accuracy

### Music Theory Engine
- **Chord Generation**: Algorithmic chord progression creation
- **Voice Leading**: Smooth transitions between chords
- **Enharmonic Handling**: Correct note spelling for each key
- **Roman Numeral Analysis**: Proper music theory terminology

### Responsive Design
- **Mobile-First**: Optimized for touch interfaces
- **Tablet Support**: Adapted layouts for iPad and similar devices
- **Desktop**: Full-featured experience on larger screens
- **Accessibility**: Keyboard navigation and screen reader support

## Educational Benefits

### For Students
- **Visual Learning**: See exactly which keys to press
- **Auditory Training**: Hear chord progressions in context
- **Muscle Memory**: Practice proper fingering patterns
- **Theoretical Understanding**: Learn chord relationships and progressions

### For Teachers
- **Demonstration Tool**: Show chord progressions visually and aurally
- **Practice Assignment**: Send students home with specific practice settings
- **Progress Tracking**: Students can practice at their own pace
- **Versatile Curriculum**: Covers beginner to advanced concepts

### Learning Outcomes
- **Chord Recognition**: Identify chords by sight and sound
- **Finger Technique**: Develop proper hand positioning
- **Musical Context**: Understand how chords function in progressions
- **Key Signatures**: Learn chord relationships in different keys

## System Requirements

### Minimum Requirements
- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **JavaScript**: Must be enabled
- **Audio**: Web Audio API support
- **Screen**: 320px minimum width for mobile

### Recommended
- **Audio**: Headphones or speakers for best sound quality
- **Screen**: Tablet size or larger for optimal visual experience
- **Connection**: Stable internet for initial sample loading

### Compatibility
- **Desktop**: Windows, macOS, Linux
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad, Android tablets

## Privacy and Security

### Data Handling
- **Local Storage**: Settings saved in browser only
- **No Account Required**: No personal information collected
- **Audio Samples**: Loaded from external CDN (Tone.js repository)
- **Offline Capability**: Works offline after initial load

### Security Features
- **Content Security**: Protected against malicious scripts
- **Safe Audio**: Audio samples from trusted sources
- **Client-Side**: All processing done in browser

## Support and Contact

### Getting Help
- **Built-in Help**: Click the Help button in the app
- **Email Support**: pianochordsuk@gmail.com
- **Documentation**: This comprehensive guide

### Feedback and Suggestions
- **Feature Requests**: Contact via email
- **Bug Reports**: Describe issue and browser information
- **Educational Input**: Suggestions from music teachers welcome

## Conclusion

The Piano Chord Progression Trainer represents a sophisticated approach to chord learning, combining modern web technology with sound pedagogical principles. Its comprehensive feature set makes it suitable for a wide range of users, from beginners learning their first chords to advanced players working on complex progressions.

The app's strength lies in its integration of visual, auditory, and interactive elements, providing multiple learning pathways to accommodate different learning styles. Whether used for self-study or classroom instruction, it offers a valuable resource for developing chord proficiency and musical understanding.

---

*© 2025. pianochordsuk@gmail.com - Soli Deo Gloria*