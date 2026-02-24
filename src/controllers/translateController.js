import { ApiClient } from '../utils/apiClient';
import { AiService } from '../prompts/aiService';

/**
 * TranslateController Class
 * Manages translation interactions with internal session-level caching.
 */
export class TranslateController {
    // Session-level cache: { "context-word": "translation" }
    static cache = new Map();

    /**
     * Translates a specific word within a given text context.
     * Uses cache to prevent redundant API requests for the same word in the same context.
     */
    static async translateWord(text, word) {
        const cleanContext = text.trim();
        const cleanWord = word.toLowerCase().trim();
        const cacheKey = `${cleanContext}:${cleanWord}`;

        // CHECK CACHE
        if (this.cache.has(cacheKey)) {
            console.log(`TranslateController: Cache hit for "${cleanWord}"`);
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = AiService.translateToMe(cleanContext, [cleanWord]);
            const response = await ApiClient.fetchGroq(prompt);

            // Response is expected to be { "word": "translation" }
            const translation = response[word] || response[cleanWord] || Object.values(response)[0];

            // SAVE TO CACHE
            if (translation) {
                this.cache.set(cacheKey, translation);
            }

            return translation;
        } catch (error) {
            console.error("TranslateController Error:", error);
            throw error;
        }
    }
}
