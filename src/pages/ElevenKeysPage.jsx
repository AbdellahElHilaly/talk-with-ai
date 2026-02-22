import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getElevenKeys, addElevenKey, removeElevenKey } from '../utils/voice';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';

const ElevenKeysPage = () => {
    const navigate = useNavigate();
    const [keys, setKeys] = useState(getElevenKeys());
    const [newKey, setNewKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    const handleAddKey = async () => {
        if (!newKey.trim()) return;
        setIsValidating(true);
        // Simple validation for ElevenLabs keys
        const success = await addElevenKey(newKey.trim());
        if (success) {
            setKeys(getElevenKeys());
            setNewKey('');
            setAlertConfig({
                show: true,
                message: t.keyAdded,
                type: 'success'
            });
        } else {
            setAlertConfig({
                show: true,
                message: t.invalidKey,
                type: 'error'
            });
        }
        setIsValidating(false);
    };

    const handleDelete = (key) => {
        removeElevenKey(key);
        setKeys(getElevenKeys());
    };

    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        setAlertConfig({
            show: true,
            message: lang === 'ar' ? "تم نسخ المفتاح! 📋" : "Key copied to clipboard! 📋",
            type: 'success'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>
            <AnimatePresence>
                {isValidating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Spinner label={t.validating} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Alert
                show={alertConfig.show}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
            />

            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors"
                >
                    <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">{t.cloudVoice}</h1>
                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.manageKeys}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <a
                            href="https://elevenlabs.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline"
                        >
                            {t.clickHere}
                        </a>
                    </div>
                </div>
            </div>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-8">
                {/* Intro */}
                <p className="text-xs text-slate-500 leading-relaxed bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                    {t.elevenHelp}
                </p>

                {/* Add Key Input */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{t.addKey}</label>
                    <div className="relative group">
                        <input
                            type="password"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="API Key..."
                            className={`w-full p-5 rounded-3xl bg-white border border-slate-200 outline-none focus:border-brand-indigo/30 transition-all font-mono text-sm shadow-sm ${rtl ? 'text-right' : 'text-left'}`}
                        />
                        <button
                            onClick={handleAddKey}
                            disabled={isValidating || !newKey.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors disabled:opacity-50 disabled:bg-slate-300"
                        >
                            {isValidating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                    </div>
                </div>

                {/* Keys List */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{t.keysCount}: {keys.length}</label>
                    <div className="flex flex-col gap-3">
                        <AnimatePresence mode="popLayout">
                            {keys.map((key, index) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${index === 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'}`}>
                                            {index === 0 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-mono text-xs text-slate-600 truncate max-w-[150px] md:max-w-xs">{key}</span>
                                            {index === 0 && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Active / Next</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleCopy(key)}
                                            className="p-3 text-slate-300 hover:text-brand-indigo transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(key)}
                                            className="p-3 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                            {keys.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400"
                                >
                                    <AlertCircle size={48} strokeWidth={1} />
                                    <span className="text-xs font-bold uppercase tracking-widest">{t.notSet}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ElevenKeysPage;
