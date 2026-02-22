/**
 * Validates an xAI Grok API Key by making a minimal test call.
 */
export const validateGrokKey = async (apiKey) => {
    if (!apiKey) return false;

    try {
        const response = await fetch('https://api.x.ai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (err) {
        console.error("xAI Validation Error:", err);
        return false;
    }
};

export const getSavedApiKey = () => localStorage.getItem('groq_api_key'); // Keeping key for data persistence
export const saveApiKey = (key) => localStorage.setItem('groq_api_key', key);
export const isStaticMode = () => {
    const key = localStorage.getItem('groq_api_key');
    return !key || key === 'static' || key === '';
};

/**
 * Sends a message to xAI Grok and expects a JSON response with translation.
 */
export const chatWithGrok = async (messages, apiKey) => {
    const systemPrompt = `You are a helpful English teacher (Grok by xAI). 
    Rule 1: Keep your replies very short and simple (maximum 1 sentence).
    Rule 2: You MUST return a JSON object with this exact structure:
    { "text": "English response", "translate": { "key_word": "Arabic translation", ... } }
    Every difficult word should have a translation in the "translate" object.`;

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'grok-beta',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.5,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const errBody = await response.json();
            throw new Error(errBody.error?.message || 'xAI Grok API failed');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    } catch (err) {
        console.error("Grok Chat Error:", err);
        throw err;
    }
};
