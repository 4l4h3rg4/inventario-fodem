import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } from '@env';

// Verificar que las variables estén definidas
if (!EXPO_PUBLIC_SUPABASE_URL || !EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Configuración de Supabase no encontrada. Verifica las variables de entorno.');
}

// Cliente único para la base de datos de Mi Despensa (con autenticación integrada)
export const supabase = createClient(
  EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Tipos para la base de datos de Mi Despensa
export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
      };
      household_invitations: {
        Row: {
          id: string;
          household_id: string;
          invited_by: string;
          role: 'owner' | 'admin' | 'member';
          token: string;
          invitation_code: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          invited_by: string;
          role?: 'owner' | 'admin' | 'member';
          token?: string;
          invitation_code?: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          invited_by?: string;
          role?: 'owner' | 'admin' | 'member';
          token?: string;
          invitation_code?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          photo: string | null;
          current_stock: number;
          min_recommended: number;
          ideal_amount: number;
          user_id: string;
          household_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          photo?: string | null;
          current_stock: number;
          min_recommended: number;
          ideal_amount: number;
          user_id: string;
          household_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          photo?: string | null;
          current_stock?: number;
          min_recommended?: number;
          ideal_amount?: number;
          user_id?: string;
          household_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_history: {
        Row: {
          id: string;
          product_id: string;
          change_amount: number;
          change_type: 'add' | 'remove' | 'adjust';
          previous_stock: number;
          new_stock: number;
          user_id: string;
          household_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          change_amount: number;
          change_type: 'add' | 'remove' | 'adjust';
          previous_stock: number;
          new_stock: number;
          user_id: string;
          household_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          change_amount?: number;
          change_type?: 'add' | 'remove' | 'adjust';
          previous_stock?: number;
          new_stock?: number;
          user_id?: string;
          household_id?: string;
          created_at?: string;
        };
      };
    };
  };
} 