import React from 'react';
import { Text } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 20, 
  color = '#2C3E50' 
}) => {
  const iconMap: { [key: string]: string } = {
    // Navegación
    home: '🏠',
    settings: '⚙️',
    profile: '👤',
    back: '←',
    close: '×',
    
    // Inventario
    inventory: '📦',
    add: '➕',
    edit: '✏️',
    delete: '🗑️',
    scan: '📷',
    
    // Hogares
    household: '🏠',
    members: '👥',
    users: '👥',
    invite: '📨',
    join: '🔗',
    
    // Acciones
    save: '💾',
    cancel: '❌',
    confirm: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    
    // Usuario
    user: '👤',
    logout: '🚪',
    login: '🔑',
    
    // Productos
    product: '📦',
    shopping: '🛒',
    list: '📋',
    
    // Estados
    success: '✅',
    error: '❌',
    loading: '⏳',
    check: '✓',
    
    // Comunicación
    email: '📧',
    
    // Contraseñas
    eye: '👁️',
    'eye-off': '🙈',
    
    // Otros
    search: '🔍',
    filter: '🔧',
    sort: '↕️',
    calendar: '📅',
    notification: '🔔',
    clock: '⏰',
    invitation: '📨',
    dropdown: '▼',
  };

  const icon = iconMap[name] || '❓';

  return (
    <Text style={{
      fontSize: size,
      color,
      textAlign: 'center',
    }}>
      {icon}
    </Text>
  );
}; 