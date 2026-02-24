/**
 * Centralized key management for Groq and ElevenLabs.
 */

// --- GROQ KEYS ---

export const getGroqKeys = () => {
    const saved = localStorage.getItem('groq_api_keys');
    return saved ? JSON.parse(saved) : [];
};

export const saveGroqKeys = (keys) => {
    localStorage.setItem('groq_api_keys', JSON.stringify(keys));
};

export const validateGroqKey = async (apiKey) => {
    if (!apiKey || !apiKey.startsWith('gsk_')) return false;
    try {
        const response = await fetch('https://api.groq.com/openai/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (err) {
        return false;
    }
};

export const addGroqKey = async (key) => {
    const isValid = await validateGroqKey(key);
    if (isValid) {
        const keys = getGroqKeys();
        if (!keys.includes(key)) {
            keys.push(key);
            saveGroqKeys(keys);
        }
        return true;
    }
    return false;
};

export const removeGroqKey = (key) => {
    const keys = getGroqKeys();
    const filtered = keys.filter(k => k !== key);
    saveGroqKeys(filtered);
};

export const isStaticMode = () => {
    return getGroqKeys().length === 0;
};

// --- ELEVENLABS KEYS ---

export const getElevenKeys = () => {
    const saved = localStorage.getItem('eleven_labs_keys');
    return saved ? JSON.parse(saved) : [];
};

export const saveElevenKeys = (keys) => {
    localStorage.setItem('eleven_labs_keys', JSON.stringify(keys));
};

export const validateElevenKey = async (apiKey) => {
    if (!apiKey || apiKey.trim().length < 10) return null;
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            headers: {
                'xi-api-key': apiKey.trim(),
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            return {
                status: 'good',
                usage: data.character_count,
                limit: data.character_limit,
                remaining: (data.character_limit - data.character_count),
                tier: data.tier
            };
        }

        // --- FIX FOR MISSING PERMISSIONS (user_read) ---
        // If the key is valid for TTS but lacks 'user_read' permission, 
        // ElevenLabs returns a 401/403 with 'missing_permissions'.
        if (data.detail?.status === 'missing_permissions' || data.detail?.message?.includes('permission')) {
            console.warn("Key lacks user_read permission, but will be accepted for TTS use.");
            return {
                status: 'good',
                restricted: true,
                usage: 0,
                limit: 0,
                remaining: 5000, // Fallback placeholder
                tier: 'Unknown (Restricted)'
            };
        }

        return null;
    } catch (err) {
        return null;
    }
};

export const addElevenKey = async (key) => {
    const info = await validateElevenKey(key);
    if (info) {
        const keys = getElevenKeys();
        if (!keys.includes(key)) {
            keys.push(key);
            saveElevenKeys(keys);
        }
        return true;
    }
    return false;
};

export const removeElevenKey = (key) => {
    const keys = getElevenKeys();
    const filtered = keys.filter(k => k !== key);
    saveElevenKeys(filtered);
};
