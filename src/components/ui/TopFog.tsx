import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/*
 * Status bar (soat, antenna, Wi-Fi, batareya) va Telegram tugmalari ("Назад", "⋯")
 * ostidagi yumshoq "tuman": orqadagi rasm xiralashadi va oqish parda bilan
 * tiniqlashadi — tizim belgilari har qanday rasm ustida aniq ko'rinadi.
 *
 * Pastki chegarada chiziq bo'lmasligi uchun:
 *   web     — butun qatlamga pastga so'nuvchi niqob (mask-image);
 *   iOS     — 5 bosqichli blur (pastga qarab kuchsizlanadi);
 *   Android — BlurView haqiqiy blur bermaydi (yarim shaffof qatlam) — faqat gradient.
 */
const STEPS = [
  { k: 1, i: 5 },
  { k: 0.82, i: 9 },
  { k: 0.64, i: 13 },
  { k: 0.48, i: 17 },
  { k: 0.32, i: 22 },
];

export function TopFog({ height }: { height: number }) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el?.style) return;
    const mask = 'linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)';
    el.style.setProperty('mask-image', mask);
    el.style.setProperty('-webkit-mask-image', mask);
  }, [height]);

  if (height <= 0) return null;
  const h = height + 8; // pastga yumshoq o'tish uchun biroz ortiq (logoga tegmaydi)
  const blur = Platform.OS !== 'android';
  return (
    <View ref={ref} pointerEvents="none" style={[styles.wrap, { height: h }]}>
      {blur && (Platform.OS === 'web'
        ? <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        : STEPS.map((s) => <BlurView key={s.k} intensity={s.i} tint="light" style={[styles.layer, { height: h * s.k }]} />))}
      <LinearGradient
        colors={['rgba(255,252,248,0.62)', 'rgba(255,252,248,0.34)', 'rgba(255,252,248,0)']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0 },
});
