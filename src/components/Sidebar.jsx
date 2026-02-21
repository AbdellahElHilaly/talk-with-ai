import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [speed, setSpeed] = useState(1);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-white z-50 p-8 flex flex-col gap-10 shadow-2xl rounded-r-[2.5rem]"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">System</h2>
                                <div className="h-1 w-8 bg-brand-indigo rounded-full mt-1" />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 active:scale-90 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* API Key Input */}
                            <div className="flex flex-col gap-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Groq Engine Key</label>
                                <div className="relative group">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        placeholder="Enter Groq API Key..."
                                        className="w-full p-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                                    />
                                </div>
                            </div>

                            {/* Play Speed Slider */}
                            <div className="flex flex-col gap-5">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Speech Velocity</label>
                                    <span className="text-2xl font-black text-brand-indigo tabular-nums">{speed}x</span>
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
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-slate-50">
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-[0.2em]">Core version 1.0.4</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
