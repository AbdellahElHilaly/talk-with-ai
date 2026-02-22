/**
 * Validates a Groq API Key by making a minimal test call.
 * @param {string} apiKey 
 * @returns {Promise<boolean>}
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
        console.error("API Validation Error:", err);
        return false;
    }
};

export const getSavedApiKey = () => localStorage.getItem('groq_api_key');
export const saveApiKey = (key) => localStorage.setItem('groq_api_key', key);
export const isStaticMode = () => localStorage.getItem('groq_api_key') === 'static';
