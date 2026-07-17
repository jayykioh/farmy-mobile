import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout, ShieldCheck, Layers3, ArrowRight } from 'lucide-react-native';
import { Button } from '../../src/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.logoContainer}>
            <Sprout color={colors.primaryContainer} size={42} />
          </View>

          <Text style={styles.kicker}>FarmDiaries</Text>
          <Text style={styles.title}>Một mặt phẳng điều khiển cho nông trại của bạn</Text>
          <Text style={styles.subtitle}>
            Ghi chép, nhắc việc, theo dõi cây trồng và chăm thú trong một luồng rõ ràng, ít nhiễu.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Layers3 size={14} color={colors.primaryContainer} />
              <Text style={styles.statText}>Gọn</Text>
            </View>
            <View style={styles.statChip}>
              <ShieldCheck size={14} color={colors.primaryContainer} />
              <Text style={styles.statText}>Rõ</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.sectionLabel}>Thiết kế để đi nhanh</Text>
          <View style={styles.featureRow}>
            <View style={styles.featureIconWrap}>
              <ArrowRight size={16} color={colors.primaryContainer} />
            </View>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>Vào app, đi thẳng vào việc</Text>
              <Text style={styles.featureBody}>Không cần đi qua nhiều lớp màn hình trước khi bắt đầu.</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Đăng nhập"
          onPress={() => router.push('/(auth)/login')}
          style={styles.primaryButton}
        />
        <Button
          title="Đăng ký tài khoản"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primaryLight + '30',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    left: -100,
    bottom: -140,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.secondaryLight + '30',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(188,202,187,0.45)',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 28,
    elevation: 4,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderMain,
  },
  kicker: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: colors.primaryContainer,
    marginBottom: 10,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    color: colors.textH,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain,
  },
  statText: {
    ...typography.caption,
    color: colors.textMain,
    fontWeight: '700',
  },
  featureCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(188,202,187,0.55)',
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 14,
    fontWeight: '700',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.bgSurface1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  featureBody: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    marginBottom: 4,
  },
});
