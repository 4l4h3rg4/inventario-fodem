import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { FodemLogo } from '../src/presentation/components/FodemLogo';
import { useAuth } from '../src/shared/contexts/AuthContext';
import { useAuthNavigation } from '../src/shared/hooks/useAuthNavigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Usar el hook de navegación
  useAuthNavigation();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: FODEM_COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <FodemLogo size="large" showSubtitle={true} />
        <Text style={{ fontSize: 18, color: FODEM_COLORS.textSecondary, marginTop: 20, textAlign: 'center' }}>
          Cargando...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: FODEM_COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <FodemLogo size="large" showSubtitle={true} />
        <Text style={{ fontSize: 18, color: FODEM_COLORS.textSecondary, marginTop: 20, marginBottom: 40, textAlign: 'center' }}>
          Bienvenido a Mi Despensa
        </Text>
        <View style={{ gap: 16, width: '100%', maxWidth: 300 }}>
          <TouchableOpacity onPress={() => router.push('/auth')} style={{ backgroundColor: FODEM_COLORS.primary, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: FODEM_COLORS.textLight, fontSize: 18, fontWeight: '600' }}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth?mode=register')} style={{ backgroundColor: 'transparent', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: FODEM_COLORS.primary, alignItems: 'center' }}>
            <Text style={{ color: FODEM_COLORS.primary, fontSize: 18, fontWeight: '600' }}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Si está autenticado, mostrar loading mientras se verifica la navegación
  return (
    <View style={{ flex: 1, backgroundColor: FODEM_COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <FodemLogo size="large" showSubtitle={true} />
      <Text style={{ fontSize: 18, color: FODEM_COLORS.textSecondary, marginTop: 20, textAlign: 'center' }}>
        Verificando configuración...
      </Text>
    </View>
  );
} 