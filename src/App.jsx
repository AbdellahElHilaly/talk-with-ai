import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Send, Play, Square, Pause, RotateCcw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';

// --- Screen Assets & Helpers ---
const GlassButton = ({ children, onClick, active = false }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`p-4 rounded-[1.5rem] transition-all ${active ? 'bg-brand-indigo text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-400 border border-slate-100'
      }`}
  >
    {children}
  </motion.button>
);

// --- Pages ---

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full relative flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-50/30 rounded-full blur-[120px]" />

      <div className="relative flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12 flex flex-col items-center"
        >
          <div className="mb-4">
            <span className="logo-font text-5xl text-brand-indigo block -rotate-6">Smart-Lern</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
            Ready to <br />
            <span className="text-brand-indigo italic">Bloom?</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-sm mx-auto">
            Let's chat, listen, and grow your vocabulary together.
          </p>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05, translateY: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/chat')}
          className="group relative px-12 py-5 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-indigo to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 text-white font-black tracking-[0.2em] uppercase text-sm">
            Launch S-L
          </span>
          {/* Subtle Glow Ring */}
          <div className="absolute inset-0 border border-white/10 rounded-[2rem]" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]"
        >
          Powering your growth via Smart-Lern
        </motion.p>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-3">
          <span className="logo-font text-lg text-brand-indigo opacity-60">Smart-Lern</span>
          <div className="w-1 h-3 bg-indigo-100 rounded-full" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active v2</span>
        </div>
      </div>
    </div>
  );
};

import chatData from './data/data.json';

const Word = ({ en, ar, onSelect, isActive }) => {
  const isTradable = !!ar;
  return (
    <motion.span
      onClick={() => isTradable && onSelect(en, ar)}
      whileTap={isTradable ? { scale: 0.98 } : {}}
      className={`inline-block transition-colors duration-300 ${isTradable ? 'cursor-pointer' : 'cursor-default opacity-80'
        } ${isActive
          ? 'text-brand-indigo underline underline-offset-8 decoration-2 font-bold'
          : isTradable ? 'text-slate-700 hover:text-brand-indigo' : 'text-slate-400'
        }`}
    >
      {en}
    </motion.span>
  );
};

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(2); // Play
  const [selectedWord, setSelectedWord] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleWordSelect = (en, ar) => {
    if (selectedWord?.en === en) {
      setSelectedWord(null);
    } else {
      setSelectedWord({ en, ar });
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  const playbackActions = [
    { icon: RotateCcw, label: 'Reset' },
    { icon: Pause, label: 'Pause' },
    { icon: Play, label: 'Play', primary: true },
    { icon: Square, label: 'Stop' }
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
                  <span className="logo-font text-2xl text-brand-indigo leading-none -ml-0.5">S-L</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Connected</span>
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
                  <div className="text-2xl md:text-3xl leading-[1.6] font-medium tracking-tight flex flex-wrap gap-x-1.5 gap-y-2 text-slate-800">
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
                        {playbackActions.map((action, idx) => {
                          const colors = [
                            'text-slate-500 hover:text-slate-700', // Reset
                            'text-amber-500 hover:text-amber-600', // Pause
                            'text-brand-indigo hover:text-indigo-700', // Play
                            'text-rose-500 hover:text-rose-600'  // Stop
                          ];
                          return (
                            <button
                              key={idx}
                              className={`${colors[idx]} active:scale-90 transition-all p-1 drop-shadow-sm`}
                            >
                              <action.icon
                                size={15}
                                strokeWidth={2.5}
                                fill={idx === 2 || idx === 3 ? "currentColor" : "none"}
                                className="opacity-90 hover:opacity-100"
                              />
                            </button>
                          );
                        })}
                      </div>

                      <span className="ml-auto text-[7px] font-bold text-slate-200 tracking-[0.4em] uppercase">ID: {item.id}AI</span>
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

const App = () => {
  return (
    <Router basename="/talk-with-ai">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
