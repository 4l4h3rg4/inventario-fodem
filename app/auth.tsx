import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert,
  Platform 
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FODEM_COLORS } from '../src/shared/constants/colors';
import { getShadowStyle } from '../src/shared/utils/styles';
import { FodemLogo } from '../src/presentation/components/FodemLogo';
import { Icon } from '../src/presentation/components/Icon';
import { SuccessModal } from '../src/presentation/components/SuccessModal';
import { useAuth } from '../src/shared/contexts/AuthContext';
import { ErrorAlert } from '../src/presentation/components/ErrorAlert';
import { ConnectionStatus } from '../src/presentation/components/ConnectionStatus';
import { HouseholdService } from '../src/shared/services/householdService';

export default function AuthScreen() {
  const params = useLocalSearchParams();
  const [isLogin, setIsLogin] = useState(params.mode === 'register' ? false : true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDebug, setShowDebug] = useState(false);
  
  const { signIn, signUp } = useAuth();

  // Validaciones
  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
  };

  const isPasswordMatch = password === confirmPassword;

  const canSubmit = () => {
    if (isLogin) {
      return email.trim() && password.trim() && isEmailValid(email);
    } else {
      return (
        email.trim() && 
        password.trim() && 
        confirmPassword.trim() &&
        fullName.trim() &&
        isEmailValid(email) &&
        isPasswordValid(password) &&
        isPasswordMatch
      );
    }
  };

  const handleAuth = async () => {
    if (!canSubmit()) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    setLoading(true);
    console.log('🚀 Iniciando proceso de autenticación...');
    
    try {
      let result;
      
      if (isLogin) {
        console.log('🔐 Procesando inicio de sesión...');
        result = await signIn(email, password);
      } else {
        console.log('📝 Procesando registro...');
        result = await signUp(email, password, fullName);
      }

             if (result.error) {
         console.error('❌ Error en autenticación:', result.error);
         setErrorMessage(result.error);
         setShowErrorAlert(true);
       } else if (!isLogin) {
         console.log('✅ Registro exitoso');
         setShowSuccessModal(true);
       } else {
         console.log('✅ Inicio de sesión exitoso');
         // La navegación se maneja automáticamente por el AuthContext
         // No necesitamos navegación manual aquí para evitar conflictos
       }
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      setErrorMessage('Ocurrió un error inesperado. Por favor intenta nuevamente.');
      setShowErrorAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  const handleCloseErrorAlert = () => {
    setShowErrorAlert(false);
    setErrorMessage('');
  };

  return (
    <>
      <ScrollView style={{
        flex: 1,
        backgroundColor: FODEM_COLORS.background,
      }}>
        <View style={{
          flex: 1,
          padding: 20,
          paddingTop: 60,
          minHeight: '100%',
        }}>
          
          {/* Alert de error */}
          {showErrorAlert && (
            <ErrorAlert
              message={errorMessage}
              onClose={handleCloseErrorAlert}
            />
          )}
          {/* Logo y título */}
          <View style={{
            alignItems: 'center',
            marginBottom: 40,
          }}>
            <FodemLogo size="large" showSubtitle={true} />
            
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: FODEM_COLORS.textPrimary,
              marginTop: 20,
              textAlign: 'center',
            }}>
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>
            
            <Text style={{
              fontSize: 16,
              color: FODEM_COLORS.textSecondary,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 24,
            }}>
              {isLogin 
                ? 'Accede a tu despensa personal' 
                : 'Comienza a gestionar tu inventario'
              }
            </Text>
          </View>

          {/* Formulario */}
          <View style={{
            backgroundColor: FODEM_COLORS.surface,
            borderRadius: 16,
            padding: 24,
            marginBottom: 20,
            ...getShadowStyle(),
          }}>
            {!isLogin && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Nombre Completo
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: fullName.trim() ? FODEM_COLORS.border : FODEM_COLORS.error,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: FODEM_COLORS.textPrimary,
                    backgroundColor: FODEM_COLORS.background,
                  }}
                  placeholder="Tu nombre completo"
                  placeholderTextColor={FODEM_COLORS.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginBottom: 8,
              }}>
                Email
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: email.trim() && !isEmailValid(email) ? FODEM_COLORS.error : FODEM_COLORS.border,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: FODEM_COLORS.textPrimary,
                  backgroundColor: FODEM_COLORS.background,
                }}
                placeholder="tu@email.com"
                placeholderTextColor={FODEM_COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              {/* Mensaje de email dinámico */}
              {!isLogin && email.length > 0 && (
                <View style={{
                  marginTop: 8,
                  padding: 12,
                  backgroundColor: FODEM_COLORS.secondary,
                  borderRadius: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Icon name="email" size={14} color={FODEM_COLORS.textPrimary} />
                  <Text style={{
                    fontSize: 13,
                    color: FODEM_COLORS.textPrimary,
                    marginLeft: 8,
                    flex: 1,
                  }}>
                    Se enviará un email de confirmación a{' '}
                    <Text style={{ fontWeight: '600' }}>{email}</Text>
                  </Text>
                </View>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: FODEM_COLORS.textPrimary,
                marginBottom: 8,
              }}>
                Contraseña
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: password.trim() && !isPasswordValid(password) ? FODEM_COLORS.error : FODEM_COLORS.border,
                borderRadius: 8,
                backgroundColor: FODEM_COLORS.background,
              }}>
                <TextInput
                  style={{
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: FODEM_COLORS.textPrimary,
                  }}
                  placeholder="••••••••"
                  placeholderTextColor={FODEM_COLORS.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={FODEM_COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Validador de contraseña simple */}
              {!isLogin && password.length > 0 && (
                <View style={{
                  marginTop: 12,
                  padding: 16,
                  backgroundColor: FODEM_COLORS.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: FODEM_COLORS.border,
                }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: FODEM_COLORS.textPrimary,
                    marginBottom: 8,
                  }}>
                    Requisitos mínimos:
                  </Text>
                  
                  <View style={{ gap: 6 }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <View style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: password.length >= 8 ? FODEM_COLORS.success : FODEM_COLORS.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {password.length >= 8 && (
                          <Icon name="check" size={10} color={FODEM_COLORS.textLight} />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 13,
                        color: password.length >= 8 ? FODEM_COLORS.textPrimary : FODEM_COLORS.textSecondary,
                      }}>
                        Al menos 8 caracteres
                      </Text>
                    </View>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <View style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: /[A-Z]/.test(password) ? FODEM_COLORS.success : FODEM_COLORS.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {/[A-Z]/.test(password) && (
                          <Icon name="check" size={10} color={FODEM_COLORS.textLight} />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 13,
                        color: /[A-Z]/.test(password) ? FODEM_COLORS.textPrimary : FODEM_COLORS.textSecondary,
                      }}>
                        Al menos una mayúscula
                      </Text>
                    </View>
                    
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <View style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        backgroundColor: /\d/.test(password) ? FODEM_COLORS.success : FODEM_COLORS.border,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {/\d/.test(password) && (
                          <Icon name="check" size={10} color={FODEM_COLORS.textLight} />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 13,
                        color: /\d/.test(password) ? FODEM_COLORS.textPrimary : FODEM_COLORS.textSecondary,
                      }}>
                        Al menos un número
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {!isLogin && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginBottom: 8,
                }}>
                  Confirmar Contraseña
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: confirmPassword.trim() && !isPasswordMatch ? FODEM_COLORS.error : FODEM_COLORS.border,
                  borderRadius: 8,
                  backgroundColor: FODEM_COLORS.background,
                }}>
                  <TextInput
                    style={{
                      flex: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: FODEM_COLORS.textPrimary,
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={FODEM_COLORS.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={FODEM_COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
                
                {/* Mensaje de confirmación */}
                {confirmPassword.length > 0 && (
                  <View style={{
                    marginTop: 8,
                    padding: 12,
                    backgroundColor: isPasswordMatch ? FODEM_COLORS.success + '20' : FODEM_COLORS.error + '20',
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Icon 
                      name={isPasswordMatch ? "check" : "error"} 
                      size={14} 
                      color={isPasswordMatch ? FODEM_COLORS.success : FODEM_COLORS.error} 
                    />
                    <Text style={{
                      fontSize: 13,
                      color: isPasswordMatch ? FODEM_COLORS.success : FODEM_COLORS.error,
                      marginLeft: 8,
                    }}>
                      {isPasswordMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: canSubmit() ? FODEM_COLORS.primary : FODEM_COLORS.border,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              }}
              onPress={handleAuth}
              disabled={loading || !canSubmit()}
            >
              <Text style={{
                color: FODEM_COLORS.textLight,
                fontSize: 18,
                fontWeight: '600',
              }}>
                {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cambiar modo */}
          <View style={{
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 16,
              color: FODEM_COLORS.textSecondary,
              marginBottom: 12,
            }}>
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            </Text>
            
            <TouchableOpacity onPress={handleSwitchMode}>
              <Text style={{
                fontSize: 16,
                color: FODEM_COLORS.primary,
                fontWeight: '600',
              }}>
                {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Información adicional */}
          {!isLogin && (
            <View style={{
              backgroundColor: FODEM_COLORS.secondary,
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Icon name="info" size={16} color={FODEM_COLORS.textPrimary} />
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: FODEM_COLORS.textPrimary,
                  marginLeft: 8,
                }}>
                  Importante
                </Text>
              </View>
              <Text style={{
                fontSize: 14,
                color: FODEM_COLORS.textPrimary,
                lineHeight: 20,
              }}>
                Después de crear tu cuenta, revisa tu email para confirmar tu dirección antes de poder iniciar sesión.
              </Text>
            </View>
          )}

          {/* Debug Panel */}
          <View style={{
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <TouchableOpacity 
              onPress={() => setShowDebug(!showDebug)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: FODEM_COLORS.border,
              }}
            >
              <Text style={{
                fontSize: 14,
                color: FODEM_COLORS.textSecondary,
              }}>
                {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDebug && (
            <ConnectionStatus visible={true} />
          )}
        </View>
      </ScrollView>

      {/* Modal de éxito */}
      <SuccessModal
        visible={showSuccessModal}
        email={email}
        onClose={handleCloseSuccessModal}
      />
    </>
  );
} 