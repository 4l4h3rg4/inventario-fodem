import { Stack } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { AuthProvider } from '../src/shared/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
} 