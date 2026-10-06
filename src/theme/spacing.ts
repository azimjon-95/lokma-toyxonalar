// Spacing & Radius system

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
  // From TZ
  button: 14,      // 14-27 px range, we pick 16 for modern feel
  buttonLg: 18,
  card: 22,        // 22-26 px
  cardLg: 26,
} as const;

// Common layout constants
export const layout = {
  screenPadding: 16,
  screenPaddingLg: 20,
  cardGap: 12,
  sectionGap: 24,
  stickyBarHeight: 88,
  headerHeight: 56,
  touchTarget: 44, // WCAG minimum
} as const;
