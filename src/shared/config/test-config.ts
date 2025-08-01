// Configuración temporal para testing
// Reemplaza estos valores con tus credenciales reales de Supabase

export const TEST_CONFIG = {
  // Ejemplo de configuración - REEMPLAZA CON TUS VALORES REALES
  SUPABASE_URL: 'https://tu-proyecto.supabase.co',
  SUPABASE_ANON_KEY: 'tu-clave-anonima-aqui',
  
  // Para testing sin Supabase real
  USE_MOCK: false,
  MOCK_USER: {
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Usuario de Prueba'
  }
};

// Función para verificar si la configuración está completa
export const isConfigComplete = () => {
  return TEST_CONFIG.SUPABASE_URL !== 'https://tu-proyecto.supabase.co' && 
         TEST_CONFIG.SUPABASE_ANON_KEY !== 'tu-clave-anonima-aqui';
};

// Función para obtener configuración de Supabase
export const getSupabaseConfig = () => {
  if (TEST_CONFIG.USE_MOCK) {
    return {
      url: 'https://mock.supabase.co',
      key: 'mock-key'
    };
  }
  
  return {
    url: TEST_CONFIG.SUPABASE_URL,
    key: TEST_CONFIG.SUPABASE_ANON_KEY
  };
}; 