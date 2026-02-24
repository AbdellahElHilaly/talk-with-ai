import { CHAT_PROMPT } from './chat';
import { TRANSLATE_PROMPT } from './translate';
import { VOCAB_TRANSLATE_PROMPT } from './vocabulary';

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
    static translateToMe(context, word, index) {
        let prompt = TRANSLATE_PROMPT;

        prompt = prompt.replace('%text', context);
        prompt = prompt.replace('%word', word);
        prompt = prompt.replace('%index', index);

        return prompt;
    }

    /**
     * Constructs the prompt for standard vocabulary translations (batch).
     */
    static translateVocab(words) {
        let prompt = VOCAB_TRANSLATE_PROMPT;
        prompt = prompt.replace('%words', words.join(', '));
        return prompt;
    }
}
