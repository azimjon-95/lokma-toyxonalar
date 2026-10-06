import type { ExpoConfig, ConfigContext } from 'expo/config';

const LOCATION_TEXT = "Yaqin atrofdagi to'yxonalarni ko'rsatish uchun joylashuvingiz kerak.";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Lokma To'yxonalari",
  slug: 'lokma-toyxonalar',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'lokmago',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'uz.lokma.toyxonalar',
    associatedDomains: ['applinks:lokma.uz'],
    infoPlist: {
      NSLocationWhenInUseUsageDescription: LOCATION_TEXT,
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'uz.lokma.toyxonalar',
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#FFFFFF',
    },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'lokma.uz', pathPrefix: '/toyxonalar' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'single',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-image',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 160, resizeMode: 'contain', backgroundColor: '#FFFFFF' },
    ],
    ['expo-location', { locationWhenInUsePermission: LOCATION_TEXT }],
    [
      'react-native-maps',
      // Android: Google Maps kaliti .env dan. iOS: Apple Maps (kalit kerak emas).
      { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? '' },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
  },
});
