// Lokma To'yxonalari - Typography
// Onest font family (400-800) as per TZ

export const fontFamily = {
  regular: 'Onest-Regular',
  medium: 'Onest-Medium',
  semiBold: 'Onest-SemiBold',
  bold: 'Onest-Bold',
  // Fallback for web / system
  system: 'System',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.55,
} as const;

export const typography = {
  // Headings
  h1: {
    fontSize: fontSize['3xl'],
    fontFamily: fontFamily.bold,
    lineHeight: fontSize['3xl'] * lineHeight.tight,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semiBold,
    lineHeight: fontSize.xl * lineHeight.tight,
  },
  h4: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semiBold,
    lineHeight: fontSize.lg * lineHeight.normal,
  },

  // Body
  body: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.regular,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
  bodyMedium: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.medium,
    lineHeight: fontSize.base * lineHeight.normal,
  },
  bodySemiBold: {
    fontSize: fontSize.base,
    fontFamily: fontFamily.semiBold,
    lineHeight: fontSize.base * lineHeight.normal,
  },

  // Small
  caption: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  captionMedium: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  overline: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },

  // Price
  price: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    lineHeight: fontSize.lg * lineHeight.tight,
  },
  priceLarge: {
    fontSize: fontSize['2xl'],
    fontFamily: fontFamily.bold,
    lineHeight: fontSize['2xl'] * lineHeight.tight,
  },
} as const;
