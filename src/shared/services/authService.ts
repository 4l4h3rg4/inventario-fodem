import { authSupabase } from '../config/supabase';

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
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
   * Registrar acceso a una aplicación (para futuras implementaciones)
   */
  static async recordAppAccess(userId: string, appName: string = APP_NAME): Promise<boolean> {
    try {
      // Por ahora solo verificamos el acceso
      // En el futuro aquí se podría registrar analytics, logs, etc.
      return await this.checkAppAccess(userId, appName);
    } catch (error) {
      console.error('Error recording app access:', error);
      return false;
    }
  }

  /**
   * Crear un nuevo usuario central con plan gratuito automáticamente
   */
  static async createCentralUser(email: string, fullName: string): Promise<AuthResult> {
    try {
      const { data, error } = await authSupabase.rpc('create_user_with_free_plan', {
        p_email: email,
        p_full_name: fullName
      });

      if (error) {
        console.error('Error creating central user:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        userId: data
      };
    } catch (error) {
      console.error('Error creating central user:', error);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener información de un usuario central
   */
  static async getCentralUser(userId: string): Promise<CentralUser | null> {
    try {
      const { data, error } = await authSupabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting central user:', error);
        return null;
      }

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
      // Verificar que el usuario existe
      const user = await this.getCentralUser(userId);
      if (!user) {
        return false;
      }

      // Verificar acceso a la aplicación
      const hasAppAccess = await this.checkAppAccess(userId, appName);
      if (!hasAppAccess) {
        return false;
      }

      // Verificar que tiene una suscripción activa
      const subscriptionInfo = await this.getSubscriptionInfo(userId);
      if (!subscriptionInfo || subscriptionInfo.status !== 'active') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verifying full access:', error);
      return false;
    }
  }

  /**
   * Obtener todas las aplicaciones a las que tiene acceso un usuario
   */
  static async getUserApps(userId: string): Promise<string[]> {
    try {
      const { data, error } = await authSupabase
        .from('user_app_access')
        .select(`
          app_id,
          available_apps!inner(app_name, display_name, is_active)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('available_apps.is_active', true);

      if (error) {
        console.error('Error getting user apps:', error);
        return [];
      }

      return data?.map(item => item.available_apps.app_name) || [];
    } catch (error) {
      console.error('Error getting user apps:', error);
      return [];
    }
  }
} 