# Lokma To'yxonalari — mobil ilova (Expo / React Native)

Atrofdagi to'yxonalar katalogi: avtomatik joylashuv, xarita, bo'sh kunlar kalendari, menyu va xizmatlar bilan narx hisobi, bron.
Android, iOS va Web (Telegram Mini App uchun asos) — bitta kod.

## Xarita ("Xarita" tabi)

To'yxonalar **real xaritada**, server koordinatalari bo'yicha, foydalanuvchi manzili markazida:
- **Web / Telegram Mini App** — Yandex Maps (`YandexMap.web.tsx`), zaxira — Leaflet/OSM (`LeafletMap.web.tsx`), tanlovchi — `MapCanvas.web.tsx`; **native** (iOS/Android) — react-native-maps (`app/(tabs)/map.tsx`).
- Tanlangan radius (10 / 20 / 50 km yoki hudud) doira bo'lib chiziladi, o'zgarganda silliq kengayadi va xarita uchib moslashadi.
- Narx belgilari aniq joyida; bir-birini bosib qolsa jamlanadi (bosilsa yaqinlashadi). Yashil nuqta — bugun bo'sh.
- Pastda kartochkalar: surilsa xarita shu to'yxonaga o'tadi, belgi bosilsa kartochka siljiydi. "Yo'l" tugmasi — Yandex Maps.
- "Siz" nuqtasi, "Hammasini ko'rsatish", "Joylashuvimga qaytish", natija bo'lmasa radiusni kengaytirish taklifi.

### Xarita provayderi: Yandex Maps (standart) → OpenStreetMap (zaxira)

Web / Telegram Mini App'da xarita **Yandex Maps JS API v3** (vektor, O'zbekiston uchun to'liq ko'cha/uy ma'lumoti).
Kalit bo'lmasa yoki Yandex ishlamasa (kalit/domen ruxsat etilmagan, 403, internet, 9 soniya javob yo'q) xarita
**avtomatik OpenStreetMap'ga (Leaflet)** o'tadi — foydalanuvchi xaritasiz qolmaydi.

**1. Kalit olish:** [developer.tech.yandex.ru](https://developer.tech.yandex.ru/) → kabinet → *Подключить API* →
**«JavaScript API и HTTP Геокодер»**. Kalit ~15 daqiqada faollashadi.
**2. Majburiy:** kalitda **«Ограничение по HTTP Referer»** to'ldirilgan bo'lishi shart (v3 busiz ishlamaydi). Domenlarni yozing:
`wedding.lokma.uz`, `*.lokma.uz`, `lokma.uz`, Vercel domeningiz (`*.vercel.app` preview'lar uchun), sinov uchun `localhost`.
Tariflar/limitlar: kabinetdagi *Тарифы* bo'limi (ishga tushirishdan oldin ko'ring).
**3. Sozlash:**
```
EXPO_PUBLIC_YANDEX_MAPS_KEY=<kalit>        # bo'sh bo'lsa — to'g'ridan-to'g'ri OSM
EXPO_PUBLIC_MAP_PROVIDER=auto              # auto (standart) | yandex | osm
EXPO_PUBLIC_YANDEX_LANG=ru_RU              # Yandex o'zbekchani qo'llamaydi: ru_RU, en_US, tr_TR, uk_UA ...
```
Vercel: Settings → Environment Variables'ga qo'shib, **Redeploy** qiling (`EXPO_PUBLIC_*` build vaqtida kiradi; lokalda `npx expo start --clear`).

**Yo'l ko'rsatish / joy:** `yandex.uz/maps` havolalari (telefonda Yandex Maps / Go ilovasi o'zi ochiladi).

**OSM zaxirasi plitkalari:** CARTO Voyager (bepul, lekin tijorat/yuqori trafik uchun litsenziya kerak). Almashtirish:
```
EXPO_PUBLIC_MAP_TILES_URL=https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=...
EXPO_PUBLIC_MAP_ATTRIBUTION=© MapTiler © OpenStreetMap contributors
```
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

URL bo'sh bo'lsa ilova `src/services/mockApi.ts` bilan ishlaydi; u serverning aynan o'zi kabi javob beradi
(narx formulasi, slot band qilish, 409 xatosi va h.k.), shuning uchun backend uchun namuna sifatida ham foydali.

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
  config/env.ts              API_URL, standart joylashuv va radius
  services/api.ts            yagona ma'lumot manbai (server yoki mock)
  services/http.ts           fetch: timeout, xatolar, Bearer token
  services/mockApi.ts        demo server
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
