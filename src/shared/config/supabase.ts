import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://smlchyaybsahfmxhmvhe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtbGNoeWF5YnNhaGZteGhtdmhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NTYyMTIsImV4cCI6MjA2OTMzMjIxMn0.d-nVEgeo1ZSMJQv-nxdV7uAO-gHj-aAaON88Neqv6BU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de datos para TypeScript según la documentación
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
          username: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string | null;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          household_id?: string | null;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string | null;
          user_id?: string;
          role?: string;
          joined_at?: string;
        };
      };
      household_invitations: {
        Row: {
          id: string;
          household_id: string | null;
          invited_by: string;
          role: string;
          token: string;
          invitation_code: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          household_id?: string | null;
          invited_by: string;
          role?: string;
          token: string;
          invitation_code: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string | null;
          invited_by?: string;
          role?: string;
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
          household_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          photo?: string | null;
          current_stock?: number;
          min_recommended?: number;
          ideal_amount?: number;
          user_id: string;
          household_id?: string | null;
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
          household_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_history: {
        Row: {
          id: string;
          product_id: string | null;
          change_amount: number;
          change_type: string;
          previous_stock: number;
          new_stock: number;
          user_id: string;
          household_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          change_amount: number;
          change_type: string;
          previous_stock: number;
          new_stock: number;
          user_id: string;
          household_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          change_amount?: number;
          change_type?: string;
          previous_stock?: number;
          new_stock?: number;
          user_id?: string;
          household_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
} 