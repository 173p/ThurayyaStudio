/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                scanline: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' }
                },
                blink: {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0 }
                }
            },
            animation: {
                scanline: 'scanline 2s linear infinite',
                blink: 'blink 1s step-end infinite'
            }
        },
    },
    plugins: [],
}
