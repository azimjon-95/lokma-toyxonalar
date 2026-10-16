import Constants from 'expo-constants';

const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;

/** Production API (EXPO_PUBLIC_API_URL berilmasa shu ishlatiladi). Mock ma'lumot YO'Q — ilova doim haqiqiy server bilan ishlaydi. */
export const DEFAULT_API_URL = 'https://api.lokma.uz';

/** Server manzili (oxirida "/" siz) */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || fromExtra || DEFAULT_API_URL).replace(/\/+$/, '');
/** Bitta so'rov vaqt chegarasi: uzoq kutib turgandan ko'ra tez xato berib qayta urinish yaxshi */
export const REQUEST_TIMEOUT_MS = 10000;

/** Joylashuv aniqlanmasa — Toshkent markazi */
export const DEFAULT_LOCATION = { lat: 41.3111, lng: 69.2797, label: 'Toshkent' };
export const DEFAULT_RADIUS_KM = 20;
