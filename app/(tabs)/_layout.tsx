import { Platform, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../src/theme';

/*
 * Pastki menyu. Vebda (va Lokma Go ichidagi iframe'da) balandlik aniq
 * beriladi: standart 49px da Onest shrifti yozuvlari pastdan kesilardi
 * ("To'yxonalar" yarmi ko'rinmasdi). Mobil ilovada — tizim balandligi
 * (xavfsiz zona bilan), o'zgartirilmaydi.
 */
const isWeb = Platform.OS === 'web';
const icon = (on: keyof typeof Ionicons.glyphMap, off: keyof typeof Ionicons.glyphMap) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? on : off} size={isWeb ? 22 : size} color={color as string} />
  );

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          ...(isWeb ? { height: 64, paddingTop: 4, paddingBottom: 4 } : {}),
        },
        ...(isWeb ? { tabBarItemStyle: { justifyContent: 'center' as const, paddingVertical: 2 } } : {}),
        tabBarLabelStyle: {
          fontFamily: fontFamily.semiBold,
          fontSize: isWeb ? 11.5 : 12,
          // flexShrink: 0 — yozuv ikonka foydasiga siqilib (7px) kesilib qolmasin
          ...(isWeb ? { lineHeight: 16, marginTop: 1, flexShrink: 0 } : {}),
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'To‘yxonalar', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="map" options={{ title: 'Xarita', tabBarIcon: icon('map', 'map-outline') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saralangan', tabBarIcon: icon('heart', 'heart-outline') }} />
    </Tabs>
  );
}
