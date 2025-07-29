import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { Platform } from 'react-native';
import { useState } from 'react';
import { FodemLogo } from '../../src/presentation/components/FodemLogo';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { HouseholdSelector } from '../../src/presentation/components/HouseholdSelector';

export default function InventoryScreen() {
  const [showHouseholdSelector, setShowHouseholdSelector] = useState(false);

  // Datos de ejemplo
  const currentHousehold = {
    id: '1',
    name: 'Mi Casa',
    isActive: true,
    memberCount: 3,
    productCount: 15,
  };

  const households = [
    currentHousehold,
    {
      id: '2',
      name: 'Casa de Verano',
      isActive: false,
      memberCount: 2,
      productCount: 8,
    },
  ];

  const handleSelectHousehold = (householdId: string) => {
    console.log('Hogar seleccionado:', householdId);
    setShowHouseholdSelector(false);
  };

  const handleCreateNewHousehold = () => {
    console.log('Crear nuevo hogar');
    setShowHouseholdSelector(false);
  };

  const handleSettings = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <ScrollView style={{
      flex: 1,
      backgroundColor: FODEM_COLORS.background,
    }}>
      <View style={{
        padding: 20,
        paddingTop: Platform.OS === 'web' ? 20 : 60,
      }}>
        {/* Header con logo */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 40,
        }}>
          <FodemLogo size="small" showSubtitle={false} />

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}>
            <TouchableOpacity
              style={{
                backgroundColor: FODEM_COLORS.secondary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
              onPress={() => setShowHouseholdSelector(true)}
            >
              <Icon name="household" size={16} color={FODEM_COLORS.textPrimary} />
              <Text style={{
                color: FODEM_COLORS.textPrimary,
                fontSize: 14,
                fontWeight: '500',
              }}>
                {currentHousehold.name}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: FODEM_COLORS.surface,
              }}
              onPress={() => setShowHouseholdSelector(true)}
            >
              <Icon name="household" size={20} color={FODEM_COLORS.textPrimary} />
            </TouchableOpacity>

            {/* Solo mostrar botón de ajustes en web */}
            {Platform.OS === 'web' && (
              <TouchableOpacity
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: FODEM_COLORS.surface,
                }}
                onPress={handleSettings}
              >
                <Icon name="settings" size={20} color={FODEM_COLORS.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido principal */}
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 32,
            fontWeight: 'bold',
            marginBottom: 16,
            color: FODEM_COLORS.textPrimary,
            textAlign: 'center',
          }}>
            Mi Despensa
          </Text>

          <Text style={{
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 40,
            color: FODEM_COLORS.textSecondary,
            lineHeight: 24,
          }}>
            Gestiona el stock de productos en tu despensa
          </Text>

          <Link href="/(tabs)" asChild>
            <TouchableOpacity style={{
              backgroundColor: FODEM_COLORS.textPrimary,
              paddingHorizontal: 24,
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 20,
              minWidth: 200,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}>
              <Icon name="add" size={18} color={FODEM_COLORS.textLight} />
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 18,
                fontWeight: '600',
              }}>
                Agregar Producto
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Tarjeta principal */}
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          ...getShadowStyle(),
        }}>
          {/* Tabs */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: FODEM_COLORS.border,
          }}>
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: 2,
              borderBottomColor: FODEM_COLORS.primary,
              marginRight: 24,
            }}>
              <Icon name="inventory" size={16} color={FODEM_COLORS.primary} />
              <Text style={{
                color: FODEM_COLORS.primary,
                fontSize: 16,
                fontWeight: '600',
                marginLeft: 6,
              }}>
                Stock (0)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}>
              <Icon name="shopping" size={16} color={FODEM_COLORS.textSecondary} />
              <Text style={{
                color: FODEM_COLORS.textSecondary,
                fontSize: 16,
                fontWeight: '500',
                marginLeft: 6,
              }}>
                Compras (0)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Estado vacío */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 40,
          }}>
            <Icon name="inventory" size={48} color={FODEM_COLORS.border} />

            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              marginBottom: 8,
              marginTop: 16,
              color: FODEM_COLORS.textPrimary,
              textAlign: 'center',
            }}>
              No tienes productos aún
            </Text>

            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24,
            }}>
              Comienza agregando productos a tu despensa para llevar un control de tu stock.
            </Text>

            <TouchableOpacity style={{
              backgroundColor: FODEM_COLORS.textPrimary,
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              <Icon name="add" size={16} color={FODEM_COLORS.textLight} />
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Agregar Primer Producto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Indicador de plataforma */}
        <Text style={{
          fontSize: 12,
          color: FODEM_COLORS.textSecondary,
          textAlign: 'center',
          marginBottom: 20,
        }}>
          Plataforma: {Platform.OS}
        </Text>

        {/* Modal de selección de hogares */}
        <HouseholdSelector
          visible={showHouseholdSelector}
          onClose={() => setShowHouseholdSelector(false)}
          households={households}
          onSelectHousehold={handleSelectHousehold}
          onCreateNewHousehold={handleCreateNewHousehold}
        />
      </View>
    </ScrollView>
  );
} 