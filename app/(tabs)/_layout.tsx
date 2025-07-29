import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { FODEM_COLORS } from '../../src/shared/constants/colors';
import { Icon } from '../../src/presentation/components/Icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.OS === 'web' ? {
          display: 'none' // Ocultar tabs en web
        } : {
          backgroundColor: FODEM_COLORS.surface,
          borderTopColor: FODEM_COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarActiveTintColor: FODEM_COLORS.primary,
        tabBarInactiveTintColor: FODEM_COLORS.textSecondary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inventario',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="inventory"
              color={color}
              size={focused ? 24 : 20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name="profile"
              color={color}
              size={focused ? 24 : 20}
            />
          ),
        }}
      />
    </Tabs>
  );
} 