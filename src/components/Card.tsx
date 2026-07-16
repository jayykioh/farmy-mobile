import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'surface';
}

export const Card: React.FC<CardProps> = ({ children, variant = 'default', style, ...props }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'default': return styles.default;
      case 'outline': return styles.outline;
      case 'surface': return styles.surface;
      default: return styles.default;
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderMain,
  },
  surface: {
    backgroundColor: colors.bgSurface1,
  }
});
