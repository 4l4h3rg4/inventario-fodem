import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { supabase } from '../../shared/config/supabase';

interface ConnectionStatusProps {
  visible?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ visible = false }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [configStatus, setConfigStatus] = useState<{
    url: boolean;
    key: boolean;
  }>({ url: false, key: false });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Verificar configuración usando import de @env
      const { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } = require('@env');
      
      setConfigStatus({
        url: !!EXPO_PUBLIC_SUPABASE_URL && EXPO_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co',
        key: !!EXPO_PUBLIC_SUPABASE_ANON_KEY && EXPO_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
      });

      // Verificar conexión
      const { data, error } = await supabase.from('households').select('count').limit(1);
      
      if (error) {
        console.log('🔍 Error de conexión:', error.message);
        setIsConnected(false);
      } else {
        console.log('🔍 Conexión exitosa');
        setIsConnected(true);
      }
    } catch (error) {
      console.log('🔍 Error verificando conexión:', error);
      setIsConnected(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de Conexión</Text>
      
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <Text style={styles.label}>URL de Supabase:</Text>
          <View style={[styles.indicator, configStatus.url ? styles.success : styles.error]} />
          <Text style={[styles.status, configStatus.url ? styles.successText : styles.errorText]}>
            {configStatus.url ? 'Configurada' : 'No configurada'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.label}>Clave de Supabase:</Text>
          <View style={[styles.indicator, configStatus.key ? styles.success : styles.error]} />
          <Text style={[styles.status, configStatus.key ? styles.successText : styles.errorText]}>
            {configStatus.key ? 'Configurada' : 'No configurada'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.label}>Conexión:</Text>
          <View style={[styles.indicator, isConnected === null ? styles.warning : (isConnected ? styles.success : styles.error)]} />
          <Text style={[styles.status, isConnected === null ? styles.warningText : (isConnected ? styles.successText : styles.errorText)]}>
            {isConnected === null ? 'Verificando...' : (isConnected ? 'Conectado' : 'Sin conexión')}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={checkConnection}>
        <Text style={styles.buttonText}>Verificar Conexión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: FODEM_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: FODEM_COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: FODEM_COLORS.textPrimary,
    marginBottom: 12,
  },
  statusContainer: {
    gap: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: FODEM_COLORS.textSecondary,
    minWidth: 120,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  success: {
    backgroundColor: FODEM_COLORS.success,
  },
  error: {
    backgroundColor: FODEM_COLORS.error,
  },
  warning: {
    backgroundColor: FODEM_COLORS.warning || '#FFA500',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: FODEM_COLORS.success,
  },
  errorText: {
    color: FODEM_COLORS.error,
  },
  warningText: {
    color: FODEM_COLORS.warning || '#FFA500',
  },
  button: {
    backgroundColor: FODEM_COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: FODEM_COLORS.textLight,
    fontSize: 14,
    fontWeight: '500',
  },
}); 