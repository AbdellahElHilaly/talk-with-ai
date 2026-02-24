export const TRANSLATE_PROMPT = `[SYSTEM: LINGUISTIC CONTEXT ENGINE]
[INPUT]
CONTEXT_TEXT: "%text"
TARGET_WORD: "%word"
WORD_INDEX_IN_SPLIT_ARRAY: %index

[TASK]
Translate the specific occurrence of the TARGET_WORD at the given WORD_INDEX in the CONTEXT_TEXT into Arabic. 
Account for the grammatical role and specific meaning in this exact sentence.

[OUTPUT_RULES]
1. Output MUST be a valid JSON object only.
2. NO markdown code blocks.
3. Response MUST be: { "translation": "العربية" }

[JSON_FORMAT]
{ "translation": "..." }`;
