/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#121214',
        surface: '#1c1c1f',
        border: '#2e2e33',
        primary: {
          green: '#37b75a',
          DEFAULT: '#37b75a',
        },
        accent: {
          red: '#ff5f40',
          purple: '#8b5cf6',
        },
        text: {
          light: '#f1f1f1',
          muted: '#a1a1aa',
        }
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(55, 183, 90, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(55, 183, 90, 0.02) 1px, transparent 1px)",
        'gradient-button': "linear-gradient(90deg, #3b82f6, #9333ea)",
        'red-wave': "radial-gradient(ellipse at center, rgba(255, 95, 64, 0.4) 0%, rgba(255, 95, 64, 0) 70%)",
      },
      backgroundSize: {
        'grid-sm': '40px 40px',
      },
      boxShadow: {
        'subtle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        mono: ['Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [
    // Automatically styles all forms, inputs, and checkboxes beautifully
    require('@tailwindcss/forms'),
    
    // Allows to style scrollbars for the Kanban columns (e.g., scrollbar-thin scrollbar-thumb-surface)
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}