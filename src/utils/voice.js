/**
 * Smart-Lern Voice Engine
 * Handles Text-to-Speech using the Web Speech API and Google Cloud TTS API.
 */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPaused = false;
        this.audioElement = new Audio();
    }

    /**
     * Calls Google Cloud TTS API to get high-quality audio.
     */
    async speakGoogleCloud(text, langCode, googleKey) {
        const customVoiceId = localStorage.getItem('selected_voice') || 'Female 1';
        const speed = parseFloat(localStorage.getItem('voice_speed')) || 1.0;

        // Map our custom voice IDs to Google Cloud Voice Names
        const voiceMap = {
            en: {
                'Female 1': 'en-US-Neural2-F',
                'Male 1': 'en-US-Neural2-D',
                'Female 2': 'en-GB-Neural2-C',
                'Male 2': 'en-GB-Neural2-B'
            },
            ar: {
                'Female 1': 'ar-XA-Wavenet-A',
                'Male 1': 'ar-XA-Wavenet-B',
                'Female 2': 'ar-XA-Wavenet-D',
                'Male 2': 'ar-XA-Wavenet-C'
            }
        };

        const voiceName = voiceMap[langCode][customVoiceId] || (langCode === 'ar' ? 'ar-XA-Wavenet-A' : 'en-US-Neural2-F');

        const requestBody = {
            input: { text: text },
            voice: {
                languageCode: langCode === 'ar' ? 'ar-XA' : 'en-US',
                name: voiceName
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speed
            }
        };

        try {
            const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('Google Cloud TTS API failed');

            const data = await response.json();
            const audioBlob = this.base64ToBlob(data.audioContent, 'audio/mp3');
            const audioUrl = URL.createObjectURL(audioBlob);

            this.audioElement.src = audioUrl;
            this.audioElement.play();
        } catch (error) {
            console.error('Google Cloud TTS Error:', error);
            // Fallback to browser synth
            this.speakBrowser(text, langCode);
        }
    }

    base64ToBlob(base64, type) {
        const binStr = atob(base64);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        return new Blob([arr], { type: type });
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
        const googleKey = localStorage.getItem('google_tts_key');
        const currentAppLang = localStorage.getItem('app_lang') || 'en';
        const speechLang = forceLang || currentAppLang;

        this.stop();

        if (googleKey && googleKey.length > 10) {
            await this.speakGoogleCloud(text, speechLang, googleKey);
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
                'Male 2': "A journey of a thousand miles begins with a single word. I am Boreas."
            },
            ar: {
                'Female 1': "الحكمة تبدأ بالدهشة. لنزهر معاً في رحلة العلم.",
                'Male 1': "المعرفة الحقيقية هي أن تعرف عمق جهلك. هل نبدأ الاستكشاف؟",
                'Female 2': "النجوم لا تخشى اللمعان في الظلام. أطلق العنان لأفكارك.",
                'Male 2': "رحلة الألف ميل تبدأ بكلمة واحدة. أنا بورياس، رفيقك."
            }
        };

        const text = previews[langCode][voiceId] || previews[langCode]['Female 1'];

        // Temporarily override for preview playback
        const googleKey = localStorage.getItem('google_tts_key');
        if (googleKey && googleKey.length > 10) {
            await this.speakGoogleCloud(text, langCode, googleKey);
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
