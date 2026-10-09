import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

/** Pastki suzuvchi panel: sana · vaqt, narx va vino gradientli "Bron qilish" */
export function BookingBar({ label, price, disabled, onPress, bottomInset }: {
  label: string; price: string; disabled: boolean; onPress: () => void; bottomInset: number;
}) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 10) + 6 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="calendar-month-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{price}</Text>
        </View>
        <View style={styles.sep} />
        <Pressable
          onPress={onPress}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          style={({ pressed }) => [styles.btnWrap, disabled && { opacity: 0.5 }, pressed && !disabled && { transform: [{ scale: 0.97 }] }]}
        >
          <LinearGradient colors={['#C2365F', colors.primary, colors.wineDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
            <View style={styles.shine} />
            <Text style={styles.btnText}>Bron qilish</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14 },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingLeft: 10, paddingRight: 9,
    borderRadius: 30, backgroundColor: 'rgba(255,253,250,0.97)', borderWidth: 1, borderColor: '#F0E6DB',
    shadowColor: '#5A3A1A', shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 10,
    maxWidth: 680, width: '100%', alignSelf: 'center',
  },
  icon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#F6EEE6', alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fontFamily.regular, fontSize: 11, color: '#7A7068' },
  price: { fontFamily: fontFamily.serif, fontSize: 18.5, lineHeight: 23, color: colors.text, marginTop: 1 },
  sep: { width: 1, alignSelf: 'stretch', marginVertical: 8, marginHorizontal: -2, backgroundColor: '#EDE3D8' },
  btnWrap: { borderRadius: 26, shadowColor: colors.wineDeep, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 50, paddingHorizontal: 18, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(230,199,137,0.5)' },
  shine: { position: 'absolute', top: 0, left: 18, right: 18, height: 1.5, backgroundColor: 'rgba(255,255,255,0.45)' },
  btnText: { fontFamily: fontFamily.semiBold, fontSize: 15.5, color: colors.white },
});
