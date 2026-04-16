/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Del código exacto de Stitch
        background: '#f9f9f9',
        surface: {
          DEFAULT: '#f9f9f9',
          dim: '#dadada',
          bright: '#f9f9f9',
          container: '#eeeeee',
          'container-low': '#f3f3f4',
          'container-high': '#e8e8e8',
          'container-highest': '#e2e2e2',
          'container-lowest': '#ffffff',
          variant: '#e2e2e2',
        },
        primary: {
          DEFAULT: '#000000',
          'fixed': '#5f5e5e',
          'fixed-dim': '#474646',
          container: '#3c3b3b',
        },
        on: {
          primary: '#e5e2e1',
          'primary-fixed': '#ffffff',
          'primary-fixed-variant': '#e5e2e1',
          'primary-container': '#ffffff',
          surface: '#1a1c1c',
          'surface-variant': '#474747',
          background: '#1a1c1c',
          secondary: '#ffffff',
          'secondary-container': '#1b1c1b',
          'secondary-fixed': '#c8c6c6',
          'secondary-fixed-variant': '#3b3b3b',
          tertiary: '#e3e2e2',
          'tertiary-container': '#ffffff',
          tertiary: '#e3e2e2',
          'tertiary-fixed': '#ffffff',
          'tertiary-fixed-variant': '#e3e2e2',
          error: '#ffffff',
          'error-container': '#410002',
        },
        secondary: {
          DEFAULT: '#5f5e5e',
          container: '#d6d4d3',
          fixed: '#c8c6c6',
          'fixed-dim': '#acabab',
        },
        tertiary: {
          DEFAULT: '#3b3b3c',
          container: '#747474',
          fixed: '#5e5e5e',
          'fixed-dim': '#464747',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        outline: {
          DEFAULT: '#777777',
          variant: '#c6c6c6',
        },
        inverse: {
          surface: '#2f3131',
          'on-surface': '#f0f1f1',
          primary: '#c8c6c5',
        },
        // Aliases para simplificar
        'surface-tint': '#5f5e5e',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'card': '8px 24px 48px -12px rgba(26,28,28,0.04)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}