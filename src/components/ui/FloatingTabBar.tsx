import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from 'expo-router';
import { setNavCompact, useNavCompact } from '../../lib/navCompact';
import { TAB_BAR_HEIGHT, TAB_BAR_MAX_WIDTH, TAB_BAR_SIDE, tabBarBottomGap } from '../../lib/tabBarSpace';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

/*
 * ═══ SUZUVCHI PASTKI MENYU — Lokma Go / Lokma Market bilan BIR XIL (Instagram uslubidagi kapsula) ═══
 * Faqat ikonkalar (nomi accessibilityLabel'da); faol tab ortida yumshoq "pill" tablar orasida silliq suriladi.
 * Geometriya va harakat Lokma Go bilan aynan bir xil (lakmago-client: docs/wedding-floating-nav/floating-nav.css), rang — vino #A61E4D.
 * Yashirin tablar (expo-router `href: null` → tabBarItemStyle.display = 'none') ko'rsatilmaydi.
 */
const PAD = 6;                                   // kapsula ichki chetidan (px)
const IDLE = '#1C2030';                          // faolsiz ikonka rangi (Go/Market bilan bir xil)
const COMPACT_SCALE = 0.8;                       // pastga scroll: kapsula 58 → 46.4 px (Go/Market bilan bir xil)
const PILL = 'rgba(60, 64, 78, 0.18)';           // faol "pill": kulrang shisha (Instagram uslubi)
const INK = '#0B0D14';                           // faol ikonka (qora)
const isWeb = Platform.OS === 'web';
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  const stretch = useRef(new Animated.Value(1)).current;   // pill almashganda suyuq-jele kabi cho'ziladi
  const placed = useRef(false);

  // Instagram kabi: pastga scroll → kichrayadi (pastki chegara joyida), yuqoriga → qaytadi. Faqat transform (native driver) — silliq.
  const compact = useNavCompact();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const to = compact ? COMPACT_SCALE : 1;
    if (reduceMotion) { scale.setValue(to); return; }
    Animated.timing(scale, { toValue: to, duration: 520, easing: EASE, useNativeDriver: !isWeb }).start();
  }, [compact, reduceMotion, scale]);
  // Boshqa tabga o'tilsa menyu to'liq holatga qaytadi
  useEffect(() => { setNavCompact(false); }, [state.index]);
  // Scale markaz atrofida — pastki chegara joyida qolishi uchun pastga siljitiladi: H × (1 − s) / 2
  const ty = scale.interpolate({ inputRange: [COMPACT_SCALE, 1], outputRange: [(TAB_BAR_HEIGHT * (1 - COMPACT_SCALE)) / 2, 0], extrapolate: 'clamp' });

  useEffect(() => { AccessibilityInfo.isReduceMotionEnabled?.().then(setReduceMotion).catch(() => {}); }, []);

  const visible = state.routes.filter((r) => StyleSheet.flatten(descriptors[r.key]?.options?.tabBarItemStyle)?.display !== 'none');
  const focusedKey = state.routes[state.index]?.key;
  const activeIndex = visible.findIndex((r) => r.key === focusedKey);
  const n = Math.max(visible.length, 1);
  const pillW = width > 0 ? (width - 2 * PAD) / n : 0;

  // Faol tabga qarab pill siljiydi (birinchi o'lchovda — animatsiyasiz)
  useEffect(() => {
    if (pillW <= 0 || activeIndex < 0) return;
    const to = PAD + activeIndex * pillW;
    if (!placed.current || reduceMotion) { x.setValue(to); placed.current = true; return; }
    Animated.timing(x, { toValue: to, duration: 520, easing: Easing.bezier(0.34, 1.32, 0.5, 1), useNativeDriver: !isWeb }).start();
    stretch.setValue(1);
    Animated.sequence([
      Animated.timing(stretch, { toValue: 1.22, duration: 200, easing: EASE, useNativeDriver: !isWeb }),
      Animated.timing(stretch, { toValue: 1, duration: 320, easing: EASE, useNativeDriver: !isWeb }),
    ]).start();
  }, [activeIndex, pillW, reduceMotion, x, stretch]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const gap = tabBarBottomGap(insets.bottom);

  return (
    <View style={[styles.wrap, { paddingBottom: gap }]} pointerEvents="box-none">
      <Animated.View style={[styles.shadow, { transform: [{ translateY: ty }, { scale }] }]} onLayout={onLayout}>
        <View style={styles.glass}>
          {/* "LUPA" shishasi: orqadagi kontent yo'qolmaydi — yumshoq xiralashib, yorqin ko'rinib turadi (oz blur + shaffof oq + nur).
              Android'da blur beqaror — deyarli to'liq oq. */}
          {Platform.OS !== 'android' ? <BlurView intensity={isWeb ? 40 : 35} tint="light" style={StyleSheet.absoluteFill} /> : null}
          {Platform.OS === 'android'
            ? <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.97)' }]} />
            : (
              <>
                <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(226,228,234,0.30)' }]} />
                <LinearGradient pointerEvents="none" style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} locations={[0, 0.4, 0.62, 1]}
                  colors={['rgba(255,255,255,0.50)', 'rgba(255,255,255,0.30)', 'rgba(255,255,255,0.26)', 'rgba(255,255,255,0.44)']} />
                <LinearGradient pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: '54%' }]} colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']} />
              </>
            )}
          {activeIndex >= 0 && pillW > 0 ? (
            <Animated.View pointerEvents="none" style={[styles.pill, { width: pillW, transform: [{ translateX: x }, { scaleX: stretch }] }]} />
          ) : null}
          <View style={styles.row}>
            {visible.map((route, i) => {
              const { options } = descriptors[route.key];
              const focused = i === activeIndex;
              const label = (typeof options.tabBarAccessibilityLabel === 'string' && options.tabBarAccessibilityLabel) || options.title || route.name;
              const color = focused ? INK : IDLE;
              const onPress = () => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
                  navigation.navigate(route.name, route.params);
                }
              };
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: focused }}
                  style={({ pressed }) => [styles.tab, pressed && { transform: [{ scale: 0.88 }] }]}
                >
                  {options.tabBarIcon?.({ focused, color, size: 26 })}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', paddingHorizontal: TAB_BAR_SIDE },
  shadow: {
    width: '100%', maxWidth: TAB_BAR_MAX_WIDTH, height: TAB_BAR_HEIGHT, borderRadius: TAB_BAR_HEIGHT / 2,
    shadowColor: '#101828', shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 10,
  },
  glass: {
    flex: 1, borderRadius: TAB_BAR_HEIGHT / 2, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.72)',
  },
  pill: { position: 'absolute', top: 6, bottom: 6, left: 0, borderRadius: 999, backgroundColor: PILL, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: PAD },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
