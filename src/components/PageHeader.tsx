import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goBackOrReplace } from '../utils/navigation';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  fallbackHref?: Href;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = true,
  rightElement,
  fallbackHref = '/(tabs)/home',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gutter, contentMaxWidth } = useResponsiveLayout();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={[styles.inner, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}>
        <View style={styles.sideContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={() => goBackOrReplace(router, fallbackHref)}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              hitSlop={4}
            >
              <ChevronLeft size={23} color={colors.textMain} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        <View style={[styles.sideContainer, styles.rightContainer]}>
          {rightElement}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.bgMain,
    paddingBottom: 12,
  },
  inner: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideContainer: {
    width: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h3,
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: colors.borderMain + '66',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  }
});
