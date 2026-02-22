/**
 * Smart-Lern Voice Engine
 * Handles Text-to-Speech using the Web Speech API and ElevenLabs API.
 */

export const getElevenKeys = () => {
    const saved = localStorage.getItem('eleven_labs_keys');
    return saved ? JSON.parse(saved) : [];
};

export const saveElevenKeys = (keys) => {
    localStorage.setItem('eleven_labs_keys', JSON.stringify(keys));
};

export const validateElevenKey = async (apiKey) => {
    if (!apiKey || apiKey.trim().length < 10) return null;
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            headers: {
                'xi-api-key': apiKey.trim(),
                'Accept': 'application/json'
            }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
            status: 'good',
            usage: data.character_count,
            limit: data.character_limit,
            remaining: (data.character_limit - data.character_count),
            tier: data.tier
        };
    } catch (err) {
        return null;
    }
};

export const addElevenKey = async (key) => {
    const info = await validateElevenKey(key);
    if (info) {
        const keys = getElevenKeys();
        if (!keys.includes(key)) {
            keys.push(key);
            saveElevenKeys(keys);
        }
        return true;
    }
    return false;
};

export const removeElevenKey = (key) => {
    const keys = getElevenKeys();
    const filtered = keys.filter(k => k !== key);
    saveElevenKeys(filtered);
};

export const getActiveElevenKey = () => {
    const keys = getElevenKeys();
    return keys.length > 0 ? keys[0] : null;
};

export const rotateElevenKey = () => {
    const keys = getElevenKeys();
    if (keys.length > 1) {
        const [first, ...rest] = keys;
        const rotated = [...rest, first]; // Round Robin
        saveElevenKeys(rotated);
        return rotated[0];
    }
    return keys[0] || null;
};

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.audioElement = new Audio();
        this.onStateChange = null;
        this.state = 'idle'; // idle, loading, playing
        this.currentSequence = 0; // To prevent race conditions

        this.audioElement.onplay = () => this.updateState('playing');
        this.audioElement.onended = () => {
            if (this.state === 'playing') this.updateState('idle');
        };
        this.audioElement.onpause = () => {
            if (this.state === 'playing') this.updateState('idle');
        };
    }

    updateState(newState) {
        if (this.state === newState) return;
        this.state = newState;
        if (this.onStateChange) this.onStateChange(newState);
    }

    /**
     * Stop all current speech and reset state
     */
    stop() {
        this.currentSequence++; // Invalidate any pending async operations

        // Stop browser synth
        if (this.synth) {
            this.synth.cancel();
            // Some browsers need a second cancel or a pause/resume dance to clear the queue
            if (this.synth.speaking) {
                this.synth.pause();
                this.synth.resume();
                this.synth.cancel();
            }
        }

        // Stop ElevenLabs / Audio Element
        this.audioElement.pause();
        this.audioElement.src = "";
        this.audioElement.load(); // Forces reset

        this.updateState('idle');
    }

    /**
     * Calls ElevenLabs API to get high-quality audio.
     */
    async speakElevenLabs(text, langCode, sequenceId, forceVoice = null) {
        const key = getActiveElevenKey();
        if (!key) {
            return this.speakBrowser(text, langCode, forceVoice, sequenceId);
        }

        const customVoiceId = forceVoice || localStorage.getItem('selected_voice') || 'Female 1';

        const voiceMap = {
            en: {
                'Female 1': '21m00Tcm4TlvDq8ikWAM', // Rachel
                'Male 1': 'pNInz6obpgDQGcFmaJgB'    // Adam
            },
            ar: {
                'Female 1': '21m00Tcm4TlvDq8ikWAM',
                'Male 1': 'pNInz6obpgDQGcFmaJgB'
            }
        };

        const voiceId = voiceMap[langCode]?.[customVoiceId] || voiceMap.en[customVoiceId] || '21m00Tcm4TlvDq8ikWAM';

        try {
            this.updateState('loading');

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': key.trim(),
                    'Accept': 'audio/mpeg'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                })
            });

            if (sequenceId !== this.currentSequence) return; // Stale request

            if (!response.ok) {
                // If credits exhausted or key invalid, rotate and retry or fallback
                if (response.status === 401 || response.status === 403 || response.status === 429) {
                    const nextKey = rotateElevenKey();
                    if (nextKey) {
                        return this.speakElevenLabs(text, langCode, sequenceId, forceVoice);
                    } else {
                        return this.speakBrowser(text, langCode, customVoiceId, sequenceId);
                    }
                }
                throw new Error(`ElevenLabs failed: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (sequenceId !== this.currentSequence) return;

            this.audioElement.src = audioUrl;
            await this.audioElement.play();
        } catch (error) {
            console.error('ElevenLabs Error:', error);
            if (sequenceId === this.currentSequence) {
                this.speakBrowser(text, langCode, customVoiceId, sequenceId);
            }
        }
    }

    /**
     * Fallback to Web Speech API
     */
    async speakBrowser(text, langCode, forceVoice, sequenceId) {
        if (sequenceId !== this.currentSequence) return;

        // Ensure voices are loaded
        const voice = await this.getBestVoice(forceVoice || 'Female 1', langCode);

        if (sequenceId !== this.currentSequence) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = parseFloat(localStorage.getItem('voice_speed')) || 1.0;
        utterance.pitch = 1.0;
        // CRITICAL: Always use en-US if text is English, even if langCode is ar
        utterance.lang = langCode === 'ar' ? 'ar-SA' : 'en-US';

        utterance.onstart = () => {
            if (sequenceId === this.currentSequence) this.updateState('playing');
        };
        utterance.onend = () => {
            if (sequenceId === this.currentSequence) this.updateState('idle');
        };
        utterance.onerror = () => {
            if (sequenceId === this.currentSequence) this.updateState('idle');
        };

        // Small delay helps browser clear previous cancel properly
        setTimeout(() => {
            if (sequenceId === this.currentSequence) {
                this.synth.speak(utterance);
            }
        }, 50);
    }

    async getBestVoice(customId, langCode) {
        return new Promise((resolve) => {
            const check = () => {
                const voices = this.synth.getVoices();
                if (voices.length === 0) return false;

                const targetedLang = langCode === 'ar' ? 'ar' : 'en';
                // First try exact language match
                let matches = voices.filter(v => v.lang.startsWith(targetedLang));

                // If no English matches, try ANY English
                if (matches.length === 0 && targetedLang === 'en') {
                    matches = voices.filter(v => v.lang.toLowerCase().includes('en'));
                }

                // If still no matches, take anything
                if (matches.length === 0) matches = voices;

                const isFemale = customId.includes('Female');
                let best = matches.find(v =>
                    isFemale ? (v.name.includes('Female') || v.name.includes('Google US English') || v.name.includes('Zira'))
                        : (v.name.includes('Male') || v.name.includes('Google UK English Male') || v.name.includes('David'))
                );

                return best || matches[0];
            };

            const result = check();
            if (result) {
                resolve(result);
            } else {
                const handler = () => {
                    const r = check();
                    if (r) {
                        this.synth.removeEventListener('voiceschanged', handler);
                        resolve(r);
                    }
                };
                this.synth.addEventListener('voiceschanged', handler);
                // Safe timeout fallback
                setTimeout(() => {
                    this.synth.removeEventListener('voiceschanged', handler);
                    resolve(this.synth.getVoices()[0]);
                }, 1000);
            }
        });
    }

    async speak(text, forceLang = null, forceVoice = null) {
        this.stop(); // Increments sequence
        const seqId = this.currentSequence;

        const lang = forceLang || localStorage.getItem('app_lang') || 'en';
        const elevenKey = getActiveElevenKey();

        if (elevenKey) {
            await this.speakElevenLabs(text, lang, seqId, forceVoice);
        } else {
            await this.speakBrowser(text, lang, forceVoice, seqId);
        }
    }

    async speakBrowserOnly(text, forceLang = null, forceVoice = null) {
        this.stop();
        const seqId = this.currentSequence;
        const lang = forceLang || localStorage.getItem('app_lang') || 'en';
        await this.speakBrowser(text, lang, forceVoice, seqId);
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
        const text = previews[langCode]?.[voiceId] || previews.en['Female 1'];
        await this.speak(text, langCode, voiceId);
    }
}

export const voiceEngine = new VoiceEngine();
