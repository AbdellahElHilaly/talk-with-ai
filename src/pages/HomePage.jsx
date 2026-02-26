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
            title: lang === 'ar' ? 'شخصيات تفاعلية' : 'Interactive Personas',
            desc: lang === 'ar' ? 'تحدث مع شخصيات متنوعة تناسب مستواك ومزاجك.' : 'Chat with diverse AI characters tailored to your style.',
            color: 'bg-indigo-50 text-indigo-500'
        },
        {
            icon: Zap,
            title: lang === 'ar' ? 'ترجمة فورية' : 'Instant Translation',
            desc: lang === 'ar' ? 'انقر على أي كلمة واسمع نطقها مع ترجمة دقيقة لتنصنيعها.' : 'Tap any word to hear it and see contextual meaning.',
            color: 'bg-amber-50 text-amber-500'
        },
        {
            icon: Bookmark,
            title: lang === 'ar' ? 'قاموسك الذكي' : 'Smart Vocabulary',
            desc: lang === 'ar' ? 'احفظ الكلمات الجديدة وتدرب عليها بشكل مستمر.' : 'Save new words and practice them continuously.',
            color: 'bg-emerald-50 text-emerald-500'
        }
    ];

    return (
        <div className="min-h-[100dvh] w-full relative flex flex-col bg-white overflow-x-hidden font-sans" dir={rtl ? 'rtl' : 'ltr'}>
            {/* Background Decorations */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/50 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/30 rounded-full blur-[100px]" />

            {/* Nav / Logo */}
            <nav className="relative z-10 px-6 md:px-8 py-6 md:py-8 flex justify-between items-center w-full max-w-6xl mx-auto shrink-0">
                <div className="flex flex-col">
                    <span className="logo-font text-2xl text-brand-indigo -rotate-3">Smart-Lern</span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLang}
                        title={lang === 'en' ? 'Switch to Arabic' : 'التبديل للإنجليزية'}
                        className="w-9 h-4  flex items-center justify-center  overflow-hidden"
                    >
                        {lang === 'en' ? (
                            <img src="https://flagcdn.com/w80/sa.png" className="w-full h-7 object-cover" alt="Arabic" />
                        ) : (
                            <img src="https://flagcdn.com/w80/gb.png" className="w-full h-7 object-cover" alt="English" />
                        )}
                    </button>
                </div>
            </nav>

            {/* Main Content - Structured for Full Screen Space */}
            <main className="relative z-10 flex-1 flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12 px-6 md:px-8 py-4 md:py-6 max-w-6xl mx-auto w-full text-center lg:text-start" dir={rtl ? 'rtl' : 'ltr'}>
                {/* Left Section: Hero + CTA */}
                <div className="flex flex-col items-center lg:items-start gap-6 lg:gap-8 w-full lg:w-1/2">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 lg:space-y-4"
                    >
                        <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black text-slate-950 tracking-tighter leading-[0.95]">
                            {lang === 'ar' ? 'تحدث مع' : 'Talk With'} <br />
                            <span className="text-brand-indigo italic text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem] leading-[0.9]">AI</span>
                            <span className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 h-5">
                                {lang === 'ar' ? 'رحلتك لإتقان الإنجليزية تبدأ هنا' : 'Your English Journey Starts Here'}
                            </span>
                        </h1>

                        <p className="text-slate-500 text-xs md:text-sm lg:text-base font-medium max-w-xs md:max-w-md mx-auto lg:mx-0 leading-relaxed pt-2">
                            {lang === 'ar' ? 'تطبيق تفاعلي يتيح لك الدردشة صوتياً ونصياً مع شخصيات ذكاء اصطناعي لتعلم وتطوير لغتك الإنجليزية بشكل طبيعي.' : 'An interactive app that lets you chat with diverse AI personas to learn and master English effortlessly.'}
                        </p>
                    </motion.div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/chat')}
                                className="group relative px-10 md:px-12 py-4 md:py-5 bg-brand-indigo text-white rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-100 transition-all font-black flex items-center gap-4 mx-auto lg:mx-0"
                            >
                                <span className="relative z-10 tracking-[0.3em] uppercase text-sm">
                                    {t.launchBtn}
                                </span>
                                <ChevronRight size={20} className={`relative z-10 transition-transform ${rtl ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
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
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-brand-indigo group-hover:text-white transition-all shadow-sm">
                                    <Download size={18} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{t.installBtn}</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Right Section: Features List */}
                <div className="flex flex-col gap-3 md:gap-4 w-full max-w-md lg:w-1/2">
                    {features.map((item, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            key={item.title}
                            className="bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-white flex items-center gap-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all"
                        >
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                                <item.icon size={22} strokeWidth={2} />
                            </div>
                            <div className={`flex flex-col ${rtl ? 'text-right' : 'text-left'}`}>
                                <h3 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight leading-none">{item.title}</h3>
                                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mt-1.5">
                                    {item.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 px-6 md:px-8 py-6 md:py-8 border-t border-slate-50 shrink-0 mt-8 lg:mt-0">
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
