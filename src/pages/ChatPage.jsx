import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Play, Square, Settings, Loader2, Plus, X, Trash2, RefreshCcw, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Word from '../components/Word';
import { ChatController } from '../controllers/chatController';
import { TranslateController } from '../controllers/translateController';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import { VocabService } from '../utils/vocabulary';

const ChatPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem('chat_session_messages');
        return saved ? JSON.parse(saved) : [];
    });
    const [isAITyping, setIsAITyping] = useState(false);
    const [nowPlaying, setNowPlaying] = useState(null);
    const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, loading, playing
    const [learnedWords, setLearnedWords] = useState(() => VocabService.getLearnedWords());
    const [ignoredWords, setIgnoredWords] = useState(() => VocabService.getIgnoredWords());
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('chat_muted') === 'true');

    // Global map for on-demand translations: { "messageId-word": "translation" }
    const [translationsMap, setTranslationsMap] = useState({});

    const getGroqKeys = () => {
        const saved = localStorage.getItem('groq_api_keys');
        return saved ? JSON.parse(saved) : [];
    };
    const [learnedCount, setLearnedCount] = useState(VocabService.getLearnedWords().length);
    const staticMode = getGroqKeys().length === 0;

    React.useEffect(() => {
        const handleUpdate = () => setLearnedCount(VocabService.getLearnedWords().length);
        window.addEventListener('vocabularyUpdated', handleUpdate);
        return () => window.removeEventListener('vocabularyUpdated', handleUpdate);
    }, []);

    React.useEffect(() => {
        const handleVocabUpdate = () => {
            const nextL = VocabService.getLearnedWords();
            const nextI = VocabService.getIgnoredWords();

            setLearnedWords(prev => JSON.stringify(prev) === JSON.stringify(nextL) ? prev : nextL);
            setIgnoredWords(prev => JSON.stringify(prev) === JSON.stringify(nextI) ? prev : nextI);
        };
        window.addEventListener('vocabularyUpdated', handleVocabUpdate);

        return () => window.removeEventListener('vocabularyUpdated', handleVocabUpdate);
    }, []);

    const navigate = useNavigate();
    const scrollRef = React.useRef(null);

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isAITyping]);


    React.useEffect(() => {
        voiceEngine.onStateChange = (state) => {
            setVoiceStatus(state);
            if (state === 'idle') setNowPlaying(null);
        };
        return () => voiceEngine.onStateChange = null;
    }, []);

    React.useEffect(() => {
        VocabService.saveLearnedWords(learnedWords);
    }, [learnedWords]);

    React.useEffect(() => {
        VocabService.saveIgnoredWords(ignoredWords);
    }, [ignoredWords]);

    React.useEffect(() => {
        sessionStorage.setItem('chat_session_messages', JSON.stringify(messages));
    }, [messages]);

    React.useEffect(() => {
        localStorage.setItem('chat_muted', isMuted);
    }, [isMuted]);

    const handleClearChat = () => {
        if (window.confirm(lang === 'ar' ? 'هل تريد حذف المحادثة؟' : 'Clear this conversation?')) {
            setMessages([]);
            sessionStorage.removeItem('chat_session_messages');
        }
    };

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    const toggleLearned = (word) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        setLearnedWords(prev => {
            if (prev.includes(cleanWord)) return prev.filter(w => w !== cleanWord);
            return [...prev.filter(w => w !== cleanWord), cleanWord];
        });
        setIgnoredWords(prev => prev.filter(w => w !== cleanWord));
    };

    const toggleIgnored = (word) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        setIgnoredWords(prev => {
            if (prev.includes(cleanWord)) return prev.filter(w => w !== cleanWord);
            return [...prev.filter(w => w !== cleanWord), cleanWord];
        });
        setLearnedWords(prev => prev.filter(w => w !== cleanWord));
    };

    const handleWordSelect = async (en, messageId, fullText) => {
        const cleanWord = en.toLowerCase().replace(/[.,!?;:]/g, '');
        const cacheKey = `${messageId}-${cleanWord}`;

        // Hearing is instant (if not muted)
        if (!isMuted) {
            voiceEngine.speak(cleanWord, 'en');
        }

        if (translationsMap[cacheKey]) {
            setSelectedWord({ en, ar: translationsMap[cacheKey] });
            return;
        }

        if (staticMode) {
            setSelectedWord({ en, ar: "..." }); // Or default
            return;
        }

        // Fetch on-demand
        try {
            setSelectedWord({ en, ar: "..." }); // Loading state
            const ar = await TranslateController.translateWord(fullText, cleanWord);
            setTranslationsMap(prev => ({ ...prev, [cacheKey]: ar }));
            setSelectedWord({ en, ar });
        } catch (error) {
            console.error("Translation failed", error);
        }
    };

    const handleSend = async () => {
        if (!message.trim() || isAITyping) return;

        if (staticMode) {
            alert(t.devModeAlert);
            return;
        }

        const userMsg = {
            id: Date.now(),
            role: 'user',
            text: message.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage('');
        setIsAITyping(true);

        try {
            const context = messages.slice(-5).map(m => ({
                role: m.role === 'ai' ? 'assistant' : m.role,
                content: m.text
            }));
            context.push({ role: 'user', content: userMsg.text });

            const aiResponse = await ChatController.sendMessage(context, userMsg.text, learnedWords, ignoredWords);

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: aiResponse.text
            }]);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsAITyping(true); // Small hack to trigger scroll after re-render
            setTimeout(() => setIsAITyping(false), 100);
        }
    };



    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden pb-safe" dir={rtl ? 'rtl' : 'ltr'}>
            {/* MAGICAL TOP BAR */}
            <div className="px-6 py-4 flex justify-between items-center z-20 sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-brand-indigo transition-colors shrink-0">
                        <Settings size={20} strokeWidth={2} />
                    </button>

                    <div className={`relative h-10 flex-1 flex items-center overflow-hidden border-slate-50 ${rtl ? 'border-r pr-4 mr-2' : 'border-l pl-4 ml-2'}`}>
                        <AnimatePresence mode="wait">
                            {!selectedWord ? (
                                <motion.div
                                    key="status-logo"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`logo-font text-2xl text-brand-indigo leading-none ${rtl ? '-mr-0.5' : '-ml-0.5'}`}>S-L</span>
                                        {staticMode && (
                                            <span className="text-[6px] px-1.5 py-0.5 bg-indigo-50 text-brand-indigo border border-indigo-100 rounded-full font-black uppercase tracking-tighter">{t.exploreMode}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1 h-1 rounded-full ${staticMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
                                            {staticMode ? t.localEngine : t.connected}
                                        </span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`translation-${selectedWord.en}`}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{selectedWord.en}</span>
                                        <span className="text-base font-black text-brand-indigo arabic-text leading-none">{selectedWord.ar}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleLearned(selectedWord.en);
                                            }}
                                            className={`p-1.5 rounded-full transition-all active:scale-90 ${learnedWords.includes(selectedWord.en.toLowerCase().replace(/[.,!?;:]/g, ''))
                                                ? 'bg-emerald-500 text-white shadow-sm'
                                                : 'text-slate-400 hover:bg-white hover:text-emerald-500'
                                                }`}
                                            title="Add to learning"
                                        >
                                            <Plus size={12} strokeWidth={3} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleIgnored(selectedWord.en);
                                            }}
                                            className={`p-1.5 rounded-full transition-all active:scale-90 ${ignoredWords.includes(selectedWord.en.toLowerCase().replace(/[.,!?;:]/g, ''))
                                                ? 'bg-rose-500 text-white shadow-sm'
                                                : 'text-slate-400 hover:bg-white hover:text-rose-500'
                                                }`}
                                            title="Remove/Ignore"
                                        >
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 transition-colors ${isMuted ? 'text-amber-500 bg-amber-50 rounded-full' : 'text-slate-300 hover:text-brand-indigo'}`}
                        title={isMuted ? 'Unmute word clicks' : 'Mute word clicks'}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={handleClearChat}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                            title={t.clearChat}
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => navigate('/')}
                        className="text-[9px] font-black text-white bg-slate-900 px-4 py-1.5 rounded-full tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
                    >
                        {t.exit}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth" ref={scrollRef}>
                <div className="max-w-2xl mx-auto flex flex-col gap-12">
                    {messages.map((item) => {
                        const isAI = item.role === 'ai';

                        if (!isAI) {
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${rtl ? 'self-start' : 'self-end'} max-w-[85%]`}
                                >
                                    <div className={`bg-white px-5 py-3.5 rounded-[1.5rem] ${rtl ? 'rounded-tl-none' : 'rounded-tr-none'} shadow-sm border border-slate-100 text-slate-600 text-sm font-medium text-left`} dir="ltr">
                                        {item.text}
                                    </div>
                                </motion.div>
                            );
                        }

                        const words = item.text.split(' ');
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${rtl ? 'self-end' : 'self-start'} w-full`}
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="text-2xl md:text-3xl leading-[1.6] font-bold tracking-tight flex flex-wrap gap-x-1.5 gap-y-2 text-slate-950 text-left" dir="ltr">
                                        {words.map((word, i) => {
                                            const cleanedKey = word.toLowerCase().replace(/[.,!?;:]/g, '');
                                            const translation = translationsMap[`${item.id}-${cleanedKey}`];
                                            return (
                                                <Word
                                                    key={i}
                                                    en={word}
                                                    ar={translation}
                                                    onSelect={(en) => handleWordSelect(en, item.id, item.text)}
                                                    isActive={selectedWord?.en === word}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col gap-3 group">
                                        <div className="h-[1px] w-full bg-slate-100 group-hover:bg-indigo-50 transition-colors" />
                                        <div className={`flex items-center gap-5 px-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                {nowPlaying === item.id ? (
                                                    <button
                                                        title="Stop"
                                                        onClick={() => {
                                                            voiceEngine.stop();
                                                            setNowPlaying(null);
                                                        }}
                                                        className="text-rose-500 active:scale-90 transition-all p-1.5 bg-rose-50 rounded-full"
                                                    >
                                                        <Square size={14} fill="currentColor" strokeWidth={2.5} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        title="Play"
                                                        onClick={() => {
                                                            voiceEngine.stop();
                                                            voiceEngine.speak(item.text, 'en');
                                                            setNowPlaying(item.id);
                                                        }}
                                                        className="text-brand-indigo active:scale-90 transition-all p-1.5 bg-indigo-50 rounded-full"
                                                    >
                                                        <Play size={14} fill="currentColor" strokeWidth={2.5} />
                                                    </button>
                                                )}

                                                {nowPlaying === item.id && (
                                                    <div className="flex gap-1 items-center px-2">
                                                        {voiceStatus === 'loading' ? (
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                                className="w-2.5 h-2.5 border-2 border-brand-indigo/30 border-t-brand-indigo rounded-full"
                                                            />
                                                        ) : voiceStatus === 'playing' ? (
                                                            <div className="flex gap-0.5 items-center">
                                                                {[1, 2, 3].map(i => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{ height: [3, 8, 3] }}
                                                                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                                                        className="w-0.5 bg-brand-indigo rounded-full"
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {isAITyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`${rtl ? 'self-end' : 'self-start'} flex items-center gap-3`}
                        >
                            <div className="bg-white/50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin text-brand-indigo" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">AI Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* BOTTOM SEND BAR */}
            <div className="px-6 pb-12 pt-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
                <motion.div className="max-w-md mx-auto relative group">
                    <div className="absolute -inset-1 bg-brand-indigo/5 rounded-[2.5rem] blur-lg opacity-0 group-within:opacity-100 transition-opacity" />
                    <div className="relative bg-white p-2 rounded-[2.5rem] flex items-center border border-slate-200 shadow-soft focus-within:border-brand-indigo/30 transition-all">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t.typeReply}
                            className="flex-1 bg-transparent py-4 px-6 outline-none text-slate-900 placeholder:text-slate-300 font-medium text-left"
                            dir="ltr"
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-brand-indigo text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-transform shrink-0"
                        >
                            <Send size={18} strokeWidth={2.5} className={rtl ? '-scale-x-100' : ''} />
                        </button>
                    </div>
                </motion.div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
};

export default ChatPage;
