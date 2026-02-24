import { ApiClient } from '../utils/apiClient';
import { AiService } from '../prompts/aiService';

/**
 * ChatController Class
 * Manages chat interactions with character personas.
 */
export class ChatController {
    /**
     * Sends a message to the AI and returns the response with character persona.
     */
    static async sendMessage(chatHistory, newMessage, favorites, ignored, characterId = 'girlfriend') {
        const prompt = AiService.replyMe(chatHistory, newMessage, favorites, ignored, characterId);
        return await ApiClient.fetchGroq(prompt);
    }
}
