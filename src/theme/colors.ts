// Lokma To'yxonalari Design System - Colors
// Based on Figma + TZ, elevated for premium feel

export const colors = {
  // Brand
  /*
   * LOKMA TO'YXONALARI rangi — to'q malina/vino (nafis, to'y ruhida).
   * Lokma Go — to'q sariq, Lokma Market — yashil, To'yxonalar — vino:
   * uchta bo'lim bir oila, lekin har biri o'z rangida.
   */
  primary: '#A61E4D',          // Urg'u (Bron qilish, tanlangan)
  primaryDark: '#8A1640',
  primaryLight: '#FCE7EF',
  primarySoft: '#FDF2F6',
  gold: '#C9A227',             // Nozik oltin urg'u (reyting, belgi)
  // Bosh sahifa: shampan-oltin (CTA, "Top tanlov", bo'lim chizig'i)
  goldLight: '#E6C789',
  goldMid: '#D1A65E',
  goldDeep: '#B07F37',
  goldText: '#A87632',
  cream: '#FBF5EE',
  creamDeep: '#F6ECE1',
  creamBorder: '#F1E5D7',

  // Neutrals
  white: '#FFFFFF',
  /*
   * Fon — iliq fil suyagi/shampan tusi (kulrang emas): to'y, nafislik, issiqlik.
   * Oq kartalar va yumshoq soyalar shu fonda "ko'tarilib" ko'rinadi.
   */
  background: '#FAF4EE',
  backgroundDeep: '#F4EAE0',
  blush: '#F9E6EC',            // Sarlavha orqasidagi nozik pushti nur
  surface: '#FFFFFF',
  surfaceSecondary: '#F6EDE4',

  // Borders
  border: '#EADFD4',
  borderLight: '#F1E8DE',
  borderFocus: '#A61E4D',

  // Text
  text: '#111318',
  textSecondary: '#5C6170',
  textTertiary: '#8E939E',
  textInverse: '#FFFFFF',

  // Status
  success: '#1F9D55',
  successBg: '#E7F6EC',
  successSoft: '#F0FAF3',

  warning: '#D97706',
  warningBg: '#FEF3C7',

  error: '#DC2626',
  errorBg: '#FEE2E2',

  // Session states (Calendar)
  free: '#1F9D55',
  freeBg: '#E7F6EC',
  partial: '#FFFFFF',
  booked: '#D0D3D9',
  bookedBg: '#F1F2F4',
  closed: '#9CA3AF',

  // Map
  mapButton: '#3D1A2E',        // to'q olxo'ri — asosiy rang bilan uyg'un
  mapPin: '#A61E4D',
  mapRadius: 'rgba(166, 30, 77, 0.12)',

  // Overlay
  overlay: 'rgba(17, 19, 24, 0.45)',
  overlayLight: 'rgba(17, 19, 24, 0.08)',

  // Shadows (for elevation)
  shadow: 'rgba(17, 19, 24, 0.08)',
  shadowStrong: 'rgba(17, 19, 24, 0.14)',
} as const;

export type ColorToken = keyof typeof colors;
