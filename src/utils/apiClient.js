/**
 * ApiClient Class
 * Handles direct communication with the Groq API with retry logic and better error handling.
 */
export class ApiClient {
    static maxRetries = 2;
    static retryDelay = 1000; // 1 second

    /**
     * Rotates to the next API key when current one fails
     */
    static rotateApiKey() {
        const savedKeys = localStorage.getItem('groq_api_keys');
        const keys = savedKeys ? JSON.parse(savedKeys) : [];

        if (keys.length > 1) {
            const [first, ...rest] = keys;
            const rotated = [...rest, first];
            localStorage.setItem('groq_api_keys', JSON.stringify(rotated));
            return rotated[0];
        }
        return keys[0] || null;
    }

    /**
     * Wait for a specified amount of time
     */
    static wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Fetches a completion from Groq AI with retry logic.
     */
    static async fetchGroq(prompt, retryCount = 0) {
        const savedKeys = localStorage.getItem('groq_api_keys');
        const keys = savedKeys ? JSON.parse(savedKeys) : [];

        if (keys.length === 0) {
            throw new Error("No Groq API keys found. Please add one in settings.");
        }

        const apiKey = keys[0];

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
                const errorData = await response.json().catch(() => ({}));

                // Handle specific HTTP status codes
                if (response.status === 401) {
                    // Invalid API key - try next key if available
                    if (keys.length > 1 && retryCount < this.maxRetries) {
                        console.warn(`Invalid API key, rotating to next key...`);
                        this.rotateApiKey();
                        await this.wait(this.retryDelay);
                        return this.fetchGroq(prompt, retryCount + 1);
                    }
                    throw new Error("Invalid API key. Please check your Groq API keys in settings.");
                }

                if (response.status === 429) {
                    // Rate limit - retry with exponential backoff
                    if (retryCount < this.maxRetries) {
                        const delay = this.retryDelay * Math.pow(2, retryCount);
                        console.warn(`Rate limited, retrying in ${delay}ms...`);
                        await this.wait(delay);
                        return this.fetchGroq(prompt, retryCount + 1);
                    }
                    throw new Error("Rate limit exceeded. Please try again in a few moments.");
                }

                if (response.status >= 500) {
                    // Server error - retry
                    if (retryCount < this.maxRetries) {
                        console.warn(`Server error, retrying...`);
                        await this.wait(this.retryDelay);
                        return this.fetchGroq(prompt, retryCount + 1);
                    }
                    throw new Error("Server error. Please try again later.");
                }

                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error("Empty response from API");
            }

            try {
                return JSON.parse(content);
            } catch {
                console.error("Failed to parse JSON response:", content);
                throw new Error("Invalid response format from AI");
            }

        } catch (error) {
            // Network errors - retry
            if (error.name === 'TypeError' && retryCount < this.maxRetries) {
                console.warn(`Network error, retrying...`);
                await this.wait(this.retryDelay);
                return this.fetchGroq(prompt, retryCount + 1);
            }

            console.error("ApiClient.fetchGroq Error:", error);
            throw error;
        }
    }
}
