import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Key, Home, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../../utils/translations';
import { getCurrentLang, isRTL } from '../../utils/lang';

const MissingKeyModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className={`pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden ring-1 ring-slate-900/5 ${rtl ? 'rtl' : 'ltr'}`}
                            dir={rtl ? 'rtl' : 'ltr'}
                        >
                            <div className="p-6 flex flex-col items-center text-center relative">
                                <button
                                    onClick={onClose}
                                    className={`absolute top-4 ${rtl ? 'left-4' : 'right-4'} p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors`}
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>

                                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
                                    <AlertTriangle size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">
                                    {lang === 'ar' ? 'مفتاح API مفقود' : 'API Key Missing'}
                                </h3>
                                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                    {lang === 'ar'
                                        ? 'وضع التطوير يعمل بنجاح! للتحدث والترجمة الفعلية باستخدام الذكاء الاصطناعي، يرجى إضافة مفتاح Chat API (Groq) الخاص بك.'
                                        : 'Development mode is running! To talk and translate with actual AI, please add your Chat API (Groq) Key.'}
                                </p>

                                <div className="flex flex-col w-full gap-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/settings/groq-keys');
                                        }}
                                        className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-2xl font-bold text-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <Key size={16} strokeWidth={2.5} />
                                        {lang === 'ar' ? 'إضافة المفتاح الآن' : 'Add Key Now'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/');
                                        }}
                                        className="w-full flex justify-center items-center gap-2 px-6 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition-all"
                                    >
                                        <Home size={16} strokeWidth={2.5} />
                                        {lang === 'ar' ? 'العودة للرئيسية' : 'Go Home'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MissingKeyModal;
