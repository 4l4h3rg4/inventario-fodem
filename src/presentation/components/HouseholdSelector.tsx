import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { getShadowStyle } from '../../shared/utils/styles';

interface Household {
  id: string;
  name: string;
  isActive: boolean;
  memberCount: number;
  productCount: number;
}

interface HouseholdSelectorProps {
  visible: boolean;
  onClose: () => void;
  households: Household[];
  onSelectHousehold: (householdId: string) => void;
  onCreateNewHousehold: () => void;
}

export const HouseholdSelector: React.FC<HouseholdSelectorProps> = ({
  visible,
  onClose,
  households,
  onSelectHousehold,
  onCreateNewHousehold,
}) => {
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
        justifyContent: 'flex-end',
      }}>
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          maxHeight: '70%',
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
              Cambiar de Casa
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 24, color: FODEM_COLORS.textSecondary }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de hogares */}
          <ScrollView style={{ marginBottom: 20 }}>
            {households.map((household) => (
              <TouchableOpacity
                key={household.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                  marginBottom: 12,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: household.isActive ? FODEM_COLORS.success : FODEM_COLORS.border,
                  backgroundColor: household.isActive ? `${FODEM_COLORS.success}10` : FODEM_COLORS.surface,
                }}
                onPress={() => onSelectHousehold(household.id)}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: household.isActive ? FODEM_COLORS.success : FODEM_COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 20 }}>👥</Text>
                </View>
                
                <View style={{ flex: 1 }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 4,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: FODEM_COLORS.textPrimary,
                      marginRight: 8,
                    }}>
                      {household.name}
                    </Text>
                    {household.isActive && (
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.success,
                        fontWeight: '500',
                      }}>
                        Activa
                      </Text>
                    )}
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 14, marginRight: 4 }}>👥</Text>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                      }}>
                        {household.memberCount}
                      </Text>
                    </View>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                      <Text style={{ fontSize: 14, marginRight: 4 }}>📦</Text>
                      <Text style={{
                        fontSize: 12,
                        color: FODEM_COLORS.textSecondary,
                      }}>
                        {household.productCount}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {household.isActive && (
                  <Text style={{
                    fontSize: 20,
                    color: FODEM_COLORS.success,
                  }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            
            {/* Crear nuevo hogar */}
            <TouchableOpacity
              style={{
                borderWidth: 2,
                borderColor: FODEM_COLORS.border,
                borderStyle: 'dashed',
                borderRadius: 12,
                padding: 20,
                alignItems: 'center',
                marginTop: 8,
              }}
              onPress={onCreateNewHousehold}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>➕</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginBottom: 4,
              }}>
                Crear Nueva Casa
              </Text>
              <Text style={{
                fontSize: 14,
                color: FODEM_COLORS.textSecondary,
                textAlign: 'center',
              }}>
                Añade un nuevo hogar
              </Text>
            </TouchableOpacity>
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