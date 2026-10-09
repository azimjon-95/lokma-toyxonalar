import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Onest_400Regular, Onest_500Medium, Onest_600SemiBold, Onest_700Bold, Onest_800ExtraBold } from '@expo-google-fonts/onest';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { colors } from '../src/theme';
import { LocationProvider } from '../src/store/location';
import { LokmaProvider } from '../src/lib/lokma';
import { applyMobileWebFeel } from '../src/lib/webMobile';
import { installAutoTranslate } from '../src/lib/i18n';

// Vebda mobil ilova hissi (matn nusxalanmaydi, zoom/rezina yo'q) — modul yuklanganda bir marta
applyMobileWebFeel();
// <Text>/<TextInput> avtomatik tarjimasi (o'zbek lotin → kirill / rus) — src/lib/i18n.ts
installAutoTranslate();
import { FavoritesProvider } from '../src/store/favorites';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Onest_400Regular, Onest_500Medium, Onest_600SemiBold, Onest_700Bold, Onest_800ExtraBold,
    PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold,
  });
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 2, refetchOnWindowFocus: false } } }),
  );
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        {/* Lokma Go ichida ochilganda foydalanuvchi ma'lumoti va qaytish tugmalari (src/lib/lokma.tsx) */}
        <LokmaProvider>
        <LocationProvider>
          <FavoritesProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="venue/[slug]" />
              <Stack.Screen name="my-bookings" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </FavoritesProvider>
        </LocationProvider>
        </LokmaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
