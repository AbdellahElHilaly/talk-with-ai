/**
 * VocabService Class
 * Manages learned and ignored words in localStorage.
 */
export class VocabService {
    static getLearnedWords() {
        const saved = localStorage.getItem('learned_words');
        return saved ? JSON.parse(saved) : [];
    }

    static getIgnoredWords() {
        const saved = localStorage.getItem('ignored_words');
        return saved ? JSON.parse(saved) : [];
    }

    static getWordTranslations() {
        const saved = localStorage.getItem('word_translations');
        return saved ? JSON.parse(saved) : {};
    }

    static saveLearnedWords(words) {
        const next = JSON.stringify(words);
        if (localStorage.getItem('learned_words') === next) return;
        localStorage.setItem('learned_words', next);
        this.notify();
    }

    static saveIgnoredWords(words) {
        const next = JSON.stringify(words);
        if (localStorage.getItem('ignored_words') === next) return;
        localStorage.setItem('ignored_words', next);
        this.notify();
    }

    static saveTranslations(translations) {
        const current = this.getWordTranslations();
        localStorage.setItem('word_translations', JSON.stringify({ ...current, ...translations }));
        this.notify();
    }

    static addWord(word, translation = '', list = 'learned') {
        const cleanWord = word.toLowerCase().trim();
        if (list === 'learned') {
            const words = this.getLearnedWords();
            if (!words.includes(cleanWord)) {
                this.saveLearnedWords([...words, cleanWord]);
            }
        } else {
            const words = this.getIgnoredWords();
            if (!words.includes(cleanWord)) {
                this.saveIgnoredWords([...words, cleanWord]);
            }
        }
        if (translation) {
            this.saveTranslations({ [cleanWord]: translation });
        }
        return true;
    }

    static deleteWord(word) {
        const cleanWord = word.toLowerCase().trim();
        this.saveLearnedWords(this.getLearnedWords().filter(w => w !== cleanWord));
        this.saveIgnoredWords(this.getIgnoredWords().filter(w => w !== cleanWord));
    }

    static moveWord(word, targetList) {
        const cleanWord = word.toLowerCase().trim();
        this.deleteWord(cleanWord);
        this.addWord(cleanWord, '', targetList);
    }

    static notify() {
        window.dispatchEvent(new CustomEvent('vocabularyUpdated'));
    }
}
