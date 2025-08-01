import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { getShadowStyle } from '../../src/shared/utils/styles';
import { Icon } from '../../src/presentation/components/Icon';
import { IconSelector } from '../../src/presentation/components/IconSelector';

import { useAuth } from '../../src/shared/contexts/AuthContext';
import { useHousehold } from '../../src/shared/contexts/HouseholdContext';
import { useState, useEffect, useCallback } from 'react';
import { HouseholdService } from '../../src/shared/services/householdService';
import { supabase } from '../../src/shared/config/supabase';

interface HouseholdMember {
  id: string;
  user_id: string;
  household_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user_profiles?: {
    full_name: string | null;
    username: string | null;
    email?: string | null;
  } | null;
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
  const { 
    currentHousehold, 
    userHouseholds, 
    loading: householdsLoading,
    setCurrentHousehold,
    refreshHouseholds 
  } = useHousehold();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<any>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>([]);
  const [householdInvitations, setHouseholdInvitations] = useState<HouseholdInvitation[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showCreateHouseholdModal, setShowCreateHouseholdModal] = useState(false);
  const [showEditHouseholdModal, setShowEditHouseholdModal] = useState(false);
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [currentInvitation, setCurrentInvitation] = useState<HouseholdInvitation | null>(null);
  const [invitationCountdown, setInvitationCountdown] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const [newHousehold, setNewHousehold] = useState({
    name: '',
    icon: '🏠',
  });

  useEffect(() => {
    // Solo actualizar si no está cargando y hay un currentHousehold
    if (!householdsLoading) {
      if (currentHousehold) {
        setSelectedHousehold(currentHousehold);
        loadHouseholdDetails();
      } else {
        // Solo limpiar si realmente no hay hogares (no cuando está cargando)
        setSelectedHousehold(null);
        setHouseholdMembers([]);
        setHouseholdInvitations([]);
      }
    }
  }, [currentHousehold, householdsLoading]);

  // Effect para manejar el countdown de la invitación
  useEffect(() => {
    if (currentInvitation) {
      const updateCountdown = () => {
        const remaining = getTimeRemaining(currentInvitation.expires_at);
        setInvitationCountdown(remaining);
        
        if (remaining <= 0) {
          setCurrentInvitation(null);
          setShowInvitationModal(false);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [currentInvitation]);

  // Recargar datos cuando la página vuelva a estar en foco
  useFocusEffect(
    useCallback(() => {
      if (currentHousehold && !householdsLoading) {
        loadHouseholdDetails();
      }
    }, [currentHousehold, householdsLoading])
  );

  // Recargar hogares cuando se regresa a esta página
  useFocusEffect(
    useCallback(() => {
      refreshHouseholds();
    }, [])
  );

  // El contexto ya maneja la carga de hogares automáticamente

  const loadHouseholdDetails = async () => {
    if (!selectedHousehold) return;

    try {
      setMembersLoading(true);
      console.log('Cargando detalles del hogar:', selectedHousehold.id);
      
      // Cargar miembros del hogar con información del perfil de usuario en una sola consulta
      const { data: membersData, error: membersError } = await supabase
        .from('household_members')
        .select(`
          *,
          user_profiles (
            full_name,
            username
          )
        `)
        .eq('household_id', selectedHousehold.id);

      if (!membersError && membersData) {
        console.log('Miembros cargados:', membersData);
        setHouseholdMembers(membersData);
      } else if (membersError) {
        console.error('Error cargando miembros:', membersError);
        // Fallback: cargar solo miembros básicos si falla el join
        const { data: basicMembersData, error: basicMembersError } = await supabase
          .from('household_members')
          .select('*')
          .eq('household_id', selectedHousehold.id);
        
        if (!basicMembersError && basicMembersData) {
          console.log('Miembros básicos cargados:', basicMembersData);
          setHouseholdMembers(basicMembersData);
        }
      }

      // Cargar invitaciones activas
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', selectedHousehold.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (!invitationsError && invitationsData) {
        console.log('Invitaciones cargadas:', invitationsData);
        setHouseholdInvitations(invitationsData);
      }
    } catch (error) {
      console.error('Error loading household details:', error);
    } finally {
      setMembersLoading(false);
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
        refreshHouseholds(); // Recargar la lista usando el contexto
        Alert.alert('Éxito', 'Hogar creado correctamente');
      }
    } catch (error) {
      console.error('Error creating household:', error);
      Alert.alert('Error', 'No se pudo crear el hogar');
    }
  };

  // Función para verificar si hay una invitación activa del usuario actual
  const getCurrentUserActiveInvitation = () => {
    if (!selectedHousehold || !user) return null;
    
    const now = new Date();
    return householdInvitations.find(invitation => 
      invitation.invited_by === user.id && 
      new Date(invitation.expires_at) > now
    ) || null;
  };

  // Función para calcular el tiempo restante de una invitación
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const remaining = Math.max(0, expires - now);
    return Math.floor(remaining / 1000); // segundos restantes
  };

  // Función para formatear el tiempo restante
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const generateInvitationCode = async () => {
    if (!selectedHousehold || !user) return;

    try {
      // Verificar en la base de datos si ya existe una invitación activa del usuario actual
      const { data: existingInvitations, error: checkError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('household_id', selectedHousehold.id)
        .eq('invited_by', user.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) {
        console.error('Error checking existing invitations:', checkError);
        Alert.alert('Error', 'No se pudo verificar invitaciones existentes');
        return;
      }

      // Si ya existe una invitación activa, mostrarla
      if (existingInvitations && existingInvitations.length > 0) {
        setCurrentInvitation(existingInvitations[0]);
        setShowInvitationModal(true);
        return;
      }

      // No existe invitación activa, crear una nueva
      const invitationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('household_invitations')
        .insert({
          household_id: selectedHousehold.id,
          invited_by: user.id,
          role: 'member',
          token: invitationCode, // Campo requerido
          invitation_code: invitationCode,
          expires_at: new Date(Date.now() + 40 * 60 * 1000).toISOString(), // 40 minutos
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        Alert.alert('Error', 'No se pudo generar el código de invitación');
        return;
      }

      if (data) {
        setCurrentInvitation(data);
        loadHouseholdDetails(); // Recargar invitaciones
        setShowInvitationModal(true);
      }
    } catch (error) {
      console.error('Error generating invitation:', error);
      Alert.alert('Error', 'No se pudo generar el código de invitación');
    }
  };

  // Función para unirse con código
  const joinWithCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa un código de invitación');
      return;
    }

    try {
      // Buscar la invitación por código
      const { data: invitation, error: invitationError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invitation_code', joinCode.trim().toUpperCase())
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        Alert.alert('Error', 'Código de invitación inválido o expirado');
        return;
      }

      // Verificar que el usuario no esté ya en el hogar
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', invitation.household_id)
        .eq('user_id', user?.id)
        .single();

      if (existingMember) {
        Alert.alert('Error', 'Ya eres miembro de este hogar');
        return;
      }

      // Unirse al hogar
      const { error: joinError } = await supabase
        .from('household_members')
        .insert({
          household_id: invitation.household_id,
          user_id: user?.id,
          role: invitation.role,
        });

      if (joinError) {
        Alert.alert('Error', 'No se pudo unir al hogar');
        return;
      }

      // Marcar la invitación como aceptada
      await supabase
        .from('household_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      Alert.alert('Éxito', 'Te has unido al hogar correctamente');
      setShowJoinCodeModal(false);
      setJoinCode('');
      refreshHouseholds(); // Recargar hogares del usuario
    } catch (error) {
      console.error('Error joining household:', error);
      Alert.alert('Error', 'No se pudo unir al hogar');
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
    setShowJoinCodeModal(true);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Propietario';
      case 'admin': return 'Administrador';
      case 'member': return 'Miembro';
      default: return role;
    }
  };

  const getMemberDisplayName = (member: HouseholdMember) => {
    // Si tiene perfil con nombre completo, usarlo
    if (member.user_profiles?.full_name) {
      return member.user_profiles.full_name;
    }
    
    // Si tiene username, usarlo
    if (member.user_profiles?.username) {
      return member.user_profiles.username;
    }
    
    // Si es el usuario actual, mostrar "Tú"
    if (member.user_id === user?.id) {
      return 'Tú';
    }
    
    // Fallback: mostrar ID truncado
    return `Usuario ${member.user_id.slice(0, 8)}`;
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
    // Cargar los datos actuales del hogar en el formulario
    setNewHousehold({
      name: selectedHousehold?.name || '',
      icon: selectedHousehold?.description || '🏠', // El icono viene de description
    });
    setShowEditHouseholdModal(true);
  };

  const handleUpdateHousehold = async () => {
    if (!selectedHousehold || !newHousehold.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el hogar');
      return;
    }

    try {
      const { error } = await supabase
        .from('households')
        .update({
          name: newHousehold.name,
          description: newHousehold.icon, // El icono se guarda en description
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedHousehold.id);

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el hogar');
        return;
      }

      Alert.alert('Éxito', 'Hogar actualizado correctamente');
      setShowEditHouseholdModal(false);
      refreshHouseholds(); // Recargar la lista usando el contexto
    } catch (error) {
      console.error('Error updating household:', error);
      Alert.alert('Error', 'No se pudo actualizar el hogar');
    }
  };

  const handleDeleteHousehold = () => {
    if (!isOwner()) {
      Alert.alert('Error', 'Solo el propietario puede eliminar el hogar');
      return;
    }

    setShowDeleteModal(true);
  };

  const confirmDeleteHousehold = async () => {
    if (!selectedHousehold) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await HouseholdService.deleteHousehold(selectedHousehold.id);
      if (error) {
        Alert.alert('Error', error);
        setDeleteLoading(false);
        setShowDeleteModal(false);
        return;
      }
      
      Alert.alert('Éxito', 'Hogar eliminado correctamente');
      
      // Limpiar estado local inmediatamente
      setSelectedHousehold(null);
      setHouseholdMembers([]);
      setHouseholdInvitations([]);
      
      // Recargar lista del contexto
      await refreshHouseholds();
      
      setShowDeleteModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el hogar');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLeaveHousehold = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveHousehold = async () => {
    if (!selectedHousehold) return;
    
    setLeaveLoading(true);
    try {
      const { error } = await HouseholdService.leaveHousehold(selectedHousehold.id);
      if (error) {
        Alert.alert('Error', error);
        setLeaveLoading(false);
        setShowLeaveModal(false);
        return;
      }
      
      Alert.alert('Éxito', 'Has salido del hogar correctamente');
      
      // Limpiar estado local inmediatamente
      setSelectedHousehold(null);
      setHouseholdMembers([]);
      setHouseholdInvitations([]);
      
      // Recargar lista del contexto
      await refreshHouseholds();
      
      setShowLeaveModal(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo salir del hogar');
    } finally {
      setLeaveLoading(false);
    }
  };

  if (householdsLoading) {
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
                  
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: FODEM_COLORS.background,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: FODEM_COLORS.border,
                        opacity: membersLoading ? 0.6 : 1,
                      }}
                      onPress={loadHouseholdDetails}
                      disabled={membersLoading}
                    >
                      <Text style={{
                        color: FODEM_COLORS.textPrimary,
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        {membersLoading ? 'Actualizando...' : 'Actualizar'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: FODEM_COLORS.secondary,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                      onPress={generateInvitationCode}
                    >
                      <Text style={{
                        color: FODEM_COLORS.textPrimary,
                        fontSize: 14,
                        fontWeight: '600',
                      }}>
                        Generar Código
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {membersLoading ? (
                  <View style={{
                    alignItems: 'center',
                    paddingVertical: 20,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      color: FODEM_COLORS.textSecondary,
                      textAlign: 'center',
                    }}>
                      Cargando miembros...
                    </Text>
                  </View>
                ) : householdMembers.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {householdMembers.map((member) => (
                      <View key={member.id} style={{
                        backgroundColor: member.user_id === user?.id ? FODEM_COLORS.primary + '20' : FODEM_COLORS.background,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: member.user_id === user?.id ? FODEM_COLORS.primary : FODEM_COLORS.border,
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{
                                fontSize: 14,
                                fontWeight: '500',
                                color: FODEM_COLORS.textPrimary,
                              }}>
                                {getMemberDisplayName(member)}
                              </Text>
                              {member.user_id === user?.id && (
                                <View style={{
                                  backgroundColor: FODEM_COLORS.primary,
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 8,
                                }}>
                                  <Text style={{
                                    fontSize: 10,
                                    fontWeight: '600',
                                    color: FODEM_COLORS.textLight,
                                  }}>
                                    TÚ
                                  </Text>
                                </View>
                              )}
                            </View>
                            {member.user_profiles?.email && (
                              <Text style={{
                                fontSize: 12,
                                color: FODEM_COLORS.textSecondary,
                                marginTop: 2,
                              }}>
                                {member.user_profiles.email}
                              </Text>
                            )}
                          </View>
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

                        {/* Invitaciones Activas - Solo para debugging en desarrollo */}
          {__DEV__ && householdInvitations.length > 0 && (
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
                  Invitaciones Activas ({householdInvitations.length}) [DEBUG]
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

      {/* Modal Editar Hogar */}
      <Modal
        visible={showEditHouseholdModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditHouseholdModal(false)}
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
              Editar Hogar
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
                onPress={() => setShowEditHouseholdModal(false)}
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
                onPress={handleUpdateHousehold}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Actualizar
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
              Código de Invitación
            </Text>
            
            {currentInvitation && (
              <>
                <View style={{
                  backgroundColor: FODEM_COLORS.background,
                  padding: 20,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <Text style={{
                    fontSize: 12,
                    color: FODEM_COLORS.textSecondary,
                    marginBottom: 8,
                  }}>
                    Código de invitación para "{selectedHousehold?.name}"
                  </Text>
                  
                  <Text style={{
                    fontSize: 32,
                    fontWeight: '700',
                    color: FODEM_COLORS.primary,
                    letterSpacing: 4,
                    marginBottom: 8,
                  }}>
                    {currentInvitation.invitation_code}
                  </Text>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <Icon name="clock" size={16} color={FODEM_COLORS.textSecondary} />
                    <Text style={{
                      fontSize: 14,
                      color: FODEM_COLORS.textSecondary,
                      fontWeight: '500',
                    }}>
                      Expira en: {formatTimeRemaining(invitationCountdown)}
                    </Text>
                  </View>
                </View>

                <View style={{
                  backgroundColor: FODEM_COLORS.background,
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: FODEM_COLORS.textPrimary,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}>
                    📋 Instrucciones:
                  </Text>
                  <Text style={{
                    fontSize: 13,
                    color: FODEM_COLORS.textSecondary,
                    lineHeight: 18,
                  }}>
                    1. Comparte este código con la persona que quieres invitar{'\n'}
                    2. La persona debe ir a "Unirse a un Hogar" en su perfil{'\n'}
                    3. Ingresar el código y confirmar{'\n'}
                    4. El código expira en 40 minutos por seguridad
                  </Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: FODEM_COLORS.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setShowInvitationModal(false)}
            >
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 16,
                fontWeight: '600',
              }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Ingresar Código de Invitación */}
      <Modal
        visible={showJoinCodeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowJoinCodeModal(false)}
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
              Unirse con Código
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 20,
            }}>
              Ingresa el código de invitación que recibiste para unirte a un hogar.
            </Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: FODEM_COLORS.textPrimary,
                marginBottom: 8,
              }}>
                Código de invitación
              </Text>
              <TextInput
                style={{
                  backgroundColor: FODEM_COLORS.background,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: FODEM_COLORS.border,
                  color: FODEM_COLORS.textPrimary,
                  fontSize: 16,
                  textAlign: 'center',
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                }}
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                placeholder="EJ: ABC123"
                placeholderTextColor={FODEM_COLORS.textSecondary}
                maxLength={6}
                autoCapitalize="characters"
              />
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
                onPress={() => {
                  setShowJoinCodeModal(false);
                  setJoinCode('');
                }}
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
                onPress={joinWithCode}
              >
                <Text style={{
                  color: FODEM_COLORS.textLight,
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Unirse
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.background,
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Eliminar Hogar
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22,
            }}>
              ¿Estás seguro de que quieres eliminar "{selectedHousehold?.name}"?{'\n\n'}Esta acción no se puede deshacer.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
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
                  backgroundColor: '#dc3545',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={confirmDeleteHousehold}
                disabled={deleteLoading}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmación de Salir */}
      <Modal
        visible={showLeaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: FODEM_COLORS.background,
            borderRadius: 12,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Salir del Hogar
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 22,
            }}>
              ¿Estás seguro de que quieres salir de "{selectedHousehold?.name}"?
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: FODEM_COLORS.secondary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => setShowLeaveModal(false)}
                disabled={leaveLoading}
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
                  backgroundColor: '#dc3545',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={confirmLeaveHousehold}
                disabled={leaveLoading}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  {leaveLoading ? 'Saliendo...' : 'Salir'}
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