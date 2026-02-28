import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Check, Plus, Trash2, Loader2, Copy, ExternalLink, Key, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVIDERS } from '../providers/ProviderRegistry';
import { getCurrentLang, isRTL } from '../utils/lang';

const STORAGE_KEY = 'selected_provider_id';

const getStoredProvider = () => localStorage.getItem(STORAGE_KEY) || 'groq';
const saveStoredProvider = (id) => localStorage.setItem(STORAGE_KEY, id);

/* ── Toast ── */
const Toast = ({ msg, type, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border
            ${type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}
    >
        <AlertCircle size={13} className={type === 'error' ? 'text-red-400' : 'text-emerald-400'} />
        <span className="flex-1">{msg}</span>
        <button onClick={onDismiss} className="opacity-40 hover:opacity-80 leading-none ml-1 text-base">&times;</button>
    </motion.div>
);

/* ── Simple 3-item provider dropdown ── */
const ProviderSelect = ({ value, options, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const selected = options.find(o => o.id === value);

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between gap-2 h-9 px-3 bg-white border rounded-lg text-left transition-all outline-none
                    ${open ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'}`}
            >
                {selected && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-sm leading-none shrink-0">{selected.icon}</span>
                        <span className="text-xs font-medium text-slate-800">{selected.name}</span>
                        <span className="text-[10px] text-slate-400 truncate hidden sm:block">· {selected.defaultModelName}</span>
                    </div>
                )}
                <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden py-1"
                    >
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => { onChange(opt.id); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors hover:bg-slate-50
                                    ${opt.id === value ? 'bg-slate-50' : ''}`}
                            >
                                <span className="text-base leading-none shrink-0">{opt.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-800">{opt.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate">{opt.defaultModelName}</p>
                                </div>
                                {opt.id === value && <Check size={12} className="text-slate-500 shrink-0" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Main ── */
const ModelSelectPage = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const rtl = isRTL();
    const isAr = lang === 'ar';

    const [providerId, setProviderId] = useState(getStoredProvider());
    const [keys, setKeys] = useState({});
    const [newKey, setNewKey] = useState('');
    const [validating, setValidating] = useState(false);
    const [toast, setToast] = useState(null);

    const provider = PROVIDERS[providerId];

    const providerOptions = Object.values(PROVIDERS).map(p => ({
        id: p.id,
        name: p.name,
        icon: p.icon,
        defaultModelName: p.models.find(m => m.id === p.defaultModel)?.name || p.defaultModel,
    }));

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const k = {};
        Object.values(PROVIDERS).forEach(p => { k[p.id] = p.getKeys(); });
        setKeys(k);
    }, []);

    const currentKeys = keys[providerId] || [];

    const handleProviderChange = (id) => {
        setProviderId(id);
        saveStoredProvider(id);
        // Also update the compound model in ProviderRegistry
        const newProvider = PROVIDERS[id];
        localStorage.setItem('selected_ai_model_v2', `${id}::${newProvider.defaultModel}`);
        setNewKey('');
    };

    const handleAdd = async () => {
        if (!newKey.trim()) return;
        setValidating(true);
        const ok = await provider.addKey(newKey.trim());
        if (ok) {
            setKeys(prev => ({ ...prev, [providerId]: provider.getKeys() }));
            setNewKey('');
            showToast(isAr ? 'تمت الإضافة ✓' : 'Key added ✓');
        } else {
            showToast(isAr ? 'المفتاح غير صالح' : 'Invalid key', 'error');
        }
        setValidating(false);
    };

    const handleDelete = (key) => {
        provider.removeKey(key);
        setKeys(prev => ({ ...prev, [providerId]: provider.getKeys() }));
    };

    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        showToast(isAr ? 'تم النسخ' : 'Copied');
    };

    const mask = (k) => `${k.slice(0, 7)}${'•'.repeat(14)}${k.slice(-4)}`;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-400 hover:text-slate-700 transition-colors">
                        <ChevronLeft size={18} className={rtl ? 'rotate-180' : ''} />
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-sm font-semibold text-slate-800">
                        {isAr ? 'محرك الذكاء الاصطناعي' : 'AI Engine'}
                    </span>
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <div className="mb-4">
                            <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
                        </div>
                    )}
                </AnimatePresence>

                {/* ── Two-column layout ── */}
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 items-start">

                    {/* ═══════ LEFT: Provider selection ═══════ */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {isAr ? '١. المزوّد' : '1. Provider'}
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {isAr ? 'اختر مزوّد الذكاء الاصطناعي' : 'Select your AI provider'}
                            </p>
                        </div>

                        {/* Dropdown */}
                        <div className="bg-white border border-slate-200 rounded-xl p-3 overflow-visible">
                            <ProviderSelect value={providerId} options={providerOptions} onChange={handleProviderChange} />
                        </div>

                        {/* Active config card */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {isAr ? 'الإعداد الحالي' : 'Active Configuration'}
                                </span>
                            </div>
                            <div className="px-4 py-3 flex flex-col gap-2.5">
                                {[
                                    {
                                        label: isAr ? 'المزوّد' : 'Provider',
                                        value: <div className="flex items-center gap-1.5"><span>{provider.icon}</span><span className="text-xs font-medium text-slate-700">{provider.name}</span></div>
                                    },
                                    {
                                        label: isAr ? 'النموذج' : 'Model',
                                        value: <span className="text-[11px] font-mono text-slate-600">{provider.defaultModel}</span>
                                    },
                                    {
                                        label: isAr ? 'المفاتيح' : 'Keys',
                                        value: <span className={`text-[11px] font-medium ${currentKeys.length > 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {currentKeys.length > 0
                                                ? `${currentKeys.length} ${isAr ? 'مفتاح · نشط' : 'key(s) · ready'}`
                                                : (isAr ? 'لا توجد مفاتيح' : 'no keys')}
                                        </span>
                                    }
                                ].map(row => (
                                    <div key={row.label} className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] text-slate-400">{row.label}</span>
                                        {row.value}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* All providers status */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {isAr ? 'حالة المزوّدين' : 'Providers Status'}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {Object.values(PROVIDERS).map(p => {
                                    const pKeys = keys[p.id] || [];
                                    const isActive = p.id === providerId;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => handleProviderChange(p.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left hover:bg-slate-50 ${isActive ? 'bg-slate-50' : ''} ${rtl ? 'flex-row-reverse' : ''}`}
                                        >
                                            <span className="text-base shrink-0">{p.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${isActive ? 'text-slate-800' : 'text-slate-600'}`}>{p.name}</p>
                                                <p className="text-[10px] text-slate-400">{pKeys.length} {isAr ? 'مفاتيح' : 'keys'}</p>
                                            </div>
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${pKeys.length > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ═══════ RIGHT: API Keys ═══════ */}
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {isAr ? '٢. مفاتيح الـ API' : '2. API Keys'}
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {isAr
                                    ? `مفاتيح ${provider.nameAr || provider.name}`
                                    : `${provider.name} API keys`}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={providerId}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                            >
                                {/* Header */}
                                <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-sm">{provider.icon}</span>
                                        <span className="text-xs font-semibold text-slate-700">{provider.name}</span>
                                        {currentKeys.length > 0 && (
                                            <span className="text-[9px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                {currentKeys.length}
                                            </span>
                                        )}
                                    </div>
                                    <a
                                        href={provider.docsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors ${rtl ? 'flex-row-reverse' : ''}`}
                                    >
                                        {isAr ? 'احصل على مفتاح' : 'Get key'}
                                        <ExternalLink size={10} />
                                    </a>
                                </div>

                                {/* Add input */}
                                <div className={`flex items-center gap-2 px-4 py-3 border-b border-slate-100 ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <input
                                        type="password"
                                        value={newKey}
                                        onChange={e => setNewKey(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                        placeholder={`${provider.keyPrefix}...`}
                                        className={`flex-1 h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none focus:border-slate-400 focus:bg-white transition-all ${rtl ? 'text-right' : 'text-left'}`}
                                    />
                                    <button
                                        onClick={handleAdd}
                                        disabled={validating || !newKey.trim()}
                                        className="h-9 px-3 bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                    >
                                        {validating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                                        {isAr ? 'إضافة' : 'Add'}
                                    </button>
                                </div>

                                {/* Keys list */}
                                <div>
                                    <AnimatePresence mode="popLayout">
                                        {currentKeys.map((key, idx) => (
                                            <motion.div
                                                key={key}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={`flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group ${rtl ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${idx === 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                                <span className="flex-1 font-mono text-[11px] text-slate-500 truncate">{mask(key)}</span>
                                                <span className={`text-[9px] font-semibold shrink-0 ${idx === 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {idx === 0 ? (isAr ? 'نشط' : 'active') : `#${idx + 1}`}
                                                </span>
                                                <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <button onClick={() => handleCopy(key)} className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
                                                        <Copy size={12} />
                                                    </button>
                                                    <button onClick={() => handleDelete(key)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {currentKeys.length === 0 && (
                                        <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
                                            <Key size={20} strokeWidth={1.5} />
                                            <span className="text-xs text-slate-400">{isAr ? 'لا توجد مفاتيح بعد' : 'No keys yet'}</span>
                                            <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer"
                                                className="text-[11px] text-indigo-400 hover:underline">
                                                {isAr ? `احصل على مفتاح ↗` : `Get a ${provider.name} key ↗`}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {currentKeys.length > 1 && (
                                    <div className={`px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span className="text-[10px] text-slate-400">
                                            {isAr ? `${currentKeys.length} مفاتيح · تناوب تلقائي` : `${currentKeys.length} keys · auto-rotation`}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <p className="text-[10px] text-slate-400 text-center">
                            {isAr
                                ? 'مفاتيح الـ API مخزّنة محلياً في متصفحك فقط.'
                                : 'Keys are stored locally in your browser only.'}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModelSelectPage;
