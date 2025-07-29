import React from 'react';
import { View, Text } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { Icon } from './Icon';

interface PasswordValidatorProps {
  password: string;
}

interface ValidationRule {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    id: 'length',
    label: 'Al menos 8 caracteres',
    validator: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Al menos una mayúscula',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Al menos una minúscula',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Al menos un número',
    validator: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Al menos un carácter especial',
    validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (password.length === 0) {
    return { score: 0, label: 'Muy débil', color: FODEM_COLORS.border };
  }

  const validRules = validationRules.filter(rule => rule.validator(password));
  const score = (validRules.length / validationRules.length) * 100;

  if (score <= 20) {
    return { score, label: 'Muy débil', color: FODEM_COLORS.error };
  } else if (score <= 40) {
    return { score, label: 'Débil', color: '#FF9500' };
  } else if (score <= 60) {
    return { score, label: 'Regular', color: '#FFCC00' };
  } else if (score <= 80) {
    return { score, label: 'Buena', color: '#34C759' };
  } else {
    return { score, label: 'Excelente', color: FODEM_COLORS.success };
  }
};

export const PasswordValidator: React.FC<PasswordValidatorProps> = ({ password }) => {
  const strength = getPasswordStrength(password);

  if (password.length === 0) {
    return null;
  }

  return (
    <View style={{
      marginTop: 12,
      padding: 16,
      backgroundColor: FODEM_COLORS.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: FODEM_COLORS.border,
    }}>
      {/* Barra de fortaleza */}
      <View style={{ marginBottom: 16 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: FODEM_COLORS.textPrimary,
          }}>
            Fortaleza de la contraseña
          </Text>
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: strength.color,
          }}>
            {strength.label}
          </Text>
        </View>
        
        <View style={{
          height: 6,
          backgroundColor: FODEM_COLORS.border,
          borderRadius: 3,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            width: `${strength.score}%`,
            backgroundColor: strength.color,
            borderRadius: 3,
          }} />
        </View>
      </View>

      {/* Reglas de validación */}
      <View>
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: FODEM_COLORS.textPrimary,
          marginBottom: 8,
        }}>
          Requisitos mínimos:
        </Text>
        
        <View style={{ gap: 6 }}>
          {validationRules.map((rule) => {
            const isValid = rule.validator(password);
            return (
              <View key={rule.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
                <View style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: isValid ? FODEM_COLORS.success : FODEM_COLORS.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {isValid && (
                    <Icon name="check" size={10} color={FODEM_COLORS.textLight} />
                  )}
                </View>
                <Text style={{
                  fontSize: 13,
                  color: isValid ? FODEM_COLORS.textPrimary : FODEM_COLORS.textSecondary,
                  textDecorationLine: isValid ? 'none' : 'none',
                }}>
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}; 