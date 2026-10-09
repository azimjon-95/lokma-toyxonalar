import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { setLang as setUiLang } from './i18n';

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
  username?: string;
  photoInitials?: string;
  telegramId?: string;
}
export interface LokmaContext {
  user: LokmaUser | null;
  addresses: LokmaAddress[];
  defaultAddressId: string | null;
  lang?: string;
  /**
   * Lokma'ning tizim bo'shliqlari (px).
   *   bottom — pastki menyu Lokma'niki bilan bir xil o'tirishi uchun;
   *   top    — iframe ekran TEPASIDAN boshlanganda (status bar + Telegram tugmalari
   *            balandligi). Berilmasa 0: Lokma o'zi iframe ustida joy qoldiradi (eski usul).
   */
  insets?: { top?: number; bottom: number };
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
    user: {
      firstName: str(u.firstName, 80), lastName: str(u.lastName, 80), phone: str(u.phone, 32) ?? null, photoUrl: str(u.photoUrl, 500),
      username: str(u.username, 64), photoInitials: str(u.photoInitials, 4), telegramId: str(u.telegramId, 24),
    },
    addresses,
    defaultAddressId: str(r.defaultAddressId, 64) ?? null,
    lang: str(r.lang, 8),
    insets: {
      top: Math.min(200, Math.max(0, num((r.insets as Record<string, unknown> | undefined)?.top) ?? 0)),
      bottom: Math.min(48, Math.max(0, num((r.insets as Record<string, unknown> | undefined)?.bottom) ?? 0)),
    },
  };
}

/** Ota ilovadan so'ralgan amallar (profil, til, manzillar, bronlar) — natija Promise bilan */
export type LokmaAction =
  | 'updateUser' | 'addAddress' | 'removeAddress' | 'setDefaultAddress' | 'setLang'
  | 'referral' | 'shareReferral' | 'myBookings' | 'cancelBooking';

interface LokmaValue extends LokmaContext {
  /** Sahifa hozir foydalanuvchiga ko'rinib turibdimi (fonda isitilgan bo'lishi mumkin) */
  visible: boolean;
  /** Lokma Go profilidagi amallarni ota ilova orqali bajarish (faqat Lokma ichida) */
  rpc: <T = unknown>(action: LokmaAction, payload?: Record<string, unknown>) => Promise<T>;
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
  // Fonda isitilgan iframe ko'rinmaguncha GPS so'ramaydi va og'ir ishlarni kechiktiradi
  const [visible, setVisible] = useState(!embedded);
  const pending = useRef(new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>());
  const parentOriginRef = useRef<string | null>(null);

  useEffect(() => {
    if (!embedded) return undefined;
    const onMsg = (e: MessageEvent) => {
      if (!ORIGINS.has(e.origin) || e.source !== window.parent) return;
      const d = e.data as { type?: string; payload?: unknown; visible?: boolean; path?: string; id?: string; ok?: boolean; data?: unknown; error?: string } | null;
      if (!d || typeof d.type !== 'string') return;
      setParentOrigin(e.origin);
      parentOriginRef.current = e.origin;
      if (d.type === 'lokma-wedding:context') {
        const clean = sanitize(d.payload);
        if (!clean) return;
        setCtx(clean);
        setSettled(true);
        if (clean.lang) setUiLang(clean.lang); // til Lokma Go'dan
        try { window.sessionStorage.setItem(STORE_KEY, JSON.stringify(clean)); } catch { /* yopiq */ }
      } else if (d.type === 'lokma-wedding:visible') {
        setVisible(Boolean(d.visible));
      } else if (d.type === 'lokma-wedding:open') {
        // Chuqur havola: faqat o'z sahifalarimiz (/venue/<slug>, /favorites, /profile, /my-bookings)
        const path = String(d.path || '');
        if (/^\/(venue\/[a-z0-9-]{1,80}|favorites|profile|my-bookings|map)?$/i.test(path)) {
          try { router.navigate(path === '' ? '/' : (path as never)); } catch { /* router tayyor emas */ }
        }
      } else if (d.type === 'lokma-wedding:rpc-result' && d.id) {
        const p = pending.current.get(d.id);
        if (!p) return;
        clearTimeout(p.timer);
        pending.current.delete(d.id);
        if (d.ok) p.resolve(d.data); else p.reject(new Error(String(d.error || 'Xatolik')));
      }
    };
    window.addEventListener('message', onMsg);
    // Tayyorlik xabari — ma'lumotsiz, shuning uchun '*' xavfsiz.
    // caps: 'edge-to-edge' — sayt tepadagi bo'shliqni (insets.top) o'zi hisobga oladi,
    // Lokma iframe'ni ekran tepasidan boshlashi mumkin (rasm status bar ortiga chiqadi).
    window.parent.postMessage({ type: 'lokma-wedding:ready', caps: ['edge-to-edge'] }, '*');
    const t = setTimeout(() => setSettled(true), 2500);
    return () => { window.removeEventListener('message', onMsg); clearTimeout(t); };
  }, []);

  const rpc = useCallback(<T,>(action: LokmaAction, payload: Record<string, unknown> = {}) => new Promise<T>((resolve, reject) => {
    const origin = parentOriginRef.current;
    if (!embedded || !origin) { reject(new Error('Bu amal faqat Lokma Go ichida ishlaydi')); return; }
    const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const timer = setTimeout(() => { pending.current.delete(id); reject(new Error('Javob kelmadi, qayta urinib ko‘ring')); }, 20_000);
    pending.current.set(id, { resolve, reject, timer });
    window.parent.postMessage({ type: 'lokma-wedding:rpc', id, action, payload }, origin);
  }), []);

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
      visible,
      rpc,
      defaultAddress,
      goToLokma,
    };
  }, [ctx, settled, visible, rpc, goToLokma]);

  /*
   * Lokma ichida xavfsiz zona Lokma'dan keladi (iOS iframe ichida ham
   * env(safe-area-*) beradi — uni ishlatsak bo'shliq IKKI BARAVAR bo'lardi).
   *   top    — Lokma iframe'ni ekran tepasidan boshlasa: status bar + Telegram
   *            tugmalari balandligi (hero rasmi ularning ORTIGA chiqadi);
   *            eski Lokma'da 0 (bo'shliqni Lokma o'zi qoldiradi);
   *   bottom — pastki menyu Lokma'niki kabi tizim paneli ustida turadi.
   */
  const embeddedInsets = useMemo(
    () => ({ top: ctx?.insets?.top ?? 0, left: 0, right: 0, bottom: ctx?.insets?.bottom ?? 0 }),
    [ctx?.insets?.top, ctx?.insets?.bottom],
  );
  const inner = <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  return embedded
    ? <SafeAreaInsetsContext.Provider value={embeddedInsets}>{inner}</SafeAreaInsetsContext.Provider>
    : inner;
}

export function useLokma() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLokma LokmaProvider ichida ishlatilishi kerak');
  return v;
}

/** Lokma'ga qaytish tugmalari ko'rsatiladimi: iframe ichida yoki veb-saytda */
export const showLokmaSwitch = isWeb;
