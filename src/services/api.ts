// Ilovaning yagona ma'lumot manbai. EXPO_PUBLIC_API_URL bo'lsa — server, bo'lmasa — mock.
import type {
  Booking, BookingRequest, CalendarDay, FreeSoonItem, LatLng, QuoteRequest, QuoteResponse,
  VenueDetail, VenueListItem, VenueQuery,
} from '../types';
import { USE_MOCK } from '../config/env';
import { request } from './http';
import { mockApi } from './mockApi';

export const api = {
  listVenues: (q: VenueQuery): Promise<VenueListItem[]> =>
    USE_MOCK ? mockApi.listVenues(q) : request('GET', '/api/venues', { query: { ...q } }),

  freeSoon: (q: VenueQuery & { days: number }): Promise<FreeSoonItem[]> =>
    USE_MOCK ? mockApi.freeSoon(q) : request('GET', '/api/venues/free-soon', { query: { ...q } }),

  getVenue: (slug: string, from: LatLng): Promise<VenueDetail> =>
    USE_MOCK ? mockApi.getVenue(slug, from) : request('GET', `/api/venues/${encodeURIComponent(slug)}`, { query: { ...from } }),

  getCalendar: (hallId: string, month: string): Promise<CalendarDay[]> =>
    USE_MOCK ? mockApi.getCalendar(hallId, month) : request('GET', `/api/halls/${encodeURIComponent(hallId)}/calendar`, { query: { month } }),

  quote: (req: QuoteRequest): Promise<QuoteResponse> =>
    USE_MOCK ? mockApi.quote(req) : request('POST', '/api/quote', { body: req }),

  createBooking: (req: BookingRequest): Promise<Booking> =>
    USE_MOCK ? mockApi.createBooking(req) : request('POST', '/api/bookings', { body: req }),
};
