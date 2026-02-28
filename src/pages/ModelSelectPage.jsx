import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, CheckCircle2, Plus, Trash2, Loader2, Copy, ExternalLink, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVIDERS, getSelectedProviderId, setSelectedProviderId, getSelectedModel, setSelectedModel } from '../providers/ProviderRegistry';
import { getCurrentLang, isRTL } from '../utils/lang';
import Alert from '../components/shared/Alert';
import Spinner from '../components/shared/Spinner';

/* ─── tiny reusable dropdown ─── */
const Select = ({ value, onChange, options, rtl }) => {
    const [open, setOpen] = useState(false);
    const selected = options.find(o => o.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between gap-3 px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl hover:border-brand-indigo/40 transition-all shadow-sm focus:outline-none ${open ? 'border-brand-indigo/50 shadow-md' : ''} ${rtl ? 'flex-row-reverse text-right' : 'text-left'}`}
            >
                <div className={`flex items-center gap-3 overflow-hidden ${rtl ? 'flex-row-reverse' : ''}`}>
                    {selected?.icon && <span className="text-xl shrink-0">{selected.icon}</span>}
                    <div className={`flex flex-col overflow-hidden ${rtl ? 'items-end' : 'items-start'}`}>
                        <span className="text-sm font-black text-slate-900 truncate">{selected?.label}</span>
                        {selected?.sub && <span className="text-[10px] text-slate-400 font-medium truncate">{selected.sub}</span>}
                    </div>
                </div>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* backdrop */}
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-[calc(100%+6px)] left-0 right-0 z-20 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden"
                        >
                            {options.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors ${rtl ? 'flex-row-reverse text-right' : 'text-left'} ${opt.value === value ? 'bg-indigo-50/50' : ''}`}
                                >
                                    {opt.icon && <span className="text-xl shrink-0">{opt.icon}</span>}
                                    <div className={`flex flex-col flex-1 overflow-hidden ${rtl ? 'items-end' : 'items-start'}`}>
                                        <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <span className="text-sm font-bold text-slate-800 truncate">{opt.label}</span>
                                            {opt.badge && (
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${opt.badgeColor || 'bg-slate-100 text-slate-500'}`}>
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>
                                        {opt.sub && <span className="text-[10px] text-slate-400 truncate">{opt.sub}</span>}
                                    </div>
                                    {opt.value === value && (
                                        <CheckCircle2 size={16} className="text-brand-indigo shrink-0" strokeWidth={2.5} />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── main page ─── */
const ModelSelectPage = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const rtl = isRTL();
    const isAr = lang === 'ar';

    const [activeProviderId, setActiveProviderId] = useState(getSelectedProviderId());
    const [activeModel, setActiveModel] = useState(getSelectedModel());
    const [providerKeys, setProviderKeys] = useState({});
    const [newKey, setNewKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

    const providers = Object.values(PROVIDERS);
    const activeProvider = PROVIDERS[activeProviderId];

    useEffect(() => {
        const keys = {};
        providers.forEach(p => { keys[p.id] = p.getKeys(); });
        setProviderKeys(keys);
    }, []);

    const currentKeys = providerKeys[activeProviderId] || [];

    /* provider dropdown options */
    const providerOptions = providers.map(p => ({
        value: p.id,
        label: p.name,
        sub: isAr ? p.descriptionAr : p.description,
        icon: p.icon,
    }));

    /* model dropdown options */
    const modelOptions = activeProvider.models.map(m => {
        const badgeColors = {
            Recommended: 'bg-emerald-50 text-emerald-600',
            Fast: 'bg-blue-50 text-blue-600',
            Powerful: 'bg-purple-50 text-purple-600',
        };
        return {
            value: m.id,
            label: m.name,
            sub: isAr ? m.descriptionAr : m.description,
            badge: m.badge,
            badgeColor: badgeColors[m.badge],
        };
    });

    const handleProviderChange = (providerId) => {
        setActiveProviderId(providerId);
        setSelectedProviderId(providerId);
        const defaultModel = PROVIDERS[providerId].defaultModel;
        setActiveModel(defaultModel);
        setNewKey('');
    };

    const handleModelChange = (modelId) => {
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
            setAlertConfig({ show: true, message: isAr ? 'المفتاح غير صالح. تأكد منه وأعد المحاولة.' : 'Invalid key. Please check and try again.', type: 'error' });
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

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>

            <AnimatePresence>
                {isValidating && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
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

            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center gap-4 sticky top-0 z-10 shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors"
                >
                    <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">
                        {isAr ? 'محرك الذكاء الاصطناعي' : 'AI Engine'}
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {isAr ? 'اختر مزوّدك ونموذجك' : 'Choose your provider & model'}
                    </p>
                </div>
            </div>

            <main className="flex-1 p-5 max-w-xl mx-auto w-full flex flex-col gap-6 pb-12">

                {/* ════════════════════════════════════════
                    PART 1 — PROVIDER & MODEL SELECTION
                ════════════════════════════════════════ */}
                <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

                    {/* section header */}
                    <div className="px-6 pt-5 pb-2">
                        <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-brand-indigo font-black text-xs">1</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {isAr ? 'اختيار النموذج' : 'Model Selection'}
                            </span>
                        </div>
                    </div>

                    <div className="px-5 pb-5 flex flex-col gap-4 mt-2">

                        {/* Provider dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>
                                {isAr ? 'مزوّد الذكاء الاصطناعي' : 'AI Provider'}
                            </label>
                            <Select
                                value={activeProviderId}
                                onChange={handleProviderChange}
                                options={providerOptions}
                                rtl={rtl}
                            />
                        </div>

                        {/* divider */}
                        <div className="h-px bg-slate-100 mx-1" />

                        {/* Model dropdown */}
                        <div className="flex flex-col gap-2">
                            <label className={`text-[10px] font-black text-slate-500 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>
                                {isAr ? 'النموذج' : 'Model'}
                            </label>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeProviderId}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Select
                                        value={activeModel}
                                        onChange={handleModelChange}
                                        options={modelOptions}
                                        rtl={rtl}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Active summary pill */}
                        <div className={`flex items-center gap-2 px-4 py-2.5 bg-indigo-50 rounded-2xl ${rtl ? 'flex-row-reverse' : ''}`}>
                            <span className="text-base">{activeProvider.icon}</span>
                            <span className="text-[10px] font-black text-brand-indigo truncate">
                                {activeProvider.name} · {activeModel}
                            </span>
                            <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        </div>
                    </div>
                </section>


                {/* ════════════════════════════════════════
                    PART 2 — API KEYS MANAGEMENT
                ════════════════════════════════════════ */}
                <AnimatePresence mode="wait">
                    <motion.section
                        key={activeProviderId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
                    >
                        {/* section header */}
                        <div className="px-6 pt-5 pb-2">
                            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-brand-indigo font-black text-xs">2</div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {isAr ? `مفاتيح ${activeProvider.nameAr}` : `${activeProvider.name} API Keys`}
                                    </span>
                                </div>
                                <a
                                    href={activeProvider.docsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-1 text-[9px] font-black text-brand-indigo hover:underline uppercase tracking-widest ${rtl ? 'flex-row-reverse' : ''}`}
                                >
                                    {isAr ? 'احصل على مفتاح' : 'Get a key'}
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>

                        <div className="px-5 pb-5 flex flex-col gap-4 mt-2">

                            {/* ── Add key input ── */}
                            <div className="relative">
                                <div className={`absolute ${rtl ? 'right-4' : 'left-4'} top-0 bottom-0 flex items-center pointer-events-none`}>
                                    <KeyRound size={16} className="text-slate-300" />
                                </div>
                                <input
                                    type="password"
                                    value={newKey}
                                    onChange={e => setNewKey(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddKey()}
                                    placeholder={`${activeProvider.keyPrefix}...`}
                                    className={`w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-brand-indigo/40 focus:bg-white transition-all font-mono text-sm shadow-sm ${rtl ? 'text-right pr-11 pl-16' : 'text-left pl-11 pr-16'}`}
                                />
                                <button
                                    onClick={handleAddKey}
                                    disabled={isValidating || !newKey.trim()}
                                    className={`absolute ${rtl ? 'left-2' : 'right-2'} top-2 bottom-2 px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-indigo transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-black uppercase tracking-wider`}
                                >
                                    {isValidating
                                        ? <Loader2 size={14} className="animate-spin" />
                                        : <><Plus size={14} />{isAr ? 'إضافة' : 'Add'}</>
                                    }
                                </button>
                            </div>

                            {/* ── Keys list ── */}
                            <div className="flex flex-col gap-2">
                                <AnimatePresence mode="popLayout">
                                    {currentKeys.map((key, idx) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, scale: 0.96, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, x: rtl ? 30 : -30 }}
                                            transition={{ duration: 0.18 }}
                                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                                        >
                                            {/* status dot */}
                                            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={18} className="text-emerald-500" strokeWidth={2.5} />
                                            </div>

                                            {/* key text */}
                                            <div className={`flex flex-col flex-1 overflow-hidden ${rtl ? 'items-end' : 'items-start'}`}>
                                                <span className="font-mono text-[11px] text-slate-600 truncate max-w-full">
                                                    {key.slice(0, 8)}{'•'.repeat(12)}{key.slice(-4)}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${idx === 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {idx === 0
                                                        ? (isAr ? '⚡ مفعّل الآن' : '⚡ Active')
                                                        : (isAr ? `احتياطي #${idx}` : `Backup #${idx}`)}
                                                </span>
                                            </div>

                                            {/* actions */}
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                <button
                                                    onClick={() => handleCopy(key)}
                                                    className="p-2 text-slate-300 hover:text-brand-indigo transition-colors rounded-lg hover:bg-indigo-50"
                                                    title={isAr ? 'نسخ' : 'Copy'}
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKey(key)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50"
                                                    title={isAr ? 'حذف' : 'Delete'}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* empty state */}
                                {currentKeys.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 flex flex-col items-center gap-3 text-slate-300"
                                    >
                                        <KeyRound size={36} strokeWidth={1} />
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                {isAr ? 'لا توجد مفاتيح بعد' : 'No keys yet'}
                                            </span>
                                            <span className="text-[9px] text-slate-300 text-center">
                                                {isAr
                                                    ? `أضف مفتاح ${activeProvider.nameAr} أعلاه للبدء`
                                                    : `Add a ${activeProvider.name} key above to get started`}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* key count badge */}
                                {currentKeys.length > 0 && (
                                    <div className={`flex items-center gap-1.5 px-3 mt-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        <span className="text-[9px] text-slate-400 font-medium">
                                            {currentKeys.length} {isAr ? 'مفتاح نشط' : currentKeys.length === 1 ? 'key active' : 'keys active'}
                                            {currentKeys.length > 1 && (isAr ? ' · التناوب التلقائي مفعّل' : ' · Auto-rotation enabled')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.section>
                </AnimatePresence>

            </main>
        </div>
    );
};

export default ModelSelectPage;
