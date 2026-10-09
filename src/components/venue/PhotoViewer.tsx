import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, FlatList, Modal, PanResponder, Platform, Pressable, StyleSheet, Text, View,
  useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fontFamily } from '../../theme';
import { useLokmaBackInterceptor } from '../../lib/lokma';

const NATIVE = Platform.OS !== 'web';
const BLUR = Platform.OS !== 'android'; // Android'da BlurView haqiqiy blur bermaydi

interface Props {
  visible: boolean;
  photos: string[];
  initialIndex: number;
  onClose: () => void;
  onShare: () => void;
  isFavorite: boolean;
  onFavorite: () => void;
}

/*
 * To'liq ekranli galereya:
 *   orqada — to'yxona sahifasi xira shisha ostida ko'rinadi (shaffof), ustida joriy
 *            suratning xiralashgan ranglari ("ambient" yorug'lik);
 *   markazda — yumaloq ramkada surat, Ken Burns: har surat o'zicha sekin harakatlanadi
 *            (yaqinlashish, surilish, uzoqlashish), almashganda yumshoq paydo bo'ladi;
 *   boshqaruv — tepada hisoblagich + ulashish/sevimli/yopish, pastda eskizlar, yonda ‹ ›;
 *   yopish — ✕, pastga surish, Android "orqaga", Telegram "Назад".
 */
export function PhotoViewer({ visible, photos, initialIndex, onClose, onShare, isFavorite, onFavorite }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<string>>(null);
  const thumbsRef = useRef<FlatList<string>>(null);

  const appear = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;

  const frameW = Math.min(width - 28, 720);
  const frameH = Math.min(height * 0.56, frameW * 1.18);

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    dragY.setValue(0);
    appear.setValue(0);
    Animated.spring(appear, { toValue: 1, useNativeDriver: NATIVE, damping: 18, stiffness: 160 }).start();
  }, [visible, initialIndex, appear, dragY]);

  const close = useCallback(() => {
    Animated.timing(appear, { toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: NATIVE }).start(() => onClose());
  }, [appear, onClose]);

  // Telegram "Назад" — sahifani emas, galereyani yopadi
  useLokmaBackInterceptor(visible, () => { close(); return true; });

  const go = (i: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, i));
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: true });
  };

  useEffect(() => {
    if (visible && photos.length) thumbsRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }, [index, visible, photos.length]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  // Pastga surib yopish (faqat vertikal harakatni ushlaydi — gorizontal varaqlash ishlayveradi)
  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10 && Math.abs(g.dy) > Math.abs(g.dx) * 1.4,
      onPanResponderMove: (_, g) => dragY.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 1.1) close();
        else Animated.spring(dragY, { toValue: 0, useNativeDriver: NATIVE, damping: 16 }).start();
      },
    }),
  ).current;

  const dragFade = dragY.interpolate({ inputRange: [0, 260], outputRange: [1, 0.25], extrapolate: 'clamp' });
  const contentScale = Animated.multiply(
    appear.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
    dragY.interpolate({ inputRange: [0, 300], outputRange: [1, 0.86], extrapolate: 'clamp' }),
  );

  if (!photos.length) return null;
  const current = photos[index] ?? photos[0];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      {/* Orqa fon: sahifa xira shisha ostida + joriy suratning ranglari */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: Animated.multiply(appear, dragFade) }]} pointerEvents="none">
        {BLUR && <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />}
        <Image source={current} style={[StyleSheet.absoluteFill, { opacity: BLUR ? 0.42 : 0.55 }]} contentFit="cover" blurRadius={60} transition={450} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BLUR ? 'rgba(14,10,9,0.38)' : 'rgba(14,10,9,0.72)' }]} />
        <LinearGradient colors={['rgba(14,10,9,0.55)', 'rgba(14,10,9,0)', 'rgba(14,10,9,0)', 'rgba(14,10,9,0.6)']} locations={[0, 0.22, 0.72, 1]} style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.View style={[styles.fill, { opacity: appear, transform: [{ translateY: dragY }, { scale: contentScale }] }]} {...pan.panHandlers}>
        {/* Tepa: hisoblagich va tugmalar */}
        <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
          <View style={styles.counter}>
            <Text style={styles.counterText}>{index + 1}</Text>
            <Text style={styles.counterTotal}> / {photos.length}</Text>
          </View>
          <View style={styles.actions}>
            <Glass icon="share-outline" label="Ulashish" onPress={onShare} />
            <Glass icon={isFavorite ? 'heart' : 'heart-outline'} label="Saralanganlar" onPress={onFavorite} color={isFavorite ? '#FF6B8A' : colors.white} />
            <Glass icon="close" label="Yopish" onPress={close} />
          </View>
        </View>

        {/* Suratlar */}
        <View style={styles.center}>
          <FlatList
            ref={listRef}
            data={photos}
            horizontal
            pagingEnabled
            initialScrollIndex={initialIndex}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p, i) => `${i}-${p}`}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={onEnd}
            renderItem={({ item, index: i }) => (
              <View style={{ width, alignItems: 'center', justifyContent: 'center' }}>
                <KenBurns uri={item} active={i === index} variant={i % 4} width={frameW} height={frameH} />
              </View>
            )}
          />
          {index > 0 && <Side side="left" onPress={() => go(index - 1)} />}
          {index < photos.length - 1 && <Side side="right" onPress={() => go(index + 1)} />}
        </View>

        {/* Pastki eskizlar */}
        <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
          <View style={styles.thumbGlass}>
            {BLUR && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
            <FlatList
              ref={thumbsRef}
              data={photos}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(p, i) => `t${i}-${p}`}
              contentContainerStyle={styles.thumbs}
              getItemLayout={(_, i) => ({ length: 62, offset: 10 + 62 * i, index: i })}
              renderItem={({ item, index: i }) => {
                const on = i === index;
                return (
                  <Pressable onPress={() => go(i)} accessibilityRole="imagebutton" accessibilityLabel={`${i + 1}-surat`} style={[styles.thumb, on && styles.thumbOn]}>
                    <Image source={item} style={StyleSheet.absoluteFill} contentFit="cover" />
                    {!on && <View style={styles.thumbDim} />}
                  </Pressable>
                );
              }}
            />
          </View>
          <Text style={styles.hint}>Yopish uchun pastga suring</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

/*
 * Ken Burns: faol suratda sekin, cheksiz harakat (9 s oldinga, 9 s orqaga).
 * 4 xil yo'nalish — har surat o'zgacha jonlanadi. Surat paydo bo'lganda yumshoq kattalashadi.
 */
const MOTIONS = [
  { s: [1.02, 1.16], x: [-10, 14], y: [6, -8] },   // yaqinlashib o'ngga
  { s: [1.15, 1.03], x: [12, -12], y: [-6, 6] },   // uzoqlashib chapga
  { s: [1.04, 1.14], x: [0, 0], y: [12, -14] },    // yaqinlashib yuqoriga
  { s: [1.1, 1.1], x: [-18, 18], y: [0, 0] },      // yonlama suzish
];

function KenBurns({ uri, active, variant, width, height }: { uri: string; active: boolean; variant: number; width: number; height: number }) {
  const t = useRef(new Animated.Value(0)).current;
  const enter = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (!active) {
      t.stopAnimation();
      return;
    }
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
        Animated.timing(t, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, t, enter]);

  const m = MOTIONS[variant];
  const scale = t.interpolate({ inputRange: [0, 1], outputRange: m.s });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: m.x });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: m.y });

  return (
    <Animated.View
      style={[
        styles.frame,
        { width, height },
        { opacity: enter.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }, { translateX }, { translateY }] }]}>
        <Image source={uri} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      </Animated.View>
      {/* Nozik oltin hoshiya va yuqorida yaltirash */}
      <View style={styles.frameRing} pointerEvents="none" />
      <LinearGradient colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']} locations={[0, 0.3]} style={StyleSheet.absoluteFill} pointerEvents="none" />
    </Animated.View>
  );
}

function Glass({ icon, label, onPress, color = colors.white }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.glass, pressed && { transform: [{ scale: 0.9 }] }]}>
      {BLUR && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
      <Ionicons name={icon} size={20} color={color} />
    </Pressable>
  );
}

function Side({ side, onPress }: { side: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={side === 'left' ? 'Oldingi surat' : 'Keyingi surat'}
      style={({ pressed }) => [styles.side, side === 'left' ? { left: 4 } : { right: 4 }, pressed && { transform: [{ scale: 0.9 }] }]}
    >
      {BLUR && <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />}
      <Ionicons name={side === 'left' ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.white} />
    </Pressable>
  );
}

const glassBase = {
  overflow: 'hidden' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
  backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  counter: { ...glassBase, flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 16, height: 40, borderRadius: 20 },
  counterText: { fontFamily: fontFamily.serif, fontSize: 19, color: colors.white },
  counterTotal: { fontFamily: fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  actions: { flexDirection: 'row', gap: 10 },
  glass: { ...glassBase, width: 42, height: 42, borderRadius: 21 },
  center: { flex: 1, justifyContent: 'center' },
  frame: {
    borderRadius: 28, overflow: 'hidden', backgroundColor: '#2A2220',
    shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: 18 }, elevation: 18,
  },
  frameRing: { ...StyleSheet.absoluteFill, borderRadius: 28, borderWidth: 1, borderColor: 'rgba(230,199,137,0.45)' },
  side: { ...glassBase, position: 'absolute', top: '50%', marginTop: -21, width: 42, height: 42, borderRadius: 21 },
  bottom: { alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  thumbGlass: { ...glassBase, alignItems: 'stretch', borderRadius: 22, maxWidth: 720, width: '100%' },
  thumbs: { padding: 10, gap: 8 },
  thumb: { width: 54, height: 54, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 2, borderColor: 'transparent' },
  thumbOn: { borderColor: colors.goldLight, transform: [{ scale: 1.06 }] },
  thumbDim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(14,10,9,0.35)' },
  hint: { fontFamily: fontFamily.regular, fontSize: 12, color: 'rgba(255,255,255,0.6)' },
});
