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

export const getSavedApiKey = () => localStorage.getItem('groq_api_key');
export const saveApiKey = (key) => localStorage.setItem('groq_api_key', key);
export const isStaticMode = () => {
    const key = localStorage.getItem('groq_api_key');
    return !key || key === 'static' || key === '';
};

/**
 * Sends a message to Groq (Llama) and expects a JSON response with translation.
 */
export const chatWithGroq = async (messages, apiKey, learnedWords = [], ignoredWords = []) => {
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

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
