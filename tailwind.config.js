/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F6376',
          50: '#f0f9fa',
          100: '#d7eff2',
          200: '#b2dfe5',
          500: '#1F6376',
          600: '#195161',
          700: '#14404c',
          800: '#103039',
          900: '#0c2229',
        },
        accent: {
          DEFAULT: '#F39E20',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#F39E20',
          600: '#d97706',
          700: '#b45309',
        },
        surface: '#F4F5F7',
        brand: '#1F6376',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"New York"', 'Charter', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'ambient': '0 4px 24px -8px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'ambient-lg': '0 12px 32px -12px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};
