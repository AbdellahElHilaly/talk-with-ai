import React, { useState, useEffect } from 'react';
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
  const [apiKey, setApiKey] = useState('');
  const [onboardingStep, setOnboardingStep] = useState(null); // 'api', 'install', null
  const [isValidating, setIsValidating] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. Check for API key
    const savedKey = localStorage.getItem('groq_api_key');
    if (!savedKey) {
      setOnboardingStep('api');
    }

    // 2. Listen for PWA install prompt
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (localStorage.getItem('groq_api_key')) {
        setOnboardingStep('install');
      }
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const checkPWA = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (!isStandalone && deferredPrompt) {
      setOnboardingStep('install');
    }
  };

  const validateAndSaveKey = async () => {
    if (!apiKey.startsWith('gsk_')) {
      alert("Oops! That doesn't look like a Groq key. It usually starts with 'gsk_'.");
      return;
    }

    setIsValidating(true);
    try {
      // Minimal test call to Groq
      const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        localStorage.setItem('groq_api_key', apiKey);
        if (deferredPrompt) setOnboardingStep('install');
        else setOnboardingStep(null);
      } else {
        throw new Error('Invalid Key');
      }
    } catch (err) {
      alert("Hmm, my heart couldn't verify that key. Please check it and try again! ✨");
    } finally {
      setIsValidating(false);
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
      setOnboardingStep(null);
    }
  };

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

        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-6 text-[10px] font-black text-brand-indigo hover:text-indigo-600 uppercase tracking-widest transition-colors"
          >
            + Install to Home Screen
          </button>
        )}
      </div>

      {/* Onboarding Modals Overlay */}
      <AnimatePresence>
        {onboardingStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
          >
            {onboardingStep === 'api' ? (
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Settings size={80} className="rotate-12" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-2">Power Me Up! ✨</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  To start our journey, I need a tiny bit of help. Please grab your <span className="text-brand-indigo font-bold">Groq API Key</span> from their dashboard.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-brand-indigo text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p className="text-[11px] text-slate-400 font-medium">Visit <a href="https://console.groq.com/keys" target="_blank" className="text-brand-indigo underline">Groq Console</a></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-brand-indigo text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p className="text-[11px] text-slate-400 font-medium">Create a new API Key</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 text-brand-indigo text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p className="text-[11px] text-slate-400 font-medium">Paste it below and let's bloom!</p>
                  </div>
                </div>

                <div className="relative mb-4">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm outline-none focus:border-brand-indigo/30 transition-all font-mono"
                  />
                </div>

                <button
                  onClick={validateAndSaveKey}
                  disabled={isValidating}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-200"
                >
                  {isValidating ? 'Validating...' : 'Unlock My Potential'}
                </button>

                <button
                  onClick={() => {
                    localStorage.setItem('groq_api_key', 'static');
                    setOnboardingStep(null);
                  }}
                  className="w-full mt-3 text-[10px] font-black text-slate-300 hover:text-brand-indigo uppercase tracking-widest transition-colors py-2"
                >
                  Maybe later, just let me explore ✨
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center"
              >
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                    <span className="text-white text-2xl">📱</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Stay Close! 💖</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                  I'm verified and ready. Install me on your home screen for the fastest access to your learning journey!
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleInstall}
                    className="w-full bg-brand-indigo text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-100"
                  >
                    Install Smart-Lern
                  </button>
                  <button
                    onClick={() => setOnboardingStep(null)}
                    className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2"
                  >
                    Let's Chat!
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
  const isStaticMode = localStorage.getItem('groq_api_key') === 'static';

  const handleWordSelect = (en, ar) => {
    if (selectedWord?.en === en) {
      setSelectedWord(null);
    } else {
      setSelectedWord({ en, ar });
    }
  };

  const handleSend = () => {
    if (isStaticMode) {
      alert("You are in Explore Mode! ✨ Add your Groq API key in settings to unlock real AI replies.");
      return;
    }
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
                  <div className="flex items-center gap-2">
                    <span className="logo-font text-2xl text-brand-indigo leading-none -ml-0.5">S-L</span>
                    {isStaticMode && (
                      <span className="text-[6px] px-1.5 py-0.5 bg-indigo-50 text-brand-indigo border border-indigo-100 rounded-full font-black uppercase tracking-tighter">Explore Mode</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${isStaticMode ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
                    <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">
                      {isStaticMode ? 'Local Engine' : 'Connected'}
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
