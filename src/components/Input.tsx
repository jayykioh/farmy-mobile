import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, isFocused && styles.inputFocused, error && styles.inputError]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput 
          style={[styles.input, style]} 
          {...props}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          accessibilityLabel={props.accessibilityLabel || label}
          accessibilityState={{ disabled: props.editable === false }}
          onFocus={(event) => {
            setIsFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            props.onBlur?.(event);
          }}
        />
      </View>
      {error && <Text style={styles.errorText} accessibilityLiveRegion="polite">{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain,
    borderRadius: 14,
    minHeight: 54,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: colors.error,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  iconContainer: {
    paddingLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    ...typography.body,
    color: colors.textMain,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 4,
  }
});
