import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/*
 * Ekran tepasidagi "tuman" — BITTA yaxlit qatlam (status bar + Telegram tugmalari
 * ostida), chiziq va bo'linishsiz pastga so'nadi. Rangi ostidagi fonga moslanadi:
 *
 *   tone='dark'  — rasm ustida: yumshoq qorong'i parda, ozgina xiralik.
 *                  Telegram/ilova soat, antenna va "Назад" ni OQ chizadi.
 *   tone='light' — och sahifa foni ustida (pastga aylantirilganda): iliq fil
 *                  suyagi rangli shisha. Belgilar QORA.
 *
 * Tus almashganda ikki qatlam 220 ms da silliq almashadi.
 * Pastki chegara: web — mask-image; iOS — bosqichli blur; Android — faqat gradient
 * (Android'da BlurView haqiqiy blur bermaydi).
 */
const STEPS = [
  { k: 1, i: 4 },
  { k: 0.75, i: 9 },
  { k: 0.5, i: 14 },
];

const DARK = ['rgba(14,11,9,0.58)', 'rgba(14,11,9,0.34)', 'rgba(14,11,9,0.12)', 'rgba(14,11,9,0)'];
const LIGHT = ['rgba(251,247,242,0.96)', 'rgba(251,247,242,0.86)', 'rgba(251,247,242,0.45)', 'rgba(251,247,242,0)'];
const LOCS = [0, 0.45, 0.78, 1];

export function TopFog({ height, tone = 'dark' }: { height: number; tone?: 'dark' | 'light' }) {
  const wrap = useRef<View>(null);
  const light = useRef(new Animated.Value(tone === 'light' ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(light, { toValue: tone === 'light' ? 1 : 0, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [tone, light]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = wrap.current as unknown as HTMLElement | null;
    if (!el?.style) return;
    const mask = 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)';
    el.style.setProperty('mask-image', mask);
    el.style.setProperty('-webkit-mask-image', mask);
  }, [height]);

  if (height <= 0) return null;
  const h = height + 30; // pastga yumshoq o'tish
  const blur = Platform.OS !== 'android';

  return (
    <View ref={wrap} pointerEvents="none" style={[styles.wrap, { height: h }]}>
      {blur && (Platform.OS === 'web'
        ? <BlurView intensity={12} tint="default" style={StyleSheet.absoluteFill} />
        : STEPS.map((s) => <BlurView key={s.k} intensity={s.i} tint="default" style={[styles.layer, { height: h * s.k }]} />))}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: light.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <LinearGradient colors={DARK as unknown as [string, string, ...string[]]} locations={LOCS as unknown as [number, number, ...number[]]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: light }]}>
        <LinearGradient colors={LIGHT as unknown as [string, string, ...string[]]} locations={LOCS as unknown as [number, number, ...number[]]} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0 },
});
