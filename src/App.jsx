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
  const [message, setMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSend = () => {
    if (message.trim()) {
      navigate('/chat', { state: { message } });
    }
  };

  return (
    <div className="h-full w-full relative flex flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Magical Minimal Header - Floating Spark */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-ping" />
        <span className="text-[10px] font-black tracking-[0.5em] text-slate-300 uppercase">Mind Nexus</span>
      </div>

      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-6 right-6 p-4 rounded-2xl z-10 text-slate-400 bg-white/80 backdrop-blur-xl border border-white shadow-soft transition-all active:scale-95"
      >
        <Settings size={20} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 leading-none">
            Hello, <br />
            <span className="text-brand-indigo">Seeker.</span>
          </h1>
          <p className="text-slate-400 font-medium">What's on your mind today?</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-md relative group"
        >
          {/* Magical Outer Glow (Visible on Focus) */}
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-indigo/20 to-indigo-400/20 rounded-[2.5rem] blur-xl opacity-0 group-within:opacity-100 transition-opacity duration-500" />

          <div className="relative bg-white p-2 rounded-[2.2rem] flex items-center shadow-magical border border-indigo-50/50">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Whisper your thoughts..."
              className="flex-1 bg-transparent py-4 px-6 outline-none text-lg text-slate-900 placeholder:text-slate-400 font-medium"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="bg-brand-indigo text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0 transition-transform"
            >
              <Send size={22} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Prompt Suggestion Sparkle */}
          <div className="mt-6 flex justify-center gap-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1 h-3 bg-brand-indigo/30 rounded-full" />
              Tap to explore the nexus
            </span>
          </div>
        </motion.div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

import transcriptData from './data/transcript.json';

const Word = ({ en, ar, onSelect, isActive }) => {
  const isTradable = !!ar;

  return (
    <motion.span
      onClick={() => isTradable && onSelect(en, ar)}
      whileTap={isTradable ? { scale: 0.98 } : {}}
      className={`inline-block transition-colors duration-300 ${isTradable ? 'cursor-pointer' : 'cursor-default opacity-80'
        } ${isActive
          ? 'text-brand-indigo underline underline-offset-8 decoration-2'
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

  // Process text from JSON: clean punctuation for map lookup
  const words = transcriptData.text.split(' ');
  const processedTranscript = words.map(word => {
    const cleanedKey = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const translation = transcriptData.translate[cleanedKey];
    return { en: word, ar: translation || null };
  });

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
      // Future logic for adding messages to history
    }
  };

  const playbackActions = [
    { icon: RotateCcw, label: 'Reset' },
    { icon: Pause, label: 'Pause' },
    { icon: Play, label: 'Play', primary: true },
    { icon: Square, label: 'Stop' }
  ];

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden pb-safe">
      {/* MAGICAL TOP BAR */}
      <div className="px-6 py-4 flex justify-between items-center z-20 sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-50">
        <div className="flex items-center gap-4 flex-1">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 hover:text-brand-indigo transition-colors shrink-0">
            <Settings size={20} strokeWidth={2} />
          </button>

          <div className="relative h-10 flex-1 flex items-center overflow-hidden">
            <AnimatePresence mode="wait">
              {!selectedWord ? (
                <motion.div
                  key="status"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col"
                >
                  <span className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Neural Link</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Live Syncing</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="translation"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="flex flex-col"
                >
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{selectedWord.en}</span>
                  <span className="text-lg font-black text-brand-indigo arabic-text leading-none">{selectedWord.ar}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-[10px] font-black text-white bg-slate-900 px-4 py-1.5 rounded-full tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200 ml-4"
        >
          EXIT
        </button>
      </div>

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto flex flex-col items-center"
        >
          {/* Transcript Area */}
          <div className="text-3xl md:text-5xl leading-[1.6] font-medium tracking-tight flex flex-wrap gap-x-2 gap-y-4 text-center justify-center">
            {processedTranscript.map((word, i) => (
              <Word
                key={i}
                en={word.en}
                ar={word.ar}
                onSelect={handleWordSelect}
                isActive={selectedWord?.en === word.en}
              />
            ))}
            <span className="inline-block w-2 h-10 ml-1 bg-brand-indigo/10 animate-pulse rounded-full align-middle outline-none" />
          </div>

          {/* Contextual Action Icons Under Text */}
          <div className="mt-12 flex items-center justify-center gap-6 p-2 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm">
            {playbackActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`p-4 rounded-2xl transition-all active:scale-90 ${activeTab === idx
                    ? 'bg-brand-indigo text-white shadow-lg shadow-indigo-100'
                    : 'text-slate-400 hover:bg-white hover:text-slate-600'
                  }`}
              >
                <action.icon size={action.primary ? 24 : 20} strokeWidth={2.5} fill={idx === 2 || idx === 3 ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* NEW BOTTOM SEND BAR */}
      <div className="px-6 pb-14 pt-4 bg-gradient-to-t from-white via-white to-transparent">
        <motion.div
          className="max-w-md mx-auto relative group"
        >
          {/* Subtle Focus Glow */}
          <div className="absolute -inset-1 bg-brand-indigo/5 rounded-[2.5rem] blur-lg opacity-0 group-within:opacity-100 transition-opacity" />

          <div className="relative bg-slate-50 p-1.5 rounded-[2.5rem] flex items-center border border-slate-100 shadow-soft focus-within:bg-white focus-within:border-brand-indigo/20 transition-all">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Continue the conversation..."
              className="flex-1 bg-transparent py-4 px-6 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
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
