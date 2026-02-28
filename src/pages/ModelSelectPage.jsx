import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Plus, Trash2, Loader2, Zap, Brain, Copy, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVIDERS, getSelectedProviderId, setSelectedProviderId, getSelectedModel, setSelectedModel } from '../providers/ProviderRegistry';
import { getCurrentLang, isRTL } from '../utils/lang';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

const ModelSelectPage = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const rtl = isRTL();
    const isAr = lang === 'ar';

    const [activeProviderId, setActiveProviderId] = useState(getSelectedProviderId());
    const [activeModel, setActiveModel] = useState(getSelectedModel());
    const [providerKeys, setProviderKeys] = useState({});   // { providerId: string[] }
    const [newKey, setNewKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const providers = Object.values(PROVIDERS);
    const activeProvider = PROVIDERS[activeProviderId];

    // Load keys for all providers
    useEffect(() => {
        const keys = {};
        providers.forEach(p => { keys[p.id] = p.getKeys(); });
        setProviderKeys(keys);
    }, []);

    const currentKeys = providerKeys[activeProviderId] || [];

    const handleProviderSelect = (providerId) => {
        setActiveProviderId(providerId);
        setSelectedProviderId(providerId);
        setActiveModel(PROVIDERS[providerId].defaultModel);
        setNewKey('');
    };

    const handleModelSelect = (modelId) => {
        setActiveModel(modelId);
        setSelectedModel(modelId);
    };

    const handleAddKey = async () => {
        if (!newKey.trim()) return;
        setIsValidating(true);
        const success = await activeProvider.addKey(newKey.trim());
        if (success) {
            setProviderKeys(prev => ({ ...prev, [activeProviderId]: activeProvider.getKeys() }));
            setNewKey('');
            setAlertConfig({ show: true, message: isAr ? 'تمت إضافة المفتاح بنجاح! ✨' : 'Key added successfully! ✨', type: 'success' });
        } else {
            setAlertConfig({ show: true, message: isAr ? 'المفتاح غير صالح. يرجى التأكد والمحاولة مرة أخرى.' : 'Invalid key. Please check and try again.', type: 'error' });
        }
        setIsValidating(false);
    };

    const handleDeleteKey = (key) => {
        activeProvider.removeKey(key);
        setProviderKeys(prev => ({ ...prev, [activeProviderId]: activeProvider.getKeys() }));
    };

    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        setAlertConfig({ show: true, message: isAr ? 'تم نسخ المفتاح! 📋' : 'Key copied! 📋', type: 'success' });
    };

    const badgeColor = (badge) => {
        if (badge === 'Recommended') return 'bg-emerald-50 text-emerald-600';
        if (badge === 'Fast') return 'bg-blue-50 text-blue-600';
        if (badge === 'Powerful') return 'bg-purple-50 text-purple-600';
        return 'bg-slate-50 text-slate-500';
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>

            <AnimatePresence>
                {isValidating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center"
                    >
                        <Spinner label={isAr ? 'جاري التحقق...' : 'Validating...'} />
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
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors">
                    <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {isAr ? 'محرك الذكاء الاصطناعي' : 'AI Engine'}
                    </h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isAr ? 'اختر مزوّد الذكاء ونموذجه' : 'Choose your AI provider & model'}
                    </span>
                </div>
            </div>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col gap-8 pb-12">

                {/* ── 1. PROVIDER SELECTION ── */}
                <section className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAr ? 'مزوّد الذكاء الاصطناعي' : 'AI Provider'}
                    </label>
                    <div className="flex flex-col gap-3">
                        {providers.map(provider => {
                            const isActive = provider.id === activeProviderId;
                            const keyCount = (providerKeys[provider.id] || []).length;
                            return (
                                <motion.button
                                    key={provider.id}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleProviderSelect(provider.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-[2rem] border-2 transition-all text-left ${rtl ? 'flex-row-reverse text-right' : ''} ${isActive
                                        ? 'border-brand-indigo bg-indigo-50/40 shadow-sm'
                                        : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                        }`}
                                >
                                    {/* Icon bubble */}
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
                                        style={{ backgroundColor: isActive ? provider.color + '18' : '#f8fafc' }}
                                    >
                                        {provider.icon}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                                        <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-sm font-black text-slate-900">{provider.name}</span>
                                            {isActive && (
                                                <span className="text-[8px] font-black uppercase tracking-widest bg-indigo-100 text-brand-indigo px-2 py-0.5 rounded-full">
                                                    {isAr ? 'نشط' : 'Active'}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-medium truncate">
                                            {isAr ? provider.descriptionAr : provider.description}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">
                                            {keyCount} {isAr ? 'مفاتيح' : 'keys'}
                                        </span>
                                    </div>

                                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? 'border-brand-indigo bg-brand-indigo' : 'border-slate-200'}`}>
                                        {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </section>

                {/* ── 2. MODEL SELECTION ── */}
                <section className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAr ? 'النموذج' : 'Model'}
                    </label>
                    <div className="flex flex-col gap-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeProviderId}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col gap-2"
                            >
                                {activeProvider.models.map(model => {
                                    const isSelected = model.id === activeModel;
                                    return (
                                        <button
                                            key={model.id}
                                            onClick={() => handleModelSelect(model.id)}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${rtl ? 'flex-row-reverse text-right' : 'text-left'} ${isSelected
                                                ? 'border-brand-indigo/30 bg-white shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-50 text-brand-indigo' : 'bg-slate-50 text-slate-400'}`}>
                                                {model.id.includes('reasoner') || model.id.includes('8b') ? <Brain size={16} /> : <Zap size={16} />}
                                            </div>
                                            <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                                                <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <span className={`text-xs font-black ${isSelected ? 'text-brand-indigo' : 'text-slate-800'}`}>
                                                        {model.name}
                                                    </span>
                                                    {model.badge && (
                                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${badgeColor(model.badge)}`}>
                                                            {model.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-medium">
                                                    {isAr ? model.descriptionAr : model.description}
                                                </span>
                                            </div>
                                            {isSelected && <CheckCircle2 size={18} className="text-brand-indigo shrink-0" strokeWidth={2.5} />}
                                        </button>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* ── 3. API KEYS FOR ACTIVE PROVIDER ── */}
                <section className="flex flex-col gap-3">
                    <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {isAr ? 'مفاتيح الـ API' : 'API Keys'} · {activeProvider.name}
                        </label>
                        <a
                            href={activeProvider.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] font-black text-brand-indigo hover:underline uppercase tracking-widest"
                        >
                            {isAr ? 'احصل على مفتاح' : 'Get a key'}
                            <ExternalLink size={10} />
                        </a>
                    </div>

                    {/* Add key input */}
                    <div className="relative">
                        <input
                            type="password"
                            value={newKey}
                            onChange={e => setNewKey(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddKey()}
                            placeholder={`${activeProvider.keyPrefix}...`}
                            className={`w-full p-5 rounded-3xl bg-white border border-slate-200 outline-none focus:border-brand-indigo/40 transition-all font-mono text-sm shadow-sm ${rtl ? 'text-right' : 'text-left'}`}
                        />
                        <button
                            onClick={handleAddKey}
                            disabled={isValidating || !newKey.trim()}
                            className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 aspect-square bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-brand-indigo transition-colors disabled:opacity-40`}
                        >
                            {isValidating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
                        </button>
                    </div>

                    {/* Keys list */}
                    <div className="flex flex-col gap-2">
                        <AnimatePresence mode="popLayout">
                            {currentKeys.map((key, idx) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                                >
                                    <div className={`flex items-center gap-3 overflow-hidden ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckCircle2 size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className={`flex flex-col overflow-hidden ${rtl ? 'items-end' : 'items-start'}`}>
                                            <span className="font-mono text-[10px] text-slate-500 truncate max-w-[160px] md:max-w-xs">{key}</span>
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                                                {idx === 0 ? (isAr ? 'مفعّل' : 'Active') : (isAr ? 'جاهز' : 'Ready')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => handleCopy(key)} className="p-2.5 text-slate-300 hover:text-brand-indigo transition-colors">
                                            <Copy size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteKey(key)} className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {currentKeys.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="py-10 flex flex-col items-center gap-3 text-slate-300">
                                <span className="text-4xl">{activeProvider.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">
                                    {isAr ? `لا توجد مفاتيح لـ ${activeProvider.nameAr}` : `No ${activeProvider.name} keys yet`}
                                </span>
                            </motion.div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ModelSelectPage;
