import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useLokma } from '../lib/lokma';

/*
 * Ekran tepasidagi fon to'q (rasm) yoki och (sahifa foni) ekanini e'lon qiladi:
 *   mobil ilova — status bar belgilari rangi (to'q fonda oq, och fonda qora);
 *   Lokma (Telegram) — Lokma sarlavha rangini moslaydi, Telegram soat/antenna va
 *                      "Назад" / "⌄ ⋯" ni kontrast rangda chizadi.
 * Faqat ekran ko'rinib turganda ishlaydi; aylantirilganda tone o'zgarsa — darhol yangilanadi.
 */
export function useChromeTone(tone: 'dark' | 'light') {
  const { setChromeTone, settled } = useLokma();
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle(tone === 'dark' ? 'light' : 'dark');
      setChromeTone(tone);
    // settled: Lokma bilan aloqa o'rnatilgach joriy tus darhol yuboriladi
    }, [tone, setChromeTone, settled]),
  );
}
