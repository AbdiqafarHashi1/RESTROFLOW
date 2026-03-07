import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#111111',
        surface: '#181818',
        card: '#1F1F1F',
        primary: '#C8A45D',
        secondary: '#B33A2B',
        muted: '#A1A1A1',
        border: 'rgba(255,255,255,0.08)',
        success: '#1f6a42',
        warning: '#b27d12',
      },
      fontFamily: {
        heading: ['var(--font-playfair)'],
        body: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};

export default config;
