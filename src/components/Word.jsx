import React from 'react';
import { motion } from 'framer-motion';

const Word = ({ en, ar, onSelect, isActive }) => {
    const isTradable = !!ar;
    return (
        <motion.span
            onClick={() => onSelect(en, ar)}
            whileTap={{ scale: 0.95 }}
            className={`inline-block transition-colors duration-300 cursor-pointer ${isTradable ? 'font-bold' : 'font-medium'
                } ${isActive
                    ? 'text-brand-indigo'
                    : isTradable
                        ? 'text-slate-900 hover:text-brand-indigo'
                        : 'text-slate-500 hover:text-slate-700'
                }`}
        >
            {en}
        </motion.span>
    );
};

export default Word;
