"""
Windows Voice Checker for Multi-Language TTS
This script checks what speech synthesis voices are available on the system
"""

import pyttsx3
import platform

def check_available_voices():
    """Check all available TTS voices on the system"""
    
    print("=" * 60)
    print("🎤 WINDOWS VOICE AVAILABILITY CHECKER")
    print("=" * 60)
    print(f"Operating System: {platform.system()} {platform.release()}")
    print()
    
    try:
        # Initialize TTS engine
        engine = pyttsx3.init()
        
        # Get available voices
        voices = engine.getProperty('voices')
        
        print(f"📊 Total voices found: {len(voices)}")
        print()
        
        # Categorize voices by language
        language_voices = {
            'English': [],
            'Hindi': [],
            'Tamil': [],
            'Telugu': [],
            'Other': []
        }
        
        for i, voice in enumerate(voices):
            voice_id = voice.id
            voice_name = voice.name if hasattr(voice, 'name') else 'Unknown'
            
            # Categorize based on voice ID and name
            if 'en' in voice_id.lower() or 'english' in voice_name.lower():
                language_voices['English'].append((voice_name, voice_id))
            elif 'hi' in voice_id.lower() or 'hindi' in voice_name.lower() or 'hemant' in voice_name.lower() or 'kalpana' in voice_name.lower():
                language_voices['Hindi'].append((voice_name, voice_id))
            elif 'ta' in voice_id.lower() or 'tamil' in voice_name.lower() or 'valluvar' in voice_name.lower():
                language_voices['Tamil'].append((voice_name, voice_id))
            elif 'te' in voice_id.lower() or 'telugu' in voice_name.lower() or 'chitra' in voice_name.lower():
                language_voices['Telugu'].append((voice_name, voice_id))
            else:
                language_voices['Other'].append((voice_name, voice_id))
        
        # Display results
        for language, voice_list in language_voices.items():
            if language != 'Other' or voice_list:  # Show Other only if it has voices
                print(f"🗣️  {language} Voices ({len(voice_list)}):")
                if voice_list:
                    for voice_name, voice_id in voice_list:
                        print(f"   • {voice_name}")
                        print(f"     ID: {voice_id}")
                        print()
                else:
                    print("   ❌ No voices found")
                    print()
        
        # Test each Indian language
        print("🧪 TESTING VOICES:")
        print("-" * 40)
        
        test_texts = {
            'English': "Hello! This is an English voice test.",
            'Hindi': "नमस्ते! यह हिंदी आवाज़ का परीक्षण है।",
            'Tamil': "வணக்கம்! இது தமிழ் குரல் சோதனை.",
            'Telugu': "నమస్కారం! ఇది తెలుగు వాయిస్ టెస్ట్."
        }
        
        for language in ['English', 'Hindi', 'Tamil', 'Telugu']:
            voices_for_lang = language_voices[language]
            if voices_for_lang:
                print(f"✅ {language}: {len(voices_for_lang)} voice(s) available")
                # Test the first voice
                try:
                    engine.setProperty('voice', voices_for_lang[0][1])
                    print(f"   Testing: {voices_for_lang[0][0]}")
                    # Uncomment the next line to actually hear the voice
                    # engine.say(test_texts[language])
                    # engine.runAndWait()
                except Exception as e:
                    print(f"   ⚠️ Error testing voice: {e}")
            else:
                print(f"❌ {language}: No voices available")
            print()
        
        # Installation guidance
        print("💡 VOICE INSTALLATION GUIDE:")
        print("-" * 40)
        print("If Indian language voices are missing:")
        print("1. Go to Windows Settings > Time & Language > Speech")
        print("2. Click 'Add voices' and download:")
        print("   - Hindi (India)")
        print("   - Tamil (India)")
        print("   - Telugu (India)")
        print("3. Restart your browser after installation")
        print("4. Alternative: Download Microsoft Speech Platform voices")
        
    except Exception as e:
        print(f"❌ Error initializing TTS engine: {e}")
        print("Make sure pyttsx3 is installed: pip install pyttsx3")

if __name__ == "__main__":
    check_available_voices()
