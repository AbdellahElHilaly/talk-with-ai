import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Mic2, Speaker } from 'lucide-react';
import { validateGroqKey } from '../utils/auth';

const Sidebar = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
    const [speed, setSpeed] = useState(parseFloat(localStorage.getItem('voice_speed')) || 1);
    const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('selected_voice') || 'Female 1');
    const [isValidating, setIsValidating] = useState(false);
    const [isVerified, setIsVerified] = useState(!!localStorage.getItem('groq_api_key') && localStorage.getItem('groq_api_key') !== 'static');

    const voices = [
        { id: 'Female 1', icon: User, label: 'Bloom (F)', color: 'text-rose-500' },
        { id: 'Male 1', icon: User, label: 'Atlas (M)', color: 'text-indigo-500' },
        { id: 'Female 2', icon: Mic2, label: 'Nova (F)', color: 'text-amber-500' },
        { id: 'Male 2', icon: Speaker, label: 'Boreas (M)', color: 'text-emerald-500' },
    ];

    const validateKey = async () => {
        if (!apiKey.startsWith('gsk_')) {
            alert("Please enter a valid Groq key starting with 'gsk_'.");
            return;
        }

        setIsValidating(true);
        const isValid = await validateGroqKey(apiKey);

        if (isValid) {
            localStorage.setItem('groq_api_key', apiKey);
            setIsVerified(true);
            alert("API Key Verified Successfully! ✨");
        } else {
            setIsVerified(false);
            alert("Verification failed. Please check your key! 💖");
        }
        setIsValidating(false);
    };

    const handleSave = () => {
        localStorage.setItem('voice_speed', speed);
        localStorage.setItem('selected_voice', selectedVoice);
        onClose();
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
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-white z-50 p-8 flex flex-col shadow-2xl rounded-r-[2.5rem] overflow-y-auto hide-scrollbar"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex flex-col">
                                <span className="logo-font text-4xl text-brand-indigo -rotate-3">Smart-Lern</span>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1 ml-1">Settings Panel</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-10">
                            {/* API Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Groq Intelligence</label>
                                    {isVerified && <CheckCircle2 size={14} className="text-emerald-500" />}
                                </div>
                                <div className="space-y-3">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setIsVerified(false);
                                        }}
                                        placeholder="gsk_..."
                                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-200 outline-none transition-all text-slate-950 font-mono text-xs"
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={validateKey}
                                        disabled={isValidating}
                                        className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-100 transition-all hover:bg-slate-800"
                                    >
                                        {isValidating ? 'Checking...' : isVerified ? 'Verified ✓' : 'Verify Key'}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Voice Selection */}
                            <div className="flex flex-col gap-4">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Voice Engine</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {voices.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVoice(v.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${selectedVoice === v.id
                                                ? 'border-brand-indigo bg-indigo-50/30'
                                                : 'border-slate-50 hover:border-indigo-100'
                                                }`}
                                        >
                                            <v.icon className={`w-5 h-5 ${v.color}`} />
                                            <span className={`text-[9px] font-black uppercase tracking-tighter ${selectedVoice === v.id ? 'text-brand-indigo' : 'text-slate-400'}`}>
                                                {v.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Velocity Section */}
                            <div className="flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Speech Velocity</label>
                                    <span className="text-xl font-black text-brand-indigo font-mono italic">{speed}x</span>
                                </div>
                                <div className="relative px-2">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="2.0"
                                        step="0.1"
                                        value={speed}
                                        onChange={(e) => setSpeed(e.target.value)}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-indigo"
                                    />
                                    <div className="flex justify-between mt-2 px-1">
                                        <span className="text-[8px] font-bold text-slate-300">SLOW</span>
                                        <span className="text-[8px] font-bold text-slate-300">FAST</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-auto pt-10">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                className="w-full py-5 bg-brand-indigo text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-200"
                            >
                                Apply Changes
                            </motion.button>
                            <p className="text-center mt-6 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                                Smart-Lern Core v2.4.0
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
