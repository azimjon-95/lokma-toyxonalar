import { Platform, Text, View, type ColorValue } from 'react-native';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../src/theme';
import { useLokma } from '../../src/lib/lokma';

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

/* Profil belgisi: Lokma profilidagi rasm (faol bo'lsa — rangli halqa), rasm yo'q bo'lsa ikonka */
function ProfileIcon({ color, focused, photo }: { color: ColorValue; focused: boolean; photo?: string }) {
  if (!photo) return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={isWeb ? 26 : 24} color={color as string} />;
  return (
    <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: focused ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <Image source={photo} style={{ width: 20, height: 20, borderRadius: 10 }} contentFit="cover" />
    </View>
  );
}

/* Yozuv + faol bo'limda ostida vino rangli chiziq */
function TabLabel({ focused, color, children }: { focused: boolean; color: ColorValue; children: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text numberOfLines={1} style={{ fontFamily: focused ? fontFamily.semiBold : fontFamily.medium, fontSize: 10.5, lineHeight: 13, marginTop: 1, color }}>
        {children}
      </Text>
      <View style={{ marginTop: 4, height: 2.5, width: 50, borderRadius: 2, backgroundColor: focused ? colors.primary : 'transparent' }} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const lokma = useLokma();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          shadowColor: '#3A1A24', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: -4 }, elevation: 12,
          // Ikonka + yozuv + faol chiziq => 64px + pastki bo'shliq
          ...(isWeb ? { height: 58 + insets.bottom, paddingTop: 7, paddingBottom: 5 + insets.bottom } : { height: 58 + insets.bottom, paddingTop: 7 }),
        },
        tabBarLabel: ({ focused, color, children }) => <TabLabel focused={focused} color={color}>{children}</TabLabel>,
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
      {/* Profil — faqat Lokma Go ichida (foydalanuvchi Lokma'dan keladi); oddiy saytda yashirin */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          href: lokma.embedded ? undefined : null,
          tabBarIcon: ({ color, focused }) => <ProfileIcon color={color} focused={focused} photo={lokma.user?.photoUrl} />,
        }}
      />
    </Tabs>
  );
}
