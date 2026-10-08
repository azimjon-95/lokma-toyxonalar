/*
 * O'zbekiston hududlari markazlari — "Boshqa hudud" (masalan, tug'ilgan joy)
 * tanlash uchun. radiusKm — hudud kattaligiga mos qidiruv radiusi.
 */
export interface Region { id: string; name: string; lat: number; lng: number; radiusKm: number }

export const REGIONS: Region[] = [
  { id: 'toshkent_sh', name: 'Toshkent shahri', lat: 41.3111, lng: 69.2797, radiusKm: 25 },
  { id: 'toshkent_v', name: 'Toshkent viloyati', lat: 41.0, lng: 69.6, radiusKm: 80 },
  { id: 'andijon', name: 'Andijon', lat: 40.7821, lng: 72.3442, radiusKm: 60 },
  { id: 'namangan', name: 'Namangan', lat: 40.9983, lng: 71.6726, radiusKm: 60 },
  { id: 'fargona', name: "Farg'ona", lat: 40.3842, lng: 71.7843, radiusKm: 70 },
  { id: 'samarqand', name: 'Samarqand', lat: 39.6542, lng: 66.9597, radiusKm: 80 },
  { id: 'buxoro', name: 'Buxoro', lat: 39.7681, lng: 64.4556, radiusKm: 90 },
  { id: 'navoiy', name: 'Navoiy', lat: 40.0844, lng: 65.3792, radiusKm: 100 },
  { id: 'qashqadaryo', name: 'Qashqadaryo', lat: 38.8606, lng: 65.7891, radiusKm: 90 },
  { id: 'surxondaryo', name: 'Surxondaryo', lat: 37.2242, lng: 67.2783, radiusKm: 90 },
  { id: 'jizzax', name: 'Jizzax', lat: 40.1158, lng: 67.8422, radiusKm: 70 },
  { id: 'sirdaryo', name: 'Sirdaryo', lat: 40.4897, lng: 68.7842, radiusKm: 60 },
  { id: 'xorazm', name: 'Xorazm', lat: 41.5504, lng: 60.6316, radiusKm: 70 },
  { id: 'qoraqalpogiston', name: "Qoraqalpog'iston", lat: 42.4611, lng: 59.6166, radiusKm: 150 },
];

/** "Butun O'zbekiston" — serverda ruxsat etilgan eng katta radius */
export const ALL_RADIUS_KM = 1000;
export const UZ_CENTER = { lat: 41.0, lng: 64.5 };
