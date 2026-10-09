import React, { useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

/*
 * Ekran tepasidagi "tuman" — ikki qatlam:
 *
 *   1) STATUS BAR (soat, antenna, Wi-Fi, batareya) ostida — och, xira parda.
 *      Telegram bu belgilarni QORA chizadi, och fonda ular aniq ko'rinadi.
 *
 *   2) TELEGRAM TUGMALARI ("Назад", "⌄ ⋯") ostida — yumshoq qorong'i parda.
 *      Tugmalarni Telegram o'zi chizadi (shisha fon + OQ matn). Orqasi qorong'i
 *      bo'lsa, shisha to'q tus oladi va oq matn aniq o'qiladi.
 *
 * Telegram tugmalari bo'lmasa (mobil ilova, oddiy brauzer) — faqat 1-qatlam.
 * Pastki chegaralarda chiziq yo'q: web — mask-image, iOS — bosqichli blur,
 * Android — BlurView haqiqiy blur bermaydi, faqat gradient.
 */
const STEPS = [
  { k: 1, i: 5 },
  { k: 0.8, i: 10 },
  { k: 0.6, i: 15 },
  { k: 0.4, i: 20 },
];

interface Props {
  /** Umumiy tepa bo'shliq (status bar + Telegram tugmalari) */
  height: number;
  /** Faqat status bar balandligi. Berilmasa — umumiy balandlik bilan bir xil */
  statusHeight?: number | null;
}

export function TopFog({ height, statusHeight }: Props) {
  const ref = useRef<View>(null);
  const status = Math.min(height, statusHeight ?? height);
  const hasButtons = height - status > 12;
  const lightH = status + (hasButtons ? 6 : 8);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = ref.current as unknown as HTMLElement | null;
    if (!el?.style) return;
    const mask = 'linear-gradient(to bottom, #000 0%, #000 60%, transparent 100%)';
    el.style.setProperty('mask-image', mask);
    el.style.setProperty('-webkit-mask-image', mask);
  }, [lightH]);

  if (height <= 0) return null;
  const blur = Platform.OS !== 'android';

  return (
    <View pointerEvents="none" style={[styles.wrap, { height: height + 22 }]}>
      {hasButtons && (
        <LinearGradient
          colors={['rgba(18,13,10,0.46)', 'rgba(18,13,10,0.30)', 'rgba(18,13,10,0)']}
          locations={[0, 0.55, 1]}
          style={[styles.abs, { top: Math.max(0, status - 4), height: height - status + 26 }]}
        />
      )}
      <View ref={ref} style={[styles.abs, { top: 0, height: lightH, overflow: 'hidden' }]}>
        {blur && (Platform.OS === 'web'
          ? <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
          : STEPS.map((s) => <BlurView key={s.k} intensity={s.i} tint="light" style={[styles.abs, { top: 0, height: lightH * s.k }]} />))}
        <LinearGradient
          colors={['rgba(255,252,248,0.66)', 'rgba(255,252,248,0.46)', 'rgba(255,252,248,0)']}
          locations={[0, 0.68, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  abs: { position: 'absolute', left: 0, right: 0 },
});
