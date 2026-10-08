import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, layout, typography } from '../../theme';
import { mockMode } from '../../services/api';

/** Server bilan aloqa yo'q — test ma'lumotlari ko'rsatilayotgani haqida kichik belgi */
export function MockBanner() {
  const [on, setOn] = useState(mockMode.get());
  useEffect(() => mockMode.subscribe(setOn), []);
  if (!on) return null;
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Ionicons name="flask-outline" size={15} color="#8A5A00" />
      <Text style={styles.text}>Test ma’lumotlari — server bilan aloqa yo‘q</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: layout.screenPadding, marginBottom: 10,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: '#FFF6DD', borderWidth: 1, borderColor: '#F3DE9C',
  },
  text: { ...typography.caption, fontSize: 12, color: '#6B4A00', flex: 1 },
});
