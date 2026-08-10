# Multi-Language Text-to-Speech (TTS) Feature

## Overview
The MedIntel application now supports Text-to-Speech functionality in multiple languages, including:
- 🇺🇸 **English** (en-US)
- 🇮🇳 **Hindi** (hi-IN) - हिंदी
- 🇮🇳 **Tamil** (ta-IN) - தமிழ்
- 🇮🇳 **Telugu** (te-IN) - తెలుగు

## Features

### 1. Language Selection
- Users can select their preferred language from a dropdown menu
- Language preference is saved in browser's localStorage
- Both speech recognition and text-to-speech are updated when language changes

### 2. Automatic Voice Selection
Each language has optimized voice selection with fallback options:

#### English (en-US)
- Prefers Google voices, Microsoft voices, or Natural/Neural voices
- Falls back to any available US English voice

#### Hindi (hi-IN)
- Prefers Google/Microsoft Hindi voices
- Falls back to voices like Hemant, Kalpana, or any Hindi voice

#### Tamil (ta-IN)
- Prefers Google/Microsoft Tamil voices
- Falls back to Valluvar or any available Tamil voice

#### Telugu (te-IN)
- Prefers Google/Microsoft Telugu voices
- Falls back to Chitra or any available Telugu voice

### 3. Language-Specific Speech Settings
- **English**: Rate 0.85, Pitch 1.0
- **Hindi**: Rate 0.8, Pitch 1.1 (slightly higher pitch)
- **Tamil**: Rate 0.75 (slower for clarity), Pitch 1.0
- **Telugu**: Rate 0.8, Pitch 1.05

### 4. Translation Support
- Backend translation endpoint at `/api/translate`
- Supports converting English medical text to target languages
- Falls back gracefully if translation service is unavailable

## Implementation Details

### JavaScript Components
The main implementation is in `static/js/voice-assistant.js`:

```javascript
class VoiceAssistant {
    supportedLanguages = {
        'en': { code: 'en-US', name: 'English', flag: '🇺🇸' },
        'ta': { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
        'hi': { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
        'te': { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' }
    };
}
```

### Backend Translation Service
Located in `routes.py`:

```python
@app.route('/api/translate', methods=['POST'])
@login_required
def translate_text():
    # Handles text translation for TTS
    # Currently returns original text with language preparation
    # Can be extended with Google Translate API or similar services
```

### Templates Updated
- `templates/medical_assistant.html` - Added language selector and enhanced styles
- `templates/reports.html` - Will include language selector for report TTS
- `templates/voice_test.html` - Test page for multi-language functionality

## Usage

### For Users
1. Navigate to the Medical Assistant or Reports page
2. Look for the language selector dropdown (🌐 TTS Language)
3. Select your preferred language
4. Use voice features normally - TTS will speak in selected language

### For Developers
```javascript
// Get voice assistant instance
const voiceAssistant = window.voiceAssistant;

// Change language
voiceAssistant.changeLanguage('hi'); // Switch to Hindi

// Speak text in current language
voiceAssistant.speakText("Your medical report is ready", false);

// Get available voices for a language
const hindiVoices = voiceAssistant.getVoicesForLanguage('hi');
```

## Testing
Access the test page at `/voice-test` (requires login) to:
- Test TTS in all supported languages
- View available voices for each language
- Test custom text with real medical content
- Verify language switching functionality

## Browser Support
- Chrome/Edge: Full support for all languages
- Firefox: Limited voice options, may fallback to default voices
- Safari: Variable support depending on system voices

## Future Enhancements
1. **Real Translation Integration**
   - Google Translate API integration
   - Azure Translator service
   - Custom medical terminology translation

2. **Voice Customization**
   - User-selectable voices per language
   - Speech rate and pitch preferences
   - Voice quality preferences

3. **Additional Languages**
   - Kannada (kn-IN)
   - Malayalam (ml-IN)
   - Bengali (bn-IN)
   - Gujarati (gu-IN)

4. **Offline Support**
   - Download and cache voices
   - Offline translation capabilities

## Error Handling
- Graceful fallback to English if target language voices unavailable
- Original text returned if translation fails
- User feedback for voice/translation errors
- Automatic retry mechanisms for temporary failures

## Accessibility
- Screen reader compatible
- Keyboard navigation support
- High contrast mode support
- Large text mode compatibility

## Performance Considerations
- Voices loaded asynchronously
- Translation requests cached
- Language preferences stored locally
- Minimal impact on page load times
