/**
 * ApiClient — Provider-Agnostic Gateway
 *
 * Routes all AI API calls through the currently selected provider.
 * The provider is chosen by the user in Settings and persisted in localStorage.
 *
 * Design Pattern: Strategy Pattern via ProviderRegistry.
 * Adding a new AI provider requires zero changes to this file.
 */

import { getActiveProvider, getSelectedModel } from '../providers/ProviderRegistry';

export class ApiClient {

    /**
     * Sends a prompt to the currently selected AI provider and model.
     * Returns a parsed JSON object.
     *
     * @param {string} prompt - The full prompt string to send.
     * @returns {Promise<object>} Parsed JSON response from the AI.
     * @throws Will throw if no API keys are configured or the request fails.
     */
    static async fetchCompletion(prompt) {
        const provider = getActiveProvider();
        const model = getSelectedModel();
        return provider.fetchCompletion(prompt, model);
    }

    /**
     * Legacy alias — kept for backward compatibility with any
     * code that still calls ApiClient.fetchGroq().
     * @deprecated Use ApiClient.fetchCompletion() instead.
     */
    static async fetchGroq(prompt) {
        return ApiClient.fetchCompletion(prompt);
    }
}
