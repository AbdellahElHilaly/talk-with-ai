import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Volume2, Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLearnedWords, addLearnedWord, removeLearnedWord } from '../utils/vocabulary';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import Alert from '../components/shared/Alert';

const InterestingWordsPage = () => {
    const navigate = useNavigate();
    const [words, setWords] = useState(getLearnedWords());
    const [newWord, setNewWord] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });
    const [nowPlaying, setNowPlaying] = useState(null);

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    useEffect(() => {
        voiceEngine.onStateChange = (state) => {
            if (state === 'idle') setNowPlaying(null);
        };
        return () => voiceEngine.onStateChange = null;
    }, []);

    const handleAdd = () => {
        if (!newWord.trim()) return;
        const success = addLearnedWord(newWord.trim());
        if (success) {
            setWords(getLearnedWords());
            setNewWord('');
            setAlertConfig({
                show: true,
                message: lang === 'ar' ? "تمت إضافة الكلمة! ✨" : "Word added successfully! ✨",
                type: 'success'
            });
        } else {
            setAlertConfig({
                show: true,
                message: lang === 'ar' ? "الكلمة موجودة بالفعل!" : "Word already exists!",
                type: 'error'
            });
        }
    };

    const handleDelete = (word) => {
        removeLearnedWord(word);
        setWords(getLearnedWords());
    };

    const handleSpeak = (word) => {
        setNowPlaying(word);
        // Detect if word is Arabic or English for better voice picking
        const isArabic = /[\u0600-\u06FF]/.test(word);
        voiceEngine.speakBrowserOnly(word, isArabic ? 'ar' : 'en');
    };

    const filteredWords = words.filter(w =>
        w.toLowerCase().includes(searchQuery.toLowerCase())
    ).reverse();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>
            <Alert
                show={alertConfig.show}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors"
                >
                    <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {lang === 'ar' ? 'كلماتي المميزة' : 'Interesting Words'}
                    </h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {words.length} {lang === 'ar' ? 'كلمات محفوظة' : 'Saved Words'}
                    </span>
                </div>
            </div>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
                {/* Add Word Input */}
                <div className="relative group">
                    <input
                        type="text"
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder={lang === 'ar' ? 'أضف كلمة جديدة...' : 'Add a new word...'}
                        className={`w-full p-5 rounded-3xl bg-white border border-slate-200 outline-none focus:border-brand-indigo/30 transition-all font-bold text-sm shadow-sm ${rtl ? 'text-right pr-5' : 'text-left pl-5'}`}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newWord.trim()}
                        className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors disabled:opacity-50 disabled:bg-slate-300`}
                    >
                        <Plus size={20} />
                    </button>
                </div>

                {/* Search */}
                {words.length > 5 && (
                    <div className="relative">
                        <Search size={16} className={`absolute ${rtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-300`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={lang === 'ar' ? 'ابحث عن كلمة...' : 'Search words...'}
                            className={`w-full py-3 ${rtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-2xl bg-slate-100/50 border-none outline-none text-xs font-bold text-slate-600 focus:bg-white transition-all`}
                        />
                    </div>
                )}

                {/* Words List */}
                <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                        {filteredWords.map((word) => (
                            <motion.div
                                key={word}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <button
                                        onClick={() => handleSpeak(word)}
                                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all ${nowPlaying === word ? 'bg-brand-indigo text-white scale-95 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:text-brand-indigo hover:bg-indigo-50'}`}
                                    >
                                        <Volume2 size={18} className={nowPlaying === word ? 'animate-pulse' : ''} />
                                    </button>
                                    <span className={`font-bold text-sm text-slate-700 truncate ${/[\u0600-\u06FF]/.test(word) ? 'font-arabic' : ''}`}>
                                        {word}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDelete(word)}
                                    className="p-3 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredWords.length === 0 && words.length > 0 && (
                        <div className="py-12 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                            {lang === 'ar' ? 'لا توجد نتائج' : 'No results found'}
                        </div>
                    )}

                    {words.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                                <Plus size={32} strokeWidth={1} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em]">
                                {lang === 'ar' ? 'أضف كلماتك الأولى' : 'Add your first words'}
                            </span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default InterestingWordsPage;
