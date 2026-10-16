# Lokma To'yxonalari — mobil ilova (Expo / React Native)

Atrofdagi to'yxonalar katalogi: avtomatik joylashuv, xarita, bo'sh kunlar kalendari, menyu va xizmatlar bilan narx hisobi, bron.
Android, iOS va Web (Telegram Mini App uchun asos) — bitta kod.

## Xarita ("Xarita" tabi)

To'yxonalar **real xaritada**, server koordinatalari bo'yicha, foydalanuvchi manzili markazida:
- **Web / Telegram Mini App** — Yandex Maps (`YandexMap.web.tsx`) → MapLibre/OpenFreeMap (`MapLibreMap.web.tsx`) → Leaflet/OSM (`LeafletMap.web.tsx`), tanlovchi — `MapCanvas.web.tsx`; **native** (iOS/Android) — react-native-maps (`app/(tabs)/map.tsx`).
- Tanlangan radius (10 / 20 / 50 km yoki hudud) doira bo'lib chiziladi, o'zgarganda silliq kengayadi va xarita uchib moslashadi.
- Narx belgilari aniq joyida; bir-birini bosib qolsa jamlanadi (bosilsa yaqinlashadi). Yashil nuqta — bugun bo'sh.
- Pastda kartochkalar: surilsa xarita shu to'yxonaga o'tadi, belgi bosilsa kartochka siljiydi. "Yo'l" tugmasi — Yandex Maps.
- "Siz" nuqtasi, "Hammasini ko'rsatish", "Joylashuvimga qaytish", natija bo'lmasa radiusni kengaytirish taklifi.

### Xarita provayderlari zanjiri (web / Telegram Mini App)

**Yandex Maps** → **MapLibre + OpenFreeMap** (kalitsiz, bepul, tijoratga ruxsat) → **Leaflet + OSM** (faqat WebGL yo'q bo'lsa).
Har bosqich ishlamasa keyingisiga **avtomatik** o'tadi — foydalanuvchi xaritasiz qolmaydi. MapLibre (~1 MB) alohida
bo'lak sifatida faqat kerak bo'lganda yuklanadi (Yandex ishlasa umuman tushmaydi).

**Yandex kaliti** ([developer.tech.yandex.ru](https://developer.tech.yandex.ru/) → «JavaScript API и HTTP Геокодер»):
kalitda **«Ограничение по HTTP Referer»** to'ldirilgan bo'lishi SHART (v3 busiz ishlamaydi) — `wedding.lokma.uz`, `*.lokma.uz`,
`lokma.uz`, Vercel domeningiz, sinov uchun `localhost`. Kalit ~15 daqiqada faollashadi. Tariflar: kabinetdagi *Тарифы*.

```
EXPO_PUBLIC_YANDEX_MAPS_KEY=<kalit>          # bo'sh bo'lsa — to'g'ridan-to'g'ri MapLibre
EXPO_PUBLIC_YANDEX_GEOCODER_KEY=<kalit>      # ixtiyoriy (qidiruv/geokoder)
EXPO_PUBLIC_YANDEX_ROUTING_KEY=<kalit>       # ixtiyoriy (marshrut)
EXPO_PUBLIC_MAP_PROVIDER=auto                # auto | yandex | maplibre | osm
EXPO_PUBLIC_YANDEX_LANG=ru_RU                # Yandex o'zbekchani qo'llamaydi: ru_RU, en_US, tr_TR ...
EXPO_PUBLIC_MAPLIBRE_STYLE=https://tiles.openfreemap.org/styles/liberty   # liberty | bright | positron
EXPO_PUBLIC_MAP_DIAG=1                       # sinov: xaritada qaysi provayder va nega zaxiraga o'tilgani chipi
```
Vercel: Settings → Environment Variables'ga qo'shib **Redeploy** qiling (`EXPO_PUBLIC_*` build vaqtida kiradi; lokalda `npx expo start --clear`).
`.env.production` dagi qiymatlardan Vercel env ustun turadi.

**Diagnostika (`EXPO_PUBLIC_MAP_DIAG=1`):** xarita tepasida chip: `Xarita: Yandex ✓` yoki `MapLibre` + sabab, masalan
`Yandex: skript yuklanmadi (403: kalit yoki domen ruxsati · wedding.lokma.uz)` — shu domenni Yandex kabinetida kalitning Referer ro'yxatiga qo'shing.
Tayyor bo'lgach `0` qiling.

**OpenFreeMap:** ommaviy server kalit talab qilmaydi, lekin **SLA yo'q** — juda muhim bo'lsa o'zingiz hostlang
([hyperknot/openfreemap](https://github.com/hyperknot/openfreemap)) yoki MapTiler uslubini `EXPO_PUBLIC_MAPLIBRE_STYLE` ga bering.
**Leaflet zaxirasi** OSM plitkalarini ishlatadi (kam yuk uchun); ko'p trafik uchun `EXPO_PUBLIC_MAP_TILES_URL`.
(CARTO basemaps endi kalit talab qiladi, shuning uchun ishlatilmaydi.)

**Yo'l ko'rsatish / joy:** `yandex.uz/maps` havolalari (telefonda Yandex Maps / Go ilovasi o'zi ochiladi).
**Native (iOS/Android):** hozircha Apple/Google xaritasi (react-native-maps; Android uchun `GOOGLE_MAPS_ANDROID_KEY`).
Yandex MapKit native'da `react-native-yamap` + dev build talab qiladi — alohida bosqich.

## Ishga tushirish

```bash
npm install
cp .env.example .env      # server manzili bo'lmasa bo'sh qoldiring — demo ma'lumotlar ishlaydi
npx expo start            # QR kodni telefondagi Expo Go bilan skanerlang
```

Talablar: Node.js 20+, telefonda **Expo Go (SDK 57)**.

| Buyruq | Vazifasi |
|---|---|
| `npm start` | dev server |
| `npm run web` | brauzerda ochish |
| `npm run typecheck` | TypeScript tekshiruvi |
| `npm run export:web` | web uchun statik build (`dist/`) |

## Serverga ulash

Server: **[lokma-toyxonalar-server](https://github.com/azimjon-95/lokma-toyxonalar-server)** (Express + MongoDB).

1. `.env` ga `EXPO_PUBLIC_API_URL=https://api.lokma.uz` yozing (oxirida `/` siz).
   Lokal sinash: `EXPO_PUBLIC_API_URL=http://<kompyuter-IP>:4100` — telefon va kompyuter bir Wi-Fi'da bo'lsin.
2. Server **docs/API.md** dagi endpointlarni shu shaklda qaytarsin.
3. Ilovani qayta ishga tushiring — boshqa hech narsa o'zgartirish shart emas.

URL berilmasa standart `https://api.lokma.uz` ishlatiladi. **Mock ma'lumot yo'q** — ilova doim haqiqiy server bilan ishlaydi.

## Tezlik: ma'lumot qanday tez yuklanadi

Server: Redis kesh (`lokma-toyxonalar-server`, README → «Кэш»). Ilova tomonida:

- **Saqlangan kesh** (`src/lib/queryClient.ts`): to'yxonalar ro'yxati, "tez orada bo'sh" va to'yxona sahifalari AsyncStorage/localStorage'da
  saqlanadi (12 soat). Ilova qayta ochilganda ro'yxat **darhol** chiqadi, yangisi fonda keladi (stale-while-revalidate).
- **Haqiqiy joylashuvni kutish:** so'rovlar standart (Toshkent) koordinata bilan ketmaydi va keyin takrorlanmaydi
  (`useLocation().ready`; aniqlanmasa 1,2 s dan keyin standart joy). So'nggi joylashuv ham eslab qolinadi.
- **Niyat bo'yicha oldindan yuklash:** karta bosishga tayyorlanganda (`onPressIn` / hover) va bosh sahifada eng tepadagi 4 ta
  to'yxona + joriy oy kalendari oldindan yuklanadi (`usePrefetchVenue`) — sahifa ochilganda tayyor.
- **Skeleton'lar** (`components/ui/Skeleton*.tsx`): spinner o'rniga kelajakdagi kontent shakli; to'yxona sahifasi ro'yxat keshidan
  rasm/nom/narxni darhol ko'rsatadi.
- **Tarmoq:** so'rov vaqt chegarasi 10 s, 5xx/tarmoq xatosida 2 marta qisqa kutish bilan qayta uriniladi, `AbortSignal` bilan bekor qilinadi,
  `Link: rel=preconnect` sarlavhasi (vercel.json) API bilan ulanishni HTML bilan parallel boshlaydi.

## Tuzilma

```
app/                         Expo Router (fayl = sahifa)
  _layout.tsx                shriftlar, provayderlar (react-query, joylashuv, saralanganlar)
  (tabs)/index.tsx           Bosh sahifa: qidiruv, filtr, "3 kun ichida bo'sh", kartalar
  (tabs)/map.tsx             Xarita (Android: Google, iOS: Apple)
  (tabs)/map.web.tsx         Web uchun xarita o'rniga ro'yxat
  (tabs)/favorites.tsx       Saralanganlar
  venue/[slug].tsx           To'yxona: galereya, kalendar, seanslar, menyu, videochi, kortej, hisob, bron
src/
  config/env.ts              API_URL (standart api.lokma.uz), standart joylashuv va radius
  lib/queryClient.ts         react-query: saqlangan kesh, qayta urinish, staleTime
  services/api.ts            yagona ma'lumot manbai (server)
  services/http.ts           fetch: timeout, xatolar, Bearer token
  services/pricing.ts        narx formulasi (server bilan bir xil bo'lishi kerak)
  hooks/queries.ts           react-query hooklari
  store/location.tsx         joylashuvni avtomatik aniqlash va kuzatish (1 km)
  store/favorites.tsx        saralanganlar (AsyncStorage)
  components/                UI, bosh sahifa, xarita, to'yxona komponentlari
  lib/                       formatlash, sana, geo (haversine)
  theme/                     ranglar, shrift (Onest), o'lchamlar
docs/API.md                  server uchun API shartnomasi
```

## Build (EAS)

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview      # APK
eas build -p ios --profile production
```
`eas.json` dagi `EXPO_PUBLIC_API_URL` qiymatlarini server tayyor bo'lganda to'ldiring.
Android xaritasi uchun EAS secret: `GOOGLE_MAPS_ANDROID_KEY` (Google Cloud → Maps SDK for Android).

## Deeplink

- `https://lokma.uz/toyxonalar/...` (Android App Links, iOS Universal Links — serverda `assetlinks.json` / `apple-app-site-association` kerak)
- `lokmago://venue/navroz-saroyi`
