import { View, type ColorValue } from 'react-native';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';
import { FloatingTabBar } from '../../src/components/ui/FloatingTabBar';
import { useLokma } from '../../src/lib/lokma';

/*
 * Pastki menyu — Lokma Go va Lokma Market bilan BIR XIL: Instagram uslubidagi suzuvchi shisha kapsula (src/components/ui/FloatingTabBar.tsx).
 * Faqat ikonkalar, faol tab ortida silliq suriluvchi "pill", vino rangi. Ekranlar pastiga useTabBarSpace() qadar joy qoldiradi.
 */
const icon = (on: keyof typeof Ionicons.glyphMap, off: keyof typeof Ionicons.glyphMap) =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={focused ? on : off} size={size} color={color as string} />
  );

/* Profil belgisi: Lokma profilidagi rasm (faol bo'lsa — rangli halqa), rasm yo'q bo'lsa ikonka */
function ProfileIcon({ color, focused, photo }: { color: ColorValue; focused: boolean; photo?: string }) {
  if (!photo) return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={28} color={color as string} />;
  return (
    <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: focused ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
      <Image source={photo} style={{ width: 24, height: 24, borderRadius: 12 }} contentFit="cover" />
    </View>
  );
}

export default function TabsLayout() {
  const lokma = useLokma();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
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
