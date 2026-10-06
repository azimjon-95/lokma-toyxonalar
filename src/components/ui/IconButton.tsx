import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface Props {
  icon: IconName;
  onPress?: () => void;
  label: string; // accessibility
  color?: string;
  size?: number;
  variant?: 'solid' | 'outline' | 'translucent';
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon, onPress, label, color = colors.text, size = 44, variant = 'solid', style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        styles[variant],
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Ionicons name={icon} size={Math.round(size * 0.45)} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  solid: { backgroundColor: colors.white },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  translucent: { backgroundColor: 'rgba(255,255,255,0.92)' },
});
