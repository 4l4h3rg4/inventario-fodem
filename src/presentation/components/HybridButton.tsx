import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';

interface HybridButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const HybridButton: React.FC<HybridButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 'medium',
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
    };

    // Tamaños
    const sizeStyles = {
      small: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    const sizeStyle = sizeStyles[size];

    if (variant === 'primary') {
      return {
        ...baseStyle,
        ...sizeStyle,
        backgroundColor: disabled ? FODEM_COLORS.border : FODEM_COLORS.primary,
      };
    } else if (variant === 'secondary') {
      return {
        ...baseStyle,
        ...sizeStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? FODEM_COLORS.border : FODEM_COLORS.primary,
      };
    } else if (variant === 'danger') {
      return {
        ...baseStyle,
        ...sizeStyle,
        backgroundColor: disabled ? FODEM_COLORS.border : FODEM_COLORS.error,
      };
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontWeight: '600' as const,
    };

    const sizeStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    const sizeStyle = sizeStyles[size];

    if (variant === 'primary') {
      return {
        ...baseStyle,
        ...sizeStyle,
        color: FODEM_COLORS.textLight,
      };
    } else if (variant === 'secondary') {
      return {
        ...baseStyle,
        ...sizeStyle,
        color: disabled ? FODEM_COLORS.textSecondary : FODEM_COLORS.primary,
      };
    } else if (variant === 'danger') {
      return {
        ...baseStyle,
        ...sizeStyle,
        color: FODEM_COLORS.textLight,
      };
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}; 