export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { typography, fontFamily, fontSize } from './typography';
import { spacing, radius, layout } from './spacing';

export const theme = {
  colors,
  typography,
  fontFamily,
  fontSize,
  spacing,
  radius,
  layout,
} as const;

export type Theme = typeof theme;
