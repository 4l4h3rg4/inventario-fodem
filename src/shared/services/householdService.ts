import { supabase } from '../config/supabase';

// Iconos disponibles para los hogares
export const HOUSEHOLD_ICONS = [
  '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩',
  '💒', '⛪', '🕌', '🕍', '🛕', '⛩️', '🕋', '⛺', '🛖', '🏕️', '🏖️', '🏜️', '🏝️', '🏔️', '⛰️', '🌋'
];

export interface Household {
  id: string;
  name: string;
  description?: string;
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

      const { data, error } = await supabase
        .from('household_members')
        .select(`
          household_id,
          role,
          joined_at,
          households (
            id,
            name,
            description,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        return { data: null, error: 'Error al obtener hogares' };
      }

      const households = data?.map(item => item.households).filter(Boolean).flat() || [];
      return { data: households as Household[], error: null };
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
        console.error('Error agregando miembro:', memberError);
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
        .select(`
          *,
          households (
            id,
            name,
            description,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('invitation_code', joinData.invitation_code)
        .eq('accepted_at', null)
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

      return { data: invitation.households as Household, error: null };
    } catch (error) {
      return { data: null, error: 'Error de conexión' };
    }
  }
} 