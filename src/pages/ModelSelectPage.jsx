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

/* ── Inline toast ── */
const Toast = ({ msg, type, onDismiss }) => (
    <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${type === 'error'
            ? 'bg-red-50 border-red-100 text-red-600'
            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
    >
        <AlertCircle size={13} className={type === 'error' ? 'text-red-400' : 'text-emerald-400'} />
        <span className="flex-1">{msg}</span>
        <button onClick={onDismiss} className="opacity-40 hover:opacity-80 text-base leading-none ml-1">&times;</button>
    </motion.div>
);

/* ── Grouped model dropdown ── */
const GroupedModelSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const allModels = getAllModels();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = allModels.find(m => m.modelId === value);

    const badgeColors = {
        Recommended: 'bg-emerald-50 text-emerald-700',
        Fast: 'bg-sky-50 text-sky-700',
        Powerful: 'bg-violet-50 text-violet-700',
    };

    // Group models by provider
    const groups = Object.values(PROVIDERS).map(provider => ({
        provider,
        models: allModels.filter(m => m.provider.id === provider.id),
    }));

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center justify-between gap-2 h-9 px-3 bg-white border rounded-lg text-left transition-all outline-none
                    ${open ? 'border-slate-400 ring-2 ring-slate-100' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selected && (
                        <>
                            <span className="text-sm leading-none shrink-0">{selected.provider.icon}</span>
                            <span className="text-xs font-medium text-slate-800 truncate">{selected.model.name}</span>
                            {selected.model.badge && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColors[selected.model.badge] || ''}`}>
                                    {selected.model.badge}
                                </span>
                            )}
                        </>
                    )}
                </div>
                <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.99 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden py-1"
                        style={{ maxHeight: '320px', overflowY: 'auto' }}
                    >
                        {groups.map((group, gi) => (
                            <div key={group.provider.id}>
                                {/* Group header */}
                                <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                                    <span className="text-xs leading-none">{group.provider.icon}</span>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {group.provider.name}
                                    </span>
                                </div>

                                {/* Models in group */}
                                {group.models.map(item => (
                                    <button
                                        key={item.modelId}
                                        onClick={() => { onChange(item.modelId); setOpen(false); }}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50
                                            ${item.modelId === value ? 'bg-slate-50' : ''}`}
                                    >
                                        {/* indent */}
                                        <div className="w-3 shrink-0" />
                                        <span className="font-medium text-slate-800 flex-1 truncate">{item.model.name}</span>
                                        {item.model.badge && (
                                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${badgeColors[item.model.badge] || ''}`}>
                                                {item.model.badge}
                                            </span>
                                        )}
                                        {item.modelId === value && <Check size={12} className="text-slate-600 shrink-0" />}
                                    </button>
                                ))}

                                {/* divider between groups */}
                                {gi < groups.length - 1 && (
                                    <div className="mx-3 my-1 h-px bg-slate-100" />
                                )}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Main page ── */
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

    const handleModelChange = (newCompoundId) => {
        setCompoundModel(newCompoundId);
        setSelectedCompoundModel(newCompoundId);
        setNewKey('');
    };

    const handleAdd = async () => {
        if (!newKey.trim()) return;
        setValidating(true);
        const ok = await provider.addKey(newKey.trim());
        if (ok) {
            setKeys(prev => ({ ...prev, [providerId]: provider.getKeys() }));
            setNewKey('');
            showToast(isAr ? 'تمت الإضافة بنجاح ✓' : 'Key added ✓');
        } else {
            showToast(isAr ? 'المفتاح غير صالح' : 'Invalid key — please retry', 'error');
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
        <div className="min-h-screen bg-slate-50" dir={rtl ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 h-12 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 -ml-1 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                        <ChevronLeft size={18} className={rtl ? 'rotate-180' : ''} />
                    </button>
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-sm font-semibold text-slate-800">
                        {isAr ? 'محرك الذكاء الاصطناعي' : 'AI Engine'}
                    </span>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

                {/* Toast */}
                <AnimatePresence>
                    {toast && <Toast msg={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
                </AnimatePresence>

                {/* ── PART 1: Model selection ── */}
                <section className="bg-white border border-slate-200 rounded-xl overflow-visible">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-600">
                            {isAr ? 'النموذج' : 'Model'}
                        </span>
                    </div>
                    <div className="px-4 py-3">
                        <GroupedModelSelect value={compoundModel} onChange={handleModelChange} />
                    </div>
                </section>

                {/* ── PART 2: API Keys ── */}
                <AnimatePresence mode="wait">
                    <motion.section
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
                                <Key size={13} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-600">
                                    {provider.icon} {isAr ? `مفاتيح ${provider.nameAr}` : `${provider.name} Keys`}
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

                        {/* Add key row */}
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
                                <div className="flex flex-col items-center gap-1.5 py-7 text-slate-300">
                                    <Key size={18} strokeWidth={1.5} />
                                    <span className="text-xs text-slate-400">
                                        {isAr ? 'لا توجد مفاتيح' : 'No keys yet'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {currentKeys.length > 1 && (
                            <div className={`px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                <span className="text-[10px] text-slate-400">
                                    {isAr
                                        ? `${currentKeys.length} مفاتيح · تناوب تلقائي`
                                        : `${currentKeys.length} keys · auto-rotation enabled`
                                    }
                                </span>
                            </div>
                        )}
                    </motion.section>
                </AnimatePresence>

            </div>
        </div>
    );
};

export default ModelSelectPage;
