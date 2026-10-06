import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'default' | 'success' | 'soft';
  style?: ViewStyle;
  leftIcon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  variant = 'default',
  style,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.base,
        selected ? styles.selected : styles[variant],
        style,
      ]}
    >
      {leftIcon}
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  success: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBg,
  },
  soft: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  text: {
    ...typography.captionMedium,
    color: colors.text,
  },
  textSelected: {
    color: colors.white,
  },
});
