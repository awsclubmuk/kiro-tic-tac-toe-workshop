/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                spiderman: {
                    red: '#DC143C',
                    'red-soft': '#B01030',
                    blue: '#001F3F',
                    'navy-mid': '#0A2A4A',
                    web: '#FFD700',
                    dark: '#070B12',
                    light: '#f8f9fa',
                },
            },
            fontFamily: {
                display: ['Bangers', 'cursive'],
                sans: ['"Exo 2"', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                web: '0 0 12px rgba(220, 20, 60, 0.35)',
                'web-lg': '0 0 24px rgba(220, 20, 60, 0.55)',
                'web-soft': '0 4px 24px rgba(0, 0, 0, 0.45)',
            },
            backgroundImage: {
                'web-pattern':
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23DC143C' stroke-width='0.6' opacity='0.22'%3E%3Cpath d='M30 0 L30 60 M0 30 L60 30'/%3E%3Cpath d='M30 30 L5 5 M30 30 L55 5 M30 30 L5 55 M30 30 L55 55'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Ccircle cx='30' cy='30' r='24'/%3E%3C/g%3E%3C/svg%3E\")",
                'city-night':
                    'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(220, 20, 60, 0.28), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 100%, rgba(0, 31, 63, 0.9), transparent 50%), linear-gradient(165deg, #070B12 0%, #0A2A4A 45%, #070B12 100%)',
            },
            animation: {
                'web-pulse': 'web-pulse 1.5s ease-in-out infinite',
                'winner-pulse': 'winner-pulse 0.6s ease-in-out 3',
                'title-in': 'title-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
                'fade-up': 'fade-up 0.55s ease-out both',
            },
            keyframes: {
                'web-pulse': {
                    '0%, 100%': { boxShadow: '0 0 12px rgba(220, 20, 60, 0.35)' },
                    '50%': { boxShadow: '0 0 22px rgba(220, 20, 60, 0.65)' },
                },
                'winner-pulse': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                },
                'title-in': {
                    '0%': { opacity: '0', transform: 'translateY(18px) scale(0.96)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
