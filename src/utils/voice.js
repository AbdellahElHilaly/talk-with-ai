/**
 * Smart-Lern Voice Engine
 * Handles Text-to-Speech using the Web Speech API and ElevenLabs API.
 */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPaused = false;
        this.audioElement = new Audio();
    }

    /**
     * Calls ElevenLabs API to get high-quality audio.
     */
    async speakElevenLabs(text, langCode, elevenKey, forceVoice = null) {
        const key = elevenKey.trim();
        const customVoiceId = forceVoice || localStorage.getItem('selected_voice') || 'Female 1';

        const voiceMap = {
            en: {
                'Female 1': '21m00Tcm4TlvDq8ikWAM', // Rachel (Most Stable Free Voice)
                'Male 1': 'pNInz6obpgDQGcFmaJgB'    // Adam (Most Stable Free Voice)
            },
            ar: {
                // Rachel and Adam support Arabic via Multilingual v2
                'Female 1': '21m00Tcm4TlvDq8ikWAM',
                'Male 1': 'pNInz6obpgDQGcFmaJgB'
            }
        };

        const voiceId = voiceMap[langCode][customVoiceId] || '21m00Tcm4TlvDq8ikWAM';

        const requestBody = {
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': key,
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('ElevenLabs API Error Status:', response.status, errorData);
                throw new Error(`ElevenLabs API failed: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            this.audioElement.src = audioUrl;

            // Handle playback errors
            this.audioElement.onerror = (e) => {
                console.error('Audio Element Error - Premium voice failed to play:', e);
            };

            await this.audioElement.play();
        } catch (error) {
            console.error('ElevenLabs TTS Error - Premium voice failed:', error);
            // Fallback disabled per user request: stop browser voices if API key exists
        }
    }

    /**
     * Fallback to Web Speech API
     */
    async speakBrowser(text, langCode, forceVoice = null) {
        const customVoiceId = forceVoice || localStorage.getItem('selected_voice') || 'Female 1';
        const speed = parseFloat(localStorage.getItem('voice_speed')) || 1.0;

        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.voice = await this.getBestVoice(customVoiceId, langCode);
        this.utterance.rate = speed;
        this.utterance.pitch = 1.0;
        this.utterance.lang = langCode === 'ar' ? 'ar-SA' : 'en-US';

        this.synth.speak(this.utterance);
    }

    async getBestVoice(customId, langCode = 'en') {
        return new Promise((resolve) => {
            let voices = this.synth.getVoices();

            const findMatch = () => {
                voices = this.synth.getVoices();
                const targetedLang = langCode === 'ar' ? 'ar' : 'en';
                const langVoices = voices.filter(v => v.lang.startsWith(targetedLang));

                if (langVoices.length === 0 && targetedLang === 'ar') {
                    return voices.find(v => v.lang.startsWith('en')) || voices[0];
                }

                if (customId.includes('Female')) {
                    return langVoices.find(v => v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Zira') || v.name.includes('Hoda')) || langVoices[0];
                } else {
                    return langVoices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male') || v.name.includes('David') || v.name.includes('Naayf')) || langVoices[1] || langVoices[0];
                }
            };

            if (voices.length > 0) {
                resolve(findMatch());
            } else {
                this.synth.onvoiceschanged = () => resolve(findMatch());
            }
        });
    }

    async speak(text, forceLang = null, forceVoice = null) {
        const elevenKey = localStorage.getItem('eleven_labs_key');
        const currentAppLang = localStorage.getItem('app_lang') || 'en';
        const speechLang = forceLang || currentAppLang;

        this.stop();

        if (elevenKey && elevenKey.length > 10) {
            await this.speakElevenLabs(text, speechLang, elevenKey, forceVoice);
        } else {
            await this.speakBrowser(text, speechLang, forceVoice);
        }
    }

    async speakPreview(voiceId, langCode) {
        const previews = {
            en: {
                'Female 1': "Wisdom begins in wonder. Let's bloom together.",
                'Male 1': "The only true knowledge is knowing you know nothing. Shall we explore?"
            },
            ar: {
                'Female 1': "الحكمة تبدأ بالدهشة. لنزهر معاً في رحلة العلم.",
                'Male 1': "المعرفة الحقيقية هي أن تعرف عمق جهلك. هل نبدأ الاستكشاف؟"
            }
        };

        const text = previews[langCode][voiceId] || previews[langCode]['Female 1'];

        const elevenKey = localStorage.getItem('eleven_labs_key');
        if (elevenKey && elevenKey.length > 10) {
            await this.speakElevenLabs(text, langCode, elevenKey, voiceId);
        } else {
            await this.speakBrowser(text, langCode, voiceId);
        }
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.isPaused = true;
        }
        if (!this.audioElement.paused) {
            this.audioElement.pause();
            this.isPaused = true;
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
        }
        if (this.audioElement.paused && this.audioElement.src) {
            this.audioElement.play();
            this.isPaused = false;
        }
    }

    stop() {
        this.synth.cancel();
        this.audioElement.pause();
        this.audioElement.src = "";
        this.isPaused = false;
    }
}

export const voiceEngine = new VoiceEngine();
