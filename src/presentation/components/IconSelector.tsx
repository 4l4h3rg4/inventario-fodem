import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { getShadowStyle } from '../../shared/utils/styles';
import { HOUSEHOLD_ICONS } from '../../shared/services/householdService';

interface IconSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  selectedIcon?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  visible,
  onClose,
  onSelectIcon,
  selectedIcon,
}) => {
  const handleIconSelect = (icon: string) => {
    onSelectIcon(icon);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderRadius: 20,
          padding: 24,
          width: '100%',
          maxWidth: 400,
          maxHeight: '80%',
          ...getShadowStyle(),
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: FODEM_COLORS.textPrimary,
            }}>
              Seleccionar Icono
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 24, color: FODEM_COLORS.textSecondary }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Grid de iconos */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              {HOUSEHOLD_ICONS && HOUSEHOLD_ICONS.length > 0 ? (
                HOUSEHOLD_ICONS.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selectedIcon === icon ? FODEM_COLORS.primary : FODEM_COLORS.border,
                      backgroundColor: selectedIcon === icon ? `${FODEM_COLORS.primary}15` : FODEM_COLORS.background,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => handleIconSelect(icon)}
                  >
                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 40,
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: FODEM_COLORS.textSecondary,
                    textAlign: 'center',
                  }}>
                    No hay iconos disponibles
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botón cancelar */}
          <TouchableOpacity
            style={{
              backgroundColor: FODEM_COLORS.surface,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: FODEM_COLORS.border,
              alignItems: 'center',
              marginTop: 20,
            }}
            onPress={onClose}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '500',
              color: FODEM_COLORS.textPrimary,
            }}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 