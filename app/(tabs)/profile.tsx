import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { IconSelector } from '../../src/presentation/components/IconSelector';

import { useAuth } from '../../src/shared/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import { HouseholdService } from '../../src/shared/services/householdService';
import { supabase } from '../../src/shared/config/supabase';

interface HouseholdMember {
  id: string;
  user_id: string;
  household_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

interface HouseholdInvitation {
  id: string;
  household_id: string;
  invited_by: string;
  role: string;
  invitation_code: string;
  expires_at: string;
  created_at: string;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userHouseholds, setUserHouseholds] = useState<any[]>([]);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [householdInvitations, setHouseholdInvitations] = useState<HouseholdInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateHouseholdModal, setShowCreateHouseholdModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);

  const [newHousehold, setNewHousehold] = useState({
    name: '',
    icon: '🏠',
  });

  useEffect(() => {
    loadUserHouseholds();
  }, []);

  useEffect(() => {
    if (selectedHousehold) {
      loadHouseholdDetails();
    }
  }, [selectedHousehold]);

  // Recargar hogares cuando se regresa a esta página
  useFocusEffect(
    useCallback(() => {
      loadUserHouseholds();
    }, [])
  );

  const loadUserHouseholds = async () => {
    try {
      setLoading(true);
      const { data, error } = await HouseholdService.getUserHouseholds();
      
      if (error) {
        console.error('Error loading households:', error);
        return;
      }

      setUserHouseholds(data || []);
      
      // Mantener la casa seleccionada si ya existe, o seleccionar la primera
      if (data && data.length > 0) {
        if (selectedHousehold) {
          // Buscar si la casa seleccionada sigue existiendo
          const currentSelected = data.find(h => h.id === selectedHousehold.id);
          if (currentSelected) {
            setSelectedHousehold(currentSelected);
          } else {
            setSelectedHousehold(data[0]);
          }
        } else {
          setSelectedHousehold(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading households:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHouseholdDetails = async () => {
    if (!selectedHousehold) return;

    try {
      // Cargar miembros del hogar
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', selectedHousehold.id);

      if (!membersError && membersData) {
        setHouseholdMembers(membersData);
      }

      // Cargar invitaciones activas
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', selectedHousehold.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (!invitationsError && invitationsData) {
        setHouseholdInvitations(invitationsData);
      }
    } catch (error) {
      console.error('Error loading household details:', error);
    }
  };

  const handleCreateHousehold = async () => {
    if (!newHousehold.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el hogar');
      return;
    }

    try {
      const { data, error } = await HouseholdService.createHousehold({
        name: newHousehold.name,
        icon: newHousehold.icon,
      });

      if (error) {
        Alert.alert('Error', error);
        return;
      }

      if (data) {
        setShowCreateHouseholdModal(false);
        setNewHousehold({ name: '', icon: '🏠' });
        loadUserHouseholds(); // Recargar la lista
        Alert.alert('Éxito', 'Hogar creado correctamente');
      }
    } catch (error) {
      console.error('Error creating household:', error);
      Alert.alert('Error', 'No se pudo crear el hogar');
    }
  };

  const generateInvitationCode = async () => {
    if (!selectedHousehold) return;

    try {
      const { data, error } = await supabase
        .from('household_invitations')
        .insert({
          household_id: selectedHousehold.id,
          invited_by: user?.id,
          role: 'member',
          invitation_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', 'No se pudo generar el código de invitación');
        return;
      }

      if (data) {
        loadHouseholdDetails(); // Recargar invitaciones
        Alert.alert('Código Generado', `Código: ${data.invitation_code}\n\nComparte este código con quien quieras invitar al hogar.`);
      }
    } catch (error) {
      console.error('Error generating invitation:', error);
      Alert.alert('Error', 'No se pudo generar el código de invitación');
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleSignOut = async () => {
    console.log('Botón de cerrar sesión presionado');
    
    try {
      console.log('Llamando a signOut directamente...');
      setIsSigningOut(true);
      await signOut();
      console.log('signOut completado');
      Alert.alert('Éxito', 'Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleCreateNewHousehold = () => {
    setShowCreateHouseholdModal(true);
  };

  const handleJoinHousehold = () => {
    router.push('/welcome');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'admin': return 'Administrador';
      case 'member': return 'Miembro';
      default: return role;
    }
  };

  const handleIconSelect = (icon: string) => {
    setNewHousehold({ ...newHousehold, icon });
    setShowIconSelector(false);
  };

  // Funciones para gestión de hogar según rol
  const getUserRoleInHousehold = () => {
    if (!selectedHousehold || !user) return null;
    
    const member = householdMembers.find(m => m.user_id === user.id);
    return member?.role || null;
  };

  const isOwnerOrAdmin = () => {
    const role = getUserRoleInHousehold();
    return role === 'owner' || role === 'admin';
  };

  const isOwner = () => {
    const role = getUserRoleInHousehold();
    return role === 'owner';
  };

  const handleEditHousehold = () => {
    // TODO: Implementar edición de hogar
    Alert.alert('Función en desarrollo', 'La edición de hogar estará disponible pronto');
  };

  const handleDeleteHousehold = () => {
    if (!isOwner()) {
      Alert.alert('Error', 'Solo el propietario puede eliminar el hogar');
      return;
    }

    Alert.alert(
      'Eliminar Hogar',
      `¿Estás seguro de que quieres eliminar "${selectedHousehold?.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await HouseholdService.deleteHousehold(selectedHousehold.id);
              if (error) {
                Alert.alert('Error', error);
                return;
              }
              
              Alert.alert('Éxito', 'Hogar eliminado correctamente');
              loadUserHouseholds(); // Recargar lista
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el hogar');
            }
          }
        }
      ]
    );
  };

  const handleLeaveHousehold = () => {
    Alert.alert(
      'Salir del Hogar',
      `¿Estás seguro de que quieres salir de "${selectedHousehold?.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await HouseholdService.leaveHousehold(selectedHousehold.id);
              if (error) {
                Alert.alert('Error', error);
                return;
              }
              
              Alert.alert('Éxito', 'Has salido del hogar correctamente');
              loadUserHouseholds(); // Recargar lista
            } catch (error) {
              Alert.alert('Error', 'No se pudo salir del hogar');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: FODEM_COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          fontSize: 18, 
          color: FODEM_COLORS.textSecondary, 
          textAlign: 'center' 
        }}>
          Cargando...
        </Text>
      </View>
    );
  }

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
          {/* Mis Hogares */}
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="household" size={20} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginLeft: 8,
                }}>
                  Mis Hogares ({userHouseholds.length})
                </Text>
              </View>
              
              <TouchableOpacity
                style={{
                  backgroundColor: FODEM_COLORS.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
                onPress={handleCreateNewHousehold}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  + Nuevo
                </Text>
              </TouchableOpacity>
            </View>

            {userHouseholds.length > 0 ? (
              <View style={{ gap: 12 }}>
                {userHouseholds.map((household) => (
                  <TouchableOpacity
                    key={household.id}
                    style={{
                      backgroundColor: selectedHousehold?.id === household.id ? FODEM_COLORS.primary : FODEM_COLORS.background,
                      padding: 16,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: FODEM_COLORS.border,
                    }}
                    onPress={() => setSelectedHousehold(household)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 16 }}>{household.description}</Text>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: selectedHousehold?.id === household.id ? FODEM_COLORS.textLight : FODEM_COLORS.textPrimary,
                      }}>
                        {household.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
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
                }}>
                  No tienes hogares configurados
                </Text>

                <TouchableOpacity 
                  style={{
                    backgroundColor: FODEM_COLORS.primary,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                  onPress={handleCreateNewHousehold}
                >
                  <Icon name="add" size={16} color={FODEM_COLORS.textLight} />
                  <Text style={{
                    color: FODEM_COLORS.textLight,
                    fontSize: 16,
                    fontWeight: '500',
                  }}>
                    Crear Primer Hogar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Gestión del Hogar Seleccionado */}
          {selectedHousehold && (
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
                <Icon name="settings" size={20} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginLeft: 8,
                }}>
                  Gestión de "{selectedHousehold.name}"
                </Text>
              </View>

              {/* Información del rol */}
              <View style={{
                backgroundColor: FODEM_COLORS.background,
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textSecondary,
                  marginBottom: 4,
                }}>
                  Tu rol:
                </Text>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                }}>
                  {getRoleDisplayName(getUserRoleInHousehold() || 'member')}
                </Text>
              </View>

              {/* Opciones según el rol */}
              {isOwnerOrAdmin() ? (
                <View style={{ gap: 12 }}>
                  {/* Opciones para propietarios y administradores */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: FODEM_COLORS.primary,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={handleEditHousehold}
                  >
                    <Text style={{
                      color: FODEM_COLORS.textLight,
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      Editar Hogar
                    </Text>
                  </TouchableOpacity>

                  {isOwner() && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#E74C3C',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                      onPress={handleDeleteHousehold}
                    >
                      <Text style={{
                        color: FODEM_COLORS.textLight,
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                        Eliminar Hogar
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!isOwner() && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#F39C12',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                      onPress={handleLeaveHousehold}
                    >
                      <Text style={{
                        color: FODEM_COLORS.textLight,
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                        Salir del Hogar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {/* Opciones para miembros regulares */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#F39C12',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={handleLeaveHousehold}
                  >
                    <Text style={{
                      color: FODEM_COLORS.textLight,
                      fontSize: 16,
                      fontWeight: '600',
                    }}>
                      Salir del Hogar
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Detalles del Hogar Seleccionado */}
          {selectedHousehold && (
            <>
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
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="users" size={20} color={FODEM_COLORS.textPrimary} />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: FODEM_COLORS.textPrimary,
                      marginLeft: 8,
                    }}>
                      Miembros ({householdMembers.length})
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: FODEM_COLORS.secondary,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                    onPress={() => setShowInvitationModal(true)}
                  >
                    <Text style={{
                      color: FODEM_COLORS.textPrimary,
                      fontSize: 14,
                      fontWeight: '600',
                    }}>
                      Invitar
                    </Text>
                  </TouchableOpacity>
                </View>

                {householdMembers.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {householdMembers.map((member) => (
                      <View key={member.id} style={{
                        backgroundColor: FODEM_COLORS.background,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: FODEM_COLORS.border,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: FODEM_COLORS.textPrimary,
                          }}>
                            Usuario {member.user_id.slice(0, 8)}
                          </Text>
                          <View style={{
                            backgroundColor: member.role === 'owner' ? FODEM_COLORS.primary : 
                                           member.role === 'admin' ? FODEM_COLORS.secondary : '#6C757D',
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                          }}>
                            <Text style={{
                              fontSize: 12,
                              fontWeight: '500',
                              color: member.role === 'owner' ? FODEM_COLORS.textLight : FODEM_COLORS.textPrimary,
                            }}>
                              {getRoleDisplayName(member.role)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{
                    fontSize: 14,
                    color: FODEM_COLORS.textSecondary,
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}>
                    No hay miembros en este hogar
                  </Text>
                )}
              </View>

              {/* Invitaciones Activas */}
              {householdInvitations.length > 0 && (
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
                    <Icon name="invitation" size={20} color={FODEM_COLORS.textPrimary} />
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: FODEM_COLORS.textPrimary,
                      marginLeft: 8,
                    }}>
                      Invitaciones Activas ({householdInvitations.length})
                    </Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    {householdInvitations.map((invitation) => (
                      <View key={invitation.id} style={{
                        backgroundColor: FODEM_COLORS.background,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: FODEM_COLORS.border,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: FODEM_COLORS.textPrimary,
                          }}>
                            Código: {invitation.invitation_code}
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: FODEM_COLORS.textSecondary,
                          }}>
                            Expira: {new Date(invitation.expires_at).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

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
              <Icon name="join" size={20} color={FODEM_COLORS.textPrimary} />
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
              <Icon name="join" size={48} color={FODEM_COLORS.border} />
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

              <TouchableOpacity 
                style={{
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
                onPress={handleJoinHousehold}
              >
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
                backgroundColor: isSigningOut ? '#6C757D' : '#DC3545',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isSigningOut ? 0.7 : 1,
                ...getShadowStyle(),
              }}
              onPress={() => {
                console.log('TouchableOpacity presionado');
                handleSignOut();
              }}
              disabled={isSigningOut}
            >
              <Text style={{
                color: 'white',
                fontSize: 16,
                fontWeight: '600',
              }}>
                {isSigningOut ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal Crear Hogar */}
      <Modal
        visible={showCreateHouseholdModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateHouseholdModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            ...getShadowStyle(),
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Crear Nuevo Hogar
            </Text>
            
            <View style={{ gap: 16, marginBottom: 20 }}>
              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Nombre del hogar
                </Text>
                <TextInput
                  style={{
                    backgroundColor: FODEM_COLORS.background,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: FODEM_COLORS.border,
                    color: FODEM_COLORS.textPrimary,
                  }}
                  value={newHousehold.name}
                  onChangeText={(text) => setNewHousehold({...newHousehold, name: text})}
                  placeholder="Ej: Casa Principal, Apartamento..."
                  placeholderTextColor={FODEM_COLORS.textSecondary}
                />
              </View>

              <View>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Icono del hogar
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: FODEM_COLORS.background,
                    padding: 16,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: FODEM_COLORS.border,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => setShowIconSelector(true)}
                >
                  <Text style={{ fontSize: 24 }}>{newHousehold.icon}</Text>
                  <Icon name="dropdown" size={16} color={FODEM_COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setShowCreateHouseholdModal(false)}
              >
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={handleCreateHousehold}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Crear
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Generar Invitación */}
      <Modal
        visible={showInvitationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInvitationModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            ...getShadowStyle(),
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              Generar Código de Invitación
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 20,
            }}>
              Genera un código de invitación para que otras personas puedan unirse a tu hogar "{selectedHousehold?.name}".
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setShowInvitationModal(false)}
              >
                <Text style={{
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  generateInvitationCode();
                  setShowInvitationModal(false);
                }}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Generar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IconSelector */}
      <IconSelector
        visible={showIconSelector}
        onClose={() => setShowIconSelector(false)}
        onSelectIcon={handleIconSelect}
        selectedIcon={newHousehold.icon}
      />


    </ScrollView>
  );
} 