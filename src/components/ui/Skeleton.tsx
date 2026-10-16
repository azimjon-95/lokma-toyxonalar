import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BASE = '#F1EBE4';
const SHINE = 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))';

/*
 * Vebda miltillash sof CSS (compositor oqimida, JS'siz): onlab skeleton bo'lsa ham asosiy oqim band bo'lmaydi
 * (Animated + useNativeDriver vebda JS bilan har kadr ishlardi va ro'yxat chizilishini kechiktirardi).
 */
function ensureWebStyle() {
  if (typeof document === 'undefined' || document.getElementById('lk-skeleton-css')) return;
  const s = document.createElement('style');
  s.id = 'lk-skeleton-css';
  s.textContent = '@keyframes lk-shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}.lk-shimmer{position:absolute;inset:0;animation:lk-shimmer 1.3s ease-in-out infinite;will-change:transform;pointer-events:none}@media (prefers-reduced-motion:reduce){.lk-shimmer{animation:none}}';
  document.head.appendChild(s);
}

/**
 * Yuklanish "skeleton"i: kelajakdagi kontent o'rnini egallaydi (sahifa sakramaydi), ustidan yumshoq yorug'lik yugurib o'tadi.
 * Spinner o'rniga ishlatiladi — foydalanuvchi nima kelishini oldindan ko'radi va kutish qisqa seziladi.
 */
export function Skeleton({ width = '100%', height = 14, radius = 8, style }: { width?: DimensionValue; height?: DimensionValue; radius?: number; style?: StyleProp<ViewStyle> }) {
  const box: StyleProp<ViewStyle> = [{ width, height, borderRadius: radius, backgroundColor: BASE, overflow: 'hidden' }, style];

  if (Platform.OS === 'web') {
    ensureWebStyle();
    return (
      <View style={box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {React.createElement('div', { className: 'lk-shimmer', style: { background: SHINE } })}
      </View>
    );
  }
  return <NativeShimmer box={box} />;
}

/** iOS / Android: native driver (UI oqimida) */
function NativeShimmer({ box }: { box: StyleProp<ViewStyle> }) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!w) return undefined;
    const loop = Animated.loop(Animated.timing(x, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [w, x]);
  return (
    <View onLayout={(e) => setW(Math.round(e.nativeEvent.layout.width))} style={box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {w > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-w, w] }) }] }]}>
          <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
    </View>
  );
}
