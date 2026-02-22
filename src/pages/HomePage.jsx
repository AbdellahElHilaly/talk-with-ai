import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { validateGroqKey, saveApiKey } from '../utils/auth';

const HomePage = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [onboardingStep, setOnboardingStep] = useState(null); // 'api', 'install', null
    const [isValidating, setIsValidating] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        const savedKey = localStorage.getItem('groq_api_key');
        if (!savedKey) {
            setOnboardingStep('api');
        }

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

    const validateAndSaveKey = async () => {
        if (!apiKey.startsWith('gsk_')) {
            alert("Oops! That doesn't look like a Groq key. It usually starts with 'gsk_'.");
            return;
        }

        setIsValidating(true);
        const isValid = await validateGroqKey(apiKey);

        if (isValid) {
            saveApiKey(apiKey);
            if (deferredPrompt) setOnboardingStep('install');
            else setOnboardingStep(null);
        } else {
            alert("Hmm, my heart couldn't verify that key. Please check it and try again! ✨");
        }
        setIsValidating(false);
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/chat')}
                    className="group relative px-12 py-5 bg-brand-indigo rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 transition-all"
                >
                    <span className="relative z-10 text-white font-black tracking-[0.2em] uppercase text-sm">
                        Launch S-L
                    </span>
                    <div className="absolute inset-0 border border-white/20 rounded-[2rem]" />
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

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    onClick={validateAndSaveKey}
                                    disabled={isValidating}
                                    className="w-full bg-brand-indigo text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                                >
                                    {isValidating ? 'Validating...' : 'Unlock My Potential'}
                                </motion.button>

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
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleInstall}
                                        className="w-full bg-brand-indigo text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-100"
                                    >
                                        Install Smart-Lern
                                    </motion.button>
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

export default HomePage;
