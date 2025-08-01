import { Stack } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { AuthProvider } from '../src/shared/contexts/AuthContext';
import { HouseholdProvider } from '../src/shared/contexts/HouseholdContext';
import { Head } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>Inventario FODEM - Gestión de Inventario para Hogares</title>
        <meta name="description" content="Aplicación de gestión de inventario para hogares. Controla el stock de productos, gestiona hogares y mantén tu inventario organizado." />
        <meta name="keywords" content="inventario, hogar, gestión, stock, productos, fodem" />
        <meta name="author" content="FODEM" />
        <meta name="language" content="es" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Inventario FODEM" />
        <meta property="og:description" content="Aplicación de gestión de inventario para hogares" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
        <link rel="icon" href="/assets/logo_sin_fondo.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://tu-dominio.com" />
      </Head>
      <AuthProvider>
        <HouseholdProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: FODEM_COLORS.background,
              },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" options={{ presentation: 'modal' }} />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </HouseholdProvider>
      </AuthProvider>
    </>
  );
} 