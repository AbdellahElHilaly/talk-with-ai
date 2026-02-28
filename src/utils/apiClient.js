/**
 * ApiClient — Provider-Agnostic Gateway
 *
 * Routes all AI API calls through the currently selected provider & model.
 * Selection is stored as a compound id: "providerId::modelId"
 *
 * Design Pattern: Strategy Pattern via ProviderRegistry.
 */

import { getActiveProvider, getSelectedModel } from '../providers/ProviderRegistry';

export class ApiClient {

    /**
     * Sends a prompt to the currently selected AI provider and model.
     * Returns a parsed JSON object.
     */
    static async fetchCompletion(prompt) {
        const provider = getActiveProvider();
        const model = getSelectedModel();
        return provider.fetchCompletion(prompt, model);
    }

    /**
     * Legacy alias for backward compatibility.
     * @deprecated Use ApiClient.fetchCompletion() instead.
     */
    static async fetchGroq(prompt) {
        return ApiClient.fetchCompletion(prompt);
    }
}
