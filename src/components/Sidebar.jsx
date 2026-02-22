import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Mic2, Speaker, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { validateGroqKey } from '../utils/auth';
import { translations } from '../utils/translations';
import { getCurrentLang, setAppLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';

const Sidebar = ({ isOpen, onClose }) => {
    const [lang, setLang] = useState(getCurrentLang());
    const [apiKey, setApiKey] = useState(localStorage.getItem('groq_api_key') || '');
    const [elevenKey, setElevenKey] = useState(localStorage.getItem('eleven_labs_key') || '');
    const [speed, setSpeed] = useState(parseFloat(localStorage.getItem('voice_speed')) || 1);
    const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('selected_voice') || 'Female 1');
    const [isValidating, setIsValidating] = useState(false);
    const [isVerified, setIsVerified] = useState(!!localStorage.getItem('groq_api_key') && localStorage.getItem('groq_api_key') !== 'static');

    const saveElevenKey = () => {
        localStorage.setItem('eleven_labs_key', elevenKey);
        alert(lang === 'ar' ? "تم حفظ مفتاح ElevenLabs! 🚀" : "ElevenLabs Key Saved! 🚀");
    };

    const t = translations[lang];
    const rtl = isRTL();

    const voices = [
        { id: 'Female 1', icon: User, label: 'Bloom (F)', color: 'text-rose-500' },
        { id: 'Male 1', icon: User, label: 'Atlas (M)', color: 'text-indigo-500' },
        { id: 'Female 2', icon: Mic2, label: 'Nova (F)', color: 'text-amber-500' },
        { id: 'Male 2', icon: Speaker, label: 'Boreas (M)', color: 'text-emerald-500' },
        { id: 'Female 3', icon: Speaker, label: 'Ember (F)', color: 'text-orange-500' },
        { id: 'Male 3', icon: Mic2, label: 'Orion (M)', color: 'text-sky-500' },
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

    const validateKey = async () => {
        if (!apiKey.startsWith('gsk_')) {
            alert(lang === 'ar' ? "يرجى إدخال مفتاح Groq صحيح يبدأ بـ 'gsk_'." : "Please enter a valid Groq key starting with 'gsk_'.");
            return;
        }

        setIsValidating(true);
        const isValid = await validateGroqKey(apiKey);

        if (isValid) {
            localStorage.setItem('groq_api_key', apiKey);
            setIsVerified(true);
            alert(lang === 'ar' ? "تم التحقق من المفتاح بنجاح! ✨" : "API Key Verified Successfully! ✨");
        } else {
            setIsVerified(false);
            alert(lang === 'ar' ? "فشل التحقق. يرجى التأكد من المفتاح! 💖" : "Verification failed. Please check your key! 💖");
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
                        initial={{ x: rtl ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: rtl ? '100%' : '-100%' }}
                        className={`fixed ${rtl ? 'right-0' : 'left-0'} top-0 h-full w-[85%] max-w-sm bg-white z-50 p-8 flex flex-col shadow-2xl ${rtl ? 'rounded-l-[2.5rem]' : 'rounded-r-[2.5rem]'} overflow-y-auto hide-scrollbar`}
                        dir={rtl ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className={`flex justify-between items-center mb-10 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                <span className={`logo-font text-4xl text-brand-indigo ${rtl ? 'rotate-3' : '-rotate-3'}`}>Smart-Lern</span>
                                <span className={`text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1 ${rtl ? 'mr-1' : 'ml-1'}`}>{t.settingsPanel}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-all active:scale-90"
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-10">
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

                            {/* API Section */}
                            <div className="flex flex-col gap-4 text-left">
                                <div className={`flex justify-between items-center ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <a
                                            href="https://console.groq.com/keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link"
                                        >
                                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover/link:text-brand-indigo transition-colors">{t.groqIntelligence}</label>
                                        </a>
                                        <Link to="/guide/groq" className="text-[8px] font-black text-brand-indigo/40 hover:text-brand-indigo transition-colors uppercase tracking-tighter shrink-0">
                                            ({t.clickHere})
                                        </Link>
                                    </div>
                                    {isVerified && <CheckCircle2 size={12} className="text-emerald-500" />}
                                </div>
                                <div className="space-y-2">
                                    <input
                                        type="password"
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            setIsVerified(false);
                                        }}
                                        placeholder="gsk_..."
                                        className={`w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-indigo-200 outline-none transition-all text-slate-950 font-mono text-xs ${rtl ? 'text-right' : 'text-left'}`}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={validateKey}
                                        disabled={isValidating}
                                        className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-slate-100 transition-all hover:bg-slate-800"
                                    >
                                        {isValidating ? t.verifying : isVerified ? t.verified : t.verifyKey}
                                    </motion.button>
                                </div>
                            </div>

                            {/* API Section (GOOGLE CLOUD) */}
                            <div className="flex flex-col gap-4 text-left">
                                <div className={`flex justify-between items-center ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <a
                                            href="https://elevenlabs.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link"
                                        >
                                            <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover/link:text-brand-indigo transition-colors">{t.cloudVoice}</label>
                                        </a>
                                        <Link to="/guide/eleven" className="text-[8px] font-black text-brand-indigo/40 hover:text-brand-indigo transition-colors uppercase tracking-tighter shrink-0">
                                            ({t.clickHere})
                                        </Link>
                                    </div>
                                    {elevenKey && elevenKey.length > 10 && <CheckCircle2 size={12} className="text-brand-indigo" />}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                                        {t.elevenHelp}
                                    </p>
                                    <input
                                        type="password"
                                        value={elevenKey}
                                        onChange={(e) => setElevenKey(e.target.value)}
                                        placeholder="API Key..."
                                        className={`w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-brand-indigo/30 outline-none transition-all text-slate-950 font-mono text-xs ${rtl ? 'text-right' : 'text-left'}`}
                                    />
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={saveElevenKey}
                                        className="w-full py-3 bg-brand-indigo/10 text-brand-indigo rounded-xl font-black text-[9px] uppercase tracking-[0.1em] hover:bg-brand-indigo/20 transition-all"
                                    >
                                        {t.saveKey}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Voice Selection */}
                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.voiceEngine}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {voices.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => handleVoiceSelect(v.id)}
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
                            <div className="flex flex-col gap-6 text-left">
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
                                    <div className={`flex justify-between mt-2 px-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[8px] font-bold text-slate-300">{t.slow}</span>
                                        <span className="text-[8px] font-bold text-slate-300">{t.fast}</span>
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
                                {t.applyChanges}
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
