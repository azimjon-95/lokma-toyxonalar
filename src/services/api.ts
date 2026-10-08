// Ilovaning yagona ma'lumot manbai. EXPO_PUBLIC_API_URL bo'lsa — server, bo'lmasa — mock.
import type {
  Booking, BookingRequest, CalendarDay, FreeSoonItem, LatLng, QuoteRequest, QuoteResponse,
  VenueDetail, VenueListItem, VenueQuery,
} from '../types';
import { USE_MOCK } from '../config/env';
import { request, ApiError } from './http';
import { mockApi } from './mockApi';

/*
 * ═══ TEST REJIMI (vaqtinchalik) ═══
 * Server bilan aloqa bo'lmasa (tarmoq xatosi, vaqt tugashi, 5xx) — ro'yxat,
 * to'yxona sahifasi, kalendar va narx hisobi ilova ichidagi test (mock)
 * ma'lumotlari bilan ko'rsatiladi, sahifa bo'sh "xato" bo'lib qolmaydi.
 * BRON YARATISH hech qachon soxta bo'lmaydi — faqat haqiqiy server.
 * O'chirish: EXPO_PUBLIC_MOCK_FALLBACK=false
 */
const MOCK_FALLBACK = (process.env.EXPO_PUBLIC_MOCK_FALLBACK ?? 'true') !== 'false';
let mockActive = USE_MOCK;
const listeners = new Set<(v: boolean) => void>();
function setMockActive(v: boolean) {
  if (mockActive === v) return;
  mockActive = v;
  listeners.forEach((l) => l(v));
}
export const mockMode = {
  get: () => mockActive,
  subscribe: (l: (v: boolean) => void) => { listeners.add(l); return () => { listeners.delete(l); }; },
};

async function withFallback<T>(real: () => Promise<T>, mock: () => Promise<T>): Promise<T> {
  if (USE_MOCK) return mock();
  try {
    const r = await real();
    setMockActive(false);
    return r;
  } catch (e) {
    const offline = e instanceof ApiError && (e.status === 0 || e.status >= 500);
    if (MOCK_FALLBACK && offline) {
      setMockActive(true);
      return mock();
    }
    throw e;
  }
}

export const api = {
  listVenues: (q: VenueQuery): Promise<VenueListItem[]> =>
    withFallback(() => request('GET', '/api/venues', { query: { ...q } }), () => mockApi.listVenues(q)),

  freeSoon: (q: VenueQuery & { days: number }): Promise<FreeSoonItem[]> =>
    withFallback(() => request('GET', '/api/venues/free-soon', { query: { ...q } }), () => mockApi.freeSoon(q)),

  getVenue: (slug: string, from: LatLng): Promise<VenueDetail> =>
    withFallback(() => request('GET', `/api/venues/${encodeURIComponent(slug)}`, { query: { ...from } }), () => mockApi.getVenue(slug, from)),

  getCalendar: (hallId: string, month: string): Promise<CalendarDay[]> =>
    withFallback(() => request('GET', `/api/halls/${encodeURIComponent(hallId)}/calendar`, { query: { month } }), () => mockApi.getCalendar(hallId, month)),

  quote: (req: QuoteRequest): Promise<QuoteResponse> =>
    withFallback(() => request('POST', '/api/quote', { body: req }), () => mockApi.quote(req)),

  // Bron — faqat haqiqiy server (test rejimida ham soxta bron yaratilmaydi)
  createBooking: (req: BookingRequest): Promise<Booking> =>
    USE_MOCK ? mockApi.createBooking(req) : request('POST', '/api/bookings', { body: req }),
};
