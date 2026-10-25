/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        salon: {
          dark: '#0F1012',        // Deep Charcoal / Near-black
          darker: '#080809',      // Darker rich charcoal
          card: '#16181B',        // Card background for dark sections
          cardBorder: '#272A30',  // Border for dark cards
          cream: '#FAF7F2',       // Warm Ivory / Soft Cream
          creamAlt: '#F3EFE6',    // Slightly deeper cream
          gold: '#C5A880',        // Champagne Gold
          goldLight: '#DFCAA8',   // Light Champagne Gold
          goldDark: '#9E8055',    // Deep Champagne Gold
          muted: '#8A8F99',       // Neutral grey
          mutedDark: '#60646D',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
