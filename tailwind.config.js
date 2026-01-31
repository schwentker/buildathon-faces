/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        buildathon: {
          bg: 'var(--buildathon-bg)',
          surface: 'var(--buildathon-surface)',
          border: 'var(--buildathon-border)',
          primary: 'var(--buildathon-primary)',
          secondary: 'var(--buildathon-secondary)',
          text: 'var(--buildathon-text)',
          muted: 'var(--buildathon-text-muted)',
        },
      },
    },
  },
  plugins: [],
};