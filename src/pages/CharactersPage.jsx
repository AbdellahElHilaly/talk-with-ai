import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';
import { CHARACTERS } from '../prompts/characters';

const CharactersPage = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const rtl = isRTL();

    const [selectedCharacter, setSelectedCharacter] = useState(() => {
        return localStorage.getItem('selected_character') || 'teacher';
    });

    const handleSelect = (characterId) => {
        setSelectedCharacter(characterId);
        localStorage.setItem('selected_character', characterId);
        window.dispatchEvent(new CustomEvent('characterChanged', { detail: characterId }));

        // Update recent_characters array in localStorage
        const saved = localStorage.getItem('recent_characters');
        let prev = saved ? JSON.parse(saved) : ['teacher', 'police', 'father', 'mother', 'girlfriend'];
        const next = [characterId, ...prev.filter(id => id !== characterId)].slice(0, 5);
        localStorage.setItem('recent_characters', JSON.stringify(next));

        navigate('/chat');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col" dir={rtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/chat')}
                        className="p-2 -ml-2 text-slate-400 hover:text-brand-indigo transition-colors outline-none"
                    >
                        <ChevronLeft size={24} className={rtl ? 'rotate-180' : ''} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'ar' ? 'اختر شخصية' : 'Choose Persona'}</h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {lang === 'ar' ? 'تحدث مع الذكاء الاصطناعي المناسب' : 'Chat with the right AI'}
                        </span>
                    </div>
                </div>
                <div className="p-3 bg-indigo-50 text-brand-indigo rounded-2xl shadow-sm">
                    <UserCircle2 size={24} strokeWidth={2} />
                </div>
            </div>

            <main className="flex-1 p-6 max-w-4xl mx-auto w-full flex flex-col gap-6 overflow-y-auto pb-safe">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-10 sm:gap-y-10">
                    {Object.values(CHARACTERS).map((character, index) => (
                        <motion.button
                            key={character.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSelect(character.id)}
                            className={`w-[76px] sm:w-[90px] relative flex flex-col items-center gap-2 transition-all touch-manipulation outline-none group ${selectedCharacter === character.id ? 'scale-105 z-10' : 'hover:scale-105 hover:z-10'}`}
                        >
                            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-sm transition-all ${selectedCharacter === character.id
                                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 ring-4 ring-brand-indigo ring-offset-2 ring-offset-slate-50'
                                : 'bg-white ring-1 ring-slate-200 group-hover:ring-brand-indigo/40 group-hover:shadow-md'
                                }`}>
                                <span className="drop-shadow-sm">{character.icon}</span>
                                {selectedCharacter === character.id && (
                                    <div className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm z-10">
                                        <span className="text-[10px] sm:text-[12px] text-white font-black leading-none">✓</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center w-full px-1">
                                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-center leading-tight line-clamp-2 w-full ${selectedCharacter === character.id ? 'text-brand-indigo' : 'text-slate-500'
                                    }`}>
                                    {lang === 'ar' ? character.nameAr : character.name}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CharactersPage;
