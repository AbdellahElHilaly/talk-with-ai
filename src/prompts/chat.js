/**
 * Template for general chat responses.
 * 
 * Placeholders:
 * %history - The stringified chat history
 * %message - The user's new message
 */
export const CHAT_PROMPT = `[SYSTEM: ROBOTIC MODE ENABLED]
[INPUT]
CHAT_HISTORY:
%history

USER_NEW_MESSAGE:
"%message"

CONSTRAINTS:
- FAVORITE_WORDS: [%favorites]
- IGNORED_WORDS: [%ignoring]

[TASK]
1. Respond to the user's message naturally while keeping the conversation logic.
2. Incorporate FAVORITE_WORDS where contextually appropriate.
3. NEVER use IGNORED_WORDS.

[OUTPUT_RULES]
1. Output MUST be a valid JSON object only.
2. NO conversational text outside the JSON.
3. NO markdown formatting.
4. Response MUST start with { and end with }.

[JSON_FORMAT]
{
  "text": "Your English response here"
}`;
