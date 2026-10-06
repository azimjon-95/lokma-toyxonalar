import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

export function Loading({ label = 'Yuklanmoqda…' }: { label?: string }) {
  return (
    <View style={styles.box}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.sub}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View style={styles.box}>
      <Ionicons name="cloud-offline-outline" size={36} color={colors.textTertiary} />
      <Text style={styles.title}>Ma’lumotni yuklab bo‘lmadi</Text>
      {!!message && <Text style={styles.sub}>{message}</Text>}
      {onRetry && <Button title="Qayta urinish" variant="outline" size="sm" onPress={onRetry} />}
    </View>
  );
}

export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.box}>
      <Ionicons name="search-outline" size={36} color={colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {!!subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', padding: spacing[8], gap: spacing[2] },
  title: { ...typography.bodySemiBold, color: colors.text, textAlign: 'center' },
  sub: { ...typography.caption, color: colors.textSecondary, textAlign: 'center' },
});
