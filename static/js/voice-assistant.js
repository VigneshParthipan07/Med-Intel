/**
 * Voice Features for Medical Assistant Chatbot
 * Implements Speech-to-Text and Text-to-Speech capabilities
 */

class VoiceAssistant {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.lastResponse = '';
        this.currentUtterance = null;
        // Enable auto-speak by default if not explicitly set
        const savedSetting = localStorage.getItem('autoSpeakEnabled');
        this.autoSpeakEnabled = savedSetting === null ? true : savedSetting === 'true';
        
        // Multi-language support
        this.currentLanguage = localStorage.getItem('ttsLanguage') || 'en';
        this.supportedLanguages = {
            'en': { code: 'en-US', name: 'English', flag: '🇺🇸' },
            'ta': { code: 'ta-IN', name: 'Tamil', flag: '🇮🇳' },
            'hi': { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
            'te': { code: 'te-IN', name: 'Telugu', flag: '🇮🇳' }
        };
        this.availableVoices = [];
        
        console.log('🎤 VoiceAssistant constructor called');
        
        this.initializeSpeechRecognition();
        this.initializeVoices();
        this.bindEvents();
        this.loadAutoSpeakPreference();
        
        console.log('🎤 VoiceAssistant initialization completed');
    }

    /**
     * Initialize Speech Recognition API
     */
    initializeSpeechRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech Recognition not supported in this browser');
            this.hideVoiceFeatures();
            return;
        }

        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition settings
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.supportedLanguages[this.currentLanguage].code;
        this.recognition.maxAlternatives = 1;

        // Set up event handlers
        this.setupRecognitionEvents();
    }

    /**
     * Update speech recognition language
     */
    updateRecognitionLanguage() {
        if (this.recognition) {
            this.recognition.lang = this.supportedLanguages[this.currentLanguage].code;
            console.log(`🎤 Speech recognition language updated to: ${this.supportedLanguages[this.currentLanguage].name}`);
        }
    }

    /**
     * Initialize speech synthesis voices
     */
    initializeVoices() {
        // Ensure voices are loaded
        if (this.synthesis.getVoices().length === 0) {
            this.synthesis.addEventListener('voiceschanged', () => {
                this.availableVoices = this.synthesis.getVoices();
                console.log('🎤 Voices loaded:', this.availableVoices.length, 'voices available');
                this.logAvailableVoicesForAllLanguages();
                this.checkAndInstallIndianVoices();
                this.updateLanguageSelector();
            });
        } else {
            this.availableVoices = this.synthesis.getVoices();
            this.logAvailableVoicesForAllLanguages();
            this.checkAndInstallIndianVoices();
            this.updateLanguageSelector();
        }
    }

    /**
     * Force refresh voices (useful after installing new language packs)
     */
    refreshVoices() {
        console.log('🔄 Force refreshing voice list...');
        this.availableVoices = this.synthesis.getVoices();
        console.log(`🎤 Refreshed: ${this.availableVoices.length} system voices`);
        
        this.checkAndInstallIndianVoices();
        this.updateLanguageSelector();
        this.logAvailableVoicesForAllLanguages();
        
        console.log('✅ Voice refresh completed');
        return this.availableVoices.length;
    }

    /**
     * Check if Indian language voices are available and provide guidance
     */
    checkAndInstallIndianVoices() {
        const hindiVoices = this.getVoicesForLanguage('hi');
        const tamilVoices = this.getVoicesForLanguage('ta');
        const teluguVoices = this.getVoicesForLanguage('te');
        
        console.log('🇮🇳 Indian Language Voice Status:');
        console.log(`  Hindi: ${hindiVoices.length} voices ${hindiVoices.length > 0 ? '✅' : '(will use English fallback)'}`);
        console.log(`  Tamil: ${tamilVoices.length} voices ${tamilVoices.length > 0 ? '✅' : '(will use English fallback)'}`);
        console.log(`  Telugu: ${teluguVoices.length} voices ${teluguVoices.length > 0 ? '✅' : '(will use English fallback)'}`);
        
        if (hindiVoices.length === 0 || tamilVoices.length === 0 || teluguVoices.length === 0) {
            console.log('💡 Voice system is working with English fallback');
            console.log('🎯 For native voices: Settings > Speech > Add voices');
            
            // Show user notification
            this.showVoiceInstallationGuide();
        } else {
            console.log('🎉 All Indian language voices are available!');
        }
    }

    /**
     * Show voice installation guide to user
     */
    showVoiceInstallationGuide() {
        const missingLanguages = [];
        if (this.getVoicesForLanguage('hi').length === 0) missingLanguages.push('Hindi');
        if (this.getVoicesForLanguage('ta').length === 0) missingLanguages.push('Tamil');
        if (this.getVoicesForLanguage('te').length === 0) missingLanguages.push('Telugu');
        
        if (missingLanguages.length > 0) {
            const message = `💡 Optional: Install ${missingLanguages.join(', ')} voices from Windows Settings > Speech for better voice quality.`;
            console.info('🔧 Voice Enhancement Available:', message);
            
            // Create notification element with improved styling
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div class="alert alert-info alert-dismissible fade show" role="alert" style="margin: 10px 0;">
                    <strong>💡 Voice Enhancement:</strong> ${message}
                    <button type="button" class="btn btn-sm btn-outline-primary ms-2" onclick="showQuickInstallGuide()">📖 Quick Guide</button>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            // Try to add to voice controls area
            const voiceControls = document.querySelector('.d-flex.gap-1');
            if (voiceControls && voiceControls.parentNode) {
                voiceControls.parentNode.insertBefore(notification, voiceControls);
            }
        }
    }

    /**
     * Log available voices for all supported languages
     */
    logAvailableVoicesForAllLanguages() {
        console.log('🎤 === VOICE ANALYSIS FOR ALL LANGUAGES ===');
        console.log('Total available voices:', this.availableVoices.length);
        
        // Log all voices first
        console.log('🔍 All available voices:');
        this.availableVoices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} | Lang: ${voice.lang} | Local: ${voice.localService}`);
        });
        
        console.log('🌐 === LANGUAGE-SPECIFIC VOICES ===');
        Object.entries(this.supportedLanguages).forEach(([langKey, langInfo]) => {
            const voices = this.getVoicesForLanguage(langKey);
            console.log(`\n🗣️ ${langInfo.name} (${langInfo.code}) - ${voices.length} voices found:`);
            
            if (voices.length > 0) {
                voices.forEach((voice, index) => {
                    const isLocal = voice.localService ? '(Local)' : '(Remote)';
                    const isDefault = voice.default ? '(Default)' : '';
                    console.log(`  ${index + 1}. ${voice.name} | ${voice.lang} ${isLocal} ${isDefault}`);
                });
            } else {
                console.log(`  ❌ No ${langInfo.name} voices available`);
            }
        });
        console.log('🎤 === END VOICE ANALYSIS ===\n');
    }

    /**
     * Get available voices for a specific language
     */
    getVoicesForLanguage(languageKey) {
        const langInfo = this.supportedLanguages[languageKey];
        if (!langInfo) return [];
        
        // Get exact matches first, then fuzzy matches
        const exactMatches = this.availableVoices.filter(voice => voice.lang === langInfo.code);
        
        // Also look for language family matches and common variations
        const fuzzyMatches = this.availableVoices.filter(voice => {
            if (exactMatches.some(exact => exact.name === voice.name)) return false; // Skip if already in exact matches
            
            const voiceLangCode = voice.lang.split('-')[0].toLowerCase();
            const targetLangCode = langInfo.code.split('-')[0].toLowerCase();
            
            // Special handling for Indian languages
            if (languageKey === 'hi') {
                return voiceLangCode === 'hi' || voice.name.toLowerCase().includes('hindi') || 
                       voice.name.toLowerCase().includes('hemant') || voice.name.toLowerCase().includes('kalpana');
            } else if (languageKey === 'ta') {
                return voiceLangCode === 'ta' || voice.name.toLowerCase().includes('tamil') || 
                       voice.name.toLowerCase().includes('valluvar');
            } else if (languageKey === 'te') {
                return voiceLangCode === 'te' || voice.name.toLowerCase().includes('telugu') || 
                       voice.name.toLowerCase().includes('chitra');
            }
            
            return voiceLangCode === targetLangCode;
        });
        
        const allMatches = [...exactMatches, ...fuzzyMatches];
        console.log(`🔍 Language ${langInfo.name}: Found ${exactMatches.length} exact + ${fuzzyMatches.length} fuzzy = ${allMatches.length} total voices`);
        
        return allMatches;
    }

    /**
     * Create language selector UI
     */
    createLanguageSelector() {
        const selectorHTML = `
            <div class="language-selector-container">
                <label for="ttsLanguageSelect" class="form-label">🌐 Text-to-Speech Language:</label>
                <select id="ttsLanguageSelect" class="form-select form-select-sm">
                    ${Object.entries(this.supportedLanguages).map(([key, lang]) => 
                        `<option value="${key}" ${key === this.currentLanguage ? 'selected' : ''}>
                            ${lang.flag} ${lang.name}
                        </option>`
                    ).join('')}
                </select>
                <small class="text-muted">Select language for voice output</small>
            </div>
        `;
        
        // Insert the language selector in multiple locations for better visibility
        const targetSelectors = [
            '.d-flex.gap-1',
            '.voice-controls', 
            '.chat-footer',
            '.input-group'
        ];
        
        setTimeout(() => {
            let selectorAdded = false;
            
            targetSelectors.forEach(selector => {
                const containers = document.querySelectorAll(selector);
                containers.forEach(container => {
                    if (container && !container.querySelector('.language-selector-container')) {
                        // Try to insert before the container for better positioning
                        if (container.parentElement) {
                            container.parentElement.insertAdjacentHTML('afterbegin', selectorHTML);
                            selectorAdded = true;
                            console.log('🎛️ Language selector added to:', selector);
                        }
                    }
                });
            });
            
            // If no good location found, add to the chat footer
            if (!selectorAdded) {
                const chatFooter = document.querySelector('.chat-footer') || document.querySelector('.container-fluid');
                if (chatFooter) {
                    chatFooter.insertAdjacentHTML('afterbegin', selectorHTML);
                    console.log('🎛️ Language selector added to fallback location');
                }
            }
            
            // Bind change event to all selectors
            document.querySelectorAll('#ttsLanguageSelect').forEach(select => {
                select.addEventListener('change', (e) => {
                    console.log('🌐 Language changed to:', e.target.value);
                    this.changeLanguage(e.target.value);
                });
            });
            
            console.log('✅ Language selector setup completed');
        }, 100);
    }

    /**
     * Update language selector options based on available voices
     */
    updateLanguageSelector() {
        const selectors = document.querySelectorAll('#ttsLanguageSelect');
        selectors.forEach(select => {
            Object.entries(this.supportedLanguages).forEach(([key, lang]) => {
                const option = select.querySelector(`option[value="${key}"]`);
                const voices = this.getVoicesForLanguage(key);
                if (option) {
                    option.textContent = `${lang.flag} ${lang.name} (${voices.length} voices)`;
                    option.disabled = voices.length === 0;
                }
            });
        });
    }

    /**
     * Change TTS language
     */
    changeLanguage(languageKey) {
        if (this.supportedLanguages[languageKey]) {
            this.currentLanguage = languageKey;
            localStorage.setItem('ttsLanguage', languageKey);
            console.log(`🌐 TTS Language changed to: ${this.supportedLanguages[languageKey].name}`);
            
            // Update speech recognition language as well
            this.updateRecognitionLanguage();
            
            // Update all selectors
            document.querySelectorAll('#ttsLanguageSelect').forEach(select => {
                select.value = languageKey;
            });
            
            // Stop current speech if any
            if (this.synthesis.speaking) {
                this.synthesis.cancel();
            }
        }
    }

    /**
     * Set up speech recognition event handlers
     */
    setupRecognitionEvents() {
        if (!this.recognition) return;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI(true);
            console.log('Voice recognition started');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Speech recognized:', transcript);
            
            // Insert the recognized text into the appropriate input field
            const inputs = [
                document.getElementById('reportQuestionInput'),
                document.getElementById('messageInput')
            ];
            
            const activeInput = inputs.find(input => input && !input.disabled);
            if (activeInput) {
                activeInput.value = transcript;
                activeInput.focus();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showVoiceError(event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    /**
     * Bind event handlers to UI elements
     */
    bindEvents() {
        // Voice input buttons
        const voiceBtns = [
            document.getElementById('voiceInputBtn'),
            document.getElementById('voiceInputBtnMain')
        ];
        voiceBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.toggleListening());
            }
        });

        // Speak response buttons
        const speakBtns = [
            document.getElementById('speakResponseBtn'),
            document.getElementById('speakResponseBtnMain')
        ];
        speakBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.speakLastResponse());
            }
        });

        // Stop speaking buttons
        const stopBtns = [
            document.getElementById('stopSpeakBtn'),
            document.getElementById('stopSpeakBtnMain')
        ];
        stopBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.stopSpeaking());
            }
        });

        // Auto-speak toggle buttons
        const autoSpeakBtns = [
            document.getElementById('autoSpeakToggle'),
            document.getElementById('autoSpeakToggleMain')
        ];
        autoSpeakBtns.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.toggleAutoSpeak());
            }
        });

        // Stop speaking when user starts typing
        const inputs = [
            document.getElementById('reportQuestionInput'),
            document.getElementById('messageInput')
        ];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (this.synthesis.speaking) {
                        this.synthesis.cancel();
                    }
                });
            }
        });
    }

    /**
     * Load auto-speak preference and update UI
     */
    loadAutoSpeakPreference() {
        // Save the default setting if it's the first time
        if (localStorage.getItem('autoSpeakEnabled') === null) {
            localStorage.setItem('autoSpeakEnabled', 'true');
        }
        
        // Initialize auto-speak toggle buttons
        setTimeout(() => {
            const toggleBtns = [
                document.getElementById('autoSpeakToggle'),
                document.getElementById('autoSpeakToggleMain')
            ];

            toggleBtns.forEach(btn => {
                if (btn) {
                    if (this.autoSpeakEnabled) {
                        btn.classList.remove('btn-outline-secondary');
                        btn.classList.add('btn-success');
                        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                        btn.title = 'Auto-speak enabled - AI will speak responses aloud. Click to disable';
                    } else {
                        btn.classList.remove('btn-success');
                        btn.classList.add('btn-outline-secondary');
                        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                        btn.title = 'Auto-speak disabled - Click to enable automatic speech for AI responses';
                    }
                }
            });
            
            console.log('Voice Assistant initialized - Auto-speak:', this.autoSpeakEnabled ? 'ENABLED' : 'DISABLED');
        }, 100);
    }

    /**
     * Toggle speech recognition on/off
     */
    toggleListening() {
        if (!this.recognition) {
            this.showVoiceError('Speech recognition not available');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    /**
     * Start listening for voice input
     */
    startListening() {
        if (!this.recognition || this.isListening) return;

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showVoiceError('Could not start voice recognition');
        }
    }

    /**
     * Stop listening for voice input
     */
    stopListening() {
        this.isListening = false;
        this.updateVoiceUI(false);
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    /**
     * Speak the given text using text-to-speech with multi-language support
     */
    async speakText(text, autoSpeak = false) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        // Wait a bit for the cancel to take effect
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            // For now, use original text but with proper language settings
            // This allows native language voices to work better
            let textToSpeak = text;
            
            // If not English, try translation (but fallback to original)
            if (this.currentLanguage !== 'en') {
                try {
                    const translated = await this.translateText(text, this.currentLanguage);
                    if (translated && translated !== text) {
                        textToSpeak = translated;
                        console.log(`🌐 Using translated text for ${this.supportedLanguages[this.currentLanguage].name}`);
                    } else {
                        console.log(`🌐 Using original text for ${this.supportedLanguages[this.currentLanguage].name} TTS`);
                    }
                } catch (error) {
                    console.log(`⚠️ Translation failed, using original text for ${this.supportedLanguages[this.currentLanguage].name}`);
                }
            }

            // Clean up the text for better speech
            const cleanText = this.cleanTextForSpeech(textToSpeak);
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            this.currentUtterance = utterance;
            
            // Set language-specific settings FIRST
            const langInfo = this.supportedLanguages[this.currentLanguage];
            utterance.lang = langInfo.code;
            
            console.log(`🎵 Creating utterance for ${langInfo.name} (${langInfo.code})`);
            console.log(`📝 Text to speak: "${cleanText.substring(0, 100)}..."`);
            
            // Language-specific speech settings
            this.configureSpeechSettings(utterance, this.currentLanguage);

            // Select the best voice for the current language - THIS IS CRITICAL
            const selectedVoice = this.selectBestVoice(this.currentLanguage);
            if (selectedVoice) {
                utterance.voice = selectedVoice;
                console.log(`🗣️ VOICE SET: ${selectedVoice.name} (${selectedVoice.lang}) for ${langInfo.name}`);
                console.log(`🔧 Voice details:`, {
                    name: selectedVoice.name,
                    lang: selectedVoice.lang,
                    localService: selectedVoice.localService,
                    voiceURI: selectedVoice.voiceURI
                });
            } else {
                console.warn(`⚠️ No ${langInfo.name} voice found, using default voice with ${langInfo.code} language setting`);
                console.warn(`🔍 Available voices for debugging:`, this.getVoicesForLanguage(this.currentLanguage));
            }

            utterance.onstart = () => {
                const voiceUsed = utterance.voice ? utterance.voice.name : 'Default';
                console.log(`🔊 ${langInfo.name} speech synthesis STARTED`);
                console.log(`🎤 Using voice: ${voiceUsed}`);
                console.log(`🌐 Language setting: ${utterance.lang}`);
                console.log(`📱 Text: "${cleanText.substring(0, 50)}..."`);
                this.updateSpeakingStatus(true);
                
                // Show stop button if this is auto-speak
                if (autoSpeak) {
                    this.showAutoSpeakControls(true);
                }
            };

            utterance.onend = () => {
                console.log(`🔇 ${langInfo.name} speech synthesis ENDED successfully`);
                this.updateSpeakingStatus(false);
                this.showAutoSpeakControls(false);
                this.currentUtterance = null;
            };

            utterance.onerror = (event) => {
                console.error(`❌ ${langInfo.name} speech synthesis ERROR:`, event);
                console.error(`🔧 Error details:`, {
                    error: event.error,
                    voice: utterance.voice ? utterance.voice.name : 'None',
                    lang: utterance.lang,
                    text: cleanText.substring(0, 50) + '...'
                });
                this.updateSpeakingStatus(false);
                this.showAutoSpeakControls(false);
                this.currentUtterance = null;
            };

            // Use a longer delay to ensure voice is properly loaded
            console.log(`⏳ Preparing to speak in ${langInfo.name}...`);
            setTimeout(() => {
                console.log(`🚀 Starting speech synthesis for ${langInfo.name}`);
                this.synthesis.speak(utterance);
            }, 200);
            
        } catch (error) {
            console.error('Error in speakText:', error);
        }
    }

    /**
     * Configure speech settings based on language
     */
    configureSpeechSettings(utterance, languageKey) {
        switch (languageKey) {
            case 'en':
                utterance.rate = 0.85;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;
                break;
            case 'hi':
                utterance.rate = 0.75;  // Slower for better Hindi pronunciation
                utterance.pitch = 1.05; // Slightly higher pitch for Hindi
                utterance.volume = 0.95;
                break;
            case 'ta':
                utterance.rate = 0.7;   // Slower for Tamil clarity 
                utterance.pitch = 0.95; // Slightly lower pitch for Tamil
                utterance.volume = 0.95;
                break;
            case 'te':
                utterance.rate = 0.75;  // Moderate speed for Telugu
                utterance.pitch = 1.0;  // Normal pitch for Telugu
                utterance.volume = 0.95;
                break;
            default:
                utterance.rate = 0.8;
                utterance.pitch = 1.0;
                utterance.volume = 0.9;
        }
        
        console.log(`🎛️ Speech settings for ${this.supportedLanguages[languageKey].name}:`, {
            rate: utterance.rate,
            pitch: utterance.pitch,
            volume: utterance.volume,
            lang: utterance.lang
        });
    }

    /**
     * Select the best voice for a given language with enhanced fallback
     */
    selectBestVoice(languageKey) {
        const voices = this.getVoicesForLanguage(languageKey);
        const langInfo = this.supportedLanguages[languageKey];
        
        if (voices.length === 0) {
            console.warn(`❌ No voices found for ${langInfo.name}, trying fallback...`);
            
            // Enhanced fallback: try to find any voice that might work
            let fallbackVoice = null;
            
            // For Indian languages, try to find English voices as fallback
            if (['hi', 'ta', 'te'].includes(languageKey)) {
                const englishVoices = this.availableVoices.filter(voice => 
                    voice.lang.startsWith('en-') || voice.lang === 'en'
                );
                
                if (englishVoices.length > 0) {
                    fallbackVoice = englishVoices.find(voice => 
                        voice.name.toLowerCase().includes('google') ||
                        voice.name.toLowerCase().includes('microsoft')
                    ) || englishVoices[0];
                    
                    console.log(`🔄 Using English fallback voice for ${langInfo.name}:`, fallbackVoice.name);
                }
            }
            
            // If still no voice, use any available voice
            if (!fallbackVoice && this.availableVoices.length > 0) {
                fallbackVoice = this.availableVoices[0];
                console.log(`🔄 Using default system voice for ${langInfo.name}:`, fallbackVoice.name);
            }
            
            return fallbackVoice;
        }

        console.log(`🎯 Selecting voice for ${langInfo.name} from ${voices.length} available voices`);
        
        // Enhanced priority selection based on language
        let selectedVoice = null;
        
        if (languageKey === 'en') {
            // English voice priorities
            selectedVoice = voices.find(voice => voice.name.includes('Google') && voice.lang.startsWith('en-US')) ||
                           voices.find(voice => voice.name.includes('Microsoft') && voice.lang.startsWith('en-US')) ||
                           voices.find(voice => voice.lang === 'en-US') ||
                           voices.find(voice => voice.lang.startsWith('en-'));
        } else if (languageKey === 'hi') {
            // Hindi voice priorities
            selectedVoice = voices.find(voice => voice.name.toLowerCase().includes('google') && voice.lang.includes('hi')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('hindi')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('hemant')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('kalpana')) ||
                           voices.find(voice => voice.lang.includes('hi')) ||
                           voices[0];
        } else if (languageKey === 'ta') {
            // Tamil voice priorities
            selectedVoice = voices.find(voice => voice.name.toLowerCase().includes('google') && voice.lang.includes('ta')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('tamil')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('valluvar')) ||
                           voices.find(voice => voice.lang.includes('ta')) ||
                           voices[0];
        } else if (languageKey === 'te') {
            // Telugu voice priorities
            selectedVoice = voices.find(voice => voice.name.toLowerCase().includes('google') && voice.lang.includes('te')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('telugu')) ||
                           voices.find(voice => voice.name.toLowerCase().includes('chitra')) ||
                           voices.find(voice => voice.lang.includes('te')) ||
                           voices[0];
        }
        
        // Fallback to first available voice
        if (!selectedVoice) {
            selectedVoice = voices[0];
        }
        
        if (selectedVoice) {
            console.log(`✅ Selected voice for ${langInfo.name}:`, {
                name: selectedVoice.name,
                lang: selectedVoice.lang,
                localService: selectedVoice.localService,
                default: selectedVoice.default
            });
        }
        
        return selectedVoice;
    }

    /**
     * Translate text to target language using backend translation service
     */
    async translateText(text, targetLanguage) {
        if (targetLanguage === 'en') return text;

        try {
            console.log(`🌐 Translation requested: "${text.substring(0, 50)}..." → ${this.supportedLanguages[targetLanguage].name}`);
            
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    target_language: targetLanguage
                })
            });
            
            if (!response.ok) {
                throw new Error('Translation service unavailable');
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Translation completed for ${this.supportedLanguages[targetLanguage].name}`);
                return result.translated_text;
            } else {
                throw new Error(result.error || 'Translation failed');
            }
            
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback to original text with language indicator
            const langName = this.supportedLanguages[targetLanguage].name;
            console.log(`⚠️ Using original text for ${langName} TTS (translation failed)`);
            return text;
        }
    }

    /**
     * Test voice functionality with a short phrase
     */
    async testVoice(languageKey = null) {
        const testLanguage = languageKey || this.currentLanguage;
        const langInfo = this.supportedLanguages[testLanguage];
        
        const testPhrases = {
            'en': 'Hello, this is a voice test in English.',
            'hi': 'नमस्ते, यह हिंदी में आवाज का परीक्षण है।',
            'ta': 'வணக்கம், இது தமிழில் குரல் சோதனை.',
            'te': 'హలో, ఇది తెలుగులో వాయిస్ టెస్ట్.'
        };
        
        const testPhrase = testPhrases[testLanguage] || testPhrases['en'];
        
        console.log(`🎤 Testing voice for ${langInfo.name}...`);
        console.log(`📝 Test phrase: "${testPhrase}"`);
        
        // Check available voices
        const availableVoices = this.getVoicesForLanguage(testLanguage);
        console.log(`🔍 Available ${langInfo.name} voices:`, availableVoices.length);
        
        if (availableVoices.length === 0) {
            console.warn(`⚠️ No ${langInfo.name} voices available. Using fallback.`);
        }
        
        // Test the voice
        await this.speakText(testPhrase, false);
        
        return {
            language: langInfo.name,
            voicesAvailable: availableVoices.length,
            testPhrase: testPhrase
        };
    }

    /**
     * Show voice information for debugging
     */
    showVoiceInfo() {
        console.log('🎙️ === VOICE SYSTEM INFORMATION ===');
        console.log(`Current Language: ${this.supportedLanguages[this.currentLanguage].name}`);
        console.log(`Auto-speak Enabled: ${this.autoSpeakEnabled}`);
        console.log(`Total Available Voices: ${this.availableVoices.length}`);
        
        // Show voices for each language
        Object.keys(this.supportedLanguages).forEach(langKey => {
            const voices = this.getVoicesForLanguage(langKey);
            const langInfo = this.supportedLanguages[langKey];
            console.log(`${langInfo.name} (${langKey}): ${voices.length} voices available`);
            
            if (voices.length > 0) {
                voices.forEach((voice, index) => {
                    console.log(`  ${index + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[Local]' : '[Remote]'}`);
                });
            } else {
                console.log(`  ⚠️ No voices found for ${langInfo.name}`);
            }
        });
        
        console.log('🎙️ ================================');
    }

    /**
     * Speak the last AI response
     */
    speakLastResponse() {
        if (this.lastResponse) {
            console.log('🔊 Speaking last response manually');
            this.speakText(this.lastResponse, false);
        } else {
            console.log('No response to speak');
        }
    }

    /**
     * Stop current speech synthesis
     */
    stopSpeaking() {
        if (this.synthesis.speaking) {
            console.log('⏹️ Stopping speech synthesis');
            this.synthesis.cancel();
            this.updateSpeakingStatus(false);
            this.showAutoSpeakControls(false);
            this.currentUtterance = null;
        }
    }

    /**
     * Update speaking status indicators
     */
    updateSpeakingStatus(isSpeaking) {
        const speakBtns = [
            document.getElementById('speakResponseBtn'),
            document.getElementById('speakResponseBtnMain')
        ];

        speakBtns.forEach(btn => {
            if (btn) {
                if (isSpeaking) {
                    btn.classList.add('speaking-animation');
                    btn.innerHTML = '<i class="fas fa-stop-circle"></i> Stop';
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-danger');
                } else {
                    btn.classList.remove('speaking-animation');
                    btn.innerHTML = '<i class="fas fa-volume-up"></i> Speak';
                    btn.classList.remove('btn-danger');
                    btn.classList.add('btn-outline-secondary');
                }
            }
        });
    }

    /**
     * Show/hide auto-speak controls (stop button)
     */
    showAutoSpeakControls(show) {
        const stopBtns = [
            document.getElementById('stopSpeakBtn'),
            document.getElementById('stopSpeakBtnMain')
        ];

        stopBtns.forEach(btn => {
            if (btn) {
                btn.style.display = show ? 'inline-block' : 'none';
            }
        });
    }

    /**
     * Update the last response for text-to-speech
     */
    updateLastResponse(response) {
        console.log('📝 Updating last response for voice:', response.substring(0, 50) + '...');
        this.lastResponse = response;
        
        // Show the speak button
        const speakBtns = [
            document.getElementById('speakResponseBtn'),
            document.getElementById('speakResponseBtnMain')
        ];
        
        speakBtns.forEach(btn => {
            if (btn && response) {
                btn.style.display = 'inline-block';
            }
        });

        // Auto-speak the response if enabled
        if (this.autoSpeakEnabled && response) {
            console.log('🤖 Auto-speak ENABLED: Speaking AI response automatically...');
            // Small delay to ensure the UI is updated
            setTimeout(() => {
                this.speakText(response, true);
            }, 800);
        } else if (response) {
            console.log('🔇 Auto-speak DISABLED. Click the speak button to hear the response.');
        }
    }

    /**
     * Toggle auto-speak feature
     */
    toggleAutoSpeak() {
        this.autoSpeakEnabled = !this.autoSpeakEnabled;
        
        // Update toggle button state
        const toggleBtns = [
            document.getElementById('autoSpeakToggle'),
            document.getElementById('autoSpeakToggleMain')
        ];

        toggleBtns.forEach(btn => {
            if (btn) {
                if (this.autoSpeakEnabled) {
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-success');
                    btn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    btn.title = 'Auto-speak enabled - AI will speak responses aloud. Click to disable';
                } else {
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-secondary');
                    btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    btn.title = 'Auto-speak disabled - Click to enable automatic speech for AI responses';
                }
            }
        });

        // Save preference to localStorage
        localStorage.setItem('autoSpeakEnabled', this.autoSpeakEnabled);
        
        // Provide feedback to user
        const statusMessage = this.autoSpeakEnabled ? 
            '🔊 Auto-speak ENABLED! AI responses will be spoken aloud.' : 
            '🔇 Auto-speak DISABLED.';
        console.log(statusMessage);
    }

    /**
     * Clean text for better speech synthesis
     */
    cleanTextForSpeech(text) {
        return text
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1')     // Remove bold markdown
            .replace(/\*(.*?)\*/g, '$1')         // Remove italic markdown
            .replace(/`(.*?)`/g, '$1')           // Remove inline code markdown
            .replace(/```[\s\S]*?```/g, 'Code block.')  // Replace code blocks
            .replace(/#+\s/g, '')                // Remove heading markers
            
            // Handle medical terms and abbreviations
            .replace(/\b(mg|ML|ml)\b/g, (match) => match.toLowerCase() === 'mg' ? 'milligrams' : 'milliliters')
            .replace(/\b(mcg|μg)\b/g, 'micrograms')
            .replace(/\b(kg)\b/g, 'kilograms')
            .replace(/\b(lb|lbs)\b/g, 'pounds')
            .replace(/\b(cm)\b/g, 'centimeters')
            .replace(/\b(mm)\b/g, 'millimeters')
            .replace(/\b(°C)\b/g, 'degrees Celsius')
            .replace(/\b(°F)\b/g, 'degrees Fahrenheit')
            
            // Handle numbers and ranges
            .replace(/(\d+)-(\d+)/g, '$1 to $2')    // Convert ranges like "20-30" to "20 to 30"
            .replace(/(\d+)\/(\d+)/g, '$1 over $2')  // Convert fractions like "120/80" to "120 over 80"
            
            // Handle punctuation for better speech flow
            .replace(/\n\n+/g, '. ')             // Replace multiple newlines with periods
            .replace(/\n/g, ', ')                // Replace single newlines with commas for better flow
            .replace(/\s+/g, ' ')                // Normalize whitespace
            .replace(/<[^>]*>/g, '')             // Remove HTML tags
            .replace(/[^\w\s.,!?;:-]/g, '')      // Remove special characters except common punctuation
            
            // Add natural pauses
            .replace(/\. /g, '. ')               // Ensure space after periods
            .replace(/\, /g, ', ')               // Ensure space after commas
            .replace(/(\w)([.!?])/g, '$1$2 ')    // Add space after sentence endings
            
            .trim();
    }

    /**
     * Update voice UI elements
     */
    updateVoiceUI(isListening) {
        const voiceBtns = [
            document.getElementById('voiceInputBtn'),
            document.getElementById('voiceInputBtnMain')
        ];
        const voiceStatus = document.getElementById('voiceStatus');

        voiceBtns.forEach(btn => {
            if (btn) {
                if (isListening) {
                    btn.classList.remove('btn-outline-secondary');
                    btn.classList.add('btn-danger');
                    btn.innerHTML = '<i class="fas fa-stop"></i>';
                    btn.title = 'Stop Listening';
                } else {
                    btn.classList.remove('btn-danger');
                    btn.classList.add('btn-outline-secondary');
                    btn.innerHTML = '<i class="fas fa-microphone"></i>';
                    btn.title = 'Voice Input';
                }
            }
        });

        if (voiceStatus) {
            if (isListening) {
                voiceStatus.classList.remove('d-none');
            } else {
                voiceStatus.classList.add('d-none');
            }
        }
    }

    /**
     * Show voice error message
     */
    showVoiceError(error) {
        let message = 'Voice feature error';
        
        switch (error) {
            case 'not-allowed':
                message = 'Microphone access denied. Please allow microphone permissions.';
                break;
            case 'no-speech':
                message = 'No speech detected. Please try again.';
                break;
            case 'network':
                message = 'Network error. Please check your connection.';
                break;
            default:
                message = `Voice error: ${error}`;
        }

        console.error(message);
        
        if (error !== 'aborted') {
            setTimeout(() => alert(message), 100);
        }
    }

    /**
     * Hide voice features if not supported
     */
    hideVoiceFeatures() {
        const voiceElements = [
            document.getElementById('voiceInputBtn'),
            document.getElementById('voiceInputBtnMain'),
            document.getElementById('speakResponseBtn'),
            document.getElementById('speakResponseBtnMain')
        ];
        
        voiceElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
    }

    /**
     * Check if voice features are supported
     */
    isVoiceSupported() {
        return !!(this.recognition && this.synthesis);
    }
}

// Initialize voice assistant when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎤 Initializing Voice Assistant...');
    window.voiceAssistant = new VoiceAssistant();
    
    // Integrate with existing chat functionality
    setTimeout(() => {
        integrateVoiceWithChat();
    }, 500);
});

/**
 * Integrate voice features with existing chat functionality
 */
function integrateVoiceWithChat() {
    console.log('🔗 Integrating voice with chat functionality...');
    
    // Monitor for new messages being added to chat using MutationObserver
    observeChatMessages();
    
    // Hook into existing functions if they exist
    if (typeof window.sendMessage === 'function') {
        const originalSendMessage = window.sendMessage;
        window.sendMessage = function(...args) {
            // Stop any ongoing speech when sending a new message
            if (window.voiceAssistant && window.voiceAssistant.synthesis.speaking) {
                window.voiceAssistant.synthesis.cancel();
            }
            return originalSendMessage.apply(this, args);
        };
        console.log('✅ Hooked into sendMessage function');
    }

    // Hook into report question function
    if (typeof window.sendReportQuestion === 'function') {
        const originalSendReportQuestion = window.sendReportQuestion;
        window.sendReportQuestion = function(...args) {
            // Stop any ongoing speech when sending a new question
            if (window.voiceAssistant && window.voiceAssistant.synthesis.speaking) {
                window.voiceAssistant.synthesis.cancel();
            }
            return originalSendReportQuestion.apply(this, args);
        };
        console.log('✅ Hooked into sendReportQuestion function');
    }
}

/**
 * Monitor chat for new AI responses using MutationObserver
 */
function observeChatMessages() {
    const chatContainers = [
        document.getElementById('chatMessages'),
        document.getElementById('reportChatMessages'),
        document.querySelector('.chat-messages'),
        document.querySelector('#chat-messages')
    ];

    chatContainers.forEach((container, index) => {
        if (container) {
            console.log(`👀 Monitoring chat container ${index + 1} for new messages`);
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if this is an AI response
                            if (node.classList && (
                                node.classList.contains('assistant-message') ||
                                node.classList.contains('ai-message') ||
                                node.classList.contains('bot-message') ||
                                node.querySelector('.assistant-message') ||
                                node.querySelector('.ai-message') ||
                                node.querySelector('.bot-message')
                            )) {
                                // Extract text content and trigger speech
                                const messageText = node.textContent || node.innerText;
                                if (messageText && messageText.trim() && window.voiceAssistant) {
                                    console.log('🆕 New AI message detected:', messageText.substring(0, 50) + '...');
                                    window.voiceAssistant.updateLastResponse(messageText.trim());
                                }
                            }
                        }
                    });
                });
            });

            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });
}

// Export for use in other scripts
window.VoiceAssistant = VoiceAssistant;

// Global function to manually trigger voice response (for debugging)
window.triggerVoiceResponse = function(text) {
    if (window.voiceAssistant) {
        console.log('🎯 Manually triggering voice response:', text.substring(0, 50) + '...');
        window.voiceAssistant.updateLastResponse(text);
        if (window.voiceAssistant.autoSpeakEnabled) {
            window.voiceAssistant.speakText(text, true);
        }
    } else {
        console.warn('⚠️ Voice assistant not initialized');
    }
};

// Ensure the class is available globally
console.log('🎤 VoiceAssistant class loaded and available globally');
