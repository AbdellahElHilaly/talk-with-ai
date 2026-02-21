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
              {/* Dark Mode Toggle */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-lg">Appearance</span>
                <button
                  onClick={toggleDarkMode}
                  className="p-3 rounded-xl bg-brand-indigo/10 text-brand-indigo flex items-center gap-2"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  {isDarkMode ? 'Light' : 'Dark'}
                </button>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-2">
                <label className="font-medium text-lg">Groq API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 outline-none focus:border-brand-indigo transition-all"
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
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-brand-ghost dark:bg-brand-dark transition-colors duration-300">
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-4 right-4 p-3 glass rounded-full shadow-sm z-10 text-brand-indigo bg-white/80 dark:bg-black/20"
      >
        <Settings size={20} />
      </button>

      {/* Centered Input Container - Using flex-1 to stay stable even with keyboard */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md glass rounded-2xl flex items-center shadow-lg bg-white dark:bg-black/40 border-brand-indigo/10 overflow-hidden"
        >
          <div className="pl-4 pr-1 text-brand-indigo/40 font-bold">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Talk with AI..."
            className="flex-1 bg-transparent py-4 px-2 outline-none text-base text-brand-text dark:text-brand-ghost placeholder:text-brand-text/30"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-brand-indigo text-white p-4 active:bg-brand-indigo/80 transition-colors"
          >
            <Send size={20} />
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
    <div className="h-full flex flex-col bg-white dark:bg-brand-dark transition-colors duration-300">
      {/* Minimal Action Bar */}
      <div className="px-3 py-2 flex justify-between items-center border-b border-black/5 dark:border-white/5 bg-white dark:bg-black/80 z-10 sticky top-0">
        <button onClick={() => navigate('/')} className="p-1 text-slate-600 dark:text-slate-300">
          <X size={20} />
        </button>
        <span className="text-[10px] font-bold text-brand-indigo uppercase tracking-[0.2em]">TRANSCRIPT</span>
        <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-slate-600 dark:text-slate-300">
          <Settings size={20} />
        </button>
      </div>

      {/* Full Screen Text Content */}
      <main className="flex-1 overflow-y-auto px-5 py-6">
        <div className="text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
          "Waiting for transcript..." (This will show the AI response in full screen space)
        </div>
      </main>

      {/* Minimal Bottom Nav (No Rounds, Compact) */}
      <div className="border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-black/90 px-2 py-3 mt-auto">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-brand-indigo/70">
            <RotateCcw size={22} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            className="px-8 py-2.5 bg-brand-indigo text-white rounded-xl shadow-brand-indigo shadow-lg"
          >
            <Play size={24} fill="currentColor" />
          </motion.button>

          <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-slate-500 dark:text-slate-400">
            <Pause size={22} />
          </motion.button>

          <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-rose-500/80">
            <Square size={22} fill="currentColor" />
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
