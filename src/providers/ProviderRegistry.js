/**
 * Provider Registry — Strategy Pattern
 *
 * Central registry for all supported AI providers.
 * Each provider defines its own endpoint, models, key validation,
 * key storage keys, and fetch logic.
 *
 * To add a new provider: add an entry here + create its Provider file.
 */

import { GroqProvider } from './GroqProvider';
import { DeepSeekProvider } from './DeepSeekProvider';

export const PROVIDERS = {
    groq: GroqProvider,
    deepseek: DeepSeekProvider,
};

// localStorage key for the selected provider id
const SELECTED_PROVIDER_KEY = 'selected_ai_provider';

// localStorage key for the selected model per provider
const SELECTED_MODEL_KEY = 'selected_ai_model';

/**
 * Returns the id of the currently selected provider.
 * Defaults to 'groq'.
 */
export const getSelectedProviderId = () => {
    return localStorage.getItem(SELECTED_PROVIDER_KEY) || 'groq';
};

/**
 * Persists the selected provider id.
 */
export const setSelectedProviderId = (providerId) => {
    localStorage.setItem(SELECTED_PROVIDER_KEY, providerId);
    // Reset model to the provider's default when switching providers
    const provider = PROVIDERS[providerId];
    if (provider) {
        localStorage.setItem(SELECTED_MODEL_KEY, provider.defaultModel);
    }
};

/**
 * Returns the currently selected provider object.
 */
export const getActiveProvider = () => {
    const id = getSelectedProviderId();
    return PROVIDERS[id] || GroqProvider;
};

/**
 * Returns the currently selected model id.
 * Falls back to the active provider's defaultModel.
 */
export const getSelectedModel = () => {
    const provider = getActiveProvider();
    const saved = localStorage.getItem(SELECTED_MODEL_KEY);
    // Validate that saved model belongs to current provider
    const isValid = provider.models.some(m => m.id === saved);
    return isValid ? saved : provider.defaultModel;
};

/**
 * Persists the selected model id.
 */
export const setSelectedModel = (modelId) => {
    localStorage.setItem(SELECTED_MODEL_KEY, modelId);
};
