import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft, ChevronDown, Check, Plus, Trash2,
    Loader2, Copy, ExternalLink, Key, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PROVIDERS, getAllModels,
    getSelectedCompoundModel, setSelectedCompoundModel,
    parseModelId
} from '../providers/ProviderRegistry';
import { getCurrentLang, isRTL } from '../utils/lang';

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

/* ── Grouped model dropdown ── */
const GroupedModelSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const allModels = getAllModels();

    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const selected = allModels.find(m => m.modelId === value);
    const badgeColor = { Recommended: 'bg-emerald-50 text-emerald-700', Fast: 'bg-sky-50 text-sky-700', Powerful: 'bg-violet-50 text-violet-700' };
    const groups = Object.values(PROVIDERS).map(p => ({ provider: p, models: allModels.filter(m => m.provider.id === p.id) }));

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between gap-2 h-9 px-3 bg-white border rounded-lg text-left transition-all outline-none
                    ${open ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selected && <>
                        <span className="text-sm leading-none shrink-0">{selected.provider.icon}</span>
                        <span className="text-xs font-medium text-slate-800 truncate">{selected.model.name}</span>
                        {selected.model.badge && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColor[selected.model.badge] || ''}`}>
                                {selected.model.badge}
                            </span>
                        )}
                    </>}
                </div>
                <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto py-1"
                        style={{ maxHeight: '280px' }}
                    >
                        {groups.map((g, gi) => (
                            <div key={g.provider.id}>
                                <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                                    <span className="text-xs">{g.provider.icon}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{g.provider.name}</span>
                                </div>
                                {g.models.map(item => (
                                    <button
                                        key={item.modelId}
                                        onClick={() => { onChange(item.modelId); setOpen(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${item.modelId === value ? 'bg-slate-50' : ''}`}
                                    >
                                        <div className="w-3 shrink-0" />
                                        <span className="font-medium text-slate-800 flex-1 truncate">{item.model.name}</span>
                                        {item.model.badge && (
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColor[item.model.badge] || ''}`}>
                                                {item.model.badge}
                                            </span>
                                        )}
                                        {item.modelId === value && <Check size={12} className="text-slate-600 shrink-0" />}
                                    </button>
                                ))}
                                {gi < groups.length - 1 && <div className="mx-3 my-1 h-px bg-slate-100" />}
                            </div>
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

    const [compoundModel, setCompoundModel] = useState(getSelectedCompoundModel());
    const [keys, setKeys] = useState({});
    const [newKey, setNewKey] = useState('');
    const [validating, setValidating] = useState(false);
    const [toast, setToast] = useState(null);

    const { providerId } = parseModelId(compoundModel);
    const provider = PROVIDERS[providerId];

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

    const handleModelChange = (id) => {
        setCompoundModel(id);
        setSelectedCompoundModel(id);
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

            {/* ── Header ── */}
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

            {/* ── Body ── */}
            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">

                {/* Toast */}
                <AnimatePresence>
                    {toast && (
                        <div className="mb-4">
                            <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
                        </div>
                    )}
                </AnimatePresence>

                {/* ══════════════════════════════════════
                    TWO-COLUMN LAYOUT (desktop) / stacked (mobile)
                ══════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 items-start">

                    {/* ── LEFT: Model Selection ── */}
                    <div className="flex flex-col gap-4">
                        {/* Label */}
                        <div>
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {isAr ? '١. النموذج' : '1. Model'}
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {isAr ? 'اختر نموذج الذكاء المناسب' : 'Select the AI model to use'}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl overflow-visible">
                            <div className="px-4 py-3">
                                <GroupedModelSelect value={compoundModel} onChange={handleModelChange} />
                            </div>
                        </div>

                        {/* Active model info card */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {isAr ? 'النموذج الحالي' : 'Active Configuration'}
                                </span>
                            </div>
                            <div className="px-4 py-3 flex flex-col gap-2">
                                {/* Provider row */}
                                <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] text-slate-400">{isAr ? 'المزوّد' : 'Provider'}</span>
                                    <div className={`flex items-center gap-1.5 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-xs">{provider.icon}</span>
                                        <span className="text-xs font-medium text-slate-700">{provider.name}</span>
                                    </div>
                                </div>
                                {/* Model row */}
                                <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] text-slate-400">{isAr ? 'النموذج' : 'Model'}</span>
                                    <span className="text-[11px] font-mono text-slate-600 truncate max-w-[160px]">
                                        {parseModelId(compoundModel).modelId}
                                    </span>
                                </div>
                                {/* Status row */}
                                <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[10px] text-slate-400">{isAr ? 'الحالة' : 'Status'}</span>
                                    <div className={`flex items-center gap-1.5 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${currentKeys.length > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                        <span className={`text-[10px] font-medium ${currentKeys.length > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {currentKeys.length > 0
                                                ? (isAr ? 'جاهز' : 'Ready')
                                                : (isAr ? 'يحتاج مفتاح' : 'Needs key')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Provider cards (all) */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                    {isAr ? 'المزوّدون' : 'Providers'}
                                </span>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {Object.values(PROVIDERS).map(p => {
                                    const pKeys = keys[p.id] || [];
                                    const isActive = p.id === providerId;
                                    return (
                                        <div
                                            key={p.id}
                                            className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isActive ? 'bg-slate-50' : ''} ${rtl ? 'flex-row-reverse' : ''}`}
                                        >
                                            <span className="text-base shrink-0">{p.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium text-slate-700 truncate">{p.name}</p>
                                                <p className="text-[10px] text-slate-400">
                                                    {pKeys.length} {isAr ? 'مفاتيح' : 'keys'}
                                                </p>
                                            </div>
                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${pKeys.length > 0 ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: API Keys ── */}
                    <div className="flex flex-col gap-4">
                        {/* Label */}
                        <div>
                            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {isAr ? '٢. مفاتيح الـ API' : '2. API Keys'}
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {isAr
                                    ? `أضف مفاتيح ${provider.nameAr} لتفعيل النموذج`
                                    : `Add ${provider.name} keys to activate the selected model`}
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
                                {/* Section header */}
                                <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-sm">{provider.icon}</span>
                                        <span className="text-xs font-semibold text-slate-700">
                                            {provider.name}
                                        </span>
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

                                {/* Add key */}
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
                                        <div className="flex flex-col items-center gap-1.5 py-8 text-slate-300">
                                            <Key size={20} strokeWidth={1.5} />
                                            <span className="text-xs text-slate-400">
                                                {isAr ? 'لا توجد مفاتيح بعد' : 'No keys yet'}
                                            </span>
                                            <a
                                                href={provider.docsUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[11px] text-brand-indigo hover:underline"
                                            >
                                                {isAr ? `احصل على مفتاح ${provider.nameAr} ↗` : `Get a ${provider.name} key ↗`}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {currentKeys.length > 1 && (
                                    <div className={`px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                        <span className="text-[10px] text-slate-400">
                                            {isAr ? `${currentKeys.length} مفاتيح · تناوب تلقائي` : `${currentKeys.length} keys · auto-rotation enabled`}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Help note */}
                        <p className="text-[10px] text-slate-400 text-center px-2">
                            {isAr
                                ? 'مفاتيح الـ API مخزّنة محلياً في متصفحك فقط ولا تُرسَل لأي خادم.'
                                : 'API keys are stored locally in your browser and never sent to any server.'}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModelSelectPage;
