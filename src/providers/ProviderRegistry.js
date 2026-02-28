/**
 * Provider Registry — Strategy Pattern
 *
 * Central registry for all supported AI providers.
 * To add a new provider: import it here and add it to PROVIDERS.
 */

import { GroqProvider } from './GroqProvider';
import { DeepSeekProvider } from './DeepSeekProvider';
import { GeminiProvider } from './GeminiProvider';

export const PROVIDERS = {
    groq: GroqProvider,
    deepseek: DeepSeekProvider,
    gemini: GeminiProvider,
};

const SELECTED_MODEL_KEY = 'selected_ai_model_v2'; // includes provider info

/**
 * Returns all models across all providers as a flat array,
 * each entry carrying its provider reference.
 * Format: { modelId: 'groq::llama-3.3-70b-versatile', provider, model }
 */
export const getAllModels = () => {
    const result = [];
    Object.values(PROVIDERS).forEach(provider => {
        provider.models.forEach(model => {
            result.push({
                modelId: `${provider.id}::${model.id}`,
                provider,
                model,
            });
        });
    });
    return result;
};

/**
 * Parses a compound modelId "providerId::modelId" into its parts.
 */
export const parseModelId = (compoundId) => {
    if (!compoundId || !compoundId.includes('::')) {
        return { providerId: 'groq', modelId: 'llama-3.3-70b-versatile' };
    }
    const [providerId, modelId] = compoundId.split('::');
    return { providerId, modelId };
};

/**
 * Returns the currently selected compound model id.
 * Defaults to Groq LLaMA 3.3 70B.
 */
export const getSelectedCompoundModel = () => {
    return localStorage.getItem(SELECTED_MODEL_KEY) || 'groq::llama-3.3-70b-versatile';
};

/**
 * Persists the selected compound model id.
 */
export const setSelectedCompoundModel = (compoundId) => {
    localStorage.setItem(SELECTED_MODEL_KEY, compoundId);
};

/**
 * Returns the active provider object based on the selected compound model.
 */
export const getActiveProvider = () => {
    const { providerId } = parseModelId(getSelectedCompoundModel());
    return PROVIDERS[providerId] || GroqProvider;
};

/**
 * Returns just the raw model id (without provider prefix).
 */
export const getSelectedModel = () => {
    const { modelId } = parseModelId(getSelectedCompoundModel());
    return modelId;
};

// ── Legacy compat (used by Sidebar) ──────────────────────────────────────────
export const getSelectedProviderId = () => getActiveProvider().id;
export const setSelectedProviderId = () => { }; // no-op, managed via setSelectedCompoundModel
export const setSelectedModel = () => { };       // no-op, managed via setSelectedCompoundModel
