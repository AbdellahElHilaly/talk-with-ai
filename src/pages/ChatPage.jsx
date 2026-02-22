import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Play, Square, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Word from '../components/Word';
import chatData from '../data/data.json';
import { isStaticMode } from '../utils/auth';

const ChatPage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const staticMode = isStaticMode();

    const handleWordSelect = (en, ar) => {
        if (selectedWord?.en === en) {
            setSelectedWord(null);
        } else {
            setSelectedWord({ en, ar });
        }
    };

    const handleSend = () => {
        if (staticMode) {
            alert("Dev Mode: Static exploration active. Add API key in settings when ready!");
            return;
        }
        if (message.trim()) {
            setMessage('');
        }
    };

    const playbackActions = [
        { icon: RotateCcw, label: 'Reset', color: 'text-slate-500 hover:text-slate-700' },
        { icon: Pause, label: 'Pause', color: 'text-amber-500 hover:text-amber-600' },
        { icon: Play, label: 'Play', color: 'text-brand-indigo hover:text-indigo-700', primary: true, filled: true },
        { icon: Square, label: 'Stop', color: 'text-rose-500 hover:text-rose-600', filled: true }
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden pb-safe">
            {/* MAGICAL TOP BAR */}
            <div className="px-6 py-4 flex justify-between items-center z-20 sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-brand-indigo transition-colors shrink-0">
                        <Settings size={20} strokeWidth={2} />
                    </button>

                    <div className="relative h-10 flex-1 flex items-center overflow-hidden ml-2 border-l border-slate-50 pl-4">
                        <AnimatePresence mode="wait">
                            {!selectedWord ? (
                                <motion.div
                                    key="status-logo"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="flex flex-col"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="logo-font text-2xl text-brand-indigo leading-none -ml-0.5">S-L</span>
                                        {staticMode && (
                                            <span className="text-[6px] px-1.5 py-0.5 bg-indigo-50 text-brand-indigo border border-indigo-100 rounded-full font-black uppercase tracking-tighter">Explore Mode</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-1 h-1 rounded-full ${staticMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                                        <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
                                            {staticMode ? 'Local Engine' : 'Connected'}
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
                                    className="flex flex-col"
                                >
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{selectedWord.en}</span>
                                    <span className="text-base font-black text-brand-indigo arabic-text leading-none">{selectedWord.ar}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="text-[9px] font-black text-white bg-slate-900 px-4 py-1.5 rounded-full tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                    EXIT
                </button>
            </div>

            <main className="flex-1 overflow-y-auto px-6 py-8">
                <div className="max-w-2xl mx-auto flex flex-col gap-12">
                    {chatData.map((item) => {
                        const isAI = item.role === 'ai';

                        if (!isAI) {
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="self-end max-w-[85%]"
                                >
                                    <div className="bg-white px-5 py-3.5 rounded-[1.5rem] rounded-tr-none shadow-sm border border-slate-100 text-slate-600 text-sm font-medium">
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
                                className="self-start w-full"
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="text-2xl md:text-3xl leading-[1.6] font-bold tracking-tight flex flex-wrap gap-x-1.5 gap-y-2 text-slate-950">
                                        {words.map((word, i) => {
                                            const cleanedKey = word.toLowerCase().replace(/[.,!?;:]/g, '');
                                            const translation = item.translate?.[cleanedKey];
                                            return (
                                                <Word
                                                    key={i}
                                                    en={word}
                                                    ar={translation}
                                                    onSelect={handleWordSelect}
                                                    isActive={selectedWord?.en === word}
                                                />
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-col gap-3 group">
                                        <div className="h-[1px] w-full bg-slate-100 group-hover:bg-indigo-50 transition-colors" />
                                        <div className="flex items-center gap-5 px-1">
                                            <div className="flex items-center gap-4">
                                                {playbackActions.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        title={action.label}
                                                        className={`${action.color} active:scale-90 transition-all p-1 drop-shadow-sm`}
                                                    >
                                                        <action.icon
                                                            size={15}
                                                            strokeWidth={2.5}
                                                            fill={action.filled ? "currentColor" : "none"}
                                                            className="opacity-90 hover:opacity-100"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
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
                            placeholder="Type your reply..."
                            className="flex-1 bg-transparent py-4 px-6 outline-none text-slate-900 placeholder:text-slate-300 font-medium"
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-brand-indigo text-white h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-transform shrink-0"
                        >
                            <Send size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </motion.div>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </div>
    );
};

export default ChatPage;
