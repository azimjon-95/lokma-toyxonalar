import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from 'expo-router';
import { colors } from '../../theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MAX_WIDTH, TAB_BAR_SIDE, tabBarBottomGap } from '../../lib/tabBarSpace';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

/*
 * ═══ SUZUVCHI PASTKI MENYU — Lokma Go / Lokma Market bilan BIR XIL (Instagram uslubidagi kapsula) ═══
 * Faqat ikonkalar (nomi accessibilityLabel'da); faol tab ortida yumshoq "pill" tablar orasida silliq suriladi.
 * Geometriya va harakat Lokma Go bilan aynan bir xil (lakmago-client: docs/wedding-floating-nav/floating-nav.css), rang — vino #A61E4D.
 * Yashirin tablar (expo-router `href: null` → tabBarItemStyle.display = 'none') ko'rsatilmaydi.
 */
const PAD = 6;                                   // kapsula ichki chetidan (px)
const IDLE = '#596070';                          // faolsiz ikonka rangi (Go/Market bilan bir xil)
const PILL = 'rgba(166, 30, 77, 0.12)';          // faol "pill" (vino 12%)
const isWeb = Platform.OS === 'web';
const EASE = Easing.bezier(0.22, 1, 0.36, 1);

export function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const x = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

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
    Animated.timing(x, { toValue: to, duration: 360, easing: EASE, useNativeDriver: !isWeb }).start();
  }, [activeIndex, pillW, reduceMotion, x]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  const gap = tabBarBottomGap(insets.bottom);

  return (
    <View style={[styles.wrap, { paddingBottom: gap }]} pointerEvents="box-none">
      <View style={styles.shadow} onLayout={onLayout}>
        <View style={styles.glass}>
          {/* Shisha: iOS va web'da haqiqiy xiralik; Android'da deyarli to'liq oq (blur beqaror) */}
          {Platform.OS !== 'android' ? <BlurView intensity={isWeb ? 70 : 60} tint="light" style={StyleSheet.absoluteFill} /> : null}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.6)' }]} />
          {activeIndex >= 0 && pillW > 0 ? (
            <Animated.View pointerEvents="none" style={[styles.pill, { width: pillW, transform: [{ translateX: x }] }]} />
          ) : null}
          <View style={styles.row}>
            {visible.map((route, i) => {
              const { options } = descriptors[route.key];
              const focused = i === activeIndex;
              const label = (typeof options.tabBarAccessibilityLabel === 'string' && options.tabBarAccessibilityLabel) || options.title || route.name;
              const color = focused ? colors.primary : IDLE;
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
      </View>
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
    flex: 1, borderRadius: TAB_BAR_HEIGHT / 2, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)',
  },
  pill: { position: 'absolute', top: 6, bottom: 6, left: 0, borderRadius: 999, backgroundColor: PILL },
  row: { flex: 1, flexDirection: 'row', paddingHorizontal: PAD },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
