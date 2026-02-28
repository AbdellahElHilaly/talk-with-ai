import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Mic2, Speaker, ExternalLink, HelpCircle, Loader2, AlertCircle, Bookmark, GraduationCap, Trash2, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getGroqKeys, getElevenKeys } from '../utils/keyStorage';
import { getActiveProvider, getSelectedModel } from '../providers/ProviderRegistry';
import { translations } from '../utils/translations';
import { getCurrentLang, setAppLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import { VocabService } from '../utils/vocabulary';
import { CHARACTERS } from '../prompts/characters';
import { resolveAssetPath } from '../utils/assets';
import Alert from './shared/Alert';

const Sidebar = ({ isOpen, onClose, isMuted, setIsMuted, onClearChat }) => {
    const [lang, setLang] = useState(getCurrentLang());
    const [speed, setSpeed] = useState(parseFloat(localStorage.getItem('voice_speed')) || 1);
    const [learnedCount, setLearnedCount] = useState(VocabService.getLearnedWords().length);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });
    const [activeProvider, setActiveProvider] = useState(getActiveProvider());
    const [activeModel, setActiveModel] = useState(getSelectedModel());

    React.useEffect(() => {
        const handleUpdate = () => setLearnedCount(VocabService.getLearnedWords().length);
        window.addEventListener('vocabularyUpdated', handleUpdate);
        return () => window.removeEventListener('vocabularyUpdated', handleUpdate);
    }, []);

    const [selectedVoice, setSelectedVoice] = useState(() => {
        const saved = localStorage.getItem('selected_voice');
        if (saved === '21m00Tcm4TlvDq8ikWAM') return 'Female 1';
        if (saved === 'pNInz6obpgDQGcFmaJgB') return 'Male 1';
        return saved || 'Female 1';
    });
    const [selectedCharacter, setSelectedCharacter] = useState(() => {
        return localStorage.getItem('selected_character') || 'teacher';
    });
    const [recentCharacters, setRecentCharacters] = useState(() => {
        const saved = localStorage.getItem('recent_characters');
        if (saved) return JSON.parse(saved);
        return ['teacher', 'police', 'father', 'mother', 'girlfriend'];
    });
    const [isCleaningCache, setIsCleaningCache] = useState(false);
    const [cacheStats, setCacheStats] = useState(() => voiceEngine.getCacheStats());

    const t = translations[lang];
    const rtl = isRTL();

    const voices = [
        { id: 'Female 1', icon: User, label: 'Bloom (F)', color: 'text-rose-500' },
        { id: 'Male 1', icon: User, label: 'Atlas (M)', color: 'text-indigo-500' },
    ];

    const toggleLang = (newLang) => {
        setAppLang(newLang);
        setLang(newLang);
        window.location.reload();
    };

    const handleVoiceSelect = (vId) => {
        setSelectedVoice(vId);
        localStorage.setItem('selected_voice', vId);
        voiceEngine.speakPreview(vId, lang);
    };

    const handleSpeedChange = (e) => {
        const val = e.target.value;
        setSpeed(val);
        localStorage.setItem('voice_speed', val);
    };

    const navigate = useNavigate();

    const handleCharacterSelect = (characterId) => {
        setSelectedCharacter(characterId);
        localStorage.setItem('selected_character', characterId);

        // Clear old conversation when switching characters
        sessionStorage.removeItem('chat_session_messages');
        sessionStorage.removeItem('chat_translations_map');

        window.dispatchEvent(new CustomEvent('characterChanged', { detail: characterId }));

        setRecentCharacters(prev => {
            const next = [characterId, ...prev.filter(id => id !== characterId)].slice(0, 5);
            localStorage.setItem('recent_characters', JSON.stringify(next));
            return next;
        });
    };
    const handleClearCache = () => {
        setIsCleaningCache(true);
        voiceEngine.clearAudioCache();
        setCacheStats(voiceEngine.getCacheStats());
        setTimeout(() => setIsCleaningCache(false), 1000);
    };

    const handleShareAll = async () => {
        const groqKeys = getGroqKeys();
        const elevenKeys = getElevenKeys();

        if (groqKeys.length === 0 && elevenKeys.length === 0) return;

        const baseUrl = window.location.origin + import.meta.env.BASE_URL + "import-keys";
        let url = baseUrl + "?";
        if (groqKeys.length > 0) url += `groq=${groqKeys.join(',')}`;
        if (elevenKeys.length > 0) {
            if (groqKeys.length > 0) url += "&";
            url += `eleven=${elevenKeys.join(',')}`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Smart-Lern API Account',
                    text: 'Import my AI & Voice API keys to your Smart-Lern app!',
                    url: url
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            navigator.clipboard.writeText(url);
            setAlertConfig({
                show: true,
                message: t.shareSuccess,
                type: 'success'
            });
        }
    };

    React.useEffect(() => {
        // Update cache stats periodically
        const interval = setInterval(() => {
            setCacheStats(voiceEngine.getCacheStats());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Settings autosave, removed manual handleSave

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                    />
                    {/* Desktop Centering Wrapper overlay */}
                    <div className="fixed inset-0 z-50 pointer-events-none md:flex md:items-center md:justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`pointer-events-auto fixed md:relative ${rtl ? 'right-0 md:right-auto' : 'left-0 md:left-auto'} top-0 md:top-auto h-full md:h-auto md:max-h-[min(90vh,800px)] w-full max-w-[340px] sm:max-w-[380px] md:max-w-4xl bg-white p-5 sm:p-6 md:p-8 flex flex-col shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ${rtl ? 'rounded-l-[2.5rem] md:rounded-[2.5rem]' : 'rounded-r-[2.5rem] md:rounded-[2.5rem]'} overflow-hidden ring-1 ring-slate-900/5`}
                            dir={rtl ? 'rtl' : 'ltr'}
                        >
                            <Alert
                                show={alertConfig.show}
                                message={alertConfig.message}
                                type={alertConfig.type}
                                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                            />

                            {/* Modal Header */}
                            <div className={`flex justify-between items-center mb-6 shrink-0 px-2 md:px-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                    <h2
                                        onClick={() => {
                                            onClose();
                                            navigate('/');
                                        }}
                                        className={`logo-font text-4xl md:text-5xl text-brand-indigo cursor-pointer hover:opacity-80 transition-opacity ${rtl ? 'rotate-2' : '-rotate-2'}`}
                                    >
                                        Smart-Lern
                                    </h2>
                                    <span className={`text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 ${rtl ? 'mr-1' : 'ml-1'}`}>{t.settingsPanel}</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 bg-slate-50 text-slate-400 hover:text-brand-indigo hover:bg-indigo-50 rounded-full transition-all active:scale-95 outline-none cursor-pointer border border-slate-100 shadow-sm hover:shadow"
                                >
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Scrollable Content wrapper */}
                            <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 pb-6 md:pb-0">
                                <div className="flex flex-col md:grid md:grid-cols-2 md:gap-8 md:p-2 min-h-full">

                                    {/* ---------------- LEFT COLUMN ---------------- */}
                                    <div className="flex flex-col gap-5">
                                        {/* General & Preferences */}
                                        <div className="bg-slate-50/70 border border-slate-100/80 rounded-[2rem] p-5 flex flex-col gap-6 shadow-sm">
                                            <div className="flex flex-col gap-3 text-left">
                                                <label className={`text-[9px] font-black text-slate-400 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.language}</label>
                                                <div className="flex gap-2">
                                                    <button onClick={() => toggleLang('en')} className={`flex-1 py-2.5 px-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 ${lang === 'en' ? 'border-brand-indigo bg-indigo-50/50 text-brand-indigo shadow-sm' : 'border-white bg-white text-slate-400 hover:border-slate-200 shadow-sm'}`}>
                                                        <span className="text-sm">🇺🇸</span>
                                                        <span className="text-[9px] tracking-wider">EN</span>
                                                    </button>
                                                    <button onClick={() => toggleLang('ar')} className={`flex-1 py-2.5 px-3 rounded-2xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 ${lang === 'ar' ? 'border-brand-indigo bg-indigo-50/50 text-brand-indigo shadow-sm' : 'border-white bg-white text-slate-400 hover:border-slate-200 shadow-sm'}`}>
                                                        <span className="text-sm">🇸🇦</span>
                                                        <span className="text-[9px] tracking-wider">AR</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 text-left">
                                                <label className={`text-[9px] font-black text-slate-400 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'شخصية الذكي' : 'AI PERSONALITY'}</label>
                                                <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 pb-2 pt-2">
                                                    <div className="flex gap-3 min-w-max">
                                                        <button
                                                            onClick={() => {
                                                                onClose();
                                                                setTimeout(() => navigate('/characters'), 150);
                                                            }}
                                                            className="flex flex-col items-center gap-1.5 min-w-[64px] transition-all touch-manipulation hover:-translate-y-1"
                                                        >
                                                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-50 text-brand-indigo border-2 border-indigo-100 border-dashed hover:border-brand-indigo hover:bg-brand-indigo hover:shadow-lg hover:shadow-indigo-200 hover:text-white transition-all">
                                                                <User size={18} strokeWidth={2.5} />
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-tight text-brand-indigo">
                                                                {lang === 'ar' ? 'الكل' : 'ALL'}
                                                            </span>
                                                        </button>

                                                        {recentCharacters.map((charId) => {
                                                            const character = CHARACTERS[charId];
                                                            if (!character) return null;
                                                            return (
                                                                <button
                                                                    key={character.id}
                                                                    onClick={() => handleCharacterSelect(character.id)}
                                                                    className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all touch-manipulation ${selectedCharacter === character.id ? 'transform -translate-y-1 scale-105' : 'hover:-translate-y-1'}`}
                                                                >
                                                                    <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedCharacter === character.id ? 'bg-gradient-to-br from-brand-indigo to-purple-500 shadow-lg shadow-indigo-200 ring-2 ring-white' : 'bg-white shadow-sm border border-slate-100 hover:border-slate-300'}`}>
                                                                        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                                                                            {character.miniImage ? (
                                                                                <img
                                                                                    src={resolveAssetPath(character.miniImage)}
                                                                                    alt={character.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-xl drop-shadow-sm">{character.icon}</span>
                                                                            )}
                                                                        </div>
                                                                        {selectedCharacter === character.id && (
                                                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center z-10">
                                                                                <span className="text-[8px] text-white font-bold">✓</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className={`text-[8px] font-black uppercase tracking-tight line-clamp-1 max-w-[55px] ${selectedCharacter === character.id ? 'text-brand-indigo' : 'text-slate-500'}`}>
                                                                        {lang === 'ar' ? character.nameAr : character.name}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Voice engine */}
                                        <div className="bg-slate-50/70 border border-slate-100/80 rounded-[2rem] p-5 flex flex-col gap-6 shadow-sm">
                                            <div className="flex flex-col gap-3 text-left">
                                                <label className={`text-[9px] font-black text-slate-400 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.voiceEngine}</label>
                                                <div className="flex flex-col gap-2">
                                                    {voices.map((v) => (
                                                        <button key={v.id} onClick={() => handleVoiceSelect(v.id)} className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${selectedVoice === v.id ? 'bg-white border-brand-indigo shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:shadow-sm'} ${rtl ? 'flex-row-reverse' : ''}`}>
                                                            <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                                <div className={`p-1.5 rounded-lg transition-colors ${selectedVoice === v.id ? 'bg-indigo-50 text-brand-indigo' : 'bg-slate-50 text-slate-400'}`}>
                                                                    <v.icon size={14} />
                                                                </div>
                                                                <span className={`text-[10px] font-black uppercase tracking-tight transition-colors ${selectedVoice === v.id ? 'text-brand-indigo' : 'text-slate-600'}`}>{v.label}</span>
                                                            </div>
                                                            {selectedVoice === v.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo shadow-[0_0_8px_rgba(79,70,229,0.8)]" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 text-left">
                                                <div className={`flex justify-between items-center ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.speechVelocity}</label>
                                                    <span className="text-sm font-black text-brand-indigo font-mono italic">{speed}x</span>
                                                </div>
                                                <div className="relative px-1 pt-1 opacity-80 hover:opacity-100 transition-opacity">
                                                    <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={handleSpeedChange} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-indigo outline-none" />
                                                    <div className={`flex justify-between mt-1.5 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                        <span className="text-[8px] font-bold text-slate-300 uppercase">{t.slow}</span>
                                                        <span className="text-[8px] font-bold text-slate-300 uppercase">{t.fast}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* ---------------- RIGHT COLUMN ---------------- */}
                                    <div className="flex flex-col gap-5 mt-5 md:mt-0">
                                        {/* Data & Integrations */}
                                        <div className="bg-slate-50/70 border border-slate-100/80 rounded-[2rem] p-5 flex flex-col gap-4 shadow-sm">
                                            <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <Link
                                                    to="/settings/ai-engine"
                                                    onClick={onClose}
                                                    className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}
                                                    onMouseEnter={() => { setActiveProvider(getActiveProvider()); setActiveModel(getSelectedModel()); }}
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-xl border border-slate-100 flex items-center justify-center shadow-sm text-lg"
                                                        style={{ backgroundColor: activeProvider.color + '15' }}
                                                    >
                                                        {activeProvider.icon}
                                                    </div>
                                                    <div className={`flex flex-col text-left ${rtl ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-brand-indigo transition-colors">
                                                            {lang === 'ar' ? 'محرك الذكاء' : 'AI Engine'}
                                                        </span>
                                                        <span className="text-[8px] text-slate-400 font-medium truncate max-w-[120px]">
                                                            {activeProvider.name} · {activeModel.split('-').slice(0, 2).join('-')}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <Link to="/settings/ai-engine" onClick={onClose} className="p-2 text-slate-300 hover:text-brand-indigo transition-colors bg-white rounded-full shadow-sm border border-slate-100">
                                                    <HelpCircle size={14} strokeWidth={2.5} />
                                                </Link>
                                            </div>

                                            <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <Link to="/settings/eleven-keys" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <div className="w-8 h-8 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                                                        <CheckCircle2 size={14} className={getElevenKeys().length > 0 ? 'text-emerald-500' : 'text-slate-300'} strokeWidth={3} />
                                                    </div>
                                                    <div className={`flex flex-col text-left ${rtl ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-brand-indigo transition-colors">{lang === 'ar' ? 'صوت ذكي' : 'Voice API'}</span>
                                                        <span className="text-[8px] text-slate-400 font-medium">{getElevenKeys().length} {lang === 'ar' ? 'مفاتيح' : 'keys'}</span>
                                                    </div>
                                                </Link>
                                                <Link to="/guide/eleven" className="p-2 text-slate-300 hover:text-brand-indigo transition-colors bg-white rounded-full shadow-sm border border-slate-100"><HelpCircle size={14} strokeWidth={2.5} /></Link>
                                            </div>

                                            {(getGroqKeys().length > 0 || getElevenKeys().length > 0) && (
                                                <button onClick={handleShareAll} className="w-full mt-1 py-3 bg-indigo-50 border border-indigo-100 text-brand-indigo rounded-2xl hover:bg-brand-indigo hover:shadow-lg hover:shadow-indigo-200 hover:text-white transition-all group flex items-center justify-center gap-2">
                                                    <Share2 size={12} strokeWidth={3} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'ar' ? 'مشاركة المفاتيح' : 'Share APIs'}</span>
                                                </button>
                                            )}

                                            <div className="h-px bg-slate-200/60 w-full my-2 rounded-full" />

                                            <Link to="/settings/vocabulary" className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <div className="w-8 h-8 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm text-amber-500">
                                                        <Bookmark size={14} strokeWidth={3} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{lang === 'ar' ? 'كلماتي المميزة' : 'My Words'}</span>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-500 font-mono bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">{learnedCount}</span>
                                            </Link>

                                            <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 bg-white rounded-xl border flex items-center justify-center shadow-sm ${cacheStats.size > 0 ? 'border-rose-100 text-rose-500' : 'border-slate-100 text-slate-300'}`}>
                                                        <Trash2 size={14} strokeWidth={3} />
                                                    </div>
                                                    <div className={`flex flex-col text-left ${rtl ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest mt-1 group-hover:text-rose-500 transition-colors">{lang === 'ar' ? 'ذاكرة الصوت' : 'Voice Cache'}</span>
                                                        <span className="text-[8px] text-slate-400 font-medium">{cacheStats.memoryUsage}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleClearCache}
                                                    disabled={isCleaningCache || cacheStats.size === 0}
                                                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${cacheStats.size > 0 ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white shadow-sm' : 'bg-slate-50 border border-slate-100 text-slate-300 opacity-60'}`}
                                                >
                                                    {isCleaningCache ? '...' : (lang === 'ar' ? 'تنظيف' : 'Clear')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                                            <button
                                                onClick={() => setIsMuted(!isMuted)}
                                                className={`flex-1 w-full py-4 px-4 rounded-[1.5rem] flex items-center justify-center gap-2 border font-black text-[10px] uppercase tracking-widest transition-all shadow-sm ${isMuted ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
                                            >
                                                <Speaker size={16} className={isMuted ? '' : 'text-slate-400'} strokeWidth={2.5} />
                                                {isMuted ? (lang === 'ar' ? 'إلغاء الكتم' : 'Unmute') : (lang === 'ar' ? 'كتم الصوت' : 'Mute Voice')}
                                            </button>
                                            <button
                                                onClick={onClearChat}
                                                className="flex-1 w-full py-4 px-4 rounded-[1.5rem] flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest transition-all shadow-sm hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                                {t.clearChat}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <p className="text-center mt-6 shrink-0 text-[10px] font-black text-slate-300 uppercase tracking-widest opacity-80 pb-2">Smart-Lern Core v2.4.0</p>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
