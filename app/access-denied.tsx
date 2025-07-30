import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { FodemLogo } from '../src/presentation/components/FodemLogo';
import { Icon } from '../src/presentation/components/Icon';

export default function AccessDeniedScreen() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: FODEM_COLORS.background, 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: 20 
    }}>
      <FodemLogo size="large" showSubtitle={true} />
      
      <View style={{ 
        backgroundColor: FODEM_COLORS.surface, 
        borderRadius: 16, 
        padding: 24, 
        marginTop: 40, 
        alignItems: 'center',
        maxWidth: 400,
        width: '100%'
      }}>
        <Icon name="warning" size={48} color={FODEM_COLORS.error} />
        
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: FODEM_COLORS.textPrimary, 
          marginTop: 16, 
          marginBottom: 8,
          textAlign: 'center'
        }}>
          Acceso Denegado
        </Text>
        
        <Text style={{ 
          fontSize: 16, 
          color: FODEM_COLORS.textSecondary, 
          textAlign: 'center', 
          lineHeight: 24,
          marginBottom: 24
        }}>
          No tienes acceso a esta aplicación. Por favor, contacta al administrador para obtener acceso.
        </Text>
        
        <TouchableOpacity 
          onPress={() => router.replace('/')}
          style={{ 
            backgroundColor: FODEM_COLORS.primary, 
            paddingHorizontal: 24, 
            paddingVertical: 12, 
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8
          }}
        >
          <Icon name="back" size={16} color={FODEM_COLORS.textLight} />
          <Text style={{ 
            color: FODEM_COLORS.textLight, 
            fontSize: 16, 
            fontWeight: '600' 
          }}>
            Volver al Inicio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 