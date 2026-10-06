# Lokma To'yxonalari — Server API shartnomasi

Ilova `EXPO_PUBLIC_API_URL` o'rnatilganda shu endpointlarni chaqiradi. O'rnatilmagan bo'lsa
`src/services/mockApi.ts` aynan shu shakldagi javoblarni qaytaradi — server yozishda uni namuna sifatida ishlating.
Barcha turlar: `src/types/index.ts`.

## Umumiy qoidalar

- Format: JSON, UTF-8. Sana `YYYY-MM-DD` (Toshkent vaqti), vaqt `HH:mm`, timestamp ISO 8601.
- Pul: butun son, so'm (`150000`).
- Avtorizatsiya (bron uchun): `Authorization: Bearer <token>`. Telegram Mini App'da token `initData` imzosini tekshirib beriladi.
- Xato javobi (har qanday 4xx/5xx):
  ```json
  { "message": "Foydalanuvchiga ko'rsatiladigan matn", "code": "slot_taken", "details": {} }
  ```
  Ilova `message` ni to'g'ridan-to'g'ri ko'rsatadi.
- Timeout: ilova 15 soniya kutadi.

## Endpointlar

### `GET /api/venues`
Atrofdagi to'yxonalar ro'yxati.

| Parametr | Turi | Izoh |
|---|---|---|
| `lat`, `lng` | number | foydalanuvchi joylashuvi |
| `radius_km` | number | standart 20 (10 / 20 / 50) |
| `q` | string? | nom yoki tuman bo'yicha qidiruv |
| `filter` | `all` \| `free_today` \| `cheap` \| `big` \| `parking` | tezkor chiplar: bugun bo'sh, `price_from <= 150000`, `capacity_max >= 500`, parking bor |
| `event_type` | `nahorgi_osh` \| `nikoh` \| `kunduzgi` \| `kechki` | ixtiyoriy |
| `sort` | `distance` \| `price_asc` \| `price_desc` \| `rating` | standart `distance` |

Javob: `VenueListItem[]`
```json
[{
  "id": "v1", "slug": "navroz-saroyi", "name": "Navro'z Saroyi", "district": "Chilonzor",
  "lat": 41.2856, "lng": 69.2034, "rating": 4.8, "reviews_count": 312,
  "photos": ["https://.../1.jpg", "https://.../2.jpg", "https://.../3.jpg"], "photos_count": 12,
  "capacity_min": 100, "capacity_max": 900, "price_from": 90000, "price_to": 400000,
  "has_parking": true,
  "next_free": { "date": "2026-10-06", "session": "evening" },
  "distance_km": 1.8
}]
```
`distance_km` serverda haversine bilan hisoblanadi, `radius_km` dan uzoqlari qaytarilmaydi.

### `GET /api/venues/free-soon`
"3 kun ichida bo'sh" banneri. Parametrlar: `lat`, `lng`, `radius_km`, `days` (3).
Javob: `{ venue: VenueListItem, date, session }[]`, sana va masofa bo'yicha tartiblangan, ko'pi bilan 6 ta.

### `GET /api/venues/{slug}?lat=&lng=`
To'yxona sahifasi. Javob: `VenueDetail` = `VenueListItem` + quyidagilar:
```json
{
  "address": "Chilonzor tumani, ...", "phone": "+998712000000", "description": "...",
  "photos": ["... kamida 10 ta ..."], "parking_spots": 150, "amenities": ["Konditsioner", "Kelin xonasi"],
  "halls": [{ "id": "v1-h1", "name": "Katta zal", "capacity_min": 360, "capacity_max": 900 }],
  "sessions": [
    { "code": "morning", "start_time": "06:00", "end_time": "10:00", "event_types": ["nahorgi_osh"], "price_factor": 0.6, "min_guests": 200 },
    { "code": "day", "start_time": "12:00", "end_time": "16:00", "event_types": ["kunduzgi", "nikoh"], "price_factor": 1, "min_guests": 150 },
    { "code": "evening", "start_time": "18:00", "end_time": "23:00", "event_types": ["kechki", "nikoh"], "price_factor": 1.15, "min_guests": 150 }
  ],
  "menu_packages": [{ "id": "std", "name": "Standart", "items_text": "...", "price_per_guest": 150000 }],
  "vendors": [{ "id": "vid-1", "type": "video", "name": "Kadr Studio", "description": "2 kamera · montaj", "price": 5000000 }],
  "weekend_factor": 1.15, "deposit_percent": 30, "guests_min": 150, "guests_max": 900
}
```
Topilmasa: `404`.

### `GET /api/halls/{hallId}/calendar?month=YYYY-MM`
Oyning har bir kuni uchun 3 seans holati. Javob: `CalendarDay[]`
```json
[{ "date": "2026-10-09", "sessions": { "morning": "booked", "day": "free", "evening": "hold" } }]
```
Holatlar: `free` | `hold` (to'lov kutilmoqda, 30 daqiqa) | `booked` | `closed` (o'tgan kun, ta'mir).

### `POST /api/quote`
Narx hisobi. Ilova har bir o'zgarishda chaqiradi (mehmon soni, menyu, seans, xizmatlar).
```json
{ "venue_id": "v1", "hall_id": "v1-h1", "date": "2026-10-09", "session": "evening",
  "guests": 400, "menu_package_id": "prem", "vendor_ids": ["vid-1", "car-2"] }
```
Javob:
```json
{ "price_per_guest": 253000, "venue_total": 101200000,
  "extras": [{ "vendor_id": "vid-1", "name": "Kadr Studio", "type": "video", "price": 5000000 }],
  "total": 109700000, "deposit": 32910000 }
```
**Formula** (`src/services/pricing.ts`):
`price_per_guest = round1000(menu.price_per_guest × session.price_factor × (dam olish kuni ? weekend_factor : 1))`,
`total = price_per_guest × guests + Σ vendor.price`, `deposit = round(total × deposit_percent / 100)`.
Shanba–yakshanba dam olish kuni hisoblanadi.

### `POST /api/bookings`
`QuoteRequest` + `{ "event_type": "kechki", "customer_name": "Aziz", "customer_phone": "+998901234567" }`

Server: narxni qayta hisoblaydi (mijoz yuborgan narxga ishonmaydi), slotni `hold` qiladi (`hold_until = now + 30 min`),
to'lov havolasini yaratadi. Javob: `Booking`
```json
{ "id": "...", "number": "TY-406820", "status": "pending", "venue_id": "v1", "venue_name": "Navro'z Saroyi",
  "date": "2026-10-09", "session": "evening", "guests": 400, "total": 109700000, "deposit": 32910000,
  "payment_url": "https://checkout.paycom.uz/...", "hold_until": "2026-10-06T12:30:00Z", "created_at": "..." }
```
Slot band bo'lsa: `409 { "code": "slot_taken", "message": "Bu seans allaqachon band qilingan. Boshqa seansni tanlang." }`.
`(hall_id, date, session)` bazada unique bo'lishi shart. To'lov webhook'i kelganda slot `booked`, bron `confirmed` bo'ladi;
`hold_until` o'tib ketsa slot qayta `free`.

## Keyingi bosqich (ilovada hali chaqirilmaydi)
- `GET /api/me/bookings`, `POST /api/bookings/{id}/cancel`
- `POST /api/auth/telegram` — `initData` → token
- `POST /api/payments/{click|payme|uzum}/callback`
