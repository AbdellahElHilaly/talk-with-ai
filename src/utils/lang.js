export const getCurrentLang = () => localStorage.getItem('app_lang') || 'en';
export const setAppLang = (lang) => localStorage.setItem('app_lang', lang);
export const isRTL = () => getCurrentLang() === 'ar';
