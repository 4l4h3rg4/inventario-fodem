// Logger inteligente para desarrollo vs producción
const isDevelopment = __DEV__ || process.env.NODE_ENV === 'development';

export const logger = {
  // Solo en desarrollo
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Solo en desarrollo
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  // Solo en desarrollo
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  // Siempre (errores críticos)
  error: (...args: any[]) => {
    console.error(...args);
  },

  // Solo en desarrollo para debugging
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
};