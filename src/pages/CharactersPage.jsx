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

        // Clear old conversation when switching characters
        sessionStorage.removeItem('chat_session_messages');
        sessionStorage.removeItem('chat_translations_map');

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

            <main className="flex-1 p-6 max-w-6xl mx-auto w-full overflow-y-auto pb-safe">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.values(CHARACTERS).map((character, index) => (
                        <motion.button
                            key={character.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(character.id)}
                            className={`relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border-2 transition-all text-left group ${selectedCharacter === character.id
                                ? 'border-brand-indigo ring-4 ring-indigo-50 shadow-md'
                                : 'border-slate-100 hover:border-brand-indigo/30 hover:shadow-md'
                                }`}
                        >
                            {/* Card Image Wrapper */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <img
                                    src={character.image}
                                    alt={character.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                                {/* Floating Badge for Selection */}
                                {selectedCharacter === character.id && (
                                    <div className="absolute top-4 right-4 bg-brand-indigo text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 z-10">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                        {lang === 'ar' ? 'مختار' : 'Selected'}
                                    </div>
                                )}


                                {/* Mini Profile Preview Indicator */}
                                <div className={`absolute bottom-4 ${rtl ? 'left-4' : 'right-4'} z-20`}>
                                    <div className={`w-14 h-14 rounded-full border-2 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 ${character.miniImage ? 'border-emerald-400 bg-white scale-110' : 'border-rose-400 bg-rose-50 border-dashed opacity-80'}`}>
                                        {character.miniImage ? (
                                            <img src={character.miniImage} alt="mini" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <span className="text-xl opacity-50">{character.icon}</span>
                                                <span className="text-[6px] font-black text-rose-500 uppercase leading-none mt-0.5">Missing Mini</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Character Info Over Image */}
                                <div className={`absolute bottom-4 ${rtl ? 'right-4' : 'left-4'} pr-20 ltr:pr-20 rtl:pl-20 max-w-[70%]`}>
                                    <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">
                                        {lang === 'ar' ? character.nameAr : character.name}
                                    </h2>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {character.traits.slice(0, 3).map((trait, i) => (
                                            <span key={i} className="bg-white/20 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/20">
                                                {trait}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card Content - Personality Snippet */}
                            <div className="p-5 flex flex-col gap-3">
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    {character.personality}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex gap-2 py-1">
                                        {character.favoriteEmojis ? (
                                            character.favoriteEmojis.map((emoji, i) => (
                                                <span key={i} className="text-lg cursor-default" title="Likes">
                                                    {emoji}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-lg">{character.icon}</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-black text-brand-indigo uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                        {lang === 'ar' ? 'ابدأ الدردشة ←' : 'Start Chat →'}
                                    </span>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default CharactersPage;
