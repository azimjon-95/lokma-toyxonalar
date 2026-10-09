import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontFamily } from '../../theme';

export type CategoryKey = 'all' | 'banquet' | 'ceremony' | 'favorites';

const ITEMS: { key: CategoryKey; title: string; sub: string; img: number }[] = [
  { key: 'all', title: 'To‘yxonalar', sub: 'Katta va kichik zallar', img: require('../../../assets/home/cloche.webp') },
  { key: 'banquet', title: 'Banket zallari', sub: 'Bayram va tadbirlar uchun', img: require('../../../assets/home/banquet.webp') },
  { key: 'ceremony', title: 'Tantanalar', sub: 'Nikoh, sunnat, korporativ', img: require('../../../assets/home/arch.webp') },
  { key: 'favorites', title: 'Sevimlilar', sub: 'Saqlangan joylar', img: require('../../../assets/home/heart.webp') },
];

export function CategoryRow({ active, onPress }: { active: CategoryKey | null; onPress: (k: CategoryKey) => void }) {
  return (
    <View style={styles.row}>
      {ITEMS.map((it) => {
        const on = active === it.key;
        return (
          <Pressable
            key={it.key}
            onPress={() => onPress(it.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${it.title}. ${it.sub}`}
            style={({ pressed }) => [styles.card, on && styles.cardOn, pressed && { transform: [{ scale: 0.96 }] }]}
          >
            <LinearGradient colors={[colors.cream, colors.creamDeep]} style={StyleSheet.absoluteFill} />
            <Image source={it.img} style={styles.img} contentFit="contain" />
            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{it.title}</Text>
            <Text style={styles.sub} numberOfLines={2}>{it.sub}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, paddingHorizontal: 16 },
  card: {
    flex: 1, minWidth: 0, height: 92, borderRadius: 18, overflow: 'hidden', alignItems: 'center',
    paddingTop: 8, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.creamBorder,
  },
  cardOn: { borderColor: colors.goldMid, borderWidth: 1.5 },
  img: { width: 40, height: 32 },
  title: { marginTop: 5, fontFamily: fontFamily.bold, fontSize: 11.5, lineHeight: 14, color: colors.text, textAlign: 'center' },
  sub: { marginTop: 2, fontFamily: fontFamily.regular, fontSize: 9, lineHeight: 11, color: '#8C8279', textAlign: 'center' },
});
