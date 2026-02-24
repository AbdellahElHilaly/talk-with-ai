import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Bookmark, Download, Zap, ChevronRight } from 'lucide-react';
import { translations } from '../utils/translations';
import { getCurrentLang, setAppLang, isRTL } from '../utils/lang';

const HomePage = () => {
    const navigate = useNavigate();
    const [lang, setLang] = useState(getCurrentLang());
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const t = translations[lang];
    const rtl = isRTL();

    useEffect(() => {
        const handlePrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        globalThis.addEventListener('beforeinstallprompt', handlePrompt);
        return () => globalThis.removeEventListener('beforeinstallprompt', handlePrompt);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') setDeferredPrompt(null);
        }
    };

    const toggleLang = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        setAppLang(newLang);
        setLang(newLang);
        globalThis.location.reload();
    };

    const features = [
        {
            icon: MessageSquare,
            title: lang === 'ar' ? 'دردشة ذكية' : 'Smart Chat',
            desc: lang === 'ar' ? 'تحدث مع Llama 3 المتقدم.' : 'Llama 3 advanced intelligence.',
            color: 'bg-blue-50 text-blue-500'
        },
        {
            icon: Zap,
            title: lang === 'ar' ? 'سحر الترجمة' : 'Translation Magic',
            desc: lang === 'ar' ? 'معنى الكلمة في لمحة.' : 'Word meaning at a glance.',
            color: 'bg-amber-50 text-amber-500'
        },
        {
            icon: Bookmark,
            title: lang === 'ar' ? 'كلماتك المفضلة' : 'Favorite Words',
            desc: lang === 'ar' ? 'قائمة مخصصة لمراجعتك.' : 'Custom list for your review.',
            color: 'bg-emerald-50 text-emerald-500'
        }
    ];

    return (
        <div className="h-screen w-full relative flex flex-col bg-white overflow-hidden font-sans" dir={rtl ? 'rtl' : 'ltr'}>
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/50 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/30 rounded-full blur-[100px]" />

            {/* Nav / Logo */}
            <nav className="relative z-10 px-8 py-8 flex justify-between items-center w-full max-w-6xl mx-auto shrink-0">
                <div className="flex flex-col">
                    <span className="logo-font text-2xl text-brand-indigo -rotate-3">Smart-Lern</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLang}
                        title={lang === 'en' ? 'Switch to Arabic' : 'التبديل للإنجليزية'}
                        className="w-10 h-6 bg-slate-100 rounded-sm flex items-center justify-center hover:opacity-80 transition-all border border-slate-200 overflow-hidden shadow-sm"
                    >
                        {lang === 'en' ? (
                            <img src="https://flagcdn.com/w80/sa.png" className="w-full h-full object-cover" alt="Arabic" />
                        ) : (
                            <img src="https://flagcdn.com/w80/gb.png" className="w-full h-full object-cover" alt="English" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Main Content - Structured for Full Screen Space */}
            <main className="relative z-10 flex-1 flex flex-col justify-between items-center px-8 py-10 max-w-4xl mx-auto w-full text-center">
                {/* Top Section: Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <h1 className="text-6xl md:text-7xl font-black text-slate-950 tracking-tighter leading-[0.95]">
                        {t.readyToBloom} <br />
                        <span className="text-brand-indigo italic">{t.bloom}</span>
                        <span className="block text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4">
                            {lang === 'ar' ? 'مستقبلك يبدأ هنا' : 'Your Future Starts Here'}
                        </span>
                    </h1>

                    <p className="text-slate-500 text-sm md:text-base font-medium max-w-sm mx-auto leading-relaxed pt-2">
                        {t.tagline}
                    </p>
                </motion.div>

                {/* Middle Section: CTA & Install */}
                <div className="flex flex-col items-center gap-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/chat')}
                            className="group relative px-12 py-5 bg-brand-indigo text-white rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 transition-all font-black flex items-center gap-4 mx-auto"
                        >
                            <span className="relative z-10 tracking-[0.3em] uppercase text-sm">
                                {t.launchBtn}
                            </span>
                            <ChevronRight size={20} className="relative z-10 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                    </motion.div>

                    {deferredPrompt && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleInstall}
                            className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-brand-indigo transition-all group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-indigo group-hover:text-white transition-all shadow-sm">
                                <Download size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{t.installBtn}</span>
                        </motion.button>
                    )}
                </div>

                {/* Bottom Section: Features List */}
                <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
                    {features.map((item) => (
                        <div
                            key={item.title}
                            className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-slate-50 flex items-center gap-4"
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                                <item.icon size={18} strokeWidth={2.5} />
                            </div>
                            <div className={`flex flex-col ${rtl ? 'text-right' : 'text-left'}`}>
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{item.title}</h3>
                                <p className="text-slate-400 text-[10px] font-medium leading-none mt-1.5">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-8 py-8 border-t border-slate-50 shrink-0">
                <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="logo-font text-xl text-brand-indigo opacity-80 italic">Smart-Lern</span>
                        <div className="w-[1px] h-4 bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">Active v2.4.0</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Privacy</span>
                        <div className="px-4 py-1.5 bg-slate-50 rounded-full">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Global PWA</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
