import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

const HERO = require('../../../assets/home/hero.webp');
const LOGO = require('../../../assets/home/logo.webp');

/** Hero balandligi (status bar'siz). Oq varaq shu balandlikdan 28px yuqoriga chiqadi. */
export const HERO_HEIGHT = 256;

interface Props {
  topInset: number;
  onSearch: () => void;
  onFilter: () => void;
  onExplore: () => void;
  hasFilter: boolean;
}

/*
 * Bosh sahifa hero bloki:
 *   to'liq kenglikdagi to'yxona surati + chapdan qorong'i yashil-zaytun gradient
 *   (oq matn har doim o'qiladi), logo, qidiruv/filtr tugmalari, sarlavha va oltin CTA.
 */
export function HomeHero({ topInset, onSearch, onFilter, onExplore, hasFilter }: Props) {
  return (
    <View style={[styles.wrap, { height: HERO_HEIGHT + topInset }]}>
      <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '46%', left: '62%' }} transition={250} />
      {/* Chapdan: matn ostida chuqur, o'ngga qarab ochiladi */}
      <LinearGradient
        colors={['rgba(18,30,22,0.92)', 'rgba(24,38,28,0.70)', 'rgba(30,40,30,0.18)', 'rgba(30,40,30,0)']}
        locations={[0, 0.38, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Yuqoridan (status bar va logo ostida) va pastdan yengil soya */}
      <LinearGradient colors={['rgba(10,16,12,0.45)', 'rgba(10,16,12,0)']} style={[styles.topShade, { height: topInset + 90 }]} />

      <View style={[styles.content, { paddingTop: topInset + 8 }]}>
        <View style={styles.topRow}>
          <View style={styles.brand} accessibilityRole="header" accessibilityLabel="Lokma To‘yxonalar">
            <Image source={LOGO} style={styles.logo} contentFit="contain" />
            <View>
              <Text style={styles.brandName}>Lokma</Text>
              <Text style={styles.brandSub}>To‘yxonalar</Text>
            </View>
          </View>
          <View style={styles.actions}>
            <RoundButton icon="search" label="Qidirish" onPress={onSearch} />
            <RoundButton icon="options-outline" label="Filtr va saralash" onPress={onFilter} dot={hasFilter} />
          </View>
        </View>

        <Text style={styles.eyebrow}>ORZULARINGIZDAGI</Text>
        <Text style={styles.title}>To‘yingiz uchun{'\n'}eng yaxshi joy</Text>
        <Text style={styles.subtitle}>Biz bilan har bir lahza{'\n'}unutilmas bo‘ladi ✨</Text>

        <Pressable onPress={onExplore} accessibilityRole="button" style={({ pressed }) => [styles.ctaWrap, pressed && { transform: [{ scale: 0.97 }] }]}>
          <LinearGradient colors={[colors.goldLight, colors.goldMid, colors.goldDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
            <Text style={styles.ctaText}>To‘yxonalarni ko‘rish</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function RoundButton({ icon, label, onPress, dot }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; onPress: () => void; dot?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      {dot && <View style={styles.dot} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', backgroundColor: '#2B3A2E', overflow: 'hidden' },
  topShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  content: { flex: 1, paddingHorizontal: 18 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 41, height: 38 },
  brandName: { fontFamily: fontFamily.serif, fontSize: 22, lineHeight: 25, color: colors.white, letterSpacing: 0.2 },
  brandSub: { fontFamily: fontFamily.serif, fontSize: 13, lineHeight: 15, color: colors.goldLight, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', gap: 10 },
  round: {
    width: 35, height: 35, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  dot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.white },
  eyebrow: { marginTop: 18, fontFamily: fontFamily.medium, fontSize: 9.5, letterSpacing: 3, color: 'rgba(255,255,255,0.88)' },
  title: { marginTop: 6, fontFamily: fontFamily.serif, fontSize: 23, lineHeight: 25, color: colors.white, letterSpacing: -0.2 },
  subtitle: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 14.5, color: 'rgba(255,255,255,0.92)' },
  ctaWrap: {
    alignSelf: 'flex-start', marginTop: 12, borderRadius: 17,
    shadowColor: '#7A5212', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 5,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 33, paddingHorizontal: 15, borderRadius: 17,
    borderWidth: 1, borderColor: 'rgba(255,240,210,0.55)',
  },
  ctaText: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.white, letterSpacing: 0.1 },
});
