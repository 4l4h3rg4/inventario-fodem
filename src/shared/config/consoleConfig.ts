import { LogBox } from 'react-native';

// Configuración para suprimir advertencias específicas en desarrollo
export const configureConsoleWarnings = () => {
             // Suprimir advertencias de deprecación de React Native Web
           LogBox.ignoreLogs([
             // Advertencias de sombras deprecadas
             '"shadow*" style props are deprecated. Use "boxShadow".',
             'shadow*',
             
             // Advertencias de pointerEvents deprecadas
             'props.pointerEvents is deprecated. Use style.pointerEvents',
             'pointerEvents',
             
             // Otras advertencias comunes de React Native Web
             'ViewPropTypes will be removed from React Native',
             'AsyncStorage has been extracted from react-native',
             
             // Advertencias de aria-hidden (accesibilidad)
             'Blocked aria-hidden on an element because its descendant retained focus',
             
             // Require cycles (común en React)
             'Require cycle:',
             
             // Errores 406 de user_profiles (ya no deberían ocurrir, pero por si acaso)
             '406 (Not Acceptable)',
             
             // Errores 400 de relaciones (ya no deberían ocurrir)
             '400 (Bad Request)',
             'Could not find a relationship',
           ]);

  // Solo en desarrollo mostramos configuración
  if (__DEV__) {
    // Mensaje minimizado
  }
};

// Función para limpiar logs en producción
export const cleanProductionLogs = () => {
  if (!__DEV__) {
    // En producción, suprimir logs de desarrollo para mejor rendimiento
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
  }
}; 