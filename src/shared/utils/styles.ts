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