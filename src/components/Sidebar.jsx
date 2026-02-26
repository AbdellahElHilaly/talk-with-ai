import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, User, Mic2, Speaker, ExternalLink, HelpCircle, Loader2, AlertCircle, Bookmark, GraduationCap, Trash2, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGroqKeys, getElevenKeys } from '../utils/keyStorage';
import { translations } from '../utils/translations';
import { getCurrentLang, setAppLang, isRTL } from '../utils/lang';
import { voiceEngine } from '../utils/voice';
import { VocabService } from '../utils/vocabulary';
import { CHARACTERS } from '../prompts/characters';
import Alert from './shared/Alert';

const Sidebar = ({ isOpen, onClose, isMuted, setIsMuted, onClearChat }) => {
    const [lang, setLang] = useState(getCurrentLang());
    const [speed, setSpeed] = useState(parseFloat(localStorage.getItem('voice_speed')) || 1);
    const [learnedCount, setLearnedCount] = useState(VocabService.getLearnedWords().length);
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

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
        return localStorage.getItem('selected_character') || 'girlfriend';
    });
    const [isSaving, setIsSaving] = useState(false);
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
        voiceEngine.speakPreview(vId, lang);
    };

    const handleCharacterSelect = (characterId) => {
        setSelectedCharacter(characterId);
        localStorage.setItem('selected_character', characterId);
        window.dispatchEvent(new CustomEvent('characterChanged', { detail: characterId }));
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

    const handleSave = async () => {
        setIsSaving(true);
        localStorage.setItem('voice_speed', speed);
        localStorage.setItem('selected_voice', selectedVoice);
        localStorage.setItem('selected_character', selectedCharacter);
        await new Promise(r => setTimeout(r, 800));
        setIsSaving(false);
        onClose();
    };

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
                    <motion.div
                        initial={{ x: rtl ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: rtl ? '100%' : '-100%' }}
                        className={`fixed ${rtl ? 'right-0' : 'left-0'} top-0 h-full w-full max-w-xs bg-white z-50 p-6 flex flex-col shadow-2xl ${rtl ? 'rounded-l-[2rem]' : 'rounded-r-[2rem]'} overflow-y-auto hide-scrollbar`}
                        dir={rtl ? 'rtl' : 'ltr'}
                    >
                        <Alert
                            show={alertConfig.show}
                            message={alertConfig.message}
                            type={alertConfig.type}
                            onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                        />

                        <div className={`flex justify-between items-center mb-6 ${rtl ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                <span className={`logo-font text-3xl text-brand-indigo ${rtl ? 'rotate-3' : '-rotate-3'}`}>Smart-Lern</span>
                                <span className={`text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mt-1 ${rtl ? 'mr-1' : 'ml-1'}`}>{t.settingsPanel}</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 transition-all active:scale-90 outline-none cursor-pointer"
                            >
                                <X size={24} strokeWidth={2} />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.language}</label>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleLang('en')} className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 ${lang === 'en' ? 'border-brand-indigo bg-indigo-50/30 text-brand-indigo' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                                        <span className="text-sm">🇺🇸</span>
                                        <span className="text-[9px] tracking-wider">EN</span>
                                    </button>
                                    <button onClick={() => toggleLang('ar')} className={`flex-1 py-2.5 px-3 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 ${lang === 'ar' ? 'border-brand-indigo bg-indigo-50/30 text-brand-indigo' : 'border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                                        <span className="text-sm">🇸🇦</span>
                                        <span className="text-[9px] tracking-wider">AR</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{lang === 'ar' ? 'شخصية الذكي' : 'AI PERSONALITY'}</label>
                                <div className="overflow-x-auto hide-scrollbar -mx-2">
                                    <div className="flex gap-4 py-4 px-2 min-w-max">
                                        {Object.values(CHARACTERS).map((character) => (
                                            <button
                                                key={character.id}
                                                onClick={() => handleCharacterSelect(character.id)}
                                                className={`flex flex-col items-center gap-2 min-w-[70px] transition-all touch-manipulation ${selectedCharacter === character.id
                                                    ? 'transform scale-105'
                                                    : 'hover:scale-105'
                                                    }`}
                                                aria-label={`Select ${lang === 'ar' ? character.nameAr : character.name} character`}
                                                role="radio"
                                                aria-checked={selectedCharacter === character.id}
                                            >
                                                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${selectedCharacter === character.id
                                                    ? 'bg-gradient-to-br from-brand-indigo to-purple-600 shadow-lg shadow-indigo-200'
                                                    : 'bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300'
                                                    }`}>
                                                    <span className="text-xl">{character.icon}</span>
                                                    {selectedCharacter === character.id && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
                                                            <span className="text-[8px] text-white">✓</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-tight text-center leading-tight max-w-[60px] ${selectedCharacter === character.id ? 'text-brand-indigo' : 'text-slate-500'
                                                    }`}>
                                                    {lang === 'ar' ? character.nameAr : character.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
                                <div className={`flex items-center justify-between pb-2 border-b border-slate-50 ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none pt-1">API KEYS</label>
                                    {(getGroqKeys().length > 0 || getElevenKeys().length > 0) && (
                                        <button
                                            onClick={handleShareAll}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-brand-indigo rounded-lg hover:bg-brand-indigo hover:text-white transition-all group/share"
                                        >
                                            <Share2 size={12} strokeWidth={3} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{lang === 'ar' ? 'مشاركة' : 'SHARE'}</span>
                                        </button>
                                    )}
                                </div>

                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <Link to="/settings/groq-keys" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover:text-brand-indigo transition-colors">{lang === 'ar' ? 'دردشة ذكية' : 'CHAT API'}</label>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">{getGroqKeys().length}</span>
                                        </div>
                                    </Link>
                                    <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <Link to="/guide/groq" className="text-slate-300 hover:text-brand-indigo transition-colors"><HelpCircle size={16} strokeWidth={2.5} /></Link>
                                        <div className={getGroqKeys().length > 0 ? 'text-emerald-500' : 'text-slate-200'}><CheckCircle2 size={16} strokeWidth={2.5} /></div>
                                    </div>
                                </div>

                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <Link to="/settings/eleven-keys" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover:text-brand-indigo transition-colors">{lang === 'ar' ? 'صوت ذكي' : 'VOICE API'}</label>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">{getElevenKeys().length}</span>
                                        </div>
                                    </Link>
                                    <div className={`flex items-center gap-4 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <Link to="/guide/eleven" className="text-slate-300 hover:text-brand-indigo transition-colors"><HelpCircle size={16} strokeWidth={2.5} /></Link>
                                        <div className={getElevenKeys().length > 0 ? 'text-emerald-500' : 'text-slate-200'}><CheckCircle2 size={16} strokeWidth={2.5} /></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5 pt-2 border-t border-slate-50">
                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <Link to="/settings/vocabulary" className={`flex items-center gap-3 flex-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest cursor-pointer group-hover:text-brand-indigo transition-colors">{lang === 'ar' ? 'كلماتي المميزة' : 'MY WORDS'}</label>
                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-500">{learnedCount}</span>
                                        </div>
                                    </Link>
                                    <Bookmark size={16} className="text-slate-200" strokeWidth={2.5} />
                                </div>

                                <div className={`flex items-center justify-between ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                            {lang === 'ar' ? 'ذاكرة الصوت' : 'VOICE MEMORY'}
                                        </label>
                                        <span className="text-[8px] text-slate-400 mt-0.5">
                                            {lang === 'ar' ? `محفوظ: ${cacheStats.memoryUsage}` : `Cached: ${cacheStats.memoryUsage}`}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleClearCache}
                                        disabled={isCleaningCache || cacheStats.size === 0}
                                        className={`p-2 transition-all outline-none cursor-pointer disabled:opacity-30 ${cacheStats.size > 0
                                            ? 'text-rose-500 active:scale-90'
                                            : 'text-slate-300'
                                            }`}
                                        title={lang === 'ar' ? 'تنظيف ذاكرة الصوت' : 'Clear voice cache'}
                                    >
                                        {isCleaningCache ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={24} strokeWidth={2} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 text-left">
                                <label className={`text-[10px] font-black text-slate-900 uppercase tracking-widest ${rtl ? 'text-right' : 'text-left'}`}>{t.voiceEngine}</label>
                                <div className="flex flex-col gap-2">
                                    {voices.map((v) => (
                                        <button key={v.id} onClick={() => handleVoiceSelect(v.id)} className={`flex items-center justify-between py-2 transition-all group ${rtl ? 'flex-row-reverse' : ''}`}>
                                            <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                                                <div className={`p-2 rounded-xl transition-colors ${selectedVoice === v.id ? 'bg-indigo-50' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                                                    <v.icon size={16} className={`${selectedVoice === v.id ? v.color : 'text-slate-400'}`} />
                                                </div>
                                                <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${selectedVoice === v.id ? 'text-brand-indigo' : 'text-slate-500 hover:text-slate-900'}`}>{v.label}</span>
                                            </div>
                                            {selectedVoice === v.id && <motion.div layoutId="activeVoice" className="w-1.5 h-1.5 rounded-full bg-brand-indigo" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 text-left">
                                <div className={`flex justify-between items-center ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t.speechVelocity}</label>
                                    <span className="text-xl font-black text-brand-indigo font-mono italic">{speed}x</span>
                                </div>
                                <div className="relative px-2">
                                    <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={(e) => setSpeed(e.target.value)} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-brand-indigo" />
                                    <div className={`flex justify-between mt-1 px-1 ${rtl ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[8px] font-bold text-slate-300">{t.slow}</span>
                                        <span className="text-[8px] font-bold text-slate-300">{t.fast}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5 pt-4 border-t border-slate-50">
                                <div className={`flex items-center justify-between group ${rtl ? 'flex-row-reverse' : ''}`}>
                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{lang === 'ar' ? 'أوامر سريعة' : 'QUICK ACTIONS'}</label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            className={`p-2 transition-all outline-none cursor-pointer ${isMuted ? 'text-amber-500' : 'text-slate-400'}`}
                                            title={isMuted ? 'Unmute' : 'Mute'}
                                        >
                                            <Speaker size={24} strokeWidth={2} />
                                        </button>
                                        <button
                                            onClick={onClearChat}
                                            className="p-2 text-slate-400 transition-all outline-none cursor-pointer"
                                            title={t.clearChat}
                                        >
                                            <Trash2 size={24} strokeWidth={2} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <motion.button whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-80">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : t.applyChanges}
                            </motion.button>
                            <p className="text-center mt-4 text-[8px] font-bold text-slate-300 uppercase tracking-widest">Smart-Lern Core v2.4.0</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;
