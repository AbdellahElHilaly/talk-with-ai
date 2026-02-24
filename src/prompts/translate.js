/**
 * Template for word translations based on context.
 * 
 * Placeholders:
 * %text - The context text where the words appear
 * %words - The list of words to translate
 */
export const TRANSLATE_PROMPT = `[SYSTEM: ROBOTIC MODE ENABLED]
[INPUT]
CONTEXT_TEXT: "%text"
WORDS_TO_TRANSLATE: [%words]

[TASK]
Provide Arabic translations for the words based on the context provided.

[OUTPUT_RULES]
1. Output MUST be a valid JSON object only.
2. NO conversational text before or after the JSON.
3. NO markdown code blocks (e.g., \`\`\`json).
4. NO explanations or apologies.
5. Response MUST start with { and end with }.

[JSON_FORMAT]
{ "word": "translation", ... }`;
