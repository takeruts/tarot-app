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
        'mystic-bg': '#050510',
        'mystic-gold': '#c5a059',
        'mystic-blue': '#6366f1',
      },
    },
  },
  plugins: [],
}

