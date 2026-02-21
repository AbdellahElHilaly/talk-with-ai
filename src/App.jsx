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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Search Bar in Middle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md glass rounded-3xl p-2 flex items-center shadow-xl group focus-within:ring-2 focus-within:ring-brand-indigo/30 transition-all"
      >
        <div className="pl-4 pr-2 text-brand-indigo/50">
          <Search size={22} />
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent py-4 outline-none text-lg placeholder:text-brand-text/30"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          className="bg-brand-indigo text-white p-4 rounded-2xl shadow-brand-indigo"
        >
          <Send size={22} />
        </motion.button>
      </motion.div>

      {/* Floating Settings Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-6 right-6 p-4 glass rounded-full shadow-lg hover:bg-brand-indigo hover:text-white transition-colors"
      >
        <Settings size={22} />
      </button>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
};

const ChatPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-brand-ghost dark:bg-brand-dark transition-colors duration-300">
      {/* Status Bar / Header */}
      <div className="p-4 flex justify-between items-center glass border-b border-black/5">
        <button onClick={() => navigate('/')} className="p-2">
          <X size={24} />
        </button>
        <h1 className="font-bold text-lg text-brand-indigo">Processing...</h1>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2">
          <Settings size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-3xl p-8 min-h-[60vh] text-xl leading-relaxed shadow-inner"
        >
          "Waiting for transcript..." (This will show the AI response)
        </motion.div>
      </main>

      {/* Bottom Nav Bar Controls */}
      <div className="p-6 pb-10 glass rounded-t-[40px] shadow-[0_-10px_40px_-15px_rgba(79,70,229,0.2)]">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <motion.button whileTap={{ scale: 0.85 }} className="p-5 rounded-full bg-black/5 dark:bg-white/5 text-brand-indigo">
            <RotateCcw size={28} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            className="p-6 rounded-full bg-brand-indigo text-white shadow-brand-indigo"
          >
            <Play size={32} fill="currentColor" />
          </motion.button>

          <motion.button whileTap={{ scale: 0.85 }} className="p-5 rounded-full bg-black/5 dark:bg-white/5 text-brand-dark dark:text-brand-ghost">
            <Pause size={28} />
          </motion.button>

          <motion.button whileTap={{ scale: 0.85 }} className="p-5 rounded-full bg-rose-500/10 text-rose-500">
            <Square size={28} fill="currentColor" />
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
