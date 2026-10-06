# Lokma To'yxonalari — mobil ilova (Expo / React Native)

Atrofdagi to'yxonalar katalogi: avtomatik joylashuv, xarita, bo'sh kunlar kalendari, menyu va xizmatlar bilan narx hisobi, bron.
Android, iOS va Web (Telegram Mini App uchun asos) — bitta kod.

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
