/**
 * Smart-Lern Voice Engine
 * Handles Text-to-Speech using the Web Speech API.
 */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.utterance = null;
        this.isPaused = false;
    }

    /**
     * Gets available voices and attempts to find a match based on the selected custom ID.
     * @param {string} customId - The ID from our settings (e.g., 'Female 1')
     * @param {string} langCode - 'en' or 'ar'
     */
    async getBestVoice(customId, langCode = 'en') {
        return new Promise((resolve) => {
            let voices = this.synth.getVoices();

            const findMatch = () => {
                voices = this.synth.getVoices();
                const targetedLang = langCode === 'ar' ? 'ar' : 'en';
                const langVoices = voices.filter(v => v.lang.startsWith(targetedLang));

                if (langVoices.length === 0 && targetedLang === 'ar') {
                    // Fallback to English if no Arabic voice found
                    return voices.find(v => v.lang.startsWith('en')) || voices[0];
                }

                if (customId.includes('Female')) {
                    // Priority list for female voices
                    return langVoices.find(v =>
                        v.name.includes('Female') ||
                        v.name.includes('Google US English') ||
                        v.name.includes('Zira') ||
                        v.name.includes('Hoda') ||
                        v.name.includes('Microsoft Mary')
                    ) || langVoices[0];
                } else {
                    // Priority list for male voices
                    return langVoices.find(v =>
                        v.name.includes('Male') ||
                        v.name.includes('Google UK English Male') ||
                        v.name.includes('David') ||
                        v.name.includes('Naayf') ||
                        v.name.includes('Microsoft Mike')
                    ) || langVoices[1] || langVoices[0];
                }
            };

            if (voices.length > 0) {
                resolve(findMatch());
            } else {
                this.synth.onvoiceschanged = () => resolve(findMatch());
            }
        });
    }

    /**
     * Speaks the given text.
     * @param {string} text 
     * @param {string} forceLang - 'en' or 'ar'
     * @param {string} forceVoice - Optional override for the voice ID
     */
    async speak(text, forceLang = null, forceVoice = null) {
        const customVoiceId = forceVoice || localStorage.getItem('selected_voice') || 'Female 1';
        const speed = parseFloat(localStorage.getItem('voice_speed')) || 1.0;
        const currentAppLang = localStorage.getItem('app_lang') || 'en';
        const speechLang = forceLang || currentAppLang;

        this.stop();

        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.voice = await this.getBestVoice(customVoiceId, speechLang);
        this.utterance.rate = speed;
        this.utterance.pitch = 1.0;
        this.utterance.lang = speechLang === 'ar' ? 'ar-SA' : 'en-US';

        this.synth.speak(this.utterance);
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
        // Crucial fix: Pass voiceId to ensure the selected voice plays
        await this.speak(text, langCode, voiceId);
    }

    pause() {
        if (this.synth.speaking && !this.synth.paused) {
            this.synth.pause();
            this.isPaused = true;
        }
    }

    resume() {
        if (this.synth.paused) {
            this.synth.resume();
            this.isPaused = false;
        }
    }

    stop() {
        this.synth.cancel();
        this.isPaused = false;
    }
}

export const voiceEngine = new VoiceEngine();
