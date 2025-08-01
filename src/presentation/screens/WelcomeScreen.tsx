import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  TextInput, 
  ScrollView,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { HouseholdService } from '../../shared/services/householdService';
import { FodemLogo } from '../components/FodemLogo';
import { IconSelector } from '../components/IconSelector';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useAuth } from '../../shared/contexts/AuthContext';
import { getShadowStyle } from '../../shared/utils/styles';

export function WelcomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [showIconSelector, setShowIconSelector] = useState(false);
  
  // Formulario para crear hogar
  const [householdName, setHouseholdName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏠');
  
  // Formulario para unirse a hogar
  const [invitationCode, setInvitationCode] = useState('');
  
  const router = useRouter();

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para tu hogar');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await HouseholdService.createHousehold({
        name: householdName.trim(),
        icon: selectedIcon,
      });

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error creando hogar:', error);
      Alert.alert('Error', 'No se pudo crear el hogar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!invitationCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de invitación');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await HouseholdService.joinHousehold({
        invitation_code: invitationCode.trim(),
      });

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error joining household:', error);
      Alert.alert('Error', 'No se pudo unir al hogar. Verifica el código e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <FodemLogo size="large" showSubtitle={true} />
          
          <Text style={styles.title}>
            ¡Bienvenido a Mi Despensa!
          </Text>
          
          <Text style={styles.subtitle}>
            {user?.user_metadata?.full_name || 'Usuario'}, necesitas configurar un hogar para comenzar a gestionar tu inventario
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'create' && styles.activeTab
              ]}
              onPress={() => setActiveTab('create')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'create' && styles.activeTabText
              ]}>
                🏠 Crear Hogar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'join' && styles.activeTab
              ]}
              onPress={() => setActiveTab('join')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'join' && styles.activeTabText
              ]}>
                🔗 Unirse
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido del tab activo */}
        {activeTab === 'create' ? (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Crear Nuevo Hogar</Text>
              <Text style={styles.formSubtitle}>
                Crea tu propio hogar y comienza a gestionar el inventario de tu despensa
              </Text>
            </View>

            {/* Selección de icono */}
            <View style={styles.iconSection}>
              <Text style={styles.label}>Icono del Hogar</Text>
              <TouchableOpacity
                style={styles.iconSelector}
                onPress={() => setShowIconSelector(true)}
              >
                <Text style={styles.selectedIcon}>{selectedIcon}</Text>
                <Text style={styles.iconSelectorText}>Cambiar icono</Text>
              </TouchableOpacity>
            </View>

            {/* Nombre del hogar */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Nombre del Hogar</Text>
              <TextInput
                style={[
                  styles.input,
                  !householdName.trim() && styles.inputError
                ]}
                placeholder="Ej: Mi Casa, Departamento, etc."
                placeholderTextColor={FODEM_COLORS.textSecondary}
                value={householdName}
                onChangeText={setHouseholdName}
                autoCapitalize="words"
              />
            </View>

            {/* Botón crear */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!householdName.trim() || loading) && styles.buttonDisabled
              ]}
              onPress={handleCreateHousehold}
              disabled={loading || !householdName.trim()}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creando...' : 'Crear Hogar'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Unirse a un Hogar</Text>
              <Text style={styles.formSubtitle}>
                Únete a un hogar existente usando el código de invitación que te compartieron
              </Text>
            </View>

            {/* Código de invitación */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Código de Invitación</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.codeInput,
                  !invitationCode.trim() && styles.inputError
                ]}
                placeholder="XXXX-XXXX-XXXX"
                placeholderTextColor={FODEM_COLORS.textSecondary}
                value={invitationCode}
                onChangeText={setInvitationCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Botón unirse */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                (!invitationCode.trim() || loading) && styles.buttonDisabled
              ]}
              onPress={handleJoinHousehold}
              disabled={loading || !invitationCode.trim()}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Uniéndose...' : 'Unirse al Hogar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>¿Qué es un hogar?</Text>
          <Text style={styles.infoText}>
            Un hogar es un espacio compartido donde puedes gestionar el inventario de productos junto con otros miembros de tu familia o casa. Puedes crear tu propio hogar o unirte a uno existente usando un código de invitación.
          </Text>
        </View>
      </View>

      {/* Modal de selección de iconos */}
      <ErrorBoundary>
        <IconSelector
          visible={showIconSelector}
          onClose={() => setShowIconSelector(false)}
          onSelectIcon={handleIconSelect}
          selectedIcon={selectedIcon}
        />
      </ErrorBoundary>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FODEM_COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: FODEM_COLORS.textPrimary,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: FODEM_COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  tabContainer: {
    marginBottom: 24,
  },
  tabBackground: {
    backgroundColor: FODEM_COLORS.surface,
    borderRadius: 16,
    padding: 4,
    ...getShadowStyle(),
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: FODEM_COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: FODEM_COLORS.textPrimary,
  },
  activeTabText: {
    color: FODEM_COLORS.textLight,
  },
  formContainer: {
    backgroundColor: FODEM_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...getShadowStyle(),
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: FODEM_COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: FODEM_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: FODEM_COLORS.textPrimary,
    marginBottom: 8,
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FODEM_COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: FODEM_COLORS.border,
  },
  selectedIcon: {
    fontSize: 24,
  },
  iconSelectorText: {
    fontSize: 14,
    color: FODEM_COLORS.textSecondary,
  },
  inputSection: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: FODEM_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: FODEM_COLORS.textPrimary,
    backgroundColor: FODEM_COLORS.background,
  },
  inputError: {
    borderColor: FODEM_COLORS.error,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: FODEM_COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: FODEM_COLORS.textLight,
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: FODEM_COLORS.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FODEM_COLORS.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: FODEM_COLORS.textPrimary,
    lineHeight: 20,
  },
}); 