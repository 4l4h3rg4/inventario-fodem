import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
// Iconos disponibles para los hogares
export const HOUSEHOLD_ICONS = [
  '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩',
  '💒', '⛪', '🕌', '🕍', '🛕', '⛩️', '🕋', '⛺', '🛖', '🏕️', '🏖️', '🏜️', '🏝️', '🏔️', '⛰️', '🌋'
];

export interface Household {
  id: string;
  name: string;
  description?: string; // Campo que contiene el icono
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHouseholdData {
  name: string;
  icon?: string;
}

export interface JoinHouseholdData {
  invitation_code: string;
}

export class HouseholdService {
  static async getUserHouseholds(): Promise<{ data: Household[] | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Paso 1: Obtener membresías del usuario
      const { data: memberships, error: membershipsError } = await supabase
        .from('household_members')
        .select('household_id, role, joined_at')
        .eq('user_id', user.id);

      if (membershipsError) {
        return { data: null, error: 'Error al obtener hogares' };
      }

      if (!memberships || memberships.length === 0) {
        return { data: [], error: null };
      }

      // Paso 2: Obtener información de los hogares
      const householdIds = memberships.map(m => m.household_id);
      const { data: householdsData, error: householdsError } = await supabase
        .from('households')
        .select('id, name, description, created_by, created_at, updated_at')
        .in('id', householdIds);

      if (householdsError) {
        return { data: null, error: 'Error al obtener información de hogares' };
      }

      // Mapear el campo description como icon para compatibilidad
      const mappedHouseholds = (householdsData || []).map(household => ({
        ...household,
        icon: household.description // Usar description como icon
      }));
      
      return { data: mappedHouseholds as Household[], error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }

  static async createHousehold(householdData: CreateHouseholdData): Promise<{ data: Household | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Crear el hogar
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: householdData.name,
          description: householdData.icon,
          created_by: user.id,
        })
        .select()
        .single();

      if (householdError) {
        return { data: null, error: 'Error al crear hogar' };
      }

      // Agregar al usuario como miembro del hogar
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) {
        logger.error('Error agregando miembro:', memberError);
      }

      return { data: household, error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }

  static async joinHousehold(joinData: JoinHouseholdData): Promise<{ data: Household | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { data: null, error: 'Usuario no autenticado' };
      }

      // Buscar la invitación
      const { data: invitation, error: invitationError } = await supabase
        .from('household_invitations')
        .select('*')
        .eq('invitation_code', joinData.invitation_code)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        return { data: null, error: 'Código de invitación inválido o expirado' };
      }

      // Agregar al usuario como miembro
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: invitation.household_id,
          user_id: user.id,
          role: invitation.role,
        });

      if (memberError) {
        return { data: null, error: 'Error al unirse al hogar' };
      }

      // Marcar la invitación como aceptada
      await supabase
        .from('household_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      // Obtener los datos del hogar
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', invitation.household_id)
        .single();

      if (householdError || !household) {
        return { data: null, error: 'Hogar no encontrado' };
      }

      return { data: household as Household, error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }

  static async deleteHousehold(householdId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario sea propietario del hogar
      const { data: member, error: memberError } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member || member.role !== 'owner') {
        return { success: false, error: 'Solo el propietario puede eliminar el hogar' };
      }

      // Eliminar el hogar (esto eliminará automáticamente los miembros, productos, etc. por las foreign keys)
      const { error: deleteError } = await supabase
        .from('households')
        .delete()
        .eq('id', householdId);

      if (deleteError) {
        return { success: false, error: 'Error al eliminar el hogar' };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }

  static async leaveHousehold(householdId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' };
      }

      // Verificar que el usuario sea miembro del hogar
      const { data: member, error: memberError } = await supabase
        .from('household_members')
        .select('role')
        .eq('household_id', householdId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !member) {
        return { success: false, error: 'No eres miembro de este hogar' };
      }

      // Si es el propietario, no puede salir (debe eliminar el hogar)
      if (member.role === 'owner') {
        return { success: false, error: 'El propietario no puede salir del hogar. Debe eliminarlo.' };
      }

      // Remover al usuario del hogar
      const { error: leaveError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', user.id);

      if (leaveError) {
        return { success: false, error: 'Error al salir del hogar' };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  }
} 