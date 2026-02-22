import React from 'react';
import { motion } from 'framer-motion';

const Word = ({ en, ar, onSelect, isActive }) => {
    const isTradable = !!ar;
    return (
        <motion.span
            onClick={() => onSelect(en, ar)}
            whileTap={{ scale: 0.95 }}
            className={`inline-block transition-all duration-300 cursor-pointer ${isActive
                ? 'text-brand-indigo underline underline-offset-8 decoration-2 font-black'
                : isTradable
                    ? 'text-slate-900 font-bold hover:text-brand-indigo'
                    : 'text-slate-500 font-medium hover:text-slate-700'
                }`}
        >
            {en}
        </motion.span>
    );
};

export default Word;
