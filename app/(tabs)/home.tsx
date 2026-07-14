import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { usePetStatus } from '../../src/hooks/usePet';
import { CloudRain, Sun, Wind, Droplets, Camera, MessageCircleQuestion } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: petStatus, isLoading: petLoading, refetch: refetchPet } = usePetStatus();
  const router = useRouter();

  const level = petStatus?.level || 1;
  const xp = petStatus?.exp || 0;
  const maxXp = level * 100;
  const progress = Math.min((xp / maxXp) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={petLoading} onRefresh={refetchPet} />}
      >
        
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Chào buổi sáng,</Text>
            <Text style={styles.userName}>{user?.name || 'Nông dân'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 3 Ngày</Text>
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
          
          <View style={styles.mascotImageContainer}>
            <Text style={styles.mascotEmoji}>🌱</Text>
          </View>

          <View style={styles.xpContainer}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>Kinh nghiệm</Text>
              <Text style={styles.xpValue}>{xp} / {maxXp} XP</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Hành động nhanh</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/diary')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
              <Droplets size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>Ghi nhật ký</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/scan')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Camera size={24} color="#10B981" />
            </View>
            <Text style={styles.actionText}>Quét sâu bệnh</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/chat')}>
            <View style={[styles.actionIconBg, { backgroundColor: '#FFFBEB' }]}>
              <MessageCircleQuestion size={24} color="#F59E0B" />
            </View>
            <Text style={styles.actionText}>Hỏi AI</Text>
          </TouchableOpacity>
        </View>

        {/* Weather Mini Widget */}
        <View style={styles.weatherWidget}>
          <View style={styles.weatherLeft}>
            <Sun size={32} color="#F59E0B" fill="#FDE68A" />
            <View>
              <Text style={styles.tempText}>32°C</Text>
              <Text style={styles.weatherDesc}>Nắng nhẹ, phù hợp tưới tiêu</Text>
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <View style={styles.weatherDetailItem}>
              <CloudRain size={12} color={colors.textMuted} />
              <Text style={styles.weatherDetailText}>10%</Text>
            </View>
            <View style={styles.weatherDetailItem}>
              <Wind size={12} color={colors.textMuted} />
              <Text style={styles.weatherDetailText}>5km/h</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },
  mascotCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
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
    height: 160,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  mascotEmoji: {
    fontSize: 80,
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
    gap: 12,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.bgSurface,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  tempText: {
    ...typography.h3,
    marginBottom: 2,
  },
  weatherDesc: {
    ...typography.caption,
    color: colors.textMuted,
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
