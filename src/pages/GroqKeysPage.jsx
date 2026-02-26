import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Copy, Activity, ZapOff, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGroqKeys, addGroqKey, removeGroqKey, validateGroqKey } from '../utils/keyStorage';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';

const GroqKeysPage = () => {
    const navigate = useNavigate();
    const [keys, setKeys] = useState(getGroqKeys());
    const [keyHealth, setKeyHealth] = useState({}); // { [key]: { status: 'loading'|'good'|'dead' } }
    const [newKey, setNewKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    useEffect(() => {
        const checkAllHealths = async () => {
            const healths = {};
            for (const key of keys) {
                healths[key] = { status: 'loading' };
            }
            setKeyHealth(healths);

            for (const key of keys) {
                const isGood = await validateGroqKey(key);
                setKeyHealth(prev => ({
                    ...prev,
                    [key]: { status: isGood ? 'good' : 'dead' }
                }));
            }
        };
        checkAllHealths();
    }, [keys]);

    const handleAddKey = async () => {
        if (!newKey.trim()) return;
        setIsValidating(true);
        const success = await addGroqKey(newKey.trim());
        if (success) {
            setKeys(getGroqKeys());
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
        removeGroqKey(key);
        setKeys(getGroqKeys());
    };

    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        setAlertConfig({
            show: true,
            message: lang === 'ar' ? "تم نسخ المفتاح! 📋" : "Key copied to clipboard! 📋",
            type: 'success'
        });
    };

    const handleShare = async (sharedKeys) => {
        const baseUrl = window.location.origin + import.meta.env.BASE_URL + "import-keys";
        const url = `${baseUrl}?groq=${sharedKeys.join(',')}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Smart-Lern API Keys',
                    text: 'Import my API keys to your Smart-Lern app!',
                    url: url
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(url);
            setAlertConfig({
                show: true,
                message: lang === 'ar' ? "تم نسخ رابط المشاركة! 🔗" : "Share link copied! 🔗",
                type: 'success'
            });
        }
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
            <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors"
                    >
                        <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">{t.groqIntelligence}</h1>
                        <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.manageKeys}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <a
                                href="https://console.groq.com/keys"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline"
                            >
                                {t.clickHere}
                            </a>
                        </div>
                    </div>
                </div>

                {keys.length > 0 && (
                    <button
                        onClick={() => handleShare(keys)}
                        className="p-3 bg-indigo-50 text-brand-indigo rounded-2xl hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                        title="Share All Keys"
                    >
                        <Share2 size={20} />
                    </button>
                )}
            </div>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-8 pb-10">
                {/* Add Key Input */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{t.addKey}</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="gsk_..."
                            className={`w-full p-5 rounded-3xl bg-white border border-slate-200 outline-none focus:border-brand-indigo/30 transition-all font-mono text-sm shadow-sm ${rtl ? 'text-right' : 'text-left'}`}
                        />
                        <button
                            onClick={handleAddKey}
                            disabled={isValidating || !newKey.trim()}
                            className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors disabled:opacity-50 disabled:bg-slate-300`}
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
                            {keys.map((key, index) => {
                                const health = keyHealth[key] || { status: 'loading' };
                                return (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`bg-white p-4 rounded-[2rem] border transition-all ${health.status === 'dead' ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100'} shadow-sm flex items-center justify-between group`}
                                    >
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${health.status === 'good' ? 'bg-emerald-50 text-emerald-500' :
                                                health.status === 'dead' ? 'bg-amber-50 text-amber-500' :
                                                    'bg-slate-50 text-slate-300'
                                                }`}>
                                                {health.status === 'good' ? <CheckCircle2 size={24} /> :
                                                    health.status === 'dead' ? <ZapOff size={24} /> :
                                                        <Loader2 size={24} className="animate-spin opacity-20" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-mono text-[10px] text-slate-500 tracking-tight truncate max-w-[120px] md:max-w-xs">{key}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${health.status === 'good' ? 'text-emerald-500' :
                                                        health.status === 'dead' ? 'text-amber-500' :
                                                            'text-slate-300'
                                                        }`}>
                                                        {health.status === 'good' ? (index === 0 ? 'Active & Healthy' : 'Ready to use') :
                                                            health.status === 'dead' ? (lang === 'ar' ? 'المفتاح غير صالح حالياً' : 'Key currently invalid') : 'Checking Evolution...'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => handleShare([key])}
                                                className="p-3 text-slate-300 hover:text-brand-indigo transition-colors"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleCopy(key)}
                                                className="p-3 text-slate-300 hover:text-brand-indigo transition-colors"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(key)}
                                                className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {keys.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center gap-4 text-slate-400"
                                >
                                    <Activity size={48} strokeWidth={1} className="opacity-20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.notVerified}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroqKeysPage;
