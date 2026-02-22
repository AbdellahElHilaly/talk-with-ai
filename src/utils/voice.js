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
     */
    async getBestVoice(customId) {
        return new Promise((resolve) => {
            let voices = this.synth.getVoices();

            const findMatch = () => {
                voices = this.synth.getVoices();
                // Simple mapping logic: 
                // We look for English voices that match female/male patterns
                const enVoices = voices.filter(v => v.lang.startsWith('en'));

                if (customId.includes('Female')) {
                    // Look for Google US English or similar natural female sounding ones
                    return enVoices.find(v => v.name.includes('Female') || v.name.includes('Google US English')) || enVoices[0];
                } else {
                    return enVoices.find(v => v.name.includes('Male') || v.name.includes('Google UK English Male')) || enVoices[1] || enVoices[0];
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
     */
    async speak(text) {
        const customVoiceId = localStorage.getItem('selected_voice') || 'Female 1';
        const speed = parseFloat(localStorage.getItem('voice_speed')) || 1.0;

        this.stop();

        this.utterance = new SpeechSynthesisUtterance(text);
        this.utterance.voice = await this.getBestVoice(customVoiceId);
        this.utterance.rate = speed;
        this.utterance.pitch = 1.0;
        this.utterance.lang = 'en-US';

        this.synth.speak(this.utterance);
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
