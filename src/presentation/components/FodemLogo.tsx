import React from 'react';
import { View, Text, Platform, Image } from 'react-native';

interface FodemLogoProps {
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export const FodemLogo: React.FC<FodemLogoProps> = ({ 
  size = 'medium', 
  showSubtitle = true 
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 80, height: 40 },
          image: { width: 60, height: 30 },
        };
      case 'large':
        return {
          container: { width: 160, height: 80 },
          image: { width: 120, height: 60 },
        };
      default: // medium
        return {
          container: { width: 120, height: 60 },
          image: { width: 90, height: 45 },
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <Image
        source={require('../../../assets/logo_sin_fondo.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}; 