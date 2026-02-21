import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Send, Play, Square, Pause, RotateCcw, Settings, X, Moon, Sun, FastForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const Sidebar = ({ isOpen, onClose }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [speed, setSpeed] = useState(1);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed left-0 top-0 h-full w-4/5 max-w-sm glass z-50 p-6 flex flex-col gap-8 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-brand-indigo">Settings</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {/* API Key Input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-lg">Groq API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full p-4 rounded-xl bg-slate-100 border border-slate-200 outline-none focus:border-brand-indigo transition-all"
                />
              </div>

              {/* Play Speed Slider */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-lg text-brand-text">Play Speed</label>
                  <span className="text-brand-indigo font-bold">{speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full h-2 bg-brand-indigo/20 rounded-lg appearance-none cursor-pointer accent-brand-indigo"
                />
              </div>
            </div>

            <div className="mt-auto text-center text-sm opacity-50">
              v1.0.0-mobile
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
    <div className="h-full w-full relative flex flex-col bg-white overflow-hidden">
      {/* Settings Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-[2%] right-[5%] p-3 rounded-full z-10 text-slate-400 bg-slate-50 border border-slate-100"
      >
        <Settings size={20} />
      </button>

      {/* Center Search - 90% Width for all phones */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[90%] bg-white border-2 border-slate-100 rounded-2xl flex items-center shadow-2xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="pl-[4%] pr-[2%] text-slate-300">
            <Search size={22} />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-5 px-2 outline-none text-lg text-slate-900 placeholder:text-slate-300 w-full"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-brand-indigo text-white p-5 active:bg-brand-indigo/90 transition-colors"
          >
            <Send size={22} />
          </button>
        </motion.div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 1. TOP LAYER: Action Bar */}
      <div className="px-3 py-2 flex justify-between items-center border-b border-slate-100 bg-white shadow-sm z-10 shrink-0">
        <button onClick={() => navigate('/')} className="p-2 text-slate-500">
          <X size={22} />
        </button>
        <span className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.3em]">AI TRANSCRIPT</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500">
          <Settings size={22} />
        </button>
      </div>

      {/* 2. MIDDLE LAYER: Content (Takes all free space) */}
      <main className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
        <div className="w-full max-w-2xl text-xl md:text-2xl leading-relaxed text-slate-800 font-medium text-center">
          "Waiting for transcript..." (AI response will fill this entire middle section automatically)
        </div>
      </main>

      {/* 3. BOTTOM LAYER: Player Controls (Floating Style) */}
      <div className="relative pt-6 shrink-0">
        {/* The indigo bar */}
        <div className="bg-brand-indigo px-4 py-3 pb-8 flex justify-between items-center text-white relative z-0">
          <div className="flex gap-10 items-center pl-4">
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-white/80 hover:text-white transition-colors">
              <RotateCcw size={24} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-white/80 hover:text-white transition-colors">
              <Pause size={24} />
            </motion.button>
          </div>

          <div className="flex gap-10 items-center pr-4">
            <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-white/80 hover:text-white transition-colors">
              <Square size={24} fill="currentColor" className="opacity-80" />
            </motion.button>
            <motion.button onClick={() => setIsSidebarOpen(true)} whileTap={{ scale: 0.9 }} className="p-2 text-white/80 hover:text-white transition-colors">
              <Settings size={24} />
            </motion.button>
          </div>
        </div>

        {/* Floating Center Button */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-white text-brand-indigo flex items-center justify-center shadow-2xl border-4 border-white"
          >
            <Play size={32} fill="currentColor" className="ml-1" />
          </motion.button>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

function App() {
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
