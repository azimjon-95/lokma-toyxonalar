import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

const HERO = require('../../../assets/home/hero.webp');
const LOGO = require('../../../assets/home/logo.webp');

/** Hero balandligi (tepadagi xavfsiz zonasiz). Oq varaq shundan SHEET_OVERLAP yuqoriga chiqadi. */
export const HERO_HEIGHT = 238;
/** Matn bloki kengligi: planshet/kompyuterda ham o'qilishi qulay */
export const CONTENT_MAX_WIDTH = 680;

interface Props {
  topInset: number;
  onFilter: () => void;
  hasFilter: boolean;
}

/*
 * Bosh sahifa hero bloki — ekranning ENG TEPASIDAN boshlanadi (status bar va
 * Telegram tugmalari ortida ham rasm). Tizim belgilari TopFog ostida o'qiladi.
 * Matn tepadagi xavfsiz zonadan (topInset) keyin boshlanadi.
 */
export function HomeHero({ topInset, onFilter, hasFilter }: Props) {
  return (
    <View style={[styles.wrap, { height: HERO_HEIGHT + topInset }]}>
      {/* Rasm yuqoriroq ko'tarilgan: arka va gullar varaq ostida qolmaydi */}
      <Image source={HERO} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={{ top: '58%', left: '62%' }} transition={250} />
      <LinearGradient
        colors={['rgba(18,30,22,0.88)', 'rgba(24,38,28,0.62)', 'rgba(30,40,30,0.14)', 'rgba(30,40,30,0)']}
        locations={[0, 0.4, 0.74, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Pastda varaqqa yumshoq o'tish */}
      <LinearGradient colors={['rgba(20,24,20,0)', 'rgba(20,24,20,0.28)']} style={styles.bottomShade} />

      <View style={[styles.content, { paddingTop: topInset + 14 }]}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.brand} accessibilityRole="header" accessibilityLabel="Lokma To‘yxonalar">
              <Image source={LOGO} style={styles.logo} contentFit="contain" />
              <View>
                <Text style={styles.brandName}>Lokma</Text>
                <Text style={styles.brandSub}>To‘yxonalar</Text>
              </View>
            </View>
            {/* Qidiruv — pastdagi qidiruv qatorida; bu yerda faqat filtr */}
            <RoundButton icon="options-outline" label="Filtr va saralash" onPress={onFilter} dot={hasFilter} />
          </View>

          <Text style={styles.eyebrow}>ORZULARINGIZDAGI</Text>
          <Text style={styles.title}>To‘yingiz uchun{'\n'}eng yaxshi joy</Text>
          <Text style={styles.subtitle}>Biz bilan har bir lahza{'\n'}unutilmas bo‘ladi ✨</Text>
        </View>
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
  bottomShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  content: { flex: 1, paddingHorizontal: 18 },
  inner: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 41, height: 38 },
  brandName: { fontFamily: fontFamily.serif, fontSize: 22, lineHeight: 25, color: colors.white, letterSpacing: 0.2 },
  brandSub: { fontFamily: fontFamily.serif, fontSize: 13, lineHeight: 15, color: colors.goldLight, letterSpacing: 0.3 },
  round: {
    width: 35, height: 35, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  dot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, borderWidth: 1.5, borderColor: colors.white },
  eyebrow: { marginTop: 18, fontFamily: fontFamily.medium, fontSize: 9.5, letterSpacing: 3, color: 'rgba(255,255,255,0.88)' },
  title: { marginTop: 6, fontFamily: fontFamily.serif, fontSize: 23, lineHeight: 25, color: colors.white, letterSpacing: -0.2 },
  subtitle: { marginTop: 6, fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 14.5, color: 'rgba(255,255,255,0.92)' },
});
