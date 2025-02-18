/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colors
      colors: {
        primary: '#0288d1',
        secondary: '#0288d1',
        textDark: '#000000',
        textLight: '#f2f2f2',
        backgroundLight: '#f0f0f0',
        backgroundDark: '#202124',
        headerBgDark: '#1e1e1e',
        headerBgLight: '#ffffff',
        tableBorderDark: '#4a4a4a',
        tableBorderLight: '#e5e5e5',
        tableHeaderBgDark: '#2d2d2d',
        tableHeaderBgLight: '#ffffff',
        tableHeaderTextDark: '#9ca3af',
        tableHeaderTextLight: '#4b5563',
        panelBgDark: '#2d2d2d',
        panelBgLight: '#f9fafb',
        labelTextDark: '#9ca3af',
        labelTextLight: '#4b5563',
        inputBgDark: '#1f2937',
        inputBgLight: '#ffffff',
        inputBorderDark: '#4a4a4a',
        inputBorderLight: '#e5e5e5',
        selectBgDark: '#1f2937',
        selectBgLight: '#ffffff',
        selectBorderDark: '#4a4a4a',
        selectBorderLight: '#e5e5e5',
        hoverBg: 'rgba(0, 176, 151, 0.2)',
        selectedBg: '#00B097'
      },
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
    }
  },
  plugins: [],
}