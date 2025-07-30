import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FODEM_COLORS } from '../../shared/constants/colors';
import { Icon } from './Icon';

interface ErrorAlertProps {
  message: string;
  onClose: () => void;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  message, 
  onClose, 
  type = 'error' 
}) => {
  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'error';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return '#FFF3CD';
      case 'info':
        return '#D1ECF1';
      default:
        return '#F8D7DA';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return '#FFEAA7';
      case 'info':
        return '#BEE5EB';
      default:
        return '#F5C6CB';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'warning':
        return '#856404';
      case 'info':
        return '#0C5460';
      default:
        return '#721C24';
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
      }
    ]}>
      <View style={styles.content}>
        <Icon 
          name={getIconName()} 
          size={20} 
          color={getTextColor()} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon name="close" size={16} color={getTextColor()} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
}); 