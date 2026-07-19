import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { usePetStatus } from '../../src/hooks/usePet';
import { Droplets, Camera, MessageCircleQuestion, Flame, Sprout, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';
import { WeeklyInsightsSection } from '../../src/components/WeeklyInsightsSection';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: petStatus, isLoading: petLoading, refetch: refetchPet } = usePetStatus();
  const router = useRouter();
  const { gutter, contentMaxWidth, isCompact } = useResponsiveLayout();

  const level = petStatus?.level || 1;
  const xp = petStatus?.exp || 0;
  const maxXp = level * 100;
  const progress = Math.min((xp / maxXp) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={petLoading} onRefresh={refetchPet} />}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Chào buổi sáng,</Text>
            <Text style={styles.userName}>{user?.name || 'Nông dân'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={16} color={colors.warning} />
            <Text style={styles.streakText}>Đang cập nhật</Text>
          </View>
        </View>

        {/* Mascot Card */}
        <View style={styles.mascotCard}>
          <View style={styles.mascotHeader}>
            <Text style={styles.mascotTitle}>Bé Thóc</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{level}</Text>
            </View>
          </View>
          
          <View style={styles.mascotImageContainer} accessibilityLabel="Linh vật Bé Thóc">
            <View style={styles.mascotIconShell}>
              <Sprout size={64} color={colors.primaryContainer} strokeWidth={1.7} />
            </View>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Kinh nghiệm</Text>
              <Text style={styles.xpValue}>{xp} / {maxXp} XP</Text>
            </View>
            <View
              style={styles.progressBar}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Tiến độ kinh nghiệm"
              accessibilityValue={{ min: 0, max: maxXp, now: xp }}
            >
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => router.push('/(tabs)/diary')} activeOpacity={0.72} accessibilityRole="button">
            <View style={[styles.actionIconBg, { backgroundColor: colors.infoContainer }]}>
              <Droplets size={24} color={colors.info} />
            </View>
            <Text style={styles.actionText}>Ghi nhật ký</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => router.push('/scan')} activeOpacity={0.72} accessibilityRole="button">
            <View style={[styles.actionIconBg, { backgroundColor: colors.successContainer }]}>
              <Camera size={24} color={colors.success} />
            </View>
            <Text style={styles.actionText}>Quét sâu bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => router.push('/(tabs)/chat')} activeOpacity={0.72} accessibilityRole="button">
            <View style={[styles.actionIconBg, { backgroundColor: colors.warningContainer }]}>
              <MessageCircleQuestion size={24} color={colors.warning} />
            </View>
            <Text style={styles.actionText}>Hỏi AI</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, isCompact && styles.actionCardCompact]} onPress={() => router.push('/reminders')} activeOpacity={0.72} accessibilityRole="button">
            <View style={[styles.actionIconBg, { backgroundColor: colors.secondaryLight + '80' }]}> 
              <Bell size={24} color={colors.secondaryDark} />
            </View>
            <Text style={styles.actionText}>Nhắc nhở</Text>
          </TouchableOpacity>
        </View>

        <WeeklyInsightsSection />

        {/* Daily care tip */}
        <View style={[styles.weatherWidget, isCompact && styles.weatherWidgetCompact]}>
          <View style={styles.weatherLeft}>
            <Sprout size={32} color={colors.primary} />
            <View>
              <Text style={styles.tempText}>--°C</Text>
              <Text style={styles.weatherDesc}>Dữ liệu thời tiết sẽ được đồng bộ theo nông trại của bạn.</Text>
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetailItem}>
              <Text style={styles.weatherDetailText}>+ Nhật ký</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Text style={styles.weatherDetailText}>+ Nhắc nhở</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  scrollContent: {
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greetingBlock: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 4,
  },
  userName: {
    ...typography.h2,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.warning + '33',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.warning,
  },
  mascotCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 28,
  },
  mascotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mascotTitle: {
    ...typography.h3,
  },
  levelBadge: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.secondaryDark,
  },
  mascotImageContainer: {
    minHeight: 148,
    backgroundColor: colors.primaryLightest,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primaryLight + '66',
  },
  mascotIconShell: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  xpContainer: {
    gap: 8,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  xpValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.bgSurface1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flexGrow: 1,
    flexBasis: '29%',
    minWidth: 100,
    minHeight: 128,
    backgroundColor: colors.bgSurface,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardCompact: {
    flexBasis: '46%',
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    ...typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
  weatherWidget: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
  },
  weatherWidgetCompact: {
    alignItems: 'flex-start',
    gap: 16,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  tempText: {
    ...typography.h3,
    marginBottom: 2,
  },
  weatherDesc: {
    ...typography.caption,
    color: colors.textMuted,
    flexShrink: 1,
  },
  weatherDetails: {
    gap: 4,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  }
});
