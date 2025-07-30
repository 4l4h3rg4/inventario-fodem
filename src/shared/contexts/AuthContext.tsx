import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { authSupabase, supabase } from '../config/supabase';
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
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Get initial session
    authSupabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = authSupabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user && !isNavigating) {
        setIsNavigating(true);
        console.log('Usuario autenticado, verificando acceso...');
        
        try {
          const hasAccess = await AuthService.verifyFullAccess(session.user.id);
          
          if (hasAccess) {
            console.log('Usuario tiene acceso, navegando a la app');
            setHasAppAccess(true);
            
            // Obtener información adicional
            const centralUserData = await AuthService.getCentralUser(session.user.id);
            const subscriptionData = await AuthService.getSubscriptionInfo(session.user.id);
            
            setCentralUser(centralUserData);
            setSubscriptionInfo(subscriptionData);
            
            router.replace('/(tabs)');
          } else {
            console.log('Usuario no tiene acceso, navegando a acceso denegado');
            setHasAppAccess(false);
            router.replace('/access-denied');
          }
        } catch (error) {
          console.error('Error verificando acceso:', error);
          setHasAppAccess(false);
          router.replace('/access-denied');
        } finally {
          setIsNavigating(false);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out, navigate to auth page
        console.log('AuthContext detectó SIGNED_OUT, navegando a login...');
        setHasAppAccess(false);
        setSubscriptionInfo(null);
        setCentralUser(null);
        setUser(null);
        setSession(null);
        setIsNavigating(false);
        router.replace('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [isNavigating]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Intentando iniciar sesión con:', email);
      console.log('Intentando autenticación...');
      
      const { error } = await authSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error en signIn:', error);
        
        // Mensajes específicos según el tipo de error
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Correo electrónico o contraseña incorrectos. Verifica tus datos e intenta nuevamente.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { error: 'Tu cuenta no ha sido verificada. Revisa tu correo electrónico y confirma tu cuenta.' };
        } else if (error.message.includes('Too many requests')) {
          return { error: 'Demasiados intentos fallidos. Espera unos minutos antes de intentar nuevamente.' };
        } else if (error.message.includes('User not found')) {
          return { error: 'No existe una cuenta con este correo electrónico. Verifica el correo o crea una cuenta nueva.' };
        } else {
          return { error: `Error al iniciar sesión: ${error.message}` };
        }
      }

      console.log('Inicio de sesión exitoso');
      return {};
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Iniciando registro para:', email);
      
      const { data, error } = await authSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error('Error en signUp:', error);
        
        // Mensajes específicos según el tipo de error
        if (error.message.includes('User already registered')) {
          return { error: 'Ya existe una cuenta con este correo electrónico. Inicia sesión en su lugar.' };
        } else if (error.message.includes('Password should be at least')) {
          return { error: 'La contraseña debe tener al menos 6 caracteres.' };
        } else if (error.message.includes('Invalid email')) {
          return { error: 'El formato del correo electrónico no es válido.' };
        } else if (error.message.includes('Unable to validate email address')) {
          return { error: 'No se pudo validar el correo electrónico. Verifica que sea correcto.' };
        } else if (error.message.includes('Too many requests')) {
          return { error: 'Demasiados intentos. Espera unos minutos antes de intentar nuevamente.' };
        } else {
          return { error: `Error al crear cuenta: ${error.message}` };
        }
      }

      if (data.user) {
        console.log('Usuario creado en auth, creando usuario central...');
        
        // Crear usuario en la base de datos central
        const centralUserResult = await AuthService.createCentralUser(
          data.user.id,
          email,
          fullName
        );

        if (centralUserResult.error) {
          console.error('Error creando usuario central:', centralUserResult.error);
          
          // Si el usuario ya existe en la base central, no es un error
          if (centralUserResult.error.includes('duplicate key')) {
            console.log('Usuario ya existe en base central, continuando...');
            return { success: true, message: 'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.' };
          }
          
          return { error: 'Cuenta creada pero hubo un problema con la configuración. Contacta soporte.' };
        }

        return { success: true, message: 'Cuenta creada exitosamente. Revisa tu correo para confirmar tu cuenta.' };
      }

      return { error: 'Error inesperado al crear la cuenta.' };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
    }
  };

  const signOut = async () => {
    try {
      console.log('=== INICIANDO CIERRE DE SESIÓN ===');
      
      // 1. Limpiar localStorage inmediatamente
      console.log('Limpiando localStorage...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-supabase-session');
        localStorage.removeItem('despensa-supabase-session');
        console.log('localStorage limpiado');
      }
      
      // 2. Limpiar estados del contexto inmediatamente
      console.log('Limpiando estados del contexto...');
      setHasAppAccess(false);
      setSubscriptionInfo(null);
      setCentralUser(null);
      setUser(null);
      setSession(null);
      
      // 3. Intentar cerrar sesión en ambos clientes (sin esperar)
      console.log('Intentando cerrar sesiones...');
      try {
        supabase.auth.signOut().catch(e => console.log('Error cerrando sesión en Mi Despensa:', e));
        authSupabase.auth.signOut().catch(e => console.log('Error cerrando sesión en Auth:', e));
        console.log('Comandos de cierre de sesión enviados');
      } catch (e) {
        console.log('Error enviando comandos de cierre:', e);
      }
      
      // 4. Navegar a login inmediatamente
      console.log('Navegando a página de login...');
      router.replace('/auth');
      
      console.log('=== CIERRE DE SESIÓN COMPLETADO ===');
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
      
      // En caso de error, limpiar todo de todas formas
      console.log('Limpieza de emergencia...');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-supabase-session');
        localStorage.removeItem('despensa-supabase-session');
      }
      
      setHasAppAccess(false);
      setSubscriptionInfo(null);
      setCentralUser(null);
      setUser(null);
      setSession(null);
      
      router.replace('/auth');
      console.log('Limpieza de emergencia completada');
    }
  };

  const verifyAppAccess = async () => {
    if (!user) {
      console.log('No hay usuario, estableciendo hasAppAccess = false');
      setHasAppAccess(false);
      return;
    }

    try {
      console.log('Verificando acceso para usuario:', user.id);
      
      // Verificar acceso completo
      const hasAccess = await AuthService.verifyFullAccess(user.id);
      
      if (hasAccess) {
        console.log('Usuario tiene acceso, estableciendo hasAppAccess = true');
        setHasAppAccess(true);
        
        // Obtener información adicional
        const centralUserData = await AuthService.getCentralUser(user.id);
        const subscriptionData = await AuthService.getSubscriptionInfo(user.id);
        
        setCentralUser(centralUserData);
        setSubscriptionInfo(subscriptionData);
      } else {
        console.log('Usuario no tiene acceso, estableciendo hasAppAccess = false');
        setHasAppAccess(false);
      }
    } catch (error) {
      console.error('Error verifying app access:', error);
      setHasAppAccess(false);
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