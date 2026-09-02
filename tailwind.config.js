/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gov-primary': '#064E3B', /* Deep Emerald */
        'gov-emerald': '#059669', /* Active success states */
        'gov-accent': '#D97706', /* Terracotta/Warm Amber */
        'gov-navy': '#064E3B', /* Mapped to Deep Emerald */
        'gov-blue': '#059669', /* Mapped to Emerald */
        'ashoka-gold': '#D97706', /* Mapped to Amber */
        'surface-canvas': '#FAF9F6',
        'surface-dark': '#090D16',
        'glass-border': 'rgba(6, 78, 59, 0.12)',
        'status-green': '#059669',
        'status-amber': '#f59e0b',
        'status-red': '#e11d48',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
