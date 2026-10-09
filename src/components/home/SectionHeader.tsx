import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily } from '../../theme';

/** Chapda oltin chiziq + sarlavha; o'ngda havola yoki izoh */
export function SectionHeader({ title, serif, action, actionLink, onAction, actionIcon }: {
  title: string;
  serif?: boolean;
  action?: string;
  actionLink?: boolean;
  onAction?: () => void;
  actionIcon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.bar} />
        <Text style={serif ? styles.titleSerif : styles.title} numberOfLines={1} accessibilityRole="header">{title}</Text>
      </View>
      {!!action && (
        <Pressable onPress={onAction} disabled={!onAction} hitSlop={8} accessibilityRole={onAction ? 'button' : undefined} style={styles.action}>
          <Text style={actionLink ? styles.link : styles.note}>{action}</Text>
          {!!actionIcon && <Ionicons name={actionIcon} size={actionLink ? 14 : 16} color={actionLink ? colors.goldText : colors.text} />}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, gap: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  bar: { width: 3.5, height: 18, borderRadius: 2, backgroundColor: colors.goldMid },
  titleSerif: { fontFamily: fontFamily.serif, fontSize: 19, lineHeight: 24, color: colors.text, flexShrink: 1 },
  title: { fontFamily: fontFamily.bold, fontSize: 17, lineHeight: 22, color: colors.text, flexShrink: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { fontFamily: fontFamily.medium, fontSize: 12.5, color: colors.goldText, textDecorationLine: 'underline' },
  note: { fontFamily: fontFamily.regular, fontSize: 12.5, color: colors.textSecondary },
});
