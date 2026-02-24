/**
 * ApiClient Class
 * Handles direct communication with the Groq API.
 */
export class ApiClient {
    /**
     * Fetches a completion from Groq AI.
     */
    static async fetchGroq(prompt) {
        const savedKeys = localStorage.getItem('groq_api_keys');
        const keys = savedKeys ? JSON.parse(savedKeys) : [];

        if (keys.length === 0) {
            throw new Error("No Groq API keys found. Please add one in settings.");
        }

        const apiKey = keys[0]; // Simple rotation or selection can be added here

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
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            return JSON.parse(content);
        } catch (error) {
            console.error("ApiClient.fetchGroq Error:", error);
            throw error;
        }
    }
}
