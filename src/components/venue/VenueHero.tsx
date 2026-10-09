import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

/** To'lqin chegarasi balandligi (rasm ostiga kirib turadi) */
export const WAVE_HEIGHT = 46;

interface Props {
  photo?: string;
  topInset: number;
  height: number;
  /** Lokma ichida "Назад" ni Telegram chizadi — o'zimizniki kerak emas */
  showBack: boolean;
  onBack: () => void;
  onSearch: () => void;
  onFilter: () => void;
}

/*
 * To'yxona sahifasi hero'si: ekran tepasidan (status bar ortidan) rasm,
 * pastda iliq fil suyagi rangli TO'LQIN va uning ustida nozik oltin chiziq.
 * O'ngda — qorong'i shisha doiralarda qidiruv va filtr.
 */
export function VenueHero({ photo, topInset, height, showBack, onBack, onSearch, onFilter }: Props) {
  const { width } = useWindowDimensions();
  const w = Math.max(320, width);
  // Chapdan pastga tushib, o'ngda yuqoriga ko'tariladigan yumshoq to'lqin
  const wave = `M0 ${WAVE_HEIGHT * 0.18} C ${w * 0.22} ${WAVE_HEIGHT * 0.05}, ${w * 0.42} ${WAVE_HEIGHT * 0.9}, ${w * 0.68} ${WAVE_HEIGHT * 0.72} S ${w * 0.92} ${WAVE_HEIGHT * 0.28}, ${w} ${WAVE_HEIGHT * 0.1} L ${w} ${WAVE_HEIGHT} L 0 ${WAVE_HEIGHT} Z`;
  const edge = `M0 ${WAVE_HEIGHT * 0.18} C ${w * 0.22} ${WAVE_HEIGHT * 0.05}, ${w * 0.42} ${WAVE_HEIGHT * 0.9}, ${w * 0.68} ${WAVE_HEIGHT * 0.72} S ${w * 0.92} ${WAVE_HEIGHT * 0.28}, ${w} ${WAVE_HEIGHT * 0.1}`;

  return (
    <View style={[styles.wrap, { height }]}>
      <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }} />
      <LinearGradient colors={['rgba(20,14,12,0.18)', 'rgba(20,14,12,0)', 'rgba(20,14,12,0.10)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      <View style={[styles.topRow, { top: topInset + 8 }]} pointerEvents="box-none">
        {showBack ? <GlassButton icon="chevron-back" label="Orqaga" onPress={onBack} /> : <View />}
        <View style={styles.right}>
          <GlassButton icon="search" label="Qidirish" onPress={onSearch} />
          <GlassButton icon="options-outline" label="Filtr" onPress={onFilter} />
        </View>
      </View>

      <Svg width={w} height={WAVE_HEIGHT} style={styles.wave} viewBox={`0 0 ${w} ${WAVE_HEIGHT}`}>
        <Path d={wave} fill={colors.page} />
        <Path d={edge} stroke={colors.goldMid} strokeWidth={2} fill="none" opacity={0.85} />
      </Svg>
    </View>
  );
}

function GlassButton({ icon, label, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={6} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.glass, pressed && { transform: [{ scale: 0.92 }] }]}>
      <Ionicons name={icon} size={20} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#3A2E2A', overflow: 'hidden' },
  topRow: { position: 'absolute', left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  right: { flexDirection: 'row', gap: 10 },
  glass: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(28,20,18,0.48)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  wave: { position: 'absolute', left: 0, right: 0, bottom: -1 },
});
