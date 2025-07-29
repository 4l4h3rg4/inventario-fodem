import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { getShadowStyle } from '../../shared/utils/styles';
import { FodemLogo } from './FodemLogo';
import { Icon } from './Icon';

interface SuccessModalProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function SuccessModal({ visible, email, onClose }: SuccessModalProps) {
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    if (visible) {
      // Generar confeti
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: -20,
        color: [
          FODEM_COLORS.primary,
          FODEM_COLORS.secondary,
          FODEM_COLORS.success,
          '#FFD700', // Dorado
          '#FF6B6B', // Rojo claro
          '#4ECDC4', // Turquesa
        ][Math.floor(Math.random() * 6)],
        rotation: Math.random() * 360,
        scale: Math.random() * 0.5 + 0.5,
      }));
      setConfetti(newConfetti);

      // Animar confeti
      const interval = setInterval(() => {
        setConfetti(prev => 
          prev.map(piece => ({
            ...piece,
            y: piece.y + 2,
            rotation: piece.rotation + 5,
          })).filter(piece => piece.y < height + 50)
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        {/* Confeti */}
        {confetti.map(piece => (
          <View
            key={piece.id}
            style={{
              position: 'absolute',
              left: piece.x,
              top: piece.y,
              width: 8,
              height: 8,
              backgroundColor: piece.color,
              borderRadius: 4,
              transform: [
                { rotate: `${piece.rotation}deg` },
                { scale: piece.scale },
              ],
            }}
          />
        ))}

        {/* Modal Content */}
        <View style={{
          backgroundColor: FODEM_COLORS.surface,
          borderRadius: 24,
          padding: 32,
          width: '100%',
          maxWidth: 400,
          alignItems: 'center',
          ...getShadowStyle(),
        }}>
          {/* Icono de celebración */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: FODEM_COLORS.success,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <Icon name="check" size={40} color={FODEM_COLORS.textLight} />
          </View>

          {/* Logo */}
          <FodemLogo size="medium" showSubtitle={false} />
          
          {/* Título */}
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: FODEM_COLORS.textPrimary,
            textAlign: 'center',
            marginTop: 20,
            marginBottom: 8,
          }}>
            ¡Cuenta Creada Exitosamente! 🎉
          </Text>

          {/* Subtítulo */}
          <Text style={{
            fontSize: 16,
            color: FODEM_COLORS.textSecondary,
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 24,
          }}>
            ¡Bienvenido a Mi Despensa! Ya estás a un paso de comenzar a gestionar tu inventario.
          </Text>

          {/* Mensaje importante */}
          <View style={{
            backgroundColor: FODEM_COLORS.primary + '15',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 2,
            borderColor: FODEM_COLORS.primary + '30',
            width: '100%',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: FODEM_COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Icon name="email" size={14} color={FODEM_COLORS.textLight} />
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: FODEM_COLORS.textPrimary,
              }}>
                ¡Confirma tu Email!
              </Text>
            </View>
            
            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textPrimary,
              lineHeight: 20,
              marginBottom: 8,
            }}>
              Hemos enviado un email de confirmación a:
            </Text>
            
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: FODEM_COLORS.primary,
              textAlign: 'center',
              backgroundColor: FODEM_COLORS.background,
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: FODEM_COLORS.border,
            }}>
              {email}
            </Text>
            
            <Text style={{
              fontSize: 14,
              color: FODEM_COLORS.textSecondary,
              lineHeight: 20,
              marginTop: 12,
              textAlign: 'center',
            }}>
              <Text style={{ fontWeight: '600', color: FODEM_COLORS.textPrimary }}>
                Importante:
              </Text>{' '}
              Debes confirmar tu email antes de poder iniciar sesión en la aplicación.
            </Text>
          </View>

          {/* Pasos a seguir */}
          <View style={{
            backgroundColor: FODEM_COLORS.secondary + '20',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            width: '100%',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: FODEM_COLORS.textPrimary,
              marginBottom: 12,
              textAlign: 'center',
            }}>
              📋 Pasos a seguir:
            </Text>
            
            <View style={{ gap: 8 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: FODEM_COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: FODEM_COLORS.textLight,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    1
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textPrimary,
                  flex: 1,
                }}>
                  Revisa tu bandeja de entrada
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: FODEM_COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: FODEM_COLORS.textLight,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    2
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textPrimary,
                  flex: 1,
                }}>
                  Haz clic en el enlace de confirmación
                </Text>
              </View>
              
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: FODEM_COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: FODEM_COLORS.textLight,
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    3
                  </Text>
                </View>
                <Text style={{
                  fontSize: 14,
                  color: FODEM_COLORS.textPrimary,
                  flex: 1,
                }}>
                  ¡Vuelve aquí e inicia sesión!
                </Text>
              </View>
            </View>
          </View>

          {/* Botón de cerrar */}
          <TouchableOpacity
            style={{
              backgroundColor: FODEM_COLORS.primary,
              borderRadius: 16,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
            }}
            onPress={onClose}
          >
            <Text style={{
              color: FODEM_COLORS.textLight,
              fontSize: 18,
              fontWeight: '600',
            }}>
              ¡Entendido! 👍
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 