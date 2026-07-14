import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '800', // font-extrabold equivalent
    color: colors.textH,
  },
  h2: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textH,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textH,
  },
  body: {
    fontSize: 16,
    color: colors.textMain,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgSurface,
  },
});
