// Lokma To'yxonalari — domen turlari (TZ ma'lumotlar modeli asosida).
// Server javoblari ham aynan shu shaklda bo'lishi kerak: docs/API.md

export type SessionCode = 'morning' | 'day' | 'evening';
export type SlotStatus = 'free' | 'hold' | 'booked' | 'closed';
export type EventTypeCode = 'nahorgi_osh' | 'nikoh' | 'kunduzgi' | 'kechki';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type VendorType = 'video' | 'cortege';
export type SortKey = 'distance' | 'price_asc' | 'price_desc' | 'rating';
export type QuickFilter = 'all' | 'free_today' | 'cheap' | 'big' | 'parking';

export interface LatLng {
  lat: number;
  lng: number;
}

/** Ro'yxat va xaritadagi qisqa ko'rinish */
export interface VenueListItem {
  id: string;
  slug: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  photos: string[];
  photos_count: number;
  capacity_min: number;
  capacity_max: number;
  price_from: number; // so'm / kishi
  price_to: number;
  has_parking: boolean;
  /** Eng yaqin bo'sh seans */
  next_free: { date: string; session: SessionCode } | null;
  /** Serverda (lat,lng) bo'yicha hisoblanadi */
  distance_km: number;
}

export interface Hall {
  id: string;
  name: string;
  capacity_min: number;
  capacity_max: number;
}

export interface SessionTemplate {
  code: SessionCode;
  start_time: string; // "18:00"
  end_time: string; // "23:00"
  event_types: EventTypeCode[];
  /** Narx koeffitsiyenti (nahor 0.6, kunduz 1, kechki 1.15) */
  price_factor: number;
  min_guests: number;
}

export interface MenuPackage {
  id: string;
  name: string;
  items_text: string;
  price_per_guest: number;
}

export interface Vendor {
  id: string;
  type: VendorType;
  name: string;
  description: string;
  price: number;
  photo?: string;
  rating?: number;
}

export interface VenueDetail extends VenueListItem {
  address: string;
  phone: string;
  description: string;
  parking_spots: number;
  amenities: string[];
  halls: Hall[];
  sessions: SessionTemplate[];
  menu_packages: MenuPackage[];
  vendors: Vendor[];
  weekend_factor: number; // 1.15
  deposit_percent: number; // 30
  guests_min: number;
  guests_max: number;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  sessions: Record<SessionCode, SlotStatus>;
}

/** "3 kun ichida bo'sh" banneri uchun */
export interface FreeSoonItem {
  venue: VenueListItem;
  date: string;
  session: SessionCode;
}

export interface VenueQuery extends LatLng {
  radius_km: number;
  q?: string;
  filter?: QuickFilter;
  event_type?: EventTypeCode;
  sort?: SortKey;
}

export interface QuoteRequest {
  venue_id: string;
  hall_id: string;
  date: string;
  session: SessionCode;
  guests: number;
  menu_package_id: string;
  vendor_ids: string[];
}

export interface QuoteResponse {
  price_per_guest: number;
  venue_total: number;
  extras: { vendor_id: string; name: string; type: VendorType; price: number }[];
  total: number;
  deposit: number;
}

export interface BookingRequest extends QuoteRequest {
  event_type: EventTypeCode;
  customer_name: string;
  customer_phone: string;
}

export interface Booking {
  id: string;
  number: string;
  status: BookingStatus;
  venue_id: string;
  venue_name: string;
  date: string;
  session: SessionCode;
  guests: number;
  total: number;
  deposit: number;
  /** To'lov sahifasi (Click/Payme/Uzum). Mock rejimda null */
  payment_url: string | null;
  /** Seans shu vaqtgacha band qilib turiladi (TZ: 30 daqiqa) */
  hold_until: string;
  created_at: string;
}
