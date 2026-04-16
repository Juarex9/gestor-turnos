/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#000000',
          dim: '#000000',
          bright: '#1a1a1a',
          container: '#0d0d0d',
          'container-low': '#0a0a0a',
          'container-high': '#1a1a1a',
          'container-highest': '#262626',
          'container-lowest': '#000000',
          variant: '#262626',
          tint: '#ffffff',
        },
        primary: {
          DEFAULT: '#ffffff',
          container: '#e5e5e5',
          fixed: '#ffffff',
          'fixed-dim': '#d4d4d4',
        },
        on: {
          primary: '#000000',
          'primary-container': '#000000',
          'primary-fixed': '#000000',
          'primary-fixed-variant': '#000000',
          secondary: '#000000',
          'secondary-container': '#d4d4d4',
          'secondary-fixed': '#000000',
          'secondary-fixed-variant': '#000000',
          tertiary: '#000000',
          'tertiary-container': '#d4d4d4',
          'tertiary-fixed': '#000000',
          'tertiary-fixed-variant': '#000000',
        },
        secondary: {
          DEFAULT: '#a3a3a3',
          container: '#262626',
          fixed: '#d4d4d4',
          'fixed-dim': '#a3a3a3',
        },
        tertiary: {
          DEFAULT: '#a3a3a3',
          container: '#262626',
          fixed: '#d4d4d4',
          'fixed-dim': '#a3a3a3',
        },
        error: {
          DEFAULT: '#ef4444',
          container: '#7f1d1d',
        },
        on: {
          error: '#000000',
          'error-container': '#fecaca',
        },
        outline: {
          DEFAULT: '#525252',
          variant: '#404040',
        },
        on: {
          background: '#ffffff',
          surface: '#ffffff',
          'surface-variant': '#a3a3a3',
        },
        inverse: {
          surface: '#ffffff',
          'on-surface': '#000000',
          primary: '#000000',
        },
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 255, 255, 0.2)',
        card: '0 4px 20px rgba(0, 0, 0, 0.5)',
        modal: '0 20px 40px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
