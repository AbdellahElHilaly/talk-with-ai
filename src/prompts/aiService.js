import { CHAT_PROMPT } from './chat';
import { TRANSLATE_PROMPT } from './translate';

/**
 * AiService Class
 * Handles prompt construction and template management.
 */
export class AiService {
    /**
     * Constructs the prompt for a chat response.
     */
    static replyMe(chatHistory, newMessage, favorites, ignored) {
        let prompt = CHAT_PROMPT;

        const historyStr = chatHistory
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        prompt = prompt.replace('%history', historyStr);
        prompt = prompt.replace('%input', newMessage);
        prompt = prompt.replace('%favorites', JSON.stringify(favorites));
        prompt = prompt.replace('%ignoring', JSON.stringify(ignored));

        return prompt;
    }

    /**
     * Constructs the prompt for a word translation.
     */
    static translateToMe(context, words) {
        let prompt = TRANSLATE_PROMPT;

        prompt = prompt.replace('%context', context);
        prompt = prompt.replace('%words', words.join(', '));

        return prompt;
    }
}
