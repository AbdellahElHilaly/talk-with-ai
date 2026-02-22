/**
 * Validates a Groq API Key by making a minimal test call.
 */
export const validateGroqKey = async (apiKey) => {
    if (!apiKey || !apiKey.startsWith('gsk_')) return false;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (err) {
        console.error("Groq Validation Error:", err);
        return false;
    }
};

export const getGroqKeys = () => {
    const saved = localStorage.getItem('groq_api_keys');
    return saved ? JSON.parse(saved) : [];
};

export const saveGroqKeys = (keys) => {
    localStorage.setItem('groq_api_keys', JSON.stringify(keys));
};

export const addGroqKey = async (key) => {
    const isValid = await validateGroqKey(key);
    if (isValid) {
        const keys = getGroqKeys();
        if (!keys.includes(key)) {
            keys.push(key);
            saveGroqKeys(keys);
        }
        return true;
    }
    return false;
};

export const removeGroqKey = (key) => {
    const keys = getGroqKeys();
    const filtered = keys.filter(k => k !== key);
    saveGroqKeys(filtered);
};

export const getActiveGroqKey = () => {
    const keys = getGroqKeys();
    return keys.length > 0 ? keys[0] : null;
};

export const rotateGroqKey = () => {
    const keys = getGroqKeys();
    if (keys.length > 0) {
        const [first, ...rest] = keys;
        saveGroqKeys(rest);
        return rest.length > 0 ? rest[0] : null;
    }
    return null;
};

export const isStaticMode = () => {
    const keys = getGroqKeys();
    return keys.length === 0;
};

/**
 * Sends a message to Groq (Llama) and expects a JSON response with translation.
 */
export const chatWithGroq = async (messages, learnedWords = [], ignoredWords = []) => {
    let apiKey = getActiveGroqKey();
    if (!apiKey) throw new Error('No API key available');

    let vocabularyInstructions = '';
    if (learnedWords.length > 0) {
        vocabularyInstructions += `\n- The user is learning these words: [${learnedWords.join(', ')}]. TRY to use them in your response if they fit naturally. If you use them, you MUST include them in the "translate" object.`;
    }
    if (ignoredWords.length > 0) {
        vocabularyInstructions += `\n- AVOID using these words if possible: [${ignoredWords.join(', ')}]. If you choose to use them anyway, DO NOT include them in the "translate" object.`;
    }

    const systemPrompt = `You are a helpful English teacher powered by Llama. 
    Rule 1: Keep your replies conversational and educational (2-3 sentences).
    Rule 2: You MUST return a JSON object with this exact structure:
    { "text": "Your English response", "translate": { "word": "translation", ... } }
    Rule 3: You MUST provide accurately translated Arabic meanings for words in the "translate" object.
    ${vocabularyInstructions}
    Rule 4: Besides the words mentioned above, identify 2-3 other educational keywords from your response and translate them into Arabic.`;

    const attemptChat = async (currentKey) => {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages
                    ],
                    temperature: 0.5,
                    response_format: { type: "json_object" }
                })
            });

            if (response.status === 401 || response.status === 429) {
                // Key invalid or rate limited - rotate and retry
                const nextKey = rotateGroqKey();
                if (nextKey) {
                    return attemptChat(nextKey);
                } else {
                    throw new Error('All API keys exhausted or invalid');
                }
            }

            if (!response.ok) {
                const errBody = await response.json();
                throw new Error(errBody.error?.message || 'Groq API failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            return JSON.parse(content);
        } catch (err) {
            console.error("Groq Chat Error:", err);
            throw err;
        }
    };

    return attemptChat(apiKey);
};
