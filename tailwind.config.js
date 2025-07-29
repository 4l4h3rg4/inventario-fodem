/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Colores de FODEM PROJECT
        fodem: {
          primary: '#B8C5D1',      // Azul grisáceo claro
          secondary: '#E8D5C4',    // Beige claro
          'primary-dark': '#9BA8B4', // Versión más oscura del azul
          'secondary-dark': '#D4C1B0', // Versión más oscura del beige
          'text-primary': '#2C3E50',   // Negro suave para texto principal
          'text-secondary': '#7F8C8D', // Gris para texto secundario
          background: '#F8F9FA',       // Fondo principal muy claro
          surface: '#FFFFFF',          // Superficies (tarjetas, modales)
          border: '#E1E8ED',           // Bordes sutiles
          success: '#27AE60',          // Verde para éxito
          warning: '#F39C12',          // Naranja para advertencias
          error: '#E74C3C',            // Rojo para errores
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'fodem': '0 2px 8px rgba(44, 62, 80, 0.1)',
        'fodem-lg': '0 4px 16px rgba(44, 62, 80, 0.15)',
      },
      borderRadius: {
        'fodem': '12px',
        'fodem-lg': '16px',
      }
    },
  },
  plugins: [],
}

