import { Platform, type ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../src/theme';

/*
 * Pastki menyu — Lokma Go'ning pastki menyusi bilan BIR XIL o'lchamda
 * (lakmago-client BottomNav: 10px yuqori/past bo'shliq, 22px ikonka,
 * kichik yozuv, pastda tizim paneli bo'shlig'i). Lokma ichida pastki bo'shliq
 * Lokma'dan keladi (src/lib/lokma.tsx), shuning uchun ikkala ilovada menyu
 * ekranning bir xil joyida turadi. Mobil ilovada — tizim qiymatlari.
 */
const isWeb = Platform.OS === 'web';
const icon = (on: keyof typeof Ionicons.glyphMap, off: keyof typeof Ionicons.glyphMap) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? on : off} size={isWeb ? 22 : size} color={color as string} />
  );

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          // Lokma Go BottomNav: 10px yuqori/past, 22px ikonka, 10px yozuv => 56px + pastki bo'shliq
          ...(isWeb ? { height: 56 + insets.bottom, paddingTop: 10, paddingBottom: 10 + insets.bottom } : {}),
        },
        ...(isWeb ? { tabBarItemStyle: { justifyContent: 'center' as const, paddingVertical: 0 } } : {}),
        tabBarLabelStyle: {
          fontFamily: isWeb ? fontFamily.medium : fontFamily.semiBold,
          fontSize: isWeb ? 10 : 12,
          // flexShrink: 0 — yozuv ikonka foydasiga siqilib kesilmasin
          ...(isWeb ? { lineHeight: 12, marginTop: 2, flexShrink: 0 } : {}),
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'To‘yxonalar', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="map" options={{ title: 'Xarita', tabBarIcon: icon('map', 'map-outline') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saralangan', tabBarIcon: icon('heart', 'heart-outline') }} />
    </Tabs>
  );
}
