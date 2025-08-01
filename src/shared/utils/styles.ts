import { Platform } from 'react-native';
import { FODEM_COLORS } from '../constants/colors';

export const getShadowStyle = (color: string = FODEM_COLORS.textPrimary) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 2px 8px ${color}20`, // 20 = 12% opacity
    };
  } else {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    };
  }
};

// Función para sombras más pronunciadas
export const getStrongShadowStyle = (color: string = FODEM_COLORS.textPrimary) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `0 4px 12px ${color}30`, // 30 = 18% opacity
    };
  } else {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 5,
    };
  }
}; 