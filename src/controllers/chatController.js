import { ApiClient } from '../utils/apiClient';
import { AiService } from '../prompts/aiService';

/**
 * ChatController Class
 * Manages chat interactions.
 */
export class ChatController {
    /**
     * Sends a message to the AI and returns the response.
     */
    static async sendMessage(chatHistory, newMessage, favorites, ignored) {
        const prompt = AiService.replyMe(chatHistory, newMessage, favorites, ignored);
        return await ApiClient.fetchGroq(prompt);
    }
}
