/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.2)',
                    300: 'rgba(255, 255, 255, 0.3)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                q1: { base: '#ef4444', dim: 'rgba(239, 68, 68, 0.2)' },
                q2: { base: '#10b981', dim: 'rgba(16, 185, 129, 0.2)' }, // Green
                q3: { base: '#eab308', dim: 'rgba(234, 179, 8, 0.2)' },
                q4: { base: '#3b82f6', dim: 'rgba(59, 130, 246, 0.2)' }, // Blue
            },
            animation: {
                'blob': 'blob 7s infinite',
                'float-up': 'floatUp 60s linear infinite',
                'float-down': 'floatDown 65s linear infinite',
                'scroll-vertical': 'floatUp 20s linear infinite',
                'spin-slow': 'spin 8s linear infinite',
                'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
            },
            keyframes: {
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                floatUp: {
                    '0%': { transform: 'translateY(0%)' },
                    '100%': { transform: 'translateY(-50%)' },
                },
                floatDown: {
                    '0%': { transform: 'translateY(-50%)' },
                    '100%': { transform: 'translateY(0%)' },
                },
                shake: {
                    '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
                    '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
                    '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
                    '40%, 60%': { transform: 'translate3d(4px, 0, 0)' }
                }
            }
        },
    },
    plugins: [],
}
