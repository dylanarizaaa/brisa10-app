import { Tabs } from 'expo-router';
import {
  Ellipsis,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  type LucideIcon,
} from 'lucide-react-native';

import { Platform, type ColorValue } from 'react-native';

import { THEME } from '@/lib/theme';

function tabIcon(icon: LucideIcon) {
  const TabIcon = icon;
  return function TabBarIcon({ color, size }: { color: ColorValue; size: number }) {
    // Los colores de las pestañas siempre son cadenas (ver screenOptions).
    return (
      <TabIcon color={typeof color === 'string' ? color : THEME.mutedForeground} size={size - 2} />
    );
  };
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.mutedForeground,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600' },
        tabBarLabelStyle: { fontSize: 11 },
        // En web no hay zona segura inferior: un poco de aire para que las etiquetas no toquen el borde.
        tabBarStyle: Platform.OS === 'web' ? { height: 56, paddingBottom: 6 } : undefined,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: tabIcon(LayoutDashboard) }}
      />
      <Tabs.Screen name="vender" options={{ title: 'Vender', tabBarIcon: tabIcon(ShoppingCart) }} />
      <Tabs.Screen
        name="productos"
        options={{ title: 'Productos', tabBarIcon: tabIcon(Package) }}
      />
      <Tabs.Screen
        name="inventario"
        options={{ title: 'Inventario', tabBarIcon: tabIcon(Warehouse) }}
      />
      <Tabs.Screen name="mas" options={{ title: 'Más', tabBarIcon: tabIcon(Ellipsis) }} />
    </Tabs>
  );
}
