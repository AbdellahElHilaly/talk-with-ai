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
    async speakElevenLabs(text, langCode, elevenKey) {
        const key = elevenKey.trim();
        const customVoiceId = localStorage.getItem('selected_voice') || 'Female 1';

        const voiceMap = {
            en: {
                'Female 1': '21m00Tcm4TlvDq8ikWAM', // Rachel (Safe)
                'Male 1': 'pNInz6obpgDQGcFmaJgB',   // Adam (Safe)
                'Female 2': 'EXAVITQu4vr4xnSDxMaL', // Bella (Safe)
                'Male 2': 'VR6AewrXVreHct0p9W69',   // Arnold (Safe)
                'Female 3': 'AZnzlk1Xhk61S3Y90Yx8', // Nicole (Safe)
                'Male 3': 'txP8QU9LUOocPaU3bhoc'    // Josh (Safe)
            },
            ar: {
                // Using the same Safe Pre-made voices as they support Multilingual v2
                'Female 1': '21m00Tcm4TlvDq8ikWAM',
                'Male 1': 'pNInz6obpgDQGcFmaJgB',
                'Female 2': 'EXAVITQu4vr4xnSDxMaL',
                'Male 2': 'VR6AewrXVreHct0p9W69',
                'Female 3': 'AZnzlk1Xhk61S3Y90Yx8',
                'Male 3': 'txP8QU9LUOocPaU3bhoc'
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
                console.error('Audio Element Error:', e);
                this.speakBrowser(text, langCode);
            };

            await this.audioElement.play();
        } catch (error) {
            console.error('ElevenLabs TTS Error:', error);
            // Fallback to browser synth
            this.speakBrowser(text, langCode);
        }
    }

    /**
     * Fallback to Web Speech API
     */
    async speakBrowser(text, langCode) {
        const customVoiceId = localStorage.getItem('selected_voice') || 'Female 1';
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
            await this.speakElevenLabs(text, speechLang, elevenKey);
        } else {
            await this.speakBrowser(text, speechLang);
        }
    }

    async speakPreview(voiceId, langCode) {
        const previews = {
            en: {
                'Female 1': "Wisdom begins in wonder. Let's bloom together.",
                'Male 1': "The only true knowledge is knowing you know nothing. Shall we explore?",
                'Female 2': "The stars are not afraid to shine in the dark. Voice your thoughts.",
                'Male 2': "A journey of a thousand miles begins with a single word. I am Arnold.",
                'Female 3': "Kindness is a language which the deaf can hear and the blind can see.",
                'Male 3': "Everything you've ever wanted is on the other side of fear."
            },
            ar: {
                'Female 1': "الحكمة تبدأ بالدهشة. لنزهر معاً في رحلة العلم.",
                'Male 1': "المعرفة الحقيقية هي أن تعرف عمق جهلك. هل نبدأ الاستكشاف؟",
                'Female 2': "النجوم لا تخشى اللمعان في الظلام. أطلق العنان لأفكارك.",
                'Male 2': "رحلة الألف ميل تبدأ بكلمة واحدة. أنا آرنولد، رفيقك.",
                'Female 3': "اللطف لغة يسمعها الأصم ويراها الكفيف. أنا نيكول.",
                'Male 3': "كل ما تريده يقع على الجانب الآخر من الخوف. أنا جوش."
            }
        };

        const text = previews[langCode][voiceId] || previews[langCode]['Female 1'];

        const elevenKey = localStorage.getItem('eleven_labs_key');
        if (elevenKey && elevenKey.length > 10) {
            await this.speakElevenLabs(text, langCode, elevenKey);
        } else {
            await this.speakBrowser(text, langCode);
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
