import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Alert = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    const colors = {
        success: {
            bg: 'bg-white',
            border: 'border-emerald-100',
            text: 'text-slate-900',
            icon: 'text-emerald-500',
            shadow: 'shadow-emerald-100/50',
            accent: 'bg-emerald-500'
        },
        error: {
            bg: 'bg-white',
            border: 'border-rose-100',
            text: 'text-slate-900',
            icon: 'text-rose-500',
            shadow: 'shadow-rose-100/50',
            accent: 'bg-rose-500'
        }
    };

    const style = colors[type] || colors.success;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="fixed bottom-10 left-6 right-6 z-50 flex justify-center pointer-events-none"
                >
                    <div className={`pointer-events-auto flex items-center gap-4 px-5 py-4 ${style.bg} border ${style.border} rounded-3xl shadow-2xl ${style.shadow} max-w-sm w-full relative overflow-hidden`}>
                        {/* Progress Bar */}
                        {duration && (
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: duration / 1000, ease: 'linear' }}
                                className={`absolute bottom-0 left-0 h-1 ${style.accent} opacity-20`}
                            />
                        )}

                        <div className={`${style.icon} shrink-0`}>
                            {type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        </div>

                        <div className="flex-1">
                            <p className={`text-sm font-bold ${style.text} leading-tight`}>
                                {message}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Alert;
