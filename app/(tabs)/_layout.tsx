import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 12 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'To‘yxonalar', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Xarita', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Saralangan', tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
