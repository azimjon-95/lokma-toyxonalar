// Ilovaning yagona ma'lumot manbai — haqiqiy server (src/config/env.ts). Mock yo'q.
import type {
  Booking, BookingRequest, CalendarDay, FreeSoonItem, LatLng, QuoteRequest, QuoteResponse,
  VenueDetail, VenueListItem, VenueQuery,
} from '../types';
import { request } from './http';

export { ApiError } from './http';

export const api = {
  listVenues: (q: VenueQuery, signal?: AbortSignal): Promise<VenueListItem[]> =>
    request('GET', '/api/venues', { query: { ...q }, signal }),

  freeSoon: (q: VenueQuery & { days: number }, signal?: AbortSignal): Promise<FreeSoonItem[]> =>
    request('GET', '/api/venues/free-soon', { query: { ...q }, signal }),

  getVenue: (slug: string, from: LatLng, signal?: AbortSignal): Promise<VenueDetail> =>
    request('GET', `/api/venues/${encodeURIComponent(slug)}`, { query: { ...from }, signal }),

  getCalendar: (hallId: string, month: string, signal?: AbortSignal): Promise<CalendarDay[]> =>
    request('GET', `/api/halls/${encodeURIComponent(hallId)}/calendar`, { query: { month }, signal }),

  quote: (req: QuoteRequest, signal?: AbortSignal): Promise<QuoteResponse> =>
    request('POST', '/api/quote', { body: req, signal }),

  createBooking: (req: BookingRequest): Promise<Booking> => request('POST', '/api/bookings', { body: req }),
};
