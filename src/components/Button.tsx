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
        props.disabled && styles.disabled,
        style
      ]} 
      disabled={props.disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.bgSurface} />
      ) : (
        <>
          {icon}
          <Text style={[styles.textBase, getTextStyle()]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  textBase: {
    ...typography.buttonText,
  },
  primary: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    backgroundColor: 'transparent',
    borderWidth: 2,
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
