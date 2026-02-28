import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Play, Square, Menu, Loader2, Plus, X, Mic, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Word from '../components/Word';
import { ChatController } from '../controllers/chatController';
import { TranslateController } from '../controllers/translateController';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import { VocabService } from '../utils/vocabulary';
import { CHARACTERS } from '../prompts/characters';
import { resolveAssetPath } from '../utils/assets';

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
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef(null);
    const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, loading, playing
    const [learnedWords, setLearnedWords] = useState(() => VocabService.getLearnedWords());
    const [ignoredWords, setIgnoredWords] = useState(() => VocabService.getIgnoredWords());
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('chat_muted') === 'true');
    const [selectedCharacter, setSelectedCharacter] = useState(() => {
        return localStorage.getItem('selected_character') || 'teacher';
    });

    // Global map for on-demand translations: { "messageId-index": "translation" }
    const [translationsMap, setTranslationsMap] = useState(() => {
        const saved = sessionStorage.getItem('chat_translations_map');
        return saved ? JSON.parse(saved) : {};
    });

    const getGroqKeys = () => {
        const saved = localStorage.getItem('groq_api_keys');
        return saved ? JSON.parse(saved) : [];
    };
    const [learnedCount, setLearnedCount] = useState(VocabService.getLearnedWords().length);
    const staticMode = getGroqKeys().length === 0;

    React.useEffect(() => {
        const handleCharacterChange = (event) => {
            setSelectedCharacter(event.detail);
            // Clear chat history when character changes
            setMessages([]);
            setTranslationsMap({});
            setSelectedWord(null);
            sessionStorage.removeItem('chat_session_messages');
            sessionStorage.removeItem('chat_translations_map');
            // Also clear voice cache for fresh start with new character
            voiceEngine.clearAudioCache();
        };
        window.addEventListener('characterChanged', handleCharacterChange);

        // Setup Speech Recognition
        const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US'; // Enforce English for dictation practice

            let finalTranscriptBuffer = '';

            recognitionRef.current.onresult = (event) => {
                let currentInterim = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscriptBuffer += event.results[i][0].transcript + ' ';
                    } else {
                        currentInterim += event.results[i][0].transcript;
                    }
                }
                const combined = (finalTranscriptBuffer + currentInterim).trim();
                setMessage(combined);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            window.removeEventListener('characterChanged', handleCharacterChange);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

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

    React.useEffect(() => {
        sessionStorage.setItem('chat_translations_map', JSON.stringify(translationsMap));
    }, [translationsMap]);

    const handleClearChat = () => {
        if (window.confirm(lang === 'ar' ? 'هل تريد حذف المحادثة؟' : 'Clear this conversation?')) {
            setMessages([]);
            setTranslationsMap({});
            setSelectedWord(null);
            sessionStorage.removeItem('chat_session_messages');
            sessionStorage.removeItem('chat_translations_map');
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert(lang === 'ar' ? 'عذراً، متصفحك لا يدعم ميزة الإدخال الصوتي.' : 'Sorry, your browser does not support Speech Recognition.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            // Optional: clear message before starting new dictation
            // setMessage(''); 
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    const toggleLearned = async (word) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isCurrentlyLearned = learnedWords.includes(cleanWord);
        const isCurrentlyIgnored = ignoredWords.includes(cleanWord);

        if (isCurrentlyLearned) {
            // Remove from learned
            VocabService.deleteWord(cleanWord);
            setLearnedWords(prev => prev.filter(w => w !== cleanWord));
        } else if (isCurrentlyIgnored) {
            // Move from ignored to learned (no API call needed)
            VocabService.deleteWord(cleanWord);
            const existingTranslation = VocabService.getWordTranslations()[cleanWord] || '';
            VocabService.addWord(cleanWord, existingTranslation, 'learned');
            setIgnoredWords(prev => prev.filter(w => w !== cleanWord));
            setLearnedWords(prev => [...prev, cleanWord]);
        } else {
            // New word - needs dictionary translation
            try {
                if (!staticMode) {
                    // Send request for dictionary-style translation
                    const translation = await TranslateController.translateVocabulary(cleanWord);
                    const entries = Object.entries(translation);
                    if (entries.length > 0) {
                        const [correctedWord, arabicTranslation] = entries[0];
                        VocabService.addWord(correctedWord, arabicTranslation, 'learned');
                        setLearnedWords(prev => [...prev.filter(w => w !== correctedWord), correctedWord]);
                    }
                } else {
                    // Static mode - no translation
                    VocabService.addWord(cleanWord, '', 'learned');
                    setLearnedWords(prev => [...prev.filter(w => w !== cleanWord), cleanWord]);
                }
            } catch (error) {
                console.error('Error adding to learned:', error);
                // Fallback: add without translation
                VocabService.addWord(cleanWord, '', 'learned');
                setLearnedWords(prev => [...prev.filter(w => w !== cleanWord), cleanWord]);
            }
        }
    };

    const toggleIgnored = async (word) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isCurrentlyIgnored = ignoredWords.includes(cleanWord);
        const isCurrentlyLearned = learnedWords.includes(cleanWord);

        if (isCurrentlyIgnored) {
            // Remove from ignored
            VocabService.deleteWord(cleanWord);
            setIgnoredWords(prev => prev.filter(w => w !== cleanWord));
        } else if (isCurrentlyLearned) {
            // Move from learned to ignored (no API call needed)
            VocabService.deleteWord(cleanWord);
            VocabService.addWord(cleanWord, '', 'ignored');
            setLearnedWords(prev => prev.filter(w => w !== cleanWord));
            setIgnoredWords(prev => [...prev, cleanWord]);
        } else {
            // New word - needs spell check via dictionary translation
            try {
                if (!staticMode) {
                    // Send request for dictionary-style translation (for spell correction)
                    const translation = await TranslateController.translateVocabulary(cleanWord);
                    const entries = Object.entries(translation);
                    if (entries.length > 0) {
                        const [correctedWord] = entries[0]; // Don't need translation for ignored words
                        VocabService.addWord(correctedWord, '', 'ignored');
                        setIgnoredWords(prev => [...prev.filter(w => w !== correctedWord), correctedWord]);
                    }
                } else {
                    // Static mode
                    VocabService.addWord(cleanWord, '', 'ignored');
                    setIgnoredWords(prev => [...prev.filter(w => w !== cleanWord), cleanWord]);
                }
            } catch (error) {
                console.error('Error adding to ignored:', error);
                // Fallback: add without correction
                VocabService.addWord(cleanWord, '', 'ignored');
                setIgnoredWords(prev => [...prev.filter(w => w !== cleanWord), cleanWord]);
            }
        }
    };

    const handleWordSelect = async (en, messageId, fullText, index) => {
        const cleanWord = en.toLowerCase().replace(/[.,!?;:]/g, '');
        const cacheKey = `${messageId}-${index}`;

        // Hearing is instant (if not muted)
        if (!isMuted) {
            voiceEngine.speak(cleanWord, 'en');
        }

        if (translationsMap[cacheKey]) {
            setSelectedWord({ en, ar: translationsMap[cacheKey], index, messageId });
            return;
        }

        if (staticMode) {
            setSelectedWord({ en, ar: "...", index, messageId }); // Or default
            return;
        }

        // CONTEXTUAL TRANSLATION - uses context + word + index for precise meaning
        try {
            setSelectedWord({ en, ar: "...", index, messageId }); // Loading state
            const ar = await TranslateController.translateWord(fullText, cleanWord, index);
            setTranslationsMap(prev => ({ ...prev, [cacheKey]: ar }));
            setSelectedWord({ en, ar, index, messageId });
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

            const aiResponse = await ChatController.sendMessage(context, userMsg.text, learnedWords, ignoredWords, selectedCharacter);
            const currentCharacter = CHARACTERS[selectedCharacter] || CHARACTERS.girlfriend;

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: aiResponse.text,
                character: {
                    id: selectedCharacter,
                    name: currentCharacter.name,
                    nameAr: currentCharacter.nameAr,
                    icon: aiResponse.emoji || ""
                }
            }]);
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setIsAITyping(true); // Small hack to trigger scroll after re-render
            setTimeout(() => setIsAITyping(false), 100);
        }
    };



    return (
        <div className="h-[100dvh] w-full flex flex-col bg-slate-50 overflow-hidden pb-safe relative" dir={rtl ? 'rtl' : 'ltr'}>
            {/* PREMIUM TOP BAR */}
            <div className="px-6 h-16 flex justify-between items-center z-30 sticky top-0 bg-white/80 backdrop-blur-2xl border-b border-slate-100/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
                {/* START SECTION: MENU */}
                <div className="flex items-center shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-400 hover:text-brand-indigo transition-all active:scale-90 outline-none cursor-pointer p-2 -ml-2"
                    >
                        <Menu size={22} strokeWidth={1.5} />
                    </button>
                </div>

                {/* END SECTION: TRANSLATION / LOGO */}
                <div className="flex items-center gap-4 flex-1 justify-end min-w-0">
                    <AnimatePresence mode="wait">
                        {selectedWord ? (
                            <motion.div
                                key={`translation-${selectedWord.en}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-3 min-w-0"
                            >
                                <div className={`flex flex-col items-${rtl ? 'start' : 'end'} text-${rtl ? 'left' : 'right'} min-w-0`}>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate w-full">
                                        {selectedWord.en}
                                    </span>
                                    <span className="text-sm font-black text-slate-800 arabic-text leading-none truncate w-full">
                                        {selectedWord.ar}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLearned(selectedWord.en); }}
                                        className={`force-action-btn rounded-full flex items-center justify-center transition-all active:scale-95 outline-none cursor-pointer text-white shadow-sm ${learnedWords.includes(selectedWord.en.toLowerCase().replace(/[.,!?;:]/g, '')) ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                    >
                                        <Plus size={10} strokeWidth={4} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleIgnored(selectedWord.en); }}
                                        className={`force-action-btn rounded-full flex items-center justify-center transition-all active:scale-95 outline-none cursor-pointer text-white shadow-sm ${ignoredWords.includes(selectedWord.en.toLowerCase().replace(/[.,!?;:]/g, '')) ? 'bg-rose-500' : 'bg-slate-200'}`}
                                    >
                                        <X size={10} strokeWidth={4} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="char-name"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className={`flex flex-col items-${rtl ? 'start' : 'end'} text-${rtl ? 'left' : 'right'}`}
                            >
                                <span className="text-xs font-black text-slate-800 leading-none mb-1 tracking-tight font-outfit">
                                    {lang === 'ar' ? (CHARACTERS[selectedCharacter]?.nameAr) : (CHARACTERS[selectedCharacter]?.name)}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1 h-1 rounded-full ${staticMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        {staticMode ? t.localEngine : t.connected}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Permanent Character Avatar Link */}
                    <button
                        onClick={() => navigate('/characters')}
                        className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50 flex-shrink-0 ring-offset-2 ring-brand-indigo hover:ring-2 hover:border-brand-indigo transition-all active:scale-90 group"
                        title={lang === 'ar' ? 'تغيير الشخصية' : 'Change Character'}
                    >
                        {CHARACTERS[selectedCharacter]?.miniImage ? (
                            <img src={resolveAssetPath(CHARACTERS[selectedCharacter].miniImage)} alt="avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">{CHARACTERS[selectedCharacter]?.icon}</div>
                        )}
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto px-6 py-8 scroll-smooth hide-scrollbar" ref={scrollRef}>
                <div className="max-w-2xl mx-auto flex flex-col gap-12">
                    {messages.map((item) => {
                        const isAI = item.role === 'ai';

                        if (!isAI) {
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`${rtl ? 'self-start' : 'self-end'} max-w-[85%] flex flex-col gap-1`}
                                >
                                    <div className={`bg-white px-5 py-3.5 rounded-[1.5rem] ${rtl ? 'rounded-tl-none' : 'rounded-tr-none'} shadow-sm border border-slate-100 text-slate-600 text-sm font-medium text-left break-words`} dir="ltr">
                                        {item.text}
                                    </div>
                                    <button
                                        onClick={() => voiceEngine.speakBrowserOnly(item.text, 'en')}
                                        className={`flex items-center gap-1.5 text-slate-400 hover:text-brand-indigo transition-colors ${rtl ? 'self-start pl-3' : 'self-end pr-3'} py-1`}
                                        title={lang === 'ar' ? 'استمع للنطق الصحيح' : 'Hear correct pronunciation'}
                                    >
                                        <Volume2 size={12} />
                                        <span className="text-[9px] font-black tracking-widest uppercase">
                                            {lang === 'ar' ? 'تهجئة بطريقة صحيحة' : 'Hear Pronunciation'}
                                        </span>
                                    </button>
                                </motion.div>
                            );
                        }

                        const words = item.text.split(' ');
                        // Fix: Always get the full character config from our source of truth
                        const charId = item.character?.id || selectedCharacter;
                        const charConfig = CHARACTERS[charId] || CHARACTERS.girlfriend;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`${rtl ? 'self-end' : 'self-start'} w-full`}
                            >
                                <div className="flex flex-col gap-5">
                                    {/* Character Profile */}
                                    <div className={`flex items-center justify-between gap-4 px-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <button
                                            onClick={() => navigate('/characters')}
                                            className={`flex items-center gap-4 transition-all active:scale-95 group hover:opacity-80 ${rtl ? 'flex-row-reverse text-right' : 'text-left'}`}
                                            title={lang === 'ar' ? 'تغيير الشخصية' : 'Change Character'}
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-sm flex-shrink-0 bg-slate-50 group-hover:border-brand-indigo transition-colors ring-offset-2 group-hover:ring-2 ring-brand-indigo/30 flex items-center justify-center">
                                                {item.character?.icon && item.character.icon.trim() !== "" ? (
                                                    <span className="text-3xl leading-none">{item.character.icon}</span>
                                                ) : charConfig.miniImage || charConfig.image ? (
                                                    <img
                                                        src={resolveAssetPath(charConfig.miniImage || charConfig.image)}
                                                        alt={charConfig.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `<span class="text-3xl leading-none">${charConfig.icon}</span>`;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-3xl leading-none">{charConfig.icon}</span>
                                                )}
                                            </div>
                                            <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                                <span className="text-sm font-semibold text-brand-indigo tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {lang === 'ar' ? charConfig.nameAr : charConfig.name}
                                                </span>
                                            </div>
                                        </button>

                                        {/* SIMPLE ICON-ONLY PLAY BUTTON + SMALL ANIMATION */}
                                        <div className="flex items-center gap-2">
                                            {nowPlaying === item.id ? (
                                                <div className={`flex items-center gap-1.5 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <button
                                                        onClick={() => { voiceEngine.stop(); setNowPlaying(null); }}
                                                        className="p-1.5 text-rose-500 hover:text-rose-600 transition-all active:scale-95"
                                                    >
                                                        <Square size={14} fill="currentColor" strokeWidth={2.5} />
                                                    </button>
                                                    {voiceStatus === 'playing' && (
                                                        <div className="flex gap-0.5 items-center h-4">
                                                            {[1, 2, 3].map(i => (
                                                                <motion.div
                                                                    key={i}
                                                                    animate={{
                                                                        height: [4, 11, 4],
                                                                        backgroundColor: [
                                                                            'var(--brand-color)', // Theme base
                                                                            '#EC4899', // Pink
                                                                            '#8B5CF6', // Violet
                                                                            'var(--brand-color)'  // Back to theme base
                                                                        ]
                                                                    }}
                                                                    transition={{
                                                                        height: { repeat: Infinity, duration: 0.5, delay: i * 0.1 },
                                                                        backgroundColor: { repeat: Infinity, duration: 2, delay: i * 0.2 }
                                                                    }}
                                                                    className="w-0.5 rounded-full"
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        voiceEngine.stop();
                                                        voiceEngine.speak(item.text, 'en');
                                                        setNowPlaying(item.id);
                                                    }}
                                                    className="p-1.5 text-brand-indigo hover:text-indigo-600 transition-all active:scale-95"
                                                >
                                                    <Play size={14} fill="currentColor" strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-xl md:text-2xl leading-[1.7] font-medium tracking-tight text-slate-900 text-left overflow-hidden min-h-[1.7em]" dir="ltr">
                                        {words.map((word, i) => {
                                            const translation = translationsMap[`${item.id}-${i}`];
                                            return (
                                                <React.Fragment key={i}>
                                                    <Word
                                                        en={word}
                                                        ar={translation}
                                                        onSelect={(en) => handleWordSelect(en, item.id, item.text, i)}
                                                        isActive={selectedWord?.messageId === item.id && selectedWord?.index === i}
                                                    />
                                                    {i < words.length - 1 && ' '}
                                                </React.Fragment>
                                            );
                                        })}
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
                <motion.div className="max-w-2xl mx-auto relative group">
                    <div className="absolute -inset-1 bg-brand-indigo/5 rounded-[2.5rem] blur-lg opacity-0 group-within:opacity-100 transition-opacity" />
                    <div className="relative bg-white p-2 rounded-[2.5rem] flex items-center border border-slate-200 shadow-soft focus-within:border-brand-indigo/30 transition-all">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={isListening ? (lang === 'ar' ? 'جاري الاستماع...' : 'Listening...') : t.typeReply}
                            className={`flex-1 bg-transparent py-4 px-4 sm:px-6 outline-none text-slate-900 font-medium text-start ${isListening ? 'placeholder:text-brand-indigo animate-pulse' : 'placeholder:text-slate-300'}`}
                            dir="auto"
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <div className="flex items-center gap-1.5 shrink-0 pr-1">
                            <button
                                onClick={toggleListening}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-100 text-rose-500 shadow-inner' : 'bg-transparent text-slate-300 hover:text-brand-indigo hover:bg-slate-50'}`}
                                title={lang === 'ar' ? 'التحدث بدلاً من الكتابة' : 'Voice Typing'}
                            >
                                <Mic size={18} strokeWidth={isListening ? 3 : 2.5} className={isListening ? 'animate-pulse' : ''} />
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!message.trim() || isAITyping}
                                className="bg-brand-indigo text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100"
                            >
                                <Send size={18} strokeWidth={2.5} className={rtl ? '-scale-x-100' : ''} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                onClearChat={handleClearChat}
            />
        </div>
    );
};

export default ChatPage;
