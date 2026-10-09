import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

/*
 * Bezak elementlari (o'zimiz chizgan, rasm fayli yo'q — har qanday ekranda tiniq):
 *   Leaf      — yashil barg (o'rta tomir bilan), sahifa chetlarida;
 *   FloralLine — nozik oltin chiziqli gul novdasi (pastki chap burchak).
 */
export function Leaf({ size = 56, rotate = 0, style, tone = '#4E6B3A' }: { size?: number; rotate?: number; style?: ViewStyle; tone?: string }) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Path d="M6 58 C10 30 28 10 58 6 C56 34 38 54 6 58 Z" fill={tone} opacity={0.92} />
        <Path d="M6 58 C10 30 28 10 58 6 C46 20 30 34 6 58 Z" fill="#000" opacity={0.12} />
        <Path d="M8 56 C22 40 38 24 56 8" stroke="#E9F0E0" strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.7} />
        <G stroke="#E9F0E0" strokeWidth={0.9} opacity={0.45} strokeLinecap="round">
          <Path d="M20 44 L28 46" /><Path d="M28 36 L37 37" /><Path d="M36 28 L45 28" /><Path d="M24 40 L23 31" /><Path d="M33 31 L33 22" />
        </G>
      </Svg>
    </View>
  );
}

export function FloralLine({ size = 110, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <G stroke="#D9B98A" strokeWidth={1.2} strokeLinecap="round" opacity={0.75}>
          <Path d="M10 118 C20 90 34 70 58 52" />
          <Path d="M30 86 C22 80 18 70 22 60 C30 64 34 74 30 86 Z" />
          <Path d="M44 68 C40 58 42 48 50 42 C54 50 52 60 44 68 Z" />
          <Path d="M58 52 C64 44 74 40 84 42 C80 50 70 54 58 52 Z" />
          <Path d="M20 100 C10 98 4 90 4 82 C12 84 18 92 20 100 Z" />
          <Path d="M58 52 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" />
          <Path d="M58 52 m-2.5 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0" />
        </G>
      </Svg>
    </View>
  );
}

export const decorStyles = StyleSheet.create({
  abs: { position: 'absolute' },
});
