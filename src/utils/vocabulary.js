/**
 * Vocabulary Management System
 * Stores words, their categories (learned/ignored), and AI-provided translations.
 */

const KEYS = {
    LEARNED: 'learned_words',
    IGNORED: 'ignored_words',
    TRANSLATIONS: 'word_translations'
};

// --- GETTERS ---

export const getLearnedWords = () => {
    const saved = localStorage.getItem(KEYS.LEARNED);
    return saved ? JSON.parse(saved) : [];
};

export const getIgnoredWords = () => {
    const saved = localStorage.getItem(KEYS.IGNORED);
    return saved ? JSON.parse(saved) : [];
};

export const getWordTranslations = () => {
    const saved = localStorage.getItem(KEYS.TRANSLATIONS);
    return saved ? JSON.parse(saved) : {};
};

export const getUntranslatedWords = () => {
    const learned = getLearnedWords();
    const ignored = getIgnoredWords();
    const translations = getWordTranslations();

    const all = [...learned, ...ignored];
    return all.filter(word => !translations[word] || translations[word].trim() === '');
};

// --- SETTERS & EVENTS ---

const notifyUpdate = () => {
    window.dispatchEvent(new Event('vocabularyUpdated'));
};

export const saveTranslations = (newTranslations) => {
    const current = getWordTranslations();
    const updated = { ...current, ...newTranslations };
    localStorage.setItem(KEYS.TRANSLATIONS, JSON.stringify(updated));
    // No notify needed for background translation updates usually
};

// --- ACTIONS ---

export const addWord = (word, translation = '', listType = 'learned') => {
    if (!word) return;
    const cleanWord = word.trim().toLowerCase();

    const learned = getLearnedWords();
    const ignored = getIgnoredWords();
    const translations = getWordTranslations();

    // Remove from both lists first to ensure no duplicates
    const newLearned = learned.filter(w => w !== cleanWord);
    const newIgnored = ignored.filter(w => w !== cleanWord);

    if (listType === 'learned') {
        newLearned.unshift(cleanWord);
    } else {
        newIgnored.unshift(cleanWord);
    }

    if (translation) {
        translations[cleanWord] = translation;
        localStorage.setItem(KEYS.TRANSLATIONS, JSON.stringify(translations));
    }

    localStorage.setItem(KEYS.LEARNED, JSON.stringify(newLearned));
    localStorage.setItem(KEYS.IGNORED, JSON.stringify(newIgnored));

    notifyUpdate();
    return true;
};

export const moveWord = (word, toList) => {
    const learned = getLearnedWords();
    const ignored = getIgnoredWords();

    const newLearned = learned.filter(w => w !== word);
    const newIgnored = ignored.filter(w => w !== word);

    if (toList === 'learned') {
        newLearned.unshift(word);
    } else {
        newIgnored.unshift(word);
    }

    localStorage.setItem(KEYS.LEARNED, JSON.stringify(newLearned));
    localStorage.setItem(KEYS.IGNORED, JSON.stringify(newIgnored));
    notifyUpdate();
};

export const updateWord = (oldWord, newWord, translation) => {
    const learned = getLearnedWords();
    const ignored = getIgnoredWords();
    const translations = getWordTranslations();

    const isLearned = learned.includes(oldWord);

    // Remove old word data
    const newLearned = learned.filter(w => w !== oldWord);
    const newIgnored = ignored.filter(w => w !== oldWord);
    delete translations[oldWord];

    // Add new word data
    const cleanNew = newWord.trim().toLowerCase();
    if (isLearned) {
        newLearned.unshift(cleanNew);
    } else {
        newIgnored.unshift(cleanNew);
    }

    if (translation) {
        translations[cleanNew] = translation;
    }

    localStorage.setItem(KEYS.LEARNED, JSON.stringify(newLearned));
    localStorage.setItem(KEYS.IGNORED, JSON.stringify(newIgnored));
    localStorage.setItem(KEYS.TRANSLATIONS, JSON.stringify(translations));

    notifyUpdate();
};

export const deleteWord = (word) => {
    const learned = getLearnedWords();
    const ignored = getIgnoredWords();
    const translations = getWordTranslations();

    localStorage.setItem(KEYS.LEARNED, JSON.stringify(learned.filter(w => w !== word)));
    localStorage.setItem(KEYS.IGNORED, JSON.stringify(ignored.filter(w => w !== word)));

    delete translations[word];
    localStorage.setItem(KEYS.TRANSLATIONS, JSON.stringify(translations));

    notifyUpdate();
};
