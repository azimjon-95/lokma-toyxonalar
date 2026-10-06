import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

/** Server manzili (oxirida "/" siz). Bo'sh bo'lsa ilova mock ma'lumotlar bilan ishlaydi. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fromExtra || '').replace(/\/+$/, '');
export const USE_MOCK = API_URL.length === 0;
export const REQUEST_TIMEOUT_MS = 15000;

/** Joylashuv aniqlanmasa — Toshkent markazi */
export const DEFAULT_LOCATION = { lat: 41.3111, lng: 69.2797, label: 'Toshkent' };
export const DEFAULT_RADIUS_KM = 20;
