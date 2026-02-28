/**
 * Groq Provider
 * Implements the AI provider interface for Groq (LLaMA models).
 */

const STORAGE_KEY = 'groq_api_keys';

const getKeys = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveKeys = (keys) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

const rotateKeys = () => {
    const keys = getKeys();
    if (keys.length > 1) {
        const [first, ...rest] = keys;
        const rotated = [...rest, first];
        saveKeys(rotated);
        return rotated[0];
    }
    return keys[0] || null;
};

export const GroqProvider = {
    id: 'groq',
    name: 'Groq (LLaMA)',
    nameAr: 'جروك (لاما)',
    icon: '⚡',
    color: '#f55036',
    description: 'Ultra-fast inference powered by LLaMA 3.3',
    descriptionAr: 'استنتاج فائق السرعة مدعوم بـ LLaMA 3.3',
    docsUrl: 'https://console.groq.com/keys',
    keyPrefix: 'gsk_',
    storageKey: STORAGE_KEY,
    defaultModel: 'llama-3.3-70b-versatile',

    models: [
        {
            id: 'llama-3.3-70b-versatile',
            name: 'LLaMA 3.3 70B',
            description: 'Best quality & speed balance',
            descriptionAr: 'أفضل توازن بين الجودة والسرعة',
            badge: 'Recommended',
        },
        {
            id: 'llama-3.1-8b-instant',
            name: 'LLaMA 3.1 8B Instant',
            description: 'Fastest — great for quick chats',
            descriptionAr: 'الأسرع — رائع للمحادثات السريعة',
            badge: 'Fast',
        },
        {
            id: 'gemma2-9b-it',
            name: 'Gemma 2 9B',
            description: 'Google\'s efficient model',
            descriptionAr: 'نموذج جوجل الفعّال',
            badge: null,
        },
    ],

    getKeys,
    saveKeys,

    async validateKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('gsk_')) return false;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    async addKey(key) {
        const isValid = await this.validateKey(key);
        if (isValid) {
            const keys = getKeys();
            if (!keys.includes(key)) {
                keys.push(key);
                saveKeys(keys);
            }
            return true;
        }
        return false;
    },

    removeKey(key) {
        const keys = getKeys();
        saveKeys(keys.filter(k => k !== key));
    },

    getActiveKey() {
        const keys = getKeys();
        return keys.length > 0 ? keys[0] : null;
    },

    /**
     * Sends a prompt to Groq API and returns a parsed JSON object.
     */
    async fetchCompletion(prompt, modelId, retryCount = 0) {
        const maxRetries = 2;
        const retryDelay = 1000;
        const keys = getKeys();

        if (keys.length === 0) {
            throw new Error('NO_KEYS');
        }

        const apiKey = keys[0];
        const model = modelId || this.defaultModel;

        const wait = (ms) => new Promise(r => setTimeout(r, ms));

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.1,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    if (keys.length > 1 && retryCount < maxRetries) {
                        rotateKeys();
                        await wait(retryDelay);
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('Invalid API key. Please check your Groq keys in settings.');
                }

                if (response.status === 429) {
                    if (retryCount < maxRetries) {
                        await wait(retryDelay * Math.pow(2, retryCount));
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('Rate limit exceeded. Please try again.');
                }

                if (response.status >= 500 && retryCount < maxRetries) {
                    await wait(retryDelay);
                    return this.fetchCompletion(prompt, modelId, retryCount + 1);
                }

                throw new Error(err.error?.message || `Groq API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from Groq');

            return JSON.parse(content);

        } catch (error) {
            if (error.name === 'TypeError' && retryCount < 2) {
                await wait(retryDelay);
                return this.fetchCompletion(prompt, modelId, retryCount + 1);
            }
            throw error;
        }
    }
};
