/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        cantabrico: {
          DEFAULT: '#0F172A',
          dark: '#082F49',
        },
        salvia: {
          DEFAULT: '#6B8E7B',
          light: '#8FACA1',
        },
        arena: {
          DEFAULT: '#FDFBF7',
        },
      },
    },
  },
};

