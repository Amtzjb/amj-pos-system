/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores de la marca AMJ (luego los personalizamos más)
        primary: '#2563eb', 
        secondary: '#1e40af',
        accent: '#f59e0b',
        danger: '#ef4444',
      }
    },
  },
  plugins: [],
}