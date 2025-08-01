import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { router, usePathname } from 'expo-router';
import { supabase } from '../config/supabase';
import { HouseholdService } from '../services/householdService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle navigation after successful authentication
      if (session?.user && _event === 'SIGNED_IN' && !isNavigating) {
        console.log('🚀 User signed in, checking navigation...');
        console.log('📍 Current pathname:', pathname);
        setIsNavigating(true);
        
        // Solo navegar si estamos en la pantalla de auth o index
        if (pathname === '/auth' || pathname === '/') {
          // Agregar un pequeño delay para evitar navegaciones múltiples
          setTimeout(async () => {
            try {
              const { data: households, error } = await HouseholdService.getUserHouseholds();
              
              if (error) {
                console.error('❌ Error checking households:', error);
                router.replace('/welcome');
                return;
              }

              if (households && households.length > 0) {
                console.log('🏠 User has households, navigating to tabs');
                router.replace('/(tabs)');
              } else {
                console.log('🏠 User has no households, navigating to welcome');
                router.replace('/welcome');
              }
            } catch (error) {
              console.error('❌ Error in navigation check:', error);
              router.replace('/welcome');
            } finally {
              setIsNavigating(false);
            }
          }, 500); // Esperar 500ms antes de navegar
        } else {
          console.log('📍 Already on correct page, no navigation needed');
          setIsNavigating(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando iniciar sesión con:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Error de autenticación:', error.message);
        return { error: error.message };
      }

      if (data.user) {
        console.log('✅ Usuario autenticado exitosamente:', data.user.email);
      }

      return {};
    } catch (error: any) {
      console.error('❌ Error de conexión:', error);
      return { error: 'Error de conexión. Verifica tu conexión a internet.' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error: any) {
      return { error: 'Error de conexión' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 