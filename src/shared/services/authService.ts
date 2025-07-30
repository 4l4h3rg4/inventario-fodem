import { authSupabase } from '../config/supabase';

export interface AuthResult {
  success?: boolean;
  error?: string;
  userId?: string;
  message?: string;
}

export interface SubscriptionInfo {
  planName: string;
  planDescription: string;
  status: string;
  startDate: string;
  endDate?: string;
  maxApps: number;
  accessibleApps: string[];
}

export interface CentralUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

const APP_NAME = 'mi_despensa';

export class AuthService {
  /**
   * Verificar si un usuario tiene acceso a una aplicación específica
   */
  static async checkAppAccess(userId: string, appName: string = APP_NAME): Promise<boolean> {
    try {
      const { data, error } = await authSupabase.rpc('check_user_app_access', {
        p_user_id: userId,
        p_app_name: appName
      });

      if (error) {
        console.error('Error checking app access:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error checking app access:', error);
      return false;
    }
  }

  /**
   * Obtener información de suscripción del usuario
   */
  static async getSubscriptionInfo(userId: string): Promise<SubscriptionInfo | null> {
    try {
      const { data, error } = await authSupabase.rpc('get_user_subscription_info', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error getting subscription info:', error);
        return null;
      }

      if (data && data.length > 0) {
        const info = data[0];
        return {
          planName: info.plan_name,
          planDescription: info.plan_description,
          status: info.status,
          startDate: info.start_date,
          endDate: info.end_date,
          maxApps: info.max_apps,
          accessibleApps: info.accessible_apps || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return null;
    }
  }

  /**
   * Crear un nuevo usuario central con plan gratuito automáticamente
   */
  static async createCentralUser(userId: string, email: string, fullName: string): Promise<AuthResult> {
    try {
      console.log('Creando usuario central:', { userId, email, fullName });
      
      const { data, error } = await authSupabase.rpc('create_user_with_free_plan', {
        p_email: email,
        p_full_name: fullName,
        p_user_id: userId
      });

      if (error) {
        console.error('Error creating central user:', error);
        
        // Manejar errores específicos
        if (error.code === '23505') {
          return { 
            success: true, 
            userId: userId,
            message: 'Usuario ya existe en el sistema central' 
          };
        } else if (error.code === 'PGRST202') {
          return { 
            error: 'Error de configuración del servidor. Contacta soporte.' 
          };
        } else {
          return { 
            error: `Error al crear usuario central: ${error.message}` 
          };
        }
      }

      console.log('Usuario central creado exitosamente:', data);
      return { success: true, userId: data };
    } catch (error: any) {
      console.error('Error creating central user:', error);
      return { error: 'Error de conexión al crear usuario central' };
    }
  }

  /**
   * Obtener información de un usuario central
   */
  static async getCentralUser(userId: string): Promise<CentralUser | null> {
    try {
      console.log('Buscando usuario central con ID:', userId);
      
      const { data, error } = await authSupabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting central user:', error);
        return null;
      }

      console.log('Usuario central encontrado:', data);
      return data;
    } catch (error) {
      console.error('Error getting central user:', error);
      return null;
    }
  }

  /**
   * Verificar acceso completo del usuario (suscripción activa + acceso a app)
   */
  static async verifyFullAccess(userId: string, appName: string = APP_NAME): Promise<boolean> {
    try {
      console.log('Verificando acceso para usuario:', userId);
      
      // Verificar que el usuario existe en la base de datos central
      const centralUser = await this.getCentralUser(userId);
      if (!centralUser) {
        console.log('Usuario no encontrado en base central');
        return false;
      }

      // Verificar que tiene acceso a la aplicación
      const hasAppAccess = await this.checkAppAccess(userId, appName);
      if (!hasAppAccess) {
        console.log('Usuario no tiene acceso a la aplicación');
        return false;
      }

      console.log('Usuario tiene acceso completo');
      return true;
    } catch (error) {
      console.error('Error verifying full access:', error);
      return false;
    }
  }
} 