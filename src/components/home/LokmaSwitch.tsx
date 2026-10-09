import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { showLokmaSwitch, useLokma } from '../../lib/lokma';

/*
 * Lokma bo'limlariga qaytish: Lokma Go (taomlar) va Lokma Market (do'konlar).
 * Rasmli kartalar: pastdan quyuqlashuv, chap yuqorida 3D belgi (Lokma'dagi asl belgilar),
 * o'ng pastda oq strelka. Lokma ichida — ota ilovaga xabar; oddiy saytda — havola.
 */
const PHOTO_GO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop';
const PHOTO_MARKET = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=70&auto=format&fit=crop';

// Lokma Go / Market'dagi O'ZINING eski 3D belgilari (doira ichidagi oddiy belgi o'rniga)
const ICON_GO = require('../../../assets/lokma/lokma-go.webp');
const ICON_MARKET = require('../../../assets/lokma/market-basket.webp');

function Tile({ photo, title, sub, tone, icon, onPress }: {
  photo: string; title: string; sub: string; tone: 'go' | 'market';
  icon: number; onPress: () => void;
}) {
  const shade = tone === 'go'
    ? ['rgba(60,28,12,0.10)', 'rgba(60,28,12,0.55)', 'rgba(52,24,10,0.88)'] as const
    : ['rgba(8,60,40,0.10)', 'rgba(8,60,40,0.60)', 'rgba(6,58,38,0.92)'] as const;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => [styles.tile, { backgroundColor: tone === 'go' ? '#5A2E16' : '#0F5A3C' }, pressed && { transform: [{ scale: 0.97 }] }]}
    >
      <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      <LinearGradient colors={shade} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      {/* Belgi o'z o'lchamidagi oq (xira shisha) quti ustida */}
      <View style={styles.iconBox}>
        <Image source={icon} style={styles.icon} contentFit="contain" accessibilityIgnoresInvertColors />
      </View>
      {/* Strelka yuqori o'ngda — nom pastda to'liq kenglikda (Lokma Go tugmalari bilan bir xil) */}
      <View style={styles.arrow}>
        <Ionicons name="arrow-forward" size={13} color={colors.text} />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.sub} numberOfLines={2}>{sub}</Text>
      </View>
    </Pressable>
  );
}

export function LokmaSwitch() {
  const { goToLokma } = useLokma();
  if (!showLokmaSwitch) return null;
  return (
    <View style={styles.row}>
      <Tile
        photo={PHOTO_GO} tone="go" title="Lokma Go" sub="Restoran va taomlar"
        icon={ICON_GO}
        onPress={() => goToLokma('/')}
      />
      <Tile
        photo={PHOTO_MARKET} tone="market" title="Lokma Market" sub="Oziq-ovqat do‘konlari"
        icon={ICON_MARKET}
        onPress={() => goToLokma('/market')}
      />
    </View>
  );
}

// Barcha bo'limlarda (Lokma Go, Market, To'yxonalar) tugma o'lchami bir xil: balandlik 102
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  tile: {
    flex: 1, minWidth: 0, height: 102, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  iconBox: {
    position: 'absolute', top: 9, left: 11, width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as object) : null),
  },
  icon: { width: 34, height: 34 },
  bottom: { position: 'absolute', left: 11, right: 10, bottom: 10 },
  title: { fontFamily: fontFamily.bold, fontSize: 14, lineHeight: 16, color: colors.white },
  sub: { fontFamily: fontFamily.regular, fontSize: 10.5, lineHeight: 13, color: 'rgba(255,255,255,0.92)', marginTop: 1 },
  arrow: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
