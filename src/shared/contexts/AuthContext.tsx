import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authSupabase } from '../config/supabase';
import { AuthService, SubscriptionInfo, CentralUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasAppAccess: boolean;
  subscriptionInfo: SubscriptionInfo | null;
  centralUser: CentralUser | null;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  verifyAppAccess: () => Promise<void>;
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
  const [hasAppAccess, setHasAppAccess] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [centralUser, setCentralUser] = useState<CentralUser | null>(null);

  useEffect(() => {
    // Obtener sesión inicial
    authSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = authSupabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        await verifyAppAccess();
      } else {
        setHasAppAccess(false);
        setSubscriptionInfo(null);
        setCentralUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verifyAppAccess = async () => {
    if (!user) {
      setHasAppAccess(false);
      return;
    }

    try {
      // Verificar acceso completo
      const hasAccess = await AuthService.verifyFullAccess(user.id);
      setHasAppAccess(hasAccess);

      if (hasAccess) {
        // Obtener información de suscripción
        const subscription = await AuthService.getSubscriptionInfo(user.id);
        setSubscriptionInfo(subscription);

        // Obtener información del usuario central
        const centralUserData = await AuthService.getCentralUser(user.id);
        setCentralUser(centralUserData);
      }
    } catch (error) {
      console.error('Error verifying app access:', error);
      setHasAppAccess(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await authSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: 'Error interno del servidor' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Registrar usuario en Supabase Auth
      const { data, error } = await authSupabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // Crear usuario en la base de datos central con plan gratuito
        const result = await AuthService.createCentralUser(email, fullName);
        
        if (!result.success) {
          // Si falla la creación en la base central, eliminar el usuario de Auth
          await authSupabase.auth.admin.deleteUser(data.user.id);
          return { error: result.error || 'Error creando usuario' };
        }
      }

      return {};
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: 'Error interno del servidor' };
    }
  };

  const signOut = async () => {
    try {
      await authSupabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    hasAppAccess,
    subscriptionInfo,
    centralUser,
    signIn,
    signUp,
    signOut,
    verifyAppAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 