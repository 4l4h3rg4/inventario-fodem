import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  AUTH_SUPABASE_URL,
  AUTH_SUPABASE_ANON_KEY,
} from '@env';

// Configuración para la base de datos de autenticación central
const authSupabaseUrl = AUTH_SUPABASE_URL;
const authSupabaseAnonKey = AUTH_SUPABASE_ANON_KEY;

// Configuración para la base de datos de Mi Despensa
const appSupabaseUrl = SUPABASE_URL;
const appSupabaseAnonKey = SUPABASE_ANON_KEY;

// Cliente para autenticación central
export const authSupabase = createClient(authSupabaseUrl, authSupabaseAnonKey);

// Cliente para la aplicación Mi Despensa
export const supabase = createClient(appSupabaseUrl, appSupabaseAnonKey);

// Tipos para la base de datos de autenticación central
export interface AuthDatabase {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_type: 'basic' | 'premium' | 'enterprise';
          status: 'active' | 'cancelled' | 'expired';
          apps: string[];
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_type: 'basic' | 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired';
          apps?: string[];
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_type?: 'basic' | 'premium' | 'enterprise';
          status?: 'active' | 'cancelled' | 'expired';
          apps?: string[];
          created_at?: string;
          expires_at?: string | null;
        };
      };
      app_access: {
        Row: {
          id: string;
          user_id: string;
          app_name: string;
          access_token: string | null;
          last_access: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          app_name: string;
          access_token?: string | null;
          last_access?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          app_name?: string;
          access_token?: string | null;
          last_access?: string;
        };
      };
    };
  };
}

// Tipos para la base de datos de Mi Despensa (mantener los existentes)
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