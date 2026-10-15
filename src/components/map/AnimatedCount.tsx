import React, { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle, type StyleProp } from 'react-native';

/** Son o'zgarganda 0 → N emas, eski qiymatdan yangisiga sanab o'tadi */
export function AnimatedCount({ value, style, suffix = '' }: { value: number; style?: StyleProp<TextStyle>; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return undefined;
    const t0 = Date.now();
    let id = 0;
    const tick = () => {
      const k = Math.min(1, (Date.now() - t0) / 600);
      const v = Math.round(start + (value - start) * (1 - (1 - k) ** 3));
      setShown(v);
      if (k < 1) id = requestAnimationFrame(tick);
      else from.current = value;
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <Text style={style}>{shown}{suffix}</Text>;
}
