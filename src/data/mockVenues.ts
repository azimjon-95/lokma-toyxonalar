import { Venue } from '../types';

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: "Navro'z Saroyi",
    slug: 'navroz-saroyi',
    address: 'Chilonzor tumani',
    lat: 41.2856,
    lng: 69.2034,
    rating: 4.8,
    reviews_count: 312,
    parking_spots: 150,
    amenities: ['Konditsioner', 'Sahna va LED ekran', 'Ovoz tizimi', 'Kelin xonasi', 'Namozxona', 'Bolalar xonasi', 'Parking 150 o\'rin', 'Generator'],
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1519167758481-83f29da849d1?w=800',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
      'https://images.unsplash.com/photo-1478144592103-25e218a04891?w=800',
    ],
    distance_km: 1.8,
    price_from: 150000,
    price_to: 320000,
    next_free_session: "Bo'sh: bugun, kechki",
    capacity_min: 300,
    capacity_max: 900,
    halls_count: 2,
  },
  {
    id: '2',
    name: 'Oltin Qasr',
    slug: 'oltin-qasr',
    address: 'Yakkasaroy',
    lat: 41.2995,
    lng: 69.2401,
    rating: 4.7,
    reviews_count: 198,
    parking_spots: 80,
    amenities: ['Konditsioner', 'Sahna', 'Parking'],
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
    ],
    distance_km: 3.4,
    price_from: 180000,
    price_to: 350000,
    next_free_session: "Bo'sh: ertaga, kunduzgi",
    capacity_min: 200,
    capacity_max: 600,
    halls_count: 1,
  },
  {
    id: '3',
    name: "Bahor Ko'chasi",
    slug: 'bahor-kochasi',
    address: 'Mirzo Ulug\'bek',
    lat: 41.3380,
    lng: 69.3340,
    rating: 4.6,
    reviews_count: 145,
    parking_spots: 120,
    amenities: ['Konditsioner', 'Sahna', 'Kelin xonasi', 'Generator'],
    status: 'active',
    photos: [
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    ],
    distance_km: 5.1,
    price_from: 160000,
    price_to: 280000,
    next_free_session: "Bo'sh: bugun, nahor",
    capacity_min: 250,
    capacity_max: 700,
    halls_count: 2,
  },
];

export const mockSessions = [
  { code: 'morning' as const, label: 'Nahorgi osh', time: '06:00–10:00', price: 132000, status: 'booked' as const },
  { code: 'day' as const, label: 'Kunduzgi', time: '12:00–16:00', price: 220000, status: 'booked' as const },
  { code: 'evening' as const, label: 'Kechki', time: '18:00–23:00', price: 253000, status: 'free' as const },
];

export const mockMenuPackages = [
  { id: 'std', name: 'Standart', price: 150000, items: 'Standart + qazi, 6 xil salat, 3 issiq taom, tort' },
  { id: 'prem', name: 'Premium', price: 220000, items: 'Standart + qazi, 6 xil salat, 3 issiq taom, tort' },
  { id: 'vip', name: 'VIP', price: 320000, items: 'Premium + qo\'shimcha taomlar, premium tort' },
];

export const mockVendors = {
  video: [
    { id: 'v1', type: 'video' as const, name: 'Kadr Studio', description: '2 kamera · montaj · 4K', price: 5000000, photos: [] },
    { id: 'v2', type: 'video' as const, name: 'Lens Media', description: '3 kamera · dron · klip', price: 8500000, photos: [] },
  ],
  cortege: [
    { id: 'c1', type: 'cortege' as const, name: 'Chevrolet Malibu', description: '5 ta oq mashina · 3 soat', price: 2500000, photos: [] },
    { id: 'c2', type: 'cortege' as const, name: 'Lincoln limuzin', description: '1 ta · 4 soat', price: 3500000, photos: [] },
  ],
};
