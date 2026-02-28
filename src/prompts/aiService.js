import { CHAT_PROMPT } from './chat';
import { TRANSLATE_PROMPT } from './translate';
import { VOCAB_TRANSLATE_PROMPT } from './vocabulary';
import { CHARACTERS, DEFAULT_CHARACTER } from './characters';

/**
 * AiService Class
 * Handles prompt construction and template management.
 */
export class AiService {
    /**
     * Constructs the prompt for a chat response with character persona.
     */
    static replyMe(chatHistory, newMessage, favorites, ignored, characterId = 'girlfriend') {
        let prompt = CHAT_PROMPT;

        const character = CHARACTERS[characterId] || DEFAULT_CHARACTER;

        // Use the compact systemPrompt if available (saves tokens & avoids rate limits).
        // Otherwise fall back to the full personality + speakingStyle fields.
        const characterPrompt = character.systemPrompt
            ? `${character.systemPrompt}\nKey Traits: ${character.traits.join(', ')}`
            : `Name: ${character.name}\nPersonality: ${character.personality}\nSpeaking Style: ${character.speakingStyle}\nKey Traits: ${character.traits.join(', ')}`;

        const historyStr = chatHistory
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        prompt = prompt.replace('%character', characterPrompt);
        prompt = prompt.replace('%history', historyStr);
        prompt = prompt.replace('%message', newMessage);
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
