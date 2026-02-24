import React from 'react';

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, ExternalLink, Info, Wand2 } from 'lucide-react';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';

const ElevenLabsGuide = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const t = translations[lang].elevenGuide;
    const common = translations[lang];
    const rtl = isRTL();

    const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir={rtl ? 'rtl' : 'ltr'}>
            <header className="px-6 py-8 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-10 sticky top-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-brand-indigo transition-all shadow-sm"
                >
                    <ArrowLeft size={20} strokeWidth={3} className={rtl ? 'rotate-180' : ''} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 leading-none">{t.title}</h1>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">{t.subtitle}</span>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 space-y-8 overflow-hidden relative"
                >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-brand-indigo">
                        <Wand2 size={200} />
                    </div>

                    <div className="bg-indigo-50/50 rounded-3xl p-6 flex gap-4 items-start border border-indigo-100/50 relative z-10">
                        <div className="p-2 bg-white rounded-xl text-brand-indigo shadow-sm">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-brand-indigo uppercase tracking-wider">Magic Voices?</h3>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                {t.whatIs}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                                <Mic size={22} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Setting up ElevenLabs</h2>
                        </div>

                        <div className="grid gap-4">
                            {steps.map((step, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex gap-4 items-center group hover:bg-white hover:shadow-md transition-all">
                                    <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white text-slate-400 text-sm font-black flex items-center justify-center shadow-sm border border-slate-100 group-hover:text-brand-indigo group-hover:border-indigo-100 transition-colors">
                                        {idx + 1}
                                    </span>
                                    <p className="text-slate-700 font-bold text-sm">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <a
                        href="https://elevenlabs.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 rounded-3xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">No Credit Card Needed</span>
                            <span className="text-sm font-black">Go to ElevenLabs.io</span>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl group-hover:translate-x-1 transition-transform">
                            <ExternalLink size={20} />
                        </div>
                    </a>
                </motion.div>

                <button
                    onClick={() => navigate(-1)}
                    className="w-full mt-8 py-5 border-2 border-slate-200 text-slate-400 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-brand-indigo transition-all"
                >
                    {common.back}
                </button>
            </main>
        </div>
    );
};

export default ElevenLabsGuide;
