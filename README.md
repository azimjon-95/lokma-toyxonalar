# Lokma To'yxonalari — React Native (Expo)

Senior-level wedding halls catalog for **Lokma Go** (Android + iOS + Web ready).

## Quick Start

```bash
cd lokma-toyxonalar
npm install
npx expo start
```

Then press `a` (Android) or `i` (iOS) or scan QR with Expo Go.

## What's included

### Screens (Figma matched + improved)
- **Home** — auto location, search, "3 kun ichida bo'sh" carousel, filter chips, premium venue cards
- **Map** — radius 10/20/50 km, price pins, bottom card
- **Venue Detail** — gallery, calendar with session dots, menu packages, amenities, videographers, cortege, live quote, sticky "Bron qilish"

### Design System (`src/theme`)
- Colors from TZ (`#C9420A` primary, `#1F9D55` free, `#0E2A5C` map)
- Typography scale (Onest ready)
- Spacing + radius (button 14–18, card 22–26)
- Soft shadows, 44px touch targets

### Architecture
- Expo Router (file-based)
- TypeScript strict types from TZ data model
- Mock data ready for API swap
- Deeplink scheme: `lokmago://weddings` + `https://lokma.uz/toyxonalar`

### Next (not yet coded)
- Real API layer + hold 30-min
- Payment (Click / Payme / Uzum)
- Telegram Mini App web version (same design)
- Favorites + My Bookings
- Onest font loading

## Structure

```
app/
  (tabs)/index.tsx    → Home
  (tabs)/map.tsx      → Map
  venue/[slug].tsx    → Venue detail
src/
  theme/              → Design tokens
  components/         → UI + VenueCard
  types/              → Full TZ model
  data/mockVenues.ts  → Demo data
```

## Deeplink (Lokma Go)

- Open: `lokmago://weddings` or `https://lokma.uz/toyxonalar`
- Venue: `lokmago://weddings/venue/navroz-saroyi`
- Return after booking: `lokmago://home`
