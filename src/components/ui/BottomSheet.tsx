import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated, Easing, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, StyleSheet, View,
  useWindowDimensions, type StyleProp, type ViewStyle,
} from 'react-native';
import { colors } from '../../theme';

interface Props {
  visible: boolean;
  /** Yopish so'raldi (orqa fon, pastga tortish, Android "orqaga"). Ota komponent `visible`ni false qiladi. */
  onClose: () => void;
  children: ReactNode;
  /** Panelning o'z uslubi (rang, burchak, ichki bo'shliq) */
  sheetStyle?: StyleProp<ViewStyle>;
  backdropColor?: string;
  handleColor?: string;
  /** Klaviatura chiqqanda panel ko'tarilsin (forma bor oynalar) */
  keyboardAvoiding?: boolean;
}

const CLOSE_DRAG_PX = 110; // shundan ko'p tortilsa yopiladi
const CLOSE_VELOCITY = 0.9; // yoki tez "uloqtirilsa"

/*
 * ═══ PASTDAN CHIQADIGAN OYNA (telefonlardagi kabi) ═══
 *   • ochilganda pastdan yumshoq (pružina) chiqadi, orqa fon asta qorayadi;
 *   • "ruchka" va uning atrofidagi zonadan pastga tortilsa — barmoqni kuzatib boradi; yetarlicha tortilsa yoki tez surilsa
 *     pastga siljib YOPILADI, bo'lmasa joyiga qaytadi;
 *   • orqa fonni bosish / Android "orqaga" ham xuddi shu animatsiya bilan yopadi.
 * Jest FAQAT ruchka zonasida ishlaydi: ichidagi ScrollView, tugma va maydonlar bilan to'qnashmaydi,
 * ro'yxatni aylantirish oynani yopib yubormaydi.
 */
export function BottomSheet({ visible, onClose, children, sheetStyle, backdropColor = colors.overlay, handleColor = colors.border, keyboardAvoiding }: Props) {
  const { height: screenH } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const ty = useRef(new Animated.Value(screenH)).current; // panelning pastga siljishi (px)
  const closing = useRef(false);
  const sheetH = useRef(0);
  const dragStart = useRef(0);
  const native = Platform.OS !== 'web';

  const spring = useCallback(() => {
    Animated.spring(ty, { toValue: 0, useNativeDriver: native, damping: 26, stiffness: 260, mass: 0.9 }).start();
  }, [ty, native]);

  /** Pastga siljib yo'qoladi, so'ng `done` */
  const slideOut = useCallback((done: () => void) => {
    Animated.timing(ty, { toValue: screenH, duration: 230, easing: Easing.out(Easing.cubic), useNativeDriver: native }).start(({ finished }) => { if (finished) done(); });
  }, [ty, screenH, native]);

  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    slideOut(() => {
      closing.current = false;
      setMounted(false);
      onClose();
    });
  }, [slideOut, onClose]);

  // visible o'zgarishi: ochilish / tashqaridan yopilish (masalan, "Ko'rsatish" bosilganda ota komponent yopadi)
  useEffect(() => {
    if (visible && !mounted) {
      ty.setValue(screenH);
      setMounted(true);
    } else if (!visible && mounted && !closing.current) {
      closing.current = true;
      slideOut(() => { closing.current = false; setMounted(false); });
    }
  }, [visible, mounted, ty, screenH, slideOut]);

  // Birinchi o'lchovdan keyin chiqish animatsiyasi (balandlik ma'lum bo'lgach)
  const opened = useRef(false);
  useEffect(() => { if (!mounted) opened.current = false; }, [mounted]);
  const onSheetLayout = (h: number) => {
    sheetH.current = h;
    if (!opened.current) {
      opened.current = true;
      ty.setValue(Math.max(h, 200));
      spring();
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderGrant: () => { ty.stopAnimation((v) => { dragStart.current = v; }); },
        onPanResponderMove: (_, g) => {
          const v = dragStart.current + g.dy;
          ty.setValue(v < 0 ? v * 0.12 : v); // yuqoriga — kuchsiz qarshilik
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > CLOSE_DRAG_PX || g.vy > CLOSE_VELOCITY) requestClose();
          else spring();
        },
        onPanResponderTerminate: () => spring(),
      }),
    [ty, requestClose, spring],
  );

  if (!mounted) return null;

  const backdropOpacity = ty.interpolate({ inputRange: [0, screenH], outputRange: [1, 0], extrapolate: 'clamp' });
  const Wrapper = keyboardAvoiding ? KeyboardAvoidingView : View;
  const wrapperProps = keyboardAvoiding ? { behavior: Platform.OS === 'ios' ? ('padding' as const) : undefined } : {};

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={requestClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Yopish" />
      </Animated.View>
      <Wrapper style={styles.bottom} pointerEvents="box-none" {...wrapperProps}>
        <Animated.View
          onLayout={(e) => onSheetLayout(e.nativeEvent.layout.height)}
          accessibilityViewIsModal
          style={[sheetStyle, { transform: [{ translateY: ty }] }]}
        >
          {/* Tortish zonasi: ko'rinadigan ruchka kichik, lekin barmoq tushadigan joy kattaroq (negativ margin tartibni o'zgartirmaydi) */}
          <View {...pan.panHandlers} style={styles.dragZone} accessibilityLabel="Oynani pastga tortib yoping" accessibilityRole="adjustable">
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>
          {children}
        </Animated.View>
      </Wrapper>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottom: { flex: 1, justifyContent: 'flex-end' },
  dragZone: { alignItems: 'center', paddingTop: 22, paddingBottom: 18, marginTop: -10, marginBottom: -6, ...(Platform.OS === 'web' ? ({ cursor: 'grab', touchAction: 'none' } as object) : null) },
  handle: { width: 40, height: 5, borderRadius: 3 },
});
