import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

/** Vino gradientli kvadrat ikonka + serif sarlavha (+ ixtiyoriy izoh va o'ng element) */
export function SectionTitle({ icon, title, subtitle, right }: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <LinearGradient colors={['#C2365F', colors.primary, colors.wineDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
        <MaterialCommunityIcons name={icon} size={22} color={colors.white} />
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={subtitle ? styles.titleSm : styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  icon: {
    width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.wineDeep, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  title: { fontFamily: fontFamily.serif, fontSize: 24, lineHeight: 30, color: colors.text },
  titleSm: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 23, color: colors.text },
  subtitle: { fontFamily: fontFamily.regular, fontSize: 13, color: '#7A7068', marginTop: 1 },
});
