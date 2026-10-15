import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, typography } from '../../theme';

/** Radius tanlash: sirpanuvchi indikator bilan (10 / 20 / 50 km). Hudud rejimida joriy qiymat ham qo'shiladi. */
export function RadiusSwitch({ value, options, onChange }: { value: number; options: number[]; onChange: (km: number) => void }) {
  const list = options.includes(value) ? options : [...options, value].sort((a, b) => a - b);
  const [layout, setLayout] = useState<Record<number, { x: number; w: number }>>({});
  const x = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const ready = useRef(false);
  const cur = layout[value];

  useEffect(() => {
    if (!cur) return;
    if (!ready.current) { x.setValue(cur.x); w.setValue(cur.w); ready.current = true; return; }
    Animated.parallel([
      Animated.spring(x, { toValue: cur.x, useNativeDriver: false, damping: 18, stiffness: 220, mass: 0.7 }),
      Animated.spring(w, { toValue: cur.w, useNativeDriver: false, damping: 18, stiffness: 220, mass: 0.7 }),
    ]).start();
  }, [cur, x, w]);

  return (
    <View style={styles.wrap} accessibilityRole="radiogroup">
      <Animated.View style={[styles.thumb, { left: x, width: w, opacity: cur ? 1 : 0 }]} />
      {list.map((r) => (
        <Pressable
          key={r}
          onPress={() => onChange(r)}
          onLayout={(e) => { const { x: lx, width } = e.nativeEvent.layout; setLayout((p) => (p[r]?.x === lx && p[r]?.w === width ? p : { ...p, [r]: { x: lx, w: width } })); }}
          style={styles.btn}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === r }}
          accessibilityLabel={`${r} kilometr`}
        >
          <Text style={[styles.text, value === r && styles.textOn]}>{r} km</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 22, padding: 4, gap: 2, shadowColor: '#2a1a20', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  thumb: { position: 'absolute', top: 4, bottom: 4, borderRadius: 18, backgroundColor: colors.primary },
  btn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 18 },
  text: { ...typography.captionMedium, fontFamily: fontFamily.bold, color: colors.text },
  textOn: { color: colors.white },
});
