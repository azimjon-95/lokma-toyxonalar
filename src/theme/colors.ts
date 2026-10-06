// Lokma To'yxonalari Design System - Colors
// Based on Figma + TZ, elevated for premium feel

export const colors = {
  // Brand
  primary: '#C9420A',          // Urg'u (Bron qilish, selected)
  primaryDark: '#B83C08',
  primaryLight: '#FDF0EB',
  primarySoft: '#FFF5F0',

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8FA',

  // Borders
  border: '#EBECEF',
  borderLight: '#F1F2F4',
  borderFocus: '#C9420A',

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
  mapButton: '#0E2A5C',
  mapPin: '#C9420A',
  mapRadius: 'rgba(201, 66, 10, 0.12)',

  // Overlay
  overlay: 'rgba(17, 19, 24, 0.45)',
  overlayLight: 'rgba(17, 19, 24, 0.08)',

  // Shadows (for elevation)
  shadow: 'rgba(17, 19, 24, 0.08)',
  shadowStrong: 'rgba(17, 19, 24, 0.14)',
} as const;

export type ColorToken = keyof typeof colors;
