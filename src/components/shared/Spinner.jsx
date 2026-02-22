import React from 'react';
import { motion } from 'framer-motion';

const Spinner = ({ size = 40, color = 'text-brand-indigo', label }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={`relative`} style={{ width: size, height: size }}>
                {/* Outer Ring */}
                <motion.div
                    className={`absolute inset-0 border-4 border-slate-100 rounded-full`}
                />
                {/* Spinning Gradient */}
                <motion.div
                    className={`absolute inset-0 border-4 border-t-transparent border-l-transparent rounded-full ${color}`}
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear"
                    }}
                    style={{
                        borderColor: 'currentColor',
                        borderTopColor: 'transparent',
                        borderLeftColor: 'transparent',
                    }}
                />
                {/* Inner Pulse */}
                <motion.div
                    className={`absolute inset-2 bg-indigo-50/50 rounded-full`}
                    animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.3, 0.6, 0.3] }}
                    transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                    }}
                />
            </div>
            {label && (
                <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                >
                    {label}
                </motion.span>
            )}
        </div>
    );
};

export default Spinner;
