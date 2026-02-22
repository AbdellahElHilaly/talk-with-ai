import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, ExternalLink, Info } from 'lucide-react';
import { translations } from '../utils/translations';
import { getCurrentLang, isRTL } from '../utils/lang';

const GroqGuide = () => {
    const navigate = useNavigate();
    const lang = getCurrentLang();
    const t = translations[lang].groqGuide;
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
                    className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-slate-100 space-y-8"
                >
                    {/* What is it? Section */}
                    <div className="bg-indigo-50/50 rounded-3xl p-6 flex gap-4 items-start border border-indigo-100/50">
                        <div className="p-2 bg-white rounded-xl text-brand-indigo shadow-sm">
                            <Info size={20} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-brand-indigo uppercase tracking-wider">What is an API Key?</h3>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                {t.whatIs}
                            </p>
                        </div>
                    </div>

                    {/* Steps Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
                                <Cpu size={22} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900">Step-by-Step Instructions</h2>
                        </div>

                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className={`absolute ${rtl ? 'right-4' : 'left-4'} top-8 bottom-8 w-0.5 bg-slate-100`} />

                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 items-start relative z-10">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-slate-100 text-slate-400 text-xs font-black flex items-center justify-center shadow-sm group-hover:border-brand-indigo transition-colors uppercase">
                                        {idx + 1}
                                    </span>
                                    <p className="text-slate-700 font-bold leading-relaxed text-sm pt-1">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Link */}
                    <a
                        href="https://console.groq.com/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl group"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Open External Site</span>
                            <span className="text-sm font-black">Go to Groq Console</span>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
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

export default GroqGuide;
