/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'mc_black': '#000000',
        'mc_dark_blue': '#0000AA',
        'mc_dark_green': '#00AA00',
        'mc_dark_aqua': '#00AAAA',
        'mc_dark_red': '#AA0000',
        'mc_dark_purple': '#AA00AA',
        'mc_gold': '#FFAA00',
        'mc_gray': '#AAAAAA',
        'mc_dark_gray': '#555555',
        'mc_blue': '#5555FF',
        'mc_green': '#55FF55',
        'mc_aqua': '#55FFFF',
        'mc_red': '#FF5555',
        'mc_light_purple': '#FF55FF',
        'mc_yellow': '#FFFF55',
        'mc_white': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
