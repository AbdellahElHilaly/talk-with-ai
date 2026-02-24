import React from 'react';
import { motion } from 'framer-motion';

const Word = ({ en, ar, onSelect, isActive }) => {
    const isTradable = !!ar;
    return (
        <motion.span
            onClick={() => onSelect(en, ar)}
            whileTap={{ scale: 0.98 }}
            className={`inline transition-colors duration-200 cursor-pointer touch-manipulation select-none ${isTradable ? 'font-bold' : 'font-medium'
                } ${isActive
                    ? 'text-brand-indigo'
                    : isTradable
                        ? 'text-slate-950 hover:text-brand-indigo outline-none'
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
