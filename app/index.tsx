import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { FodemLogo } from '../src/presentation/components/FodemLogo';

export default function HomePage() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: FODEM_COLORS.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}>
      <FodemLogo size="large" showSubtitle={true} />
      
      <Text style={{
        fontSize: 18,
        color: FODEM_COLORS.textSecondary,
        marginTop: 20,
        marginBottom: 40,
        textAlign: 'center',
      }}>
        Bienvenido a Mi Despensa
      </Text>

      <Link href="/(tabs)" asChild>
        <TouchableOpacity style={{
          backgroundColor: FODEM_COLORS.primary,
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
          <Text style={{
            color: FODEM_COLORS.textLight,
            fontSize: 18,
            fontWeight: '600',
          }}>
            Continuar
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
} 