import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, CheckCircle2, Loader2, Copy, Activity, ZapOff, BarChart3, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getElevenKeys, addElevenKey, removeElevenKey, validateElevenKey } from '../utils/keyStorage';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import Spinner from '../components/shared/Spinner';
import Alert from '../components/shared/Alert';

const ElevenKeysPage = () => {
    const navigate = useNavigate();
    const [keys, setKeys] = useState(getElevenKeys());
    const [keyInfo, setKeyInfo] = useState({}); // { [key]: { status, usage, limit, tier, remaining } }
    const [newKey, setNewKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    useEffect(() => {
        const checkAllKeys = async () => {
            const info = {};
            for (const key of keys) {
                info[key] = { status: 'loading' };
            }
            setKeyInfo(info);

            for (const key of keys) {
                const data = await validateElevenKey(key);

                if (data && data.remaining <= 0) {
                    removeElevenKey(key);
                    setKeys(prev => prev.filter(k => k !== key));
                    setAlertConfig({
                        show: true,
                        message: lang === 'ar' ? "تمت إزالة المفتاح المنتهي تلقائياً" : "Expired key removed automatically",
                        type: 'error'
                    });
                    continue;
                }

                setKeyInfo(prev => ({
                    ...prev,
                    [key]: data || { status: 'dead' }
                }));
            }
        };
        checkAllKeys();
    }, [keys]);

    const handleAddKey = async () => {
        if (!newKey.trim()) return;
        setIsValidating(true);
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
            <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center gap-4 sticky top-0 z-10 shrink-0">
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

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-8 pb-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    {t.elevenHelp}
                </p>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{t.addKey}</label>
                    <div className="relative">
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
                            className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors disabled:opacity-50 disabled:bg-slate-300`}
                        >
                            {isValidating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">{t.keysCount}: {keys.length}</label>
                    <div className="flex flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {keys.map((key, index) => {
                                const info = keyInfo[key] || { status: 'loading' };
                                const usagePercent = info.limit ? (info.usage / info.limit) * 100 : 0;
                                const isLow = info.status === 'good' && info.remaining < 500;

                                return (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`bg-white p-5 rounded-[2.5rem] border transition-all ${info.status === 'dead' ? 'border-amber-100 bg-amber-50/20' :
                                            isLow ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100'
                                            } shadow-sm flex flex-col gap-4 group`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isLow || info.status === 'dead' ? 'bg-amber-50 text-amber-500' :
                                                    info.status === 'good' ? (info.restricted ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-brand-indigo') :
                                                        'bg-slate-50 text-slate-300'
                                                    }`}>
                                                    {isLow ? <AlertTriangle size={24} /> :
                                                        info.status === 'good' ? (info.restricted ? <CheckCircle2 size={24} /> : <BarChart3 size={24} />) :
                                                            info.status === 'dead' ? <ZapOff size={24} /> :
                                                                <Loader2 size={24} className="animate-spin opacity-20" />}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-mono text-[10px] text-slate-400 tracking-tight truncate max-w-[120px] md:max-w-xs">{key}</span>
                                                    <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isLow || info.status === 'dead' ? 'text-amber-500' :
                                                        info.status === 'good' ? (info.restricted ? 'text-blue-500' : 'text-brand-indigo') :
                                                            'text-slate-300'
                                                        }`}>
                                                        {isLow ? (lang === 'ar' ? 'تنبيه: رصيد منخفض' : 'Warning: Low Credits') :
                                                            info.status === 'good' ? (info.restricted ? (lang === 'ar' ? 'مفتاح محدود (جاهز للنطق)' : 'Restricted (TTS Ready)') : `${info.tier} Plan`) :
                                                                info.status === 'dead' ? 'Access Restricted' : 'Checking Evolution...'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => handleCopy(key)} className="p-3 text-slate-300 hover:text-brand-indigo transition-colors"><Copy size={18} /></button>
                                                <button onClick={() => handleDelete(key)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        </div>

                                        {info.status === 'good' && !info.restricted && (
                                            <div className="space-y-2 px-2">
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                    <span>{lang === 'ar' ? 'الحروف المستخدمة' : 'Characters Used'}</span>
                                                    <span>{Math.round(usagePercent)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${usagePercent}%` }}
                                                        className={`h-full ${usagePercent > 90 ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-brand-indigo'}`}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-tighter">
                                                    <span className={isLow ? 'text-amber-500' : 'text-slate-300'}>
                                                        {lang === 'ar' ? 'المتبقي:' : 'Remaining:'} {info.remaining.toLocaleString()}
                                                    </span>
                                                    <span className="text-slate-300">
                                                        {info.usage.toLocaleString()} / {info.limit.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ElevenKeysPage;
