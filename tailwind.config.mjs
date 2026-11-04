/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'blanco-puro': '#FFFFFF',
        'marino-vibrante': {
          DEFAULT: '#0A2342',
          dark: '#051329',
          light: '#133B6B',
        },
        'dorado-arena': {
          DEFAULT: '#C4A47C',
          light: '#DFC8AB',
          dark: '#A9875F',
        },
        salvia: {
          DEFAULT: '#6B8E7B',
          light: '#8FACA1',
          dark: '#527261',
        },
        cantabrico: {
          DEFAULT: '#0A2342',
          dark: '#051329',
        },
        arena: {
          DEFAULT: '#FFFFFF',
        },
      },
    },
  },
};
