// Lokma To'yxonalari - Core Types (from TZ)

export type SessionCode = 'morning' | 'day' | 'evening';
export type SlotStatus = 'free' | 'hold' | 'booked' | 'closed';
export type EventTypeCode = 'nahorgi_osh' | 'nikoh' | 'kunduzgi' | 'kechki';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type UserRole = 'guest' | 'client' | 'venue_admin' | 'super_admin';
export type PaymentProvider = 'click' | 'payme' | 'uzum';

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  description_uz?: string;
  description_ru?: string;
  rating: number;
  reviews_count: number;
  parking_spots: number;
  amenities: string[];
  status: 'active' | 'pending' | 'rejected';
  photos: string[];
  // Computed
  distance_km?: number;
  price_from?: number;
  price_to?: number;
  next_free_session?: string;
  capacity_min?: number;
  capacity_max?: number;
  halls_count?: number;
}

export interface Hall {
  id: string;
  venue_id: string;
  name: string;
  capacity_min: number;
  capacity_max: number;
  photos: string[];
}

export interface SessionTemplate {
  id: string;
  venue_id: string;
  code: SessionCode;
  start_time: string; // "06:00"
  end_time: string;
  event_types: EventTypeCode[];
  min_guests: number;
}

export interface MenuPackage {
  id: string;
  venue_id: string;
  name: string; // Standart / Premium / VIP
  items_text: string;
  price_per_guest: number;
  event_types: EventTypeCode[];
}

export interface Slot {
  id: string;
  hall_id: string;
  date: string; // YYYY-MM-DD
  session_code: SessionCode;
  status: SlotStatus;
  hold_until?: string;
  booking_id?: string;
  price_per_guest?: number;
}

export interface CalendarDay {
  date: string;
  sessions: {
    morning: SlotStatus;
    day: SlotStatus;
    evening: SlotStatus;
  };
  is_past: boolean;
  is_full: boolean;
  is_partial: boolean;
  is_free: boolean;
}

export interface Vendor {
  id: string;
  type: 'video' | 'cortege';
  name: string;
  description: string;
  price: number;
  photos: string[];
  rating?: number;
}

export interface BookingExtra {
  vendor_id: string;
  price: number;
  name?: string;
}

export interface QuoteRequest {
  hall_id: string;
  date: string;
  session: SessionCode;
  guests: number;
  menu_package_id: string;
  extras?: string[]; // vendor ids
}

export interface QuoteResponse {
  total: number;
  deposit: number; // 30%
  breakdown: {
    venue: number;
    video?: number;
    cortege?: number;
  };
  price_per_guest: number;
}

export interface Booking {
  id: string;
  number: string;
  user_id: string;
  hall_id: string;
  date: string;
  session_code: SessionCode;
  event_type: EventTypeCode;
  guests: number;
  menu_package_id: string;
  extras: BookingExtra[];
  total: number;
  deposit: number;
  status: BookingStatus;
  created_at: string;
}

// UI specific
export interface FilterState {
  event_type?: EventTypeCode;
  session?: SessionCode;
  price_min?: number;
  price_max?: number;
  guests?: number;
  date?: string;
  amenities?: string[];
  radius_km: number;
  sort: 'distance' | 'price_asc' | 'price_desc' | 'rating';
}

export interface LocationState {
  lat: number;
  lng: number;
  address: string;
  isLoading: boolean;
  error?: string;
}
