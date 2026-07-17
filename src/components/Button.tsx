import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  fullWidth = true,
  icon,
  style,
  ...props 
}) => {
  const isDisabled = Boolean(props.disabled || isLoading);
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return styles.primary;
      case 'secondary': return styles.secondary;
      case 'outline': return styles.outline;
      case 'danger': return styles.danger;
      default: return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary': return styles.textPrimary;
      case 'secondary': return styles.textSecondary;
      case 'outline': return styles.textOutline;
      case 'danger': return styles.textDanger;
      default: return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.base, 
        getVariantStyle(), 
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style
      ]} 
      disabled={isDisabled}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.bgSurface} />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextStyle()]} numberOfLines={2}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.48,
  },
  textBase: {
    ...typography.buttonText,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  textPrimary: {
    color: colors.bgSurface,
  },
  secondary: {
    backgroundColor: colors.secondaryContainer,
  },
  textSecondary: {
    color: colors.textMain,
  },
  outline: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain,
  },
  textOutline: {
    color: colors.textMain,
  },
  danger: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.errorContainer,
  },
  textDanger: {
    color: colors.error,
  }
});
