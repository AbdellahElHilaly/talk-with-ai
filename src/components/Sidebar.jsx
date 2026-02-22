import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Mic2, Speaker, ExternalLink, HelpCircle, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateGroqKey, getGroqKeys } from '../utils/auth';
import { translations } from '../utils/translations';
import { getCurrentLang, setAppLang, isRTL } from '../utils/lang';
import { voiceEngine, getElevenKeys } from '../utils/voice';

const Sidebar = ({ isOpen, onClose }) => {
    const [lang, setLang] = useState(getCurrentLang());
    const [speed, setSpeed] = useState(parseFloat(localStorage.getItem('voice_speed')) || 1);
    const [selectedVoice, setSelectedVoice] = useState(() => {
        const saved = localStorage.getItem('selected_voice');
        // If it's a technical ID, map it back to labels
        if (saved === '21m00Tcm4TlvDq8ikWAM') return 'Female 1';
        if (saved === 'pNInz6obpgDQGcFmaJgB') return 'Male 1';
        return saved || 'Female 1';
    });
    const [isSaving, setIsSaving] = useState(false);

    const t = translations[lang];
    const rtl = isRTL();

    const voices = [
        { id: 'Female 1', icon: User, label: 'Bloom (F)', color: 'text-rose-500' },
        { id: 'Male 1', icon: User, label: 'Atlas (M)', color: 'text-indigo-500' },
    ];

    const toggleLang = (newLang) => {
        setAppLang(newLang);
        setLang(newLang);
        window.location.reload();
    };

    const handleVoiceSelect = (vId) => {
        setSelectedVoice(vId);
        // Play cute philosophy preview
        voiceEngine.speakPreview(vId, lang);
    };

    const handleSave = async () => {
        setIsSaving(true);
        localStorage.setItem('voice_speed', speed);
        localStorage.setItem('selected_voice', selectedVoice);
        await new Promise(r => setTimeout(r, 800));
        setIsSaving(false);
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
                        initial={{ x: rtl ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: rtl ? '100%' : '-100%' }}
                        className={`fixed ${rtl ? 'right-0' : 'left-0'} top-0 h-full w-[85%] max-w-sm bg-white z-50 p-8 flex flex-col shadow-2xl ${rtl ? 'rounded-l-[2.5rem]' : 'rounded-r-[2.5rem]'} overflow-y-auto hide-scrollbar`}
                        dir={rtl ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className={`flex justify-between items-center mb-6 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                <span className={`logo-font text-3xl text-brand-indigo ${rtl ? 'rotate-3' : '-rotate-3'}`}>Smart-Lern</span>
                                <span className={`text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1 ${rtl ? 'mr-1' : 'ml-1'}`}>{t.settingsPanel}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                            >
                                <X size={18} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* Language Selector */}
                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.language}</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleLang('en')}
                                        className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] transition-all ${lang === 'en' ? 'border-brand-indigo bg-indigo-50/30 text-brand-indigo' : 'border-slate-50 text-slate-400'}`}
                                    >
                                        ENGLISH
                                    </button>
                                    <button
                                        onClick={() => toggleLang('ar')}
                                        className={`flex-1 py-3 rounded-xl border-2 font-black text-[10px] transition-all ${lang === 'ar' ? 'border-brand-indigo bg-indigo-50/30 text-brand-indigo' : 'border-slate-50 text-slate-400'}`}
                                    >
                                        العربية
                                    </button>
                                </div>
                            </div>

                            {/* API Section (Minimal) */}
                            <div className="flex flex-col gap-5">
                                {/* GROQ API ROW */}
                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <Link to="/settings/groq-keys" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover:text-brand-indigo transition-colors">
                                            {lang === 'ar' ? 'دردشة ذكية' : 'CHAT API'}
                                        </label>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">{getGroqKeys().length}</span>
                                        </div>
                                    </Link>

                                    <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <Link to="/guide/groq" className="text-slate-300 hover:text-brand-indigo transition-colors" title={t.setupGuide}>
                                            <HelpCircle size={16} strokeWidth={2.5} />
                                        </Link>
                                        <div className={getGroqKeys().length > 0 ? 'text-emerald-500' : 'text-slate-200'}>
                                            <CheckCircle2 size={16} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>

                                {/* ELEVENLABS API ROW */}
                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <Link to="/settings/eleven-keys" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover:text-brand-indigo transition-colors">
                                            {lang === 'ar' ? 'صوت ذكي' : 'VOICE API'}
                                        </label>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">{getElevenKeys().length}</span>
                                        </div>
                                    </Link>

                                    <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <Link to="/guide/eleven" className="text-slate-300 hover:text-brand-indigo transition-colors" title={t.setupGuide}>
                                            <HelpCircle size={16} strokeWidth={2.5} />
                                        </Link>
                                        <div className={getElevenKeys().length > 0 ? 'text-emerald-500' : 'text-slate-200'}>
                                            <CheckCircle2 size={16} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Voice Selection (Minimal) */}
                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.voiceEngine}</label>
                                <div className="flex flex-col gap-2">
                                    {voices.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => handleVoiceSelect(v.id)}
                                            className={`flex items-center justify-between py-2 transition-all group ${rtl ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={`p-2 rounded-xl transition-colors ${selectedVoice === v.id ? 'bg-indigo-50' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                                                    <v.icon size={16} className={`${selectedVoice === v.id ? v.color : 'text-slate-400'}`} />
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${selectedVoice === v.id ? 'text-brand-indigo' : 'text-slate-500 hover:text-slate-900'}`}>
                                                    {v.label}
                                                </span>
                                            </div>
                                            {selectedVoice === v.id && (
                                                <motion.div layoutId="activeVoice" className="w-1.5 h-1.5 rounded-full bg-brand-indigo" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Velocity Section */}
                            <div className="flex flex-col gap-3 text-left">
                                <div className={`flex justify-between items-center ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t.speechVelocity}</label>
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
                                    <div className={`flex justify-between mt-1 px-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[8px] font-bold text-slate-300">{t.slow}</span>
                                        <span className="text-[8px] font-bold text-slate-300">{t.fast}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-8">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-80"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : t.applyChanges}
                            </motion.button>
                            <p className="text-center mt-4 text-[8px] font-bold text-slate-300 uppercase tracking-widest">
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
