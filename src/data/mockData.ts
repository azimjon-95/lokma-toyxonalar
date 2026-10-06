// Demo ma'lumotlar. Server ulanganda ishlatilmaydi (EXPO_PUBLIC_API_URL).
import type { MenuPackage, SessionTemplate, Vendor, Hall } from '../types';

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=70&auto=format&fit=crop`;
const PHOTOS = [
  u('photo-1519167758481-83f29da849d1'),
  u('photo-1464366400600-7168b8af9bc3'),
  u('photo-1478144592103-25e218a04891'),
  u('photo-1519225421980-715cb0215aed'),
  u('photo-1511795409834-ef04bbd61622'),
  u('photo-1505236858219-8359eb29e329'),
];
export const photoSet = (offset: number, count = 12) =>
  Array.from({ length: count }, (_, i) => PHOTOS[(i + offset) % PHOTOS.length]);

export interface MockVenue {
  id: string;
  slug: string;
  name: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews_count: number;
  parking_spots: number;
  amenities: string[];
  halls: Hall[];
  menu: MenuPackage[];
  photoOffset: number;
}

const AMENITIES = ['Konditsioner', 'Sahna va LED ekran', 'Ovoz tizimi', 'Kelin xonasi', 'Namozxona', 'Bolalar xonasi', 'Generator', 'Wi-Fi'];

const menu = (base: number): MenuPackage[] => [
  { id: 'std', name: 'Standart', price_per_guest: base, items_text: 'Osh, 4 xil salat, 2 issiq taom, meva, shirinlik, choy' },
  { id: 'prem', name: 'Premium', price_per_guest: Math.round((base * 1.45) / 10000) * 10000, items_text: 'Standart + qazi, 6 xil salat, 3 issiq taom, tort' },
  { id: 'vip', name: 'VIP', price_per_guest: Math.round((base * 2.1) / 10000) * 10000, items_text: 'Premium + baliq, shashlik, alohida ofitsiantlar' },
];

const halls = (id: string, big: number, small?: number): Hall[] => [
  { id: `${id}-h1`, name: 'Katta zal', capacity_min: Math.round(big * 0.4), capacity_max: big },
  ...(small ? [{ id: `${id}-h2`, name: 'Kichik zal', capacity_min: 100, capacity_max: small }] : []),
];

export const MOCK_VENUES: MockVenue[] = [
  { id: 'v1', slug: 'navroz-saroyi', name: 'Navro‘z Saroyi', district: 'Chilonzor', address: 'Chilonzor tumani, Bunyodkor ko‘chasi', lat: 41.2856, lng: 69.2034, rating: 4.8, reviews_count: 312, parking_spots: 150, amenities: AMENITIES, halls: halls('v1', 900, 400), menu: menu(150000), photoOffset: 0 },
  { id: 'v2', slug: 'oltin-qasr', name: 'Oltin Qasr', district: 'Yakkasaroy', address: 'Yakkasaroy tumani, Shota Rustaveli ko‘chasi', lat: 41.2995, lng: 69.2401, rating: 4.7, reviews_count: 198, parking_spots: 80, amenities: AMENITIES.slice(0, 5), halls: halls('v2', 600), menu: menu(180000), photoOffset: 3 },
  { id: 'v3', slug: 'bahor-koshk', name: 'Bahor Ko‘shk', district: 'Uchtepa', address: 'Uchtepa tumani, Lutfiy ko‘chasi', lat: 41.2921, lng: 69.1748, rating: 4.6, reviews_count: 145, parking_spots: 0, amenities: ['Konditsioner', 'Sahna va LED ekran', 'Kelin xonasi', 'Generator'], halls: halls('v3', 500), menu: menu(110000), photoOffset: 1 },
  { id: 'v4', slug: 'gulshan-hall', name: 'Gulshan Hall', district: 'Sergeli', address: 'Sergeli tumani, Yangi Sergeli ko‘chasi', lat: 41.2271, lng: 69.2208, rating: 4.9, reviews_count: 421, parking_spots: 200, amenities: AMENITIES, halls: halls('v4', 800, 300), menu: menu(130000), photoOffset: 2 },
  { id: 'v5', slug: 'afsona-saroyi', name: 'Afsona Saroyi', district: 'Yunusobod', address: 'Yunusobod tumani, Amir Temur ko‘chasi', lat: 41.3655, lng: 69.2869, rating: 4.8, reviews_count: 276, parking_spots: 180, amenities: AMENITIES, halls: halls('v5', 1000, 450), menu: menu(190000), photoOffset: 4 },
  { id: 'v6', slug: 'iqbol-toyxonasi', name: 'Iqbol To‘yxonasi', district: 'Zangiota', address: 'Zangiota tumani, Toshkent halqa yo‘li', lat: 41.2489, lng: 69.1203, rating: 4.5, reviews_count: 88, parking_spots: 120, amenities: AMENITIES.slice(0, 6), halls: halls('v6', 700), menu: menu(100000), photoOffset: 5 },
  { id: 'v7', slug: 'yulduz-palace', name: 'Yulduz Palace', district: 'Qibray', address: 'Qibray tumani, Bayt qishlog‘i', lat: 41.3912, lng: 69.4471, rating: 4.7, reviews_count: 164, parking_spots: 250, amenities: AMENITIES, halls: halls('v7', 1200, 500), menu: menu(160000), photoOffset: 2 },
  { id: 'v8', slug: 'chinor-bog', name: 'Chinor Bog‘', district: 'Chirchiq', address: 'Chirchiq shahri, Amir Temur ko‘chasi', lat: 41.4689, lng: 69.5822, rating: 4.6, reviews_count: 59, parking_spots: 90, amenities: AMENITIES.slice(0, 4), halls: halls('v8', 600), menu: menu(90000), photoOffset: 0 },
];

export const SESSIONS: SessionTemplate[] = [
  { code: 'morning', start_time: '06:00', end_time: '10:00', event_types: ['nahorgi_osh'], price_factor: 0.6, min_guests: 200 },
  { code: 'day', start_time: '12:00', end_time: '16:00', event_types: ['kunduzgi', 'nikoh'], price_factor: 1, min_guests: 150 },
  { code: 'evening', start_time: '18:00', end_time: '23:00', event_types: ['kechki', 'nikoh'], price_factor: 1.15, min_guests: 150 },
];

export const VENDORS: Vendor[] = [
  { id: 'vid-1', type: 'video', name: 'Kadr Studio', description: '2 kamera · montaj · 4K', price: 5_000_000, rating: 4.8 },
  { id: 'vid-2', type: 'video', name: 'Lens Media', description: '3 kamera · dron · klip', price: 8_500_000, rating: 4.9 },
  { id: 'vid-3', type: 'video', name: 'Oila Film', description: '1 kamera · montaj', price: 3_000_000, rating: 4.6 },
  { id: 'vid-4', type: 'video', name: 'Premium Wedding', description: '4 kamera · dron · Love story', price: 12_000_000, rating: 5.0 },
  { id: 'car-1', type: 'cortege', name: 'Chevrolet Malibu', description: '5 ta oq mashina · 3 soat', price: 2_500_000 },
  { id: 'car-2', type: 'cortege', name: 'Lincoln limuzin', description: '1 ta · 4 soat', price: 3_500_000 },
  { id: 'car-3', type: 'cortege', name: 'Mercedes E-class', description: '3 ta · gul bezagi bilan', price: 4_500_000 },
  { id: 'car-4', type: 'cortege', name: 'Retro Volga', description: '2 ta · fotosessiya uchun', price: 2_000_000 },
];

export const WEEKEND_FACTOR = 1.15;
export const DEPOSIT_PERCENT = 30;
