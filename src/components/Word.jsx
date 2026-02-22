import React from 'react';
import { motion } from 'framer-motion';

const Word = ({ en, ar, onSelect, isActive }) => {
    const isTradable = !!ar;
    return (
        <motion.span
            onClick={() => isTradable && onSelect(en, ar)}
            whileTap={isTradable ? { scale: 0.98 } : {}}
            className={`inline-block transition-colors duration-300 ${isTradable ? 'cursor-pointer' : 'cursor-default opacity-80'
                } ${isActive
                    ? 'text-brand-indigo underline underline-offset-8 decoration-2 font-bold'
                    : isTradable ? 'text-slate-900 hover:text-brand-indigo' : 'text-slate-400'
                }`}
        >
            {en}
        </motion.span>
    );
};

export default Word;
