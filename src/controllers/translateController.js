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
     * Translates a specific word within a given text context at a specific index.
     */
    static async translateWord(text, word, index) {
        const cleanContext = text.trim();
        const cleanWord = word.toLowerCase().trim();
        // Index is crucial for polysemy (same word, different position/meaning)
        const cacheKey = `${cleanContext}:${index}:${cleanWord}`;

        // CHECK CACHE
        if (this.cache.has(cacheKey)) {
            console.log(`TranslateController: Cache hit for "${cleanWord}" at index ${index}`);
            return this.cache.get(cacheKey);
        }

        try {
            const prompt = AiService.translateToMe(cleanContext, cleanWord, index);
            const response = await ApiClient.fetchGroq(prompt);

            // New Response format is { "translation": "..." }
            const translation = response.translation || Object.values(response)[0];

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
