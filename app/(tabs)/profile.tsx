import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { useAuth } from '../../src/shared/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
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
        {/* Botón de volver solo en web */}
        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: FODEM_COLORS.surface,
              alignSelf: 'flex-start',
              ...getShadowStyle(),
            }}
            onPress={handleGoBack}
          >
            <Icon name="back" size={16} color={FODEM_COLORS.textPrimary} />
            <Text style={{
              color: FODEM_COLORS.textPrimary,
              fontSize: 16,
              fontWeight: '500',
              marginLeft: 8,
            }}>
              Volver
            </Text>
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: 40,
        }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: FODEM_COLORS.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Icon name="user" size={32} color={FODEM_COLORS.textLight} />
          </View>

          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: FODEM_COLORS.textPrimary,
            marginBottom: 8,
          }}>
            {user?.user_metadata?.full_name || 'Usuario'}
          </Text>

          <Text style={{
            fontSize: 16,
            color: FODEM_COLORS.textSecondary,
          }}>
            {user?.email || 'usuario@ejemplo.com'}
          </Text>
        </View>

        {/* Secciones */}
        <View style={{
          gap: 20,
        }}>
          {/* Miembros del Hogar */}
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            ...getShadowStyle(),
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Icon name="members" size={20} color={FODEM_COLORS.textPrimary} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginLeft: 8,
              }}>
                Miembros del Hogar
              </Text>
            </View>

            <View style={{
              alignItems: 'center',
              paddingVertical: 20,
            }}>
              <Icon name="members" size={48} color={FODEM_COLORS.border} />
              <Text style={{
                fontSize: 16,
                color: FODEM_COLORS.textSecondary,
                textAlign: 'center',
                marginBottom: 16,
                marginTop: 16,
              }}>
                No hay miembros en este hogar
              </Text>

              <TouchableOpacity style={{
                backgroundColor: FODEM_COLORS.surface,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: FODEM_COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <Icon name="invite" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  Invitar Primer Miembro
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Unirse a un Hogar */}
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            ...getShadowStyle(),
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Icon name="household" size={20} color={FODEM_COLORS.textPrimary} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginLeft: 8,
              }}>
                Unirse a un Hogar
              </Text>
            </View>

            <View style={{
              alignItems: 'center',
              paddingVertical: 20,
            }}>
              <Icon name="household" size={48} color={FODEM_COLORS.border} />
              <Text style={{
                fontSize: 16,
                color: FODEM_COLORS.textSecondary,
                textAlign: 'center',
                marginBottom: 16,
                marginTop: 16,
                lineHeight: 24,
              }}>
                ¿Tienes un código de invitación? Únete a otro hogar para colaborar en el inventario.
              </Text>

              <TouchableOpacity style={{
                backgroundColor: FODEM_COLORS.surface,
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: FODEM_COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <Icon name="join" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                  Unirse con Código
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Acciones del Hogar */}
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            ...getShadowStyle(),
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="settings" size={20} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginLeft: 8,
                }}>
                  Acciones del Hogar
                </Text>
              </View>

              <View style={{
                backgroundColor: FODEM_COLORS.textPrimary,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 12,
                  fontWeight: '500',
                }}>
                  Propietario
                </Text>
              </View>
            </View>

            <View style={{
              gap: 12,
            }}>
              <TouchableOpacity style={{
                backgroundColor: FODEM_COLORS.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: FODEM_COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="edit" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '500',
                  marginLeft: 8,
                }}>
                  Cambiar Nombre
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={{
                backgroundColor: FODEM_COLORS.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: FODEM_COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="add" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '500',
                  marginLeft: 8,
                }}>
                  Crear Nuevo Hogar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={{
                backgroundColor: FODEM_COLORS.error,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="delete" size={16} color={FODEM_COLORS.textLight} />
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '500',
                  marginLeft: 8,
                }}>
                  Eliminar Hogar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Administración de Usuario */}
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            ...getShadowStyle(),
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <Icon name="user" size={20} color={FODEM_COLORS.textPrimary} />
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginLeft: 8,
              }}>
                Administración de Usuario
              </Text>
            </View>

            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Icon name="user" size={24} color={FODEM_COLORS.textPrimary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{
                  fontSize: 16,
                  color: FODEM_COLORS.textPrimary,
                  fontWeight: '500',
                }}>
                  {user?.email || 'usuario@ejemplo.com'}
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textSecondary,
                }}>
                  Usuario actual
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={{
                backgroundColor: FODEM_COLORS.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: FODEM_COLORS.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={handleSignOut}
            >
              <Icon name="logout" size={16} color={FODEM_COLORS.textPrimary} />
              <Text style={{
                color: FODEM_COLORS.textPrimary,
                fontSize: 16,
                fontWeight: '500',
                marginLeft: 8,
              }}>
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
} 