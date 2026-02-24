import React from 'react';
import { motion } from 'framer-motion';

const Word = ({ en, ar, onSelect, isActive }) => {
    const isTradable = !!ar;
    return (
        <motion.span
            onClick={() => onSelect(en, ar)}
            whileTap={{ scale: 0.95 }}
            className={`inline-block transition-colors duration-300 cursor-pointer px-1 py-0.5 rounded-md min-h-[44px] flex items-center touch-manipulation select-none ${
                isTradable ? 'font-bold' : 'font-medium'
            } ${
                isActive
                    ? 'text-brand-indigo bg-indigo-50'
                    : isTradable
                        ? 'text-slate-900 hover:text-brand-indigo hover:bg-slate-50 active:bg-slate-100'
                        : 'text-slate-500 hover:text-slate-700'
            }`}
            role="button"
            tabIndex={0}
            aria-label={`Translate word: ${en}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(en, ar);
                }
            }}
        >
            {en}
        </motion.span>
    );
};

export default Word;
