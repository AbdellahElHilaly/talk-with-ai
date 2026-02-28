/**
 * DeepSeek Provider
 * Implements the AI provider interface for DeepSeek.
 * DeepSeek API is fully compatible with OpenAI format —
 * only the baseURL and model names differ.
 */

const STORAGE_KEY = 'deepseek_api_keys';

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

export const DeepSeekProvider = {
    id: 'deepseek',
    name: 'DeepSeek',
    nameAr: 'ديب سيك',
    icon: '🌊',
    color: '#4D6BFE',
    description: 'Powerful reasoning models by DeepSeek AI',
    descriptionAr: 'نماذج استدلال قوية من DeepSeek AI',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    keyPrefix: 'sk-',
    storageKey: STORAGE_KEY,
    defaultModel: 'deepseek-chat',

    models: [
        {
            id: 'deepseek-chat',
            name: 'DeepSeek Chat (V3)',
            description: 'Fast & smart general purpose model',
            descriptionAr: 'نموذج سريع وذكي للأغراض العامة',
            badge: 'Recommended',
        },
        {
            id: 'deepseek-reasoner',
            name: 'DeepSeek Reasoner (R1)',
            description: 'Deep thinking mode — best for complex tasks',
            descriptionAr: 'وضع التفكير العميق — الأفضل للمهام المعقدة',
            badge: 'Powerful',
        },
    ],

    getKeys,
    saveKeys,

    async validateKey(apiKey) {
        if (!apiKey || apiKey.trim().length < 10) return false;
        try {
            const response = await fetch('https://api.deepseek.com/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Accept': 'application/json'
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
     * Sends a prompt to DeepSeek API and returns a parsed JSON object.
     * DeepSeek is OpenAI-compatible, so the structure is identical to Groq.
     * Note: deepseek-reasoner does NOT support response_format: json_object,
     * so we use a prompt-level instruction for JSON output on that model.
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
        const isReasoner = model === 'deepseek-reasoner';

        const wait = (ms) => new Promise(r => setTimeout(r, ms));

        // deepseek-reasoner does not support json_object response_format,
        // so we omit it and rely on the prompt to enforce JSON output.
        const bodyPayload = {
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: isReasoner ? undefined : 0.1,
            ...(isReasoner ? {} : { response_format: { type: 'json_object' } })
        };

        try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(bodyPayload)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    if (keys.length > 1 && retryCount < maxRetries) {
                        rotateKeys();
                        await wait(retryDelay);
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('Invalid DeepSeek API key. Please check your keys in settings.');
                }

                if (response.status === 429) {
                    if (retryCount < maxRetries) {
                        await wait(retryDelay * Math.pow(2, retryCount));
                        return this.fetchCompletion(prompt, modelId, retryCount + 1);
                    }
                    throw new Error('DeepSeek rate limit exceeded. Please try again.');
                }

                if (response.status >= 500 && retryCount < maxRetries) {
                    await wait(retryDelay);
                    return this.fetchCompletion(prompt, modelId, retryCount + 1);
                }

                throw new Error(err.error?.message || `DeepSeek API Error: ${response.status}`);
            }

            const data = await response.json();
            // For deepseek-reasoner, content is in choices[0].message.content
            // (reasoning_content is the thinking chain — we ignore it)
            const content = data.choices[0]?.message?.content;
            if (!content) throw new Error('Empty response from DeepSeek');

            // Extract JSON from the response (reasoner may wrap it in markdown)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON found in DeepSeek response');

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
