import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ShieldCheck, Key } from 'lucide-react';
import { validateGroqKey, validateElevenKey, addGroqKey, addElevenKey } from '../utils/keyStorage';
import { isRTL, getCurrentLang } from '../utils/lang';
import { translations } from '../utils/translations';

const ImportKeysPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('initializing'); // initializing, validating, done
    const [details, setDetails] = useState({ groq: 0, eleven: 0 });

    const rtl = isRTL();
    const lang = getCurrentLang();
    const t = translations[lang];

    const processGroqKeys = useCallback(async (groqKeysParam) => {
        if (!groqKeysParam) return 0;
        let count = 0;
        const keys = groqKeysParam.split(',');
        for (const key of keys) {
            const isValid = await validateGroqKey(key);
            if (isValid) {
                const added = await addGroqKey(key);
                if (added) count++;
            }
        }
        return count;
    }, []);

    const processElevenKeys = useCallback(async (elevenKeysParam) => {
        if (!elevenKeysParam) return 0;
        let count = 0;
        const keys = elevenKeysParam.split(',');
        for (const key of keys) {
            const info = await validateElevenKey(key);
            if (info) {
                const added = await addElevenKey(key);
                if (added) count++;
            }
        }
        return count;
    }, []);

    useEffect(() => {
        const importAll = async () => {
            setStatus('validating');

            const gCount = await processGroqKeys(searchParams.get('groq'));
            const eCount = await processElevenKeys(searchParams.get('eleven'));

            setDetails({ groq: gCount, eleven: eCount });
            setStatus('done');

            const timer = setTimeout(() => navigate('/'), 3000);
            return () => clearTimeout(timer);
        };

        importAll();
    }, [searchParams, navigate, processGroqKeys, processElevenKeys]);

    const isDone = status === 'done';

    // UI Text
    let titleText = t.validating;
    let subText = t.verifyingAccount;

    if (isDone) {
        titleText = t.keysImported;
        subText = t.allKeysVerified;
    }
    let redirectText = lang === 'ar' ? 'تشفير آمن' : 'SECURE ENCRYPTION';
    if (isDone) {
        redirectText = lang === 'ar' ? 'جاري التحويل...' : 'Redirecting...';
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6" dir={rtl ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center shadow-sm shadow-indigo-100/50"
                >
                    {isDone ? (
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    ) : (
                        <ShieldCheck size={40} className="text-brand-indigo animate-pulse" />
                    )}
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{titleText}</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{subText}</p>
                </div>

                {isDone && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex flex-col gap-3"
                    >
                        <SummaryItem icon={<Key size={20} />} label="GROQ" count={details.groq} lang={lang} />
                        <SummaryItem icon={<Loader2 size={20} />} label="ElevenLabs" count={details.eleven} lang={lang} />
                    </motion.div>
                )}

                <div className="flex items-center gap-3">
                    <Loader2 size={16} className={`text-brand-indigo ${status === 'validating' ? 'animate-spin' : 'opacity-0'}`} />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                        {redirectText}
                    </span>
                </div>
            </div>
        </div>
    );
};

const SummaryItem = ({ icon, label, count, lang }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-3xl">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-brand-indigo shadow-sm">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</span>
        </div>
        <span className="text-xs font-black text-brand-indigo">
            {count} {lang === 'ar' ? 'مفاتيح' : 'Keys'}
        </span>
    </div>
);

export default ImportKeysPage;
