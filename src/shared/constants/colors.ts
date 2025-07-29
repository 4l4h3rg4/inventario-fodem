// Colores del logo FODEM PROJECT
export const FODEM_COLORS = {
  // Azul grisáceo claro (forma izquierda del logo)
  primary: '#B8C5D1', // Azul cielo pálido
  
  // Beige claro (forma derecha del logo)
  secondary: '#E8D5C4', // Beige tostado suave
  
  // Colores complementarios
  primaryDark: '#9BA8B4', // Versión más oscura del azul
  secondaryDark: '#D4C1B0', // Versión más oscura del beige
  
  // Colores de texto
  textPrimary: '#2C3E50', // Negro suave para texto principal
  textSecondary: '#7F8C8D', // Gris para texto secundario
  textLight: '#FFFFFF', // Blanco para texto sobre fondos oscuros
  
  // Colores de estado
  success: '#27AE60', // Verde para éxito
  warning: '#F39C12', // Naranja para advertencias
  error: '#E74C3C', // Rojo para errores
  
  // Colores de fondo
  background: '#F8F9FA', // Fondo principal muy claro
  surface: '#FFFFFF', // Superficies (tarjetas, modales)
  surfaceSecondary: '#F1F3F4', // Superficies secundarias
  
  // Colores de borde
  border: '#E1E8ED', // Bordes sutiles
  borderDark: '#BDC3C7', // Bordes más visibles
};

// Gradientes inspirados en el logo
export const FODEM_GRADIENTS = {
  primary: `linear-gradient(135deg, ${FODEM_COLORS.primary} 0%, ${FODEM_COLORS.primaryDark} 100%)`,
  secondary: `linear-gradient(135deg, ${FODEM_COLORS.secondary} 0%, ${FODEM_COLORS.secondaryDark} 100%)`,
  logo: `linear-gradient(135deg, ${FODEM_COLORS.primary} 0%, ${FODEM_COLORS.secondary} 100%)`,
}; 