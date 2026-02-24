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
     * Used for contextual translation in chat (when clicking words).
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

    /**
     * Translates vocabulary words using dictionary-style translation.
     * Used for vocabulary page when adding new words manually.
     * Includes spell correction - AI will respond with correct word and translation.
     */
    static async translateVocabulary(words) {
        try {
            // Convert single word to array if needed
            const wordArray = Array.isArray(words) ? words : [words];
            const cleanWords = wordArray.map(w => w.trim()).filter(w => w.length > 0);
            
            if (cleanWords.length === 0) {
                throw new Error('لا توجد كلمات للترجمة');
            }

            const prompt = AiService.translateVocab(cleanWords);
            const response = await ApiClient.fetchGroq(prompt);

            // Response format should be: { "word1": "ترجمة1", "word2": "ترجمة2" }
            if (typeof response === 'object' && response !== null) {
                return response;
            } else {
                throw new Error('تنسيق الاستجابة غير صحيح');
            }
        } catch (error) {
            console.error("TranslateController Vocabulary Error:", error);
            throw error;
        }
    }
}
