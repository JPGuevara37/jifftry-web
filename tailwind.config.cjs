module.exports = {
    darkMode: 'class',
    content: ['./*.html', './blog/*.html', './js/*.js'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                space: {
                    dark: '#0B0F19',
                    light: '#1A2235',
                    accent: '#2A3655'
                },
                pastel: {
                    blue: '#93c5fd',
                    green: '#86efac',
                    purple: '#d8b4fe',
                    yellow: '#fde047',
                    pink: '#f9a8d4'
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 8s ease-in-out infinite 3s',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        }
    }
};
