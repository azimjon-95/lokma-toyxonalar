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
 * ma'lumotlari bilan JIMGINA ko'rsatiladi (ogohlantirish belgisi yo'q).
 * BRON YARATISH hech qachon soxta bo'lmaydi — faqat haqiqiy server.
 * O'chirish: EXPO_PUBLIC_MOCK_FALLBACK=false
 */
const MOCK_FALLBACK = (process.env.EXPO_PUBLIC_MOCK_FALLBACK ?? 'true') !== 'false';
async function withFallback<T>(real: () => Promise<T>, mock: () => Promise<T>, isEmpty?: (r: T) => boolean): Promise<T> {
  if (USE_MOCK) return mock();
  if (!MOCK_FALLBACK) return real();
  try {
    const r = await real();
    // Server javob berdi, lekin hali ma'lumot yo'q — test uchun mock ko'rsatamiz
    if (isEmpty?.(r)) return mock();
    return r;
  } catch (e) {
    /*
     * Har qanday xatoda (tarmoq, 5xx, 4xx: masalan to'yxona serverda yo'q yoki
     * eski server katta radiusni rad etdi) — test ma'lumotlari. Bron bunga kirmaydi.
     */
    if (e instanceof ApiError) return mock();
    throw e;
  }
}

/*
 * Test ma'lumotlari Toshkentda — mijoz boshqa viloyatda bo'lsa radius ichida
 * hech narsa chiqmasdi. Test rejimida radius cheklanmaydi (hammasi ko'rinadi).
 */
const MOCK_ANY_RADIUS = 100_000;
const isEmptyList = (r: unknown[]) => !Array.isArray(r) || r.length === 0;

export const api = {
  listVenues: (q: VenueQuery): Promise<VenueListItem[]> =>
    withFallback(() => request('GET', '/api/venues', { query: { ...q } }), () => mockApi.listVenues({ ...q, radius_km: MOCK_ANY_RADIUS }), (r) => isEmptyList(r) && !q.q && (!q.filter || q.filter === 'all')),

  freeSoon: (q: VenueQuery & { days: number }): Promise<FreeSoonItem[]> =>
    withFallback(() => request('GET', '/api/venues/free-soon', { query: { ...q } }), () => mockApi.freeSoon({ ...q, radius_km: MOCK_ANY_RADIUS }), isEmptyList),

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
