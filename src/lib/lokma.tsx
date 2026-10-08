import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';

/*
 * ═══ LOKMA GO BILAN KO'PRIK ═══
 *
 * Bu sayt (wedding.lokma.uz) Lokma Go ilovasi ICHIDA <iframe> bo'lib ochiladi
 * (Telegram WebApp va mobil ilova — lakmago-client /weddings sahifasi).
 * Mijoz alohida sayt ekanini sezmasligi uchun:
 *   • Lokma'dagi foydalanuvchi ma'lumoti (ism, telefon, manzillar) postMessage
 *     orqali keladi — bu yerda alohida ro'yxatdan o'tish/saqlash YO'Q;
 *   • "Lokma Go" / "Lokma Market" tugmalari ota ilovaga qaytaradi.
 *
 * Xavfsizlik:
 *   • xabar faqat ruxsat etilgan Lokma manzillaridan qabul qilinadi (origin);
 *   • Lokma o'zi ham ma'lumotni FAQAT wedding.lokma.uz manziliga yuboradi;
 *   • ma'lumot faqat shu sessiya xotirasida (sessionStorage) — serverga yozilmaydi.
 */
export interface LokmaAddress {
  id: string;
  title?: string;
  address?: string;
  city?: string;
  lat?: number;
  lng?: number;
  labelId?: string;
}
export interface LokmaUser {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  photoUrl?: string;
}
export interface LokmaContext {
  user: LokmaUser | null;
  addresses: LokmaAddress[];
  defaultAddressId: string | null;
  lang?: string;
}

const DEFAULT_ORIGINS = [
  'https://lakmago-client.vercel.app',
  'https://lokma.uz', 'https://www.lokma.uz', 'https://app.lokma.uz',
  'https://lakma.uz', 'https://www.lakma.uz',
  // Lokma mobil ilovasi (Capacitor WebView)
  'https://localhost', 'capacitor://localhost', 'http://localhost',
];
const ORIGINS = new Set(
  [...DEFAULT_ORIGINS, ...String(process.env.EXPO_PUBLIC_LOKMA_ORIGINS || '').split(',')]
    .map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean),
);
/** Bu sayt to'g'ridan-to'g'ri (iframe'siz) ochilganda Lokma'ga qaytish manzili */
export const LOKMA_WEB_URL = (process.env.EXPO_PUBLIC_LOKMA_WEB_URL || 'https://lakmago-client.vercel.app').replace(/\/+$/, '');

const STORE_KEY = 'lokma_ctx_v1';
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
const embedded = isWeb && (() => { try { return window.self !== window.top; } catch { return true; } })();

function readSaved(): LokmaContext | null {
  if (!isWeb) return null;
  try { const s = window.sessionStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

/** Kelgan ma'lumotni tozalash: faqat kutilgan maydonlar, to'g'ri turlar, chegaralangan uzunlik */
function sanitize(raw: unknown): LokmaContext | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : undefined);
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
  const u = (r.user && typeof r.user === 'object' ? r.user : {}) as Record<string, unknown>;
  const addresses = (Array.isArray(r.addresses) ? r.addresses : []).slice(0, 20).map((a) => {
    const x = (a || {}) as Record<string, unknown>;
    return { id: str(x.id, 64) || '', title: str(x.title, 80), address: str(x.address, 300), city: str(x.city, 80), lat: num(x.lat), lng: num(x.lng), labelId: str(x.labelId, 20) };
  }).filter((a) => a.id);
  return {
    user: { firstName: str(u.firstName, 80), lastName: str(u.lastName, 80), phone: str(u.phone, 32) ?? null, photoUrl: str(u.photoUrl, 500) },
    addresses,
    defaultAddressId: str(r.defaultAddressId, 64) ?? null,
    lang: str(r.lang, 8),
  };
}

interface LokmaValue extends LokmaContext {
  /** Lokma ilovasi ichida ochilganmi */
  embedded: boolean;
  /** Lokma ma'lumoti keldimi (yoki embedded emas — kutilmaydi) */
  settled: boolean;
  /** Standart manzil (koordinatasi bilan) */
  defaultAddress: LokmaAddress | null;
  /** Lokma Go ('/') yoki Lokma Market ('/market') ga qaytish */
  goToLokma: (to: '/' | '/market') => void;
}

const Ctx = createContext<LokmaValue | null>(null);

export function LokmaProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<LokmaContext | null>(readSaved);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);
  // Iframe'da ma'lumot kutiladi (eng ko'pi 2.5 s), aks holda darhol tayyor
  const [settled, setSettled] = useState(!embedded || Boolean(readSaved()));

  useEffect(() => {
    if (!embedded) return undefined;
    const onMsg = (e: MessageEvent) => {
      if (!ORIGINS.has(e.origin) || e.source !== window.parent) return;
      const d = e.data as { type?: string; payload?: unknown } | null;
      if (!d || d.type !== 'lokma-wedding:context') return;
      const clean = sanitize(d.payload);
      if (!clean) return;
      setParentOrigin(e.origin);
      setCtx(clean);
      setSettled(true);
      try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(clean)); } catch { /* yopiq */ }
    };
    window.addEventListener('message', onMsg);
    // Tayyorlik xabari — ma'lumotsiz, shuning uchun '*' xavfsiz
    window.parent.postMessage({ type: 'lokma-wedding:ready' }, '*');
    const t = setTimeout(() => setSettled(true), 2500);
    return () => { window.removeEventListener('message', onMsg); clearTimeout(t); };
  }, []);

  const goToLokma = useCallback((to: '/' | '/market') => {
    if (embedded && parentOrigin) {
      window.parent.postMessage({ type: 'lokma-wedding:navigate', to }, parentOrigin);
      return;
    }
    const url = `${LOKMA_WEB_URL}${to}`;
    if (isWeb) window.location.href = url;
    else Linking.openURL(url).catch(() => {});
  }, [parentOrigin]);

  const value = useMemo<LokmaValue>(() => {
    const addresses = ctx?.addresses ?? [];
    const withCoords = addresses.filter((a) => a.lat != null && a.lng != null);
    const defaultAddress = withCoords.find((a) => a.id === ctx?.defaultAddressId) || withCoords[0] || null;
    return {
      user: ctx?.user ?? null,
      addresses,
      defaultAddressId: ctx?.defaultAddressId ?? null,
      lang: ctx?.lang,
      embedded,
      settled,
      defaultAddress,
      goToLokma,
    };
  }, [ctx, settled, goToLokma]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLokma() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLokma LokmaProvider ichida ishlatilishi kerak');
  return v;
}

/** Lokma'ga qaytish tugmalari ko'rsatiladimi: iframe ichida yoki veb-saytda */
export const showLokmaSwitch = isWeb;
