export const getLearnedWords = () => {
    const saved = localStorage.getItem('learned_words');
    return saved ? JSON.parse(saved) : [];
};

export const saveLearnedWords = (words) => {
    localStorage.setItem('learned_words', JSON.stringify(words));
    // Dispatch custom event to notify other components (like ChatPage if open)
    window.dispatchEvent(new Event('vocabularyUpdated'));
};

export const addLearnedWord = (word) => {
    if (!word) return;
    const cleanWord = word.trim().toLowerCase();
    const words = getLearnedWords();
    if (!words.includes(cleanWord)) {
        saveLearnedWords([...words, cleanWord]);
        return true;
    }
    return false;
};

export const removeLearnedWord = (word) => {
    const words = getLearnedWords();
    saveLearnedWords(words.filter(w => w !== word));
};
