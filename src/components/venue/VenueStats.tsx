import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

type Item = { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; value: string; label: string };

/** 4 ustunli ma'lumot kartasi: sig'im, zallar, parking, xizmat */
export function VenueStats({ items }: { items: Item[] }) {
  return (
    <View style={styles.card}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          {i > 0 && <View style={styles.divider} />}
          <View style={styles.col}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={it.icon} size={22} color={colors.primary} />
            </View>
            {/* Uzun qiymat (masalan "To'liq xizmat") tor ekranda ham bir qatorga sig'adi */}
            <Text style={[styles.value, it.value.length > 9 && styles.valueLong]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{it.value}</Text>
            <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{it.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', marginHorizontal: 16, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 22,
    backgroundColor: '#FFFDFB', borderWidth: 1, borderColor: '#F0E6DB',
    shadowColor: '#7A5A3A', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2,
  },
  col: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingHorizontal: 0 },
  divider: { width: 1, marginVertical: 12, backgroundColor: '#EFE5DA' },
  iconWrap: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.wineSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  value: { fontFamily: fontFamily.semiBold, fontSize: 14.5, color: colors.text },
  valueLong: { fontSize: 12.5, letterSpacing: -0.2 },
  label: { fontFamily: fontFamily.regular, fontSize: 11.5, color: '#7A7068' },
});
