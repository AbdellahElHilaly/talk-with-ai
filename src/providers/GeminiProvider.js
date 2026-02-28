/**
 * Gemini Provider
 * Uses the OpenAI-compatible endpoint that Google provides for Gemini.
 * Base URL: https://generativelanguage.googleapis.com/v1beta/openai/
 * Keys start with "AIza..."
 */

const STORAGE_KEY = 'gemini_api_keys';

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

export const GeminiProvider = {
    id: 'gemini',
    name: 'Google Gemini',
    nameAr: 'جيميني من جوجل',
    icon: '✨',
    color: '#4285F4',
    description: 'Google\'s most capable multimodal models',
    descriptionAr: 'نماذج جوجل متعددة الوسائط الأكثر قدرة',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefix: 'AIza',
    storageKey: STORAGE_KEY,
    defaultModel: 'gemini-2.0-flash',

    models: [
        {
            id: 'gemini-2.0-flash',
            name: 'Gemini 2.0 Flash',
            description: 'Fastest Gemini — great for real-time chat',
            descriptionAr: 'أسرع جيميني — رائع للمحادثات الفورية',
            badge: 'Recommended',
        },
        {
            id: 'gemini-1.5-flash',
            name: 'Gemini 1.5 Flash',
            description: 'Speed & efficiency — long context window',
            descriptionAr: 'السرعة والكفاءة — نافذة سياق طويلة',
            badge: 'Fast',
        },
        {
            id: 'gemini-1.5-pro',
            name: 'Gemini 1.5 Pro',
            description: 'Best quality — complex reasoning tasks',
            descriptionAr: 'أعلى جودة — مهام الاستدلال المعقدة',
            badge: 'Powerful',
        },
        {
            id: 'gemini-2.0-flash-thinking-exp',
            name: 'Gemini 2.0 Thinking',
            description: 'Experimental thinking / reasoning mode',
            descriptionAr: 'وضع التفكير التجريبي',
            badge: null,
        },
    ],

    getKeys,
    saveKeys,

    async validateKey(apiKey) {
        if (!apiKey || !apiKey.startsWith('AIza')) return false;
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
            );
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
     * Fetches a completion from the Gemini OpenAI-compatible endpoint.
     * Note: Gemini does not support response_format: json_object on all models,
     * so we enforce JSON via the prompt and extract with regex.
     */
    async fetchCompletion(prompt, modelId, retryCount = 0) {
        const maxRetries = 2;
        const retryDelay = 1000;
        const keys = getKeys();

        if (keys.length === 0) throw new Error('NO_KEYS');

        const apiKey = keys[0];
        const model = modelId || this.defaultModel;
        const wait = (ms) => new Promise(r => setTimeout(r, ms));

        try {
            const response = await fetch(
                'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey.trim()}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.1,
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));

                if (response.status === 401 || response.status === 403) {
                    if (keys.length > 1 && retryCount < maxRetries) {
                        rotateKeys();
                        await wait(retryDelay);
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('Invalid Gemini API key. Please check your keys.');
                }

                if (response.status === 429) {
                    if (retryCount < maxRetries) {
                        await wait(retryDelay * Math.pow(2, retryCount));
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('Gemini rate limit exceeded. Please try again.');
                }

                if (response.status >= 500 && retryCount < maxRetries) {
                    await wait(retryDelay);
                    return this.fetchCompletion(prompt, modelId, retryCount + 1);
                }

                throw new Error(err.error?.message || `Gemini API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from Gemini');

            // Extract JSON (Gemini may wrap it in markdown code blocks)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in Gemini response');

            return JSON.parse(jsonMatch[0]);

        } catch (error) {
            if (error.name === 'TypeError' && retryCount < 2) {
                await wait(retryDelay);
                return this.fetchCompletion(prompt, modelId, retryCount + 1);
            }
            throw error;
        }
    }
};
