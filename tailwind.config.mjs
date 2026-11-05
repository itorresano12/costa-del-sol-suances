/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'blanco-puro': '#FFFFFF',
        'salvia-header': '#C8D5C8',
        'salvia-section': '#D5E0D5',
        'salvia-accent': '#5F7D6B',
        'arena-warm': '#F4EFE6',
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
          DEFAULT: '#5F7D6B',
          light: '#8FACA1',
          dark: '#527261',
          header: '#C8D5C8',
          section: '#D5E0D5',
          accent: '#5F7D6B',
        },
        cantabrico: {
          DEFAULT: '#0A2342',
          dark: '#051329',
        },
        arena: {
          DEFAULT: '#F4EFE6',
          warm: '#F4EFE6',
        },
      },
    },
  },
};
