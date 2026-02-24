import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Cpu, Mic, ExternalLink } from 'lucide-react';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';

const GuidePage = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const t = translations[lang];
    const rtl = isRTL();

    const sections = [
        {
            title: t.groqTitle,
            icon: Cpu,
            color: 'bg-indigo-50 text-brand-indigo',
            steps: [t.groqStep1, t.groqStep2, t.groqStep3],
            link: "https://console.groq.com/keys"
        },
        {
            title: t.googleTitle,
            icon: Mic,
            color: 'bg-rose-50 text-rose-500',
            steps: [t.googleStep1, t.googleStep2, t.googleStep3],
            link: "https://console.cloud.google.com/apis/credentials"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={rtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="px-6 py-8 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-10 sticky top-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-indigo hover:bg-white active:scale-90 transition-all shadow-sm"
                >
                    <ArrowLeft size={20} strokeWidth={3} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 leading-none">{t.setupGuide}</h1>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">{t.howToGetKeys}</span>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
                <div className="space-y-8">
                    {sections.map((section, idx) => (
                        <motion.section
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 flex flex-col gap-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${section.color}`}>
                                    <section.icon size={24} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-lg font-black text-slate-900">{section.title}</h2>
                            </div>

                            <div className="space-y-4">
                                {section.steps.map((step) => (
                                    <div key={step} className="flex gap-4 items-start">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black flex items-center justify-center mt-0.5">
                                            {section.steps.indexOf(step) + 1}
                                        </span>
                                        <p className="text-slate-600 font-medium leading-relaxed text-sm">
                                            {step}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <a
                                href={section.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`mt-2 flex items-center justify-between p-4 rounded-2xl border-2 border-dashed border-slate-100 hover:border-brand-indigo/30 hover:bg-indigo-50/20 transition-all group`}
                            >
                                <span className="text-xs font-black text-brand-indigo uppercase tracking-widest flex items-center gap-2">
                                    <ExternalLink size={14} />
                                    {t.clickHere}
                                </span>
                                <span className="text-[10px] font-bold text-slate-300">Open Dashboard</span>
                            </a>
                        </motion.section>
                    ))}
                </div>

                <div className="mt-12 mb-8 p-8 bg-brand-indigo text-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-white/10 rounded-full">
                        <Key size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black leading-none mb-2">Almost Done!</h3>
                        <p className="opacity-80 text-xs font-medium max-w-xs mx-auto">
                            Once you have your keys, paste them in the Settings panel to unlock the full potential of Smart-Lern.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-2 px-8 py-4 bg-white text-brand-indigo rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                        {t.back}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default GuidePage;
