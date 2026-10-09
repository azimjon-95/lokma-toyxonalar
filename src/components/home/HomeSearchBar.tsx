import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

interface Props {
  value: string;
  onChange: (s: string) => void;
  placeLabel: string;
  onPlacePress: () => void;
  onFocus?: () => void;
}

/** Qidiruv maydoni + o'ngda hudud tanlash ("Barcha" / tuman nomi) */
export const HomeSearchBar = forwardRef<TextInput, Props>(function HomeSearchBar({ value, onChange, placeLabel, onPlacePress, onFocus }, ref) {
  return (
    <View style={styles.bar}>
      <Ionicons name="search-outline" size={19} color={colors.text} />
      <TextInput
        ref={ref}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        onFocus={onFocus}
        placeholder="To‘yxonalar, shahar, tuman..."
        placeholderTextColor="#A39D97"
        returnKeyType="search"
        accessibilityLabel="To‘yxona qidirish"
      />
      {value ? (
        <Pressable onPress={() => onChange('')} hitSlop={8} accessibilityLabel="Tozalash">
          <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
        </Pressable>
      ) : null}
      <Pressable onPress={onPlacePress} hitSlop={6} accessibilityRole="button" accessibilityLabel="Hududni tanlash" style={styles.place}>
        <Ionicons name="location-outline" size={16} color={colors.goldMid} />
        <Text style={styles.placeText} numberOfLines={1}>{placeLabel}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.text} />
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 42, marginHorizontal: 16, paddingLeft: 14, paddingRight: 12,
    borderRadius: 21, backgroundColor: colors.white, borderWidth: 1, borderColor: '#F0E9E1',
    shadowColor: '#5A3A1A', shadowOpacity: 0.07, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  input: { flex: 1, minWidth: 0, fontFamily: fontFamily.regular, fontSize: 13, color: colors.text, paddingVertical: 0, outlineStyle: 'none' } as never,
  place: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 120 },
  placeText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.text, flexShrink: 1 },
});
