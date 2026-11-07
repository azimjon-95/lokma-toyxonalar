import { useSafeAreaInsets } from 'react-native-safe-area-context';

/*
 * Suzuvchi pastki menyu (FloatingTabBar) o'lchamlari — Lokma Go va Lokma Market (lakmago-client BottomNav) bilan AYNAN bir xil.
 *   kapsula balandligi 58 px; yon chetdan 20 px; kengligi ≤ 420 px;
 *   pastdan: max(10, xavfsiz zona + 2) px  (Lokma ichida xavfsiz zona Lokma'dan keladi — src/lib/lokma.tsx)
 * Menyu sahifa USTIDA suzadi, shuning uchun ekranlar pastiga `useTabBarSpace()` qadar bo'sh joy qoldiradi.
 */
export const TAB_BAR_HEIGHT = 58;
export const TAB_BAR_SIDE = 20;
export const TAB_BAR_MAX_WIDTH = 420;

export function tabBarBottomGap(insetBottom: number): number {
  return Math.max(10, Math.round(insetBottom) + 2);
}

/** Menyu egallagan balandlik (kapsula + pastki oraliq + 8 px nafas) — kontent pastiga qo'shiladi. */
export function useTabBarSpace(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + tabBarBottomGap(insets.bottom) + 8;
}
