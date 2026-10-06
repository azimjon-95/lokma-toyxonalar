// Server bo'lmaganda ishlaydigan "soxta server". Javob shakllari docs/API.md bilan bir xil.
import type {
  Booking, BookingRequest, CalendarDay, FreeSoonItem, QuoteRequest, QuoteResponse,
  SessionCode, SlotStatus, VenueDetail, VenueListItem, VenueQuery,
} from '../types';
import { MOCK_VENUES, SESSIONS, VENDORS, WEEKEND_FACTOR, DEPOSIT_PERCENT, photoSet, type MockVenue } from '../data/mockData';
import { distanceKm } from '../lib/geo';
import { addDays, isWeekend, parseISODate, startOfToday, toISODate, SESSION_ORDER } from '../lib/dates';
import { pricePerGuest, priceRange } from './pricing';
import { ApiError } from './errors';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const bookedByUser = new Map<string, SlotStatus>(); // `${hall}|${date}|${session}`

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function slotStatus(hallId: string, date: string, session: SessionCode): SlotStatus {
  const key = `${hallId}|${date}|${session}`;
  const own = bookedByUser.get(key);
  if (own) return own;
  if (date < toISODate(startOfToday())) return 'closed';
  const weekend = isWeekend(parseISODate(date));
  const r = hash(key);
  const busyChance = session === 'evening' ? (weekend ? 0.75 : 0.45) : session === 'day' ? (weekend ? 0.55 : 0.35) : 0.3;
  return r < busyChance ? 'booked' : 'free';
}

function nextFree(v: MockVenue): VenueListItem['next_free'] {
  const today = startOfToday();
  for (let i = 0; i < 30; i++) {
    const date = toISODate(addDays(today, i));
    for (const s of ['evening', 'day', 'morning'] as SessionCode[]) {
      if (v.halls.some((h) => slotStatus(h.id, date, s) === 'free')) return { date, session: s };
    }
  }
  return null;
}

function toListItem(v: MockVenue, from: { lat: number; lng: number }): VenueListItem {
  const range = priceRange(v.menu, SESSIONS, WEEKEND_FACTOR);
  const photos = photoSet(v.photoOffset);
  return {
    id: v.id, slug: v.slug, name: v.name, district: v.district, lat: v.lat, lng: v.lng,
    rating: v.rating, reviews_count: v.reviews_count, photos: photos.slice(0, 3), photos_count: photos.length,
    capacity_min: Math.min(...v.halls.map((h) => h.capacity_min)),
    capacity_max: Math.max(...v.halls.map((h) => h.capacity_max)),
    price_from: range.from, price_to: range.to, has_parking: v.parking_spots > 0,
    next_free: nextFree(v),
    distance_km: Math.round(distanceKm(from, v) * 10) / 10,
  };
}

const findVenue = (idOrSlug: string) => {
  const v = MOCK_VENUES.find((x) => x.id === idOrSlug || x.slug === idOrSlug);
  if (!v) throw new ApiError('To‘yxona topilmadi', 404, 'not_found');
  return v;
};

export const mockApi = {
  async listVenues(q: VenueQuery): Promise<VenueListItem[]> {
    await delay();
    const today = toISODate(startOfToday());
    let items = MOCK_VENUES.map((v) => toListItem(v, q)).filter((v) => v.distance_km <= q.radius_km);
    if (q.q) {
      const s = q.q.trim().toLowerCase();
      items = items.filter((v) => v.name.toLowerCase().includes(s) || v.district.toLowerCase().includes(s));
    }
    switch (q.filter) {
      case 'free_today': items = items.filter((v) => v.next_free?.date === today); break;
      case 'cheap': items = items.filter((v) => v.price_from <= 150000); break;
      case 'big': items = items.filter((v) => v.capacity_max >= 500); break;
      case 'parking': items = items.filter((v) => v.has_parking); break;
    }
    if (q.event_type) {
      const allowed = SESSIONS.filter((s) => s.event_types.includes(q.event_type!)).map((s) => s.code);
      items = items.filter((v) => !!v.next_free && allowed.includes(v.next_free.session));
    }
    const sorters: Record<string, (a: VenueListItem, b: VenueListItem) => number> = {
      distance: (a, b) => a.distance_km - b.distance_km,
      price_asc: (a, b) => a.price_from - b.price_from,
      price_desc: (a, b) => b.price_from - a.price_from,
      rating: (a, b) => b.rating - a.rating,
    };
    return items.sort(sorters[q.sort ?? 'distance']);
  },

  async freeSoon(q: VenueQuery & { days: number }): Promise<FreeSoonItem[]> {
    const venues = await mockApi.listVenues({ ...q, filter: 'all', q: undefined });
    const today = startOfToday();
    const out: FreeSoonItem[] = [];
    for (const venue of venues) {
      const mv = findVenue(venue.id);
      search: for (let i = 0; i < q.days; i++) {
        const date = toISODate(addDays(today, i));
        for (const s of ['evening', 'day', 'morning'] as SessionCode[]) {
          if (mv.halls.some((h) => slotStatus(h.id, date, s) === 'free')) {
            out.push({ venue, date, session: s });
            break search;
          }
        }
      }
    }
    return out.sort((a, b) => a.date.localeCompare(b.date) || a.venue.distance_km - b.venue.distance_km).slice(0, 6);
  },

  async getVenue(slug: string, from: { lat: number; lng: number }): Promise<VenueDetail> {
    await delay(250);
    const v = findVenue(slug);
    const base = toListItem(v, from);
    return {
      ...base,
      photos: photoSet(v.photoOffset),
      address: v.address,
      phone: '+998 71 200 00 00',
      description: `${v.name} — ${v.district} tumanidagi zamonaviy to‘yxona.`,
      parking_spots: v.parking_spots,
      amenities: v.amenities,
      halls: v.halls,
      sessions: SESSIONS,
      menu_packages: v.menu,
      vendors: VENDORS,
      weekend_factor: WEEKEND_FACTOR,
      deposit_percent: DEPOSIT_PERCENT,
      guests_min: 150,
      guests_max: base.capacity_max,
    };
  },

  async getCalendar(hallId: string, month: string): Promise<CalendarDay[]> {
    await delay(200);
    const [y, m] = month.split('-').map(Number);
    const days = new Date(y, m, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const date = toISODate(new Date(y, m - 1, i + 1));
      const sessions = Object.fromEntries(SESSION_ORDER.map((s) => [s, slotStatus(hallId, date, s)])) as CalendarDay['sessions'];
      return { date, sessions };
    });
  },

  async quote(req: QuoteRequest): Promise<QuoteResponse> {
    const v = findVenue(req.venue_id);
    const menu = v.menu.find((m) => m.id === req.menu_package_id);
    const session = SESSIONS.find((s) => s.code === req.session);
    if (!menu || !session) throw new ApiError('Noto‘g‘ri so‘rov', 422, 'validation');
    const ppg = pricePerGuest(menu, session, isWeekend(parseISODate(req.date)), WEEKEND_FACTOR);
    const venue_total = ppg * req.guests;
    const extras = VENDORS.filter((x) => req.vendor_ids.includes(x.id)).map((x) => ({ vendor_id: x.id, name: x.name, type: x.type, price: x.price }));
    const total = venue_total + extras.reduce((s, e) => s + e.price, 0);
    return { price_per_guest: ppg, venue_total, extras, total, deposit: Math.round((total * DEPOSIT_PERCENT) / 100) };
  },

  async createBooking(req: BookingRequest): Promise<Booking> {
    await delay(600);
    const key = `${req.hall_id}|${req.date}|${req.session}`;
    if (slotStatus(req.hall_id, req.date, req.session) !== 'free') {
      throw new ApiError('Bu seans allaqachon band qilingan. Boshqa seansni tanlang.', 409, 'slot_taken');
    }
    const q = await mockApi.quote(req);
    bookedByUser.set(key, 'hold');
    const now = new Date();
    return {
      id: `b-${now.getTime()}`,
      number: `TY-${String(now.getTime()).slice(-6)}`,
      status: 'pending',
      venue_id: req.venue_id,
      venue_name: findVenue(req.venue_id).name,
      date: req.date,
      session: req.session,
      guests: req.guests,
      total: q.total,
      deposit: q.deposit,
      payment_url: null,
      hold_until: new Date(now.getTime() + 30 * 60000).toISOString(),
      created_at: now.toISOString(),
    };
  },
};
