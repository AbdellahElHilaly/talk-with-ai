import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Volume2, Search, X, Loader2, ArrowRightLeft, Check, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as vocab from '../utils/vocabulary';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import Alert from '../components/shared/Alert';

const InterestingWordsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('learned'); // 'learned' or 'ignored'
    const [learnedWords, setLearnedWords] = useState(vocab.getLearnedWords());
    const [ignoredWords, setIgnoredWords] = useState(vocab.getIgnoredWords());
    const [wordTranslations, setWordTranslations] = useState(vocab.getWordTranslations());

    const [newWordInput, setNewWordInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });
    const [nowPlaying, setNowPlaying] = useState(null);

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    const refreshData = () => {
        setLearnedWords(vocab.getLearnedWords());
        setIgnoredWords(vocab.getIgnoredWords());
        setWordTranslations(vocab.getWordTranslations());
    };

    useEffect(() => {
        voiceEngine.onStateChange = (state) => {
            if (state === 'idle') setNowPlaying(null);
        };
        const handleVocabUpdate = () => refreshData();
        window.addEventListener('vocabularyUpdated', handleVocabUpdate);
        return () => {
            voiceEngine.onStateChange = null;
            window.removeEventListener('vocabularyUpdated', handleVocabUpdate);
        };
    }, []);

    const handleAdd = () => {
        if (!newWordInput.trim()) return;
        const success = vocab.addWord(newWordInput.trim(), '', activeTab);
        if (success) {
            setNewWordInput('');
            setAlertConfig({
                show: true,
                message: lang === 'ar' ? "تمت الإضافة! ✨" : "Word added! ✨",
                type: 'success'
            });
        }
    };

    const handleDelete = (word) => {
        vocab.deleteWord(word);
        setAlertConfig({
            show: true,
            message: lang === 'ar' ? "تم الحذف" : "Deleted",
            type: 'success'
        });
    };

    const handleMove = (word) => {
        const toList = activeTab === 'learned' ? 'ignored' : 'learned';
        vocab.moveWord(word, toList);
        setAlertConfig({
            show: true,
            message: lang === 'ar' ? "تم النقل" : "Moved",
            type: 'success'
        });
    };

    const handleSpeak = (word) => {
        setNowPlaying(word);
        voiceEngine.speakBrowserOnly(word, 'en');
    };

    const currentWords = activeTab === 'learned' ? learnedWords : ignoredWords;
    const filteredWords = currentWords.filter(w =>
        w.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen bg-slate-50 flex flex-col overflow-hidden" dir={rtl ? 'rtl' : 'ltr'}>
            <Alert
                show={alertConfig.show}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 pt-8 pb-2 shrink-0">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors">
                        <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                    </button>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {lang === 'ar' ? 'قاموسي الشخصي' : 'Vocabulary'}
                    </h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-full max-w-sm mx-auto mb-2">
                    <button
                        onClick={() => setActiveTab('learned')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'learned' ? 'bg-white text-brand-indigo shadow-sm' : 'text-slate-400'}`}
                    >
                        {lang === 'ar' ? 'أحتاجها' : 'Need It'}
                    </button>
                    <button
                        onClick={() => setActiveTab('ignored')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ignored' ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400'}`}
                    >
                        {lang === 'ar' ? 'لا أحتاجها' : 'Not Today'}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full flex flex-col gap-6 pb-20">
                {/* Add Input */}
                <div className="relative">
                    <input
                        type="text"
                        value={newWordInput}
                        onChange={(e) => setNewWordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder={lang === 'ar' ? 'أضف كلمة جديدة...' : 'Something new?'}
                        className={`w-full p-5 rounded-3xl bg-white border border-slate-100 outline-none focus:border-brand-indigo/30 transition-all font-bold text-sm shadow-sm ${rtl ? 'text-right' : 'text-left'}`}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newWordInput.trim()}
                        className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors`}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* List Content */}
                <div className="flex flex-col gap-4">
                    {/* Search Bar */}
                    {currentWords.length > 3 && (
                        <div className="relative">
                            <Search size={14} className={`absolute ${rtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
                                className={`w-full py-2.5 ${rtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} rounded-xl bg-slate-200/50 border-none outline-none text-[11px] font-black text-slate-500 tracking-wider focus:bg-white transition-all`}
                            />
                        </div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {filteredWords.map((word) => (
                            <motion.div
                                key={`${activeTab}-${word}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col transition-all`}
                            >
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <button
                                            onClick={() => handleSpeak(word)}
                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${nowPlaying === word ? 'bg-brand-indigo text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-brand-indigo'}`}
                                        >
                                            <Volume2 size={18} />
                                        </button>
                                        <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                            <span className="font-bold text-sm text-slate-900 tracking-tight">{word}</span>
                                            {wordTranslations[word] && (
                                                <span className="text-[10px] font-bold text-brand-indigo font-arabic mt-0.5">{wordTranslations[word]}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleMove(word)}
                                            title={activeTab === 'learned' ? 'Ignore' : 'Recover'}
                                            className="p-3 text-slate-300 hover:text-brand-indigo transition-colors"
                                        >
                                            {activeTab === 'learned' ? <ArrowRightLeft size={16} /> : <RotateCcw size={16} />}
                                        </button>
                                        <button onClick={() => handleDelete(word)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredWords.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300 text-center px-10">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <Plus size={24} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {activeTab === 'learned'
                                    ? (lang === 'ar' ? 'قائمتك فارغة، أضف شيئاً!' : 'Your list is empty. Add something!')
                                    : (lang === 'ar' ? 'لم تتجاهل أي كلمات بعد' : 'No ignored words yet')}
                            </span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterestingWordsPage;
