/**
 * Template for standard vocabulary translations with spell correction.
 * Used for building a personal dictionary with common meanings.
 */
export const VOCAB_TRANSLATE_PROMPT = `[SYSTEM: LEXICAL DICTIONARY ENGINE WITH SPELL CORRECTION]
[INPUT]
WORDS_TO_TRANSLATE: [%words]

[TASK]
1. First, check if any word has spelling errors and correct them automatically.
2. Provide the standard, most common, and clear Arabic translation for each word.
3. If a word is misspelled, use the corrected version as the key.
4. Since these are for a vocabulary list, provide the primary meaning that a learner should know.

[OUTPUT_RULES]
1. Output MUST be a valid JSON object only.
2. NO markdown code blocks (e.g., \`\`\`json).
3. NO conversational text, explanations, or apologies.
4. Response MUST start with { and end with }.
5. Use the corrected spelling as the key, not the original input.

[EXAMPLES]
Input: "hapiness"
Output: { "happiness": "السعادة" }

Input: "recieve"  
Output: { "receive": "يستلم" }

[JSON_FORMAT]
{ 
  "corrected_word1": "الترجمة القياسية 1",
  "corrected_word2": "الترجمة القياسية 2"
}`;
