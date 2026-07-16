import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.textH,
  },
  h2: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.25,
    color: colors.textH,
  },
  h3: {
    fontSize: 20,
    lineHeight: 27,
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
    lineHeight: 17,
    color: colors.textMuted,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.bgSurface,
  },
});
