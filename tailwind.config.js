/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-ghost': '#F8FAFC',
                'brand-indigo': '#4F46E5',
                'brand-pink': '#EC4899',
                'brand-dark': '#0F172A',
            },
            boxShadow: {
                'brand-indigo': '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
            }
        },
    },
    plugins: [],
}
