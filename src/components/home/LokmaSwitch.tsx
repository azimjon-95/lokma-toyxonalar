import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';
import { showLokmaSwitch, useLokma } from '../../lib/lokma';

/*
 * Lokma bo'limlariga qaytish: Lokma Go (taomlar) va Lokma Market (do'konlar).
 * Rasmli kartalar: pastdan quyuqlashuv, chap yuqorida oq doira ichida belgi,
 * o'ng pastda oq strelka. Lokma ichida — ota ilovaga xabar; oddiy saytda — havola.
 */
const PHOTO_GO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=70&auto=format&fit=crop';
const PHOTO_MARKET = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=70&auto=format&fit=crop';

function Tile({ photo, title, sub, tone, icon, onPress }: {
  photo: string; title: string; sub: string; tone: 'go' | 'market';
  icon: React.ReactNode; onPress: () => void;
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
      <View style={styles.iconCircle}>{icon}</View>
      <View style={styles.bottom}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{sub}</Text>
        </View>
        <View style={styles.arrow}>
          <Ionicons name="arrow-forward" size={14} color={colors.text} />
        </View>
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
        icon={<MaterialCommunityIcons name="chef-hat" size={17} color="#C77A3A" />}
        onPress={() => goToLokma('/')}
      />
      <Tile
        photo={PHOTO_MARKET} tone="market" title="Lokma Market" sub="Oziq-ovqat do‘konlari"
        icon={<MaterialCommunityIcons name="basket-outline" size={17} color="#13895A" />}
        onPress={() => goToLokma('/market')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  tile: {
    flex: 1, minWidth: 0, height: 92, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 4,
  },
  iconCircle: {
    position: 'absolute', top: 20, left: 12, width: 28, height: 28, borderRadius: 9, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  bottom: { position: 'absolute', left: 12, right: 10, bottom: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  title: { fontFamily: fontFamily.bold, fontSize: 12.5, lineHeight: 15, color: colors.white },
  sub: { fontFamily: fontFamily.regular, fontSize: 9.5, lineHeight: 12, color: 'rgba(255,255,255,0.92)' },
  arrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
