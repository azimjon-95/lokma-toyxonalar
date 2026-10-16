import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { QueryClient, type Query } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { ApiError } from '../services/errors';

/*
 * ═══ MA'LUMOT KESHI ═══
 * 1) Xotira keshi (react-query) — ekranlar orasida bir zumda.
 * 2) SAQLANGAN kesh (AsyncStorage / veb'da localStorage) — ilova qayta ochilganda ro'yxat DARHOL chiqadi,
 *    yangi ma'lumot esa fonda keladi (stale-while-revalidate). Foydalanuvchi bo'sh ekran yoki spinner ko'rmaydi.
 * Server tomonida ham Redis keshi bor (lokma-toyxonalar-server).
 */
export const STALE = {
  list: 30_000,
  detail: 60_000,
  calendar: 15_000,
  quote: 30_000,
} as const;

const HOUR = 3_600_000;

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE.list,
        gcTime: 24 * HOUR, // persist maxAge'dan kam bo'lmasin
        // 4xx — qayta urinishning foydasi yo'q; tarmoq va 5xx da 2 marta, qisqa kutish bilan
        retry: (n, e) => n < 2 && !(e instanceof ApiError && e.status >= 400 && e.status < 500),
        retryDelay: (n) => Math.min(400 * 2 ** n, 3000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        // WebView'da navigator.onLine ba'zan noto'g'ri — so'rov to'xtab qolmasin, tez xato berib qayta uriniladi
        networkMode: 'always',
      },
    },
  });
}

// Xotira to'lgan / brauzer storage'ni bloklagan holatda ilova yiqilmasin
const safeStorage = {
  getItem: async (k: string) => { try { return await AsyncStorage.getItem(k); } catch { return null; } },
  setItem: async (k: string, v: string) => { try { await AsyncStorage.setItem(k, v); } catch { /* kvota */ } },
  removeItem: async (k: string) => { try { await AsyncStorage.removeItem(k); } catch { /* */ } },
};

/** Faqat to'yxona ma'lumotlari saqlanadi: ro'yxat, "tez orada bo'sh", to'yxona sahifasi. Kalendar/narx — doim yangi. */
const PERSISTED = new Set(['venues', 'free-soon', 'venue']);

export const persistOptions = {
  persister: createAsyncStoragePersister({ storage: safeStorage, key: 'lokma-rq-v1', throttleTime: 1500 }),
  maxAge: 12 * HOUR,
  // Ilova yangilansa eski shakldagi kesh tashlab yuboriladi
  buster: `${Constants.expoConfig?.version ?? '0'}-1`,
  dehydrateOptions: {
    shouldDehydrateQuery: (q: Query) => q.state.status === 'success' && PERSISTED.has(String(q.queryKey[0])),
  },
};
