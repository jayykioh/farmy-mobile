import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../src/components/PageHeader';
import { Button } from '../../src/components/Button';
import { MapPin, Award, Medal, Droplets, ShieldAlert, User, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { usePetStatus } from '../../src/hooks/usePet';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';

export default function ProfileScreen() {
  const { logout, user } = useAuthStore();
  const { data: petStatus, isLoading: isPetLoading, error: petError } = usePetStatus();
  const router = useRouter();
  const { gutter, contentMaxWidth, isCompact } = useResponsiveLayout();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const level = petStatus?.level || 1;
  const xp = petStatus?.exp || 0;
  const maxXp = level * 100;
  const progress = Math.min((xp / maxXp) * 100, 100);
  const displayName = user?.name || 'Nông dân Farmy';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'F';
  const roleLabel = user?.role?.toLowerCase() === 'admin' ? 'Quản trị viên' : 'Nông dân';

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Hồ sơ cá nhân" showBack={false} />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info */}
        <View style={styles.profileCard}>
          {user?.avatarUrl ? (
            <Image 
              source={{ uri: user.avatarUrl }} 
              style={styles.avatar}
              accessibilityLabel="Ảnh đại diện người dùng"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]} accessibilityLabel="Ảnh đại diện mặc định">
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.locationText}>{user?.location || 'Chưa thiết lập vị trí'}</Text>
            </View>
          </View>
          
          <View style={[styles.badgeOverlay, isCompact && styles.badgeOverlayCompact]}>
            <Award size={14} color="#B45309" />
            <Text style={styles.badgeText}>{roleLabel}</Text>
          </View>
        </View>

        {/* Level XP Card */}
        <View style={styles.xpCard}>
          {isPetLoading ? (
            <View style={styles.xpStateRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.xpStateText}>Đang tải cấp độ...</Text>
            </View>
          ) : petError ? (
            <Text style={styles.xpStateText}>Chưa thể tải XP. Kéo xuống hoặc mở lại hồ sơ để thử lại.</Text>
          ) : (
            <>
              <View style={[styles.xpHeader, isCompact && styles.xpHeaderCompact]}>
                <View>
                  <Text style={styles.levelTitle}>Cấp độ {level}</Text>
                  <Text style={styles.levelSubtitle}>Hành trình chăm cây</Text>
                </View>
                <View style={[styles.xpRight, isCompact && styles.xpRightCompact]}>
                  <Text style={styles.xpAmount}>{xp} XP</Text>
                  <Text style={styles.xpTarget}>/ {maxXp} XP lên cấp {level + 1}</Text>
                </View>
              </View>
              <View style={styles.progressBar} accessible accessibilityRole="progressbar" accessibilityLabel="Tiến độ cấp độ" accessibilityValue={{ min: 0, max: maxXp, now: xp }}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </>
          )}
        </View>

        {/* Badge Shelf */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Huy hiệu</Text>
            <TouchableOpacity onPress={() => router.push('/shop')} accessibilityRole="button" accessibilityLabel="Mở cửa hàng" activeOpacity={0.7}>
              <Text style={styles.sectionLink}>Mở cửa hàng →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Medal size={28} color="#EAB308" />
              </View>
              <Text style={styles.badgeName}>Vụ đầu tiên</Text>
            </View>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Droplets size={28} color="#3B82F6" />
              </View>
              <Text style={styles.badgeName}>Tưới nước đều</Text>
            </View>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <ShieldAlert size={28} color={colors.error} />
              </View>
              <Text style={styles.badgeName}>Săn sâu bệnh</Text>
            </View>
          </ScrollView>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/profile/info')}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <User size={20} color={colors.textMain + 'B0'} />
                </View>
                <Text style={styles.settingText}>Thông tin cá nhân</Text>
              </View>
              <ChevronRight size={20} color={colors.borderMain} />
            </TouchableOpacity>
            <View style={[styles.settingItem, styles.settingItemDisabled]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <Settings size={20} color={colors.textMain + 'B0'} />
                </View>
                <View>
                  <Text style={styles.settingText}>Cài đặt ứng dụng</Text>
                  <Text style={styles.settingHint}>Sắp ra mắt</Text>
                </View>
              </View>
            </View>
            <View style={[styles.settingItem, styles.settingItemLast, styles.settingItemDisabled]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <HelpCircle size={20} color={colors.textMain + 'B0'} />
                </View>
                <View>
                  <Text style={styles.settingText}>Trợ giúp & hỗ trợ</Text>
                  <Text style={styles.settingHint}>Sắp ra mắt</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <Button 
          title="Đăng xuất"
          variant="danger"
          onPress={handleLogout}
          icon={<LogOut size={20} color={colors.error} style={{ marginRight: 8 }} />}
          style={{ marginTop: 8 }}
        />

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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.bgSurface,
    backgroundColor: colors.bgSurface1,
    marginRight: 16,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLightest,
  },
  avatarInitial: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    minWidth: 150,
  },
  name: {
    ...typography.h3,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textMain + 'B0',
  },
  badgeOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF08A',
    gap: 4,
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  badgeOverlayCompact: {
    marginTop: 14,
    marginLeft: 96,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  xpCard: {
    backgroundColor: colors.bgSurface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  xpStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  xpStateText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + 'B0',
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  xpHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  levelTitle: {
    ...typography.h3,
  },
  levelSubtitle: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  xpRight: {
    alignItems: 'flex-end',
  },
  xpRightCompact: {
    alignItems: 'flex-start',
  },
  xpAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'Courier',
  },
  xpTarget: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.bgSurface1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.h3,
  },
  sectionLink: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary,
  },
  badgeScroll: {
    gap: 16,
    paddingBottom: 8,
  },
  badgeCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    width: 120,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  settingsList: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '30',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemDisabled: {
    opacity: 0.72,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSurface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    ...typography.body,
    fontWeight: '700',
  },
  settingHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  }
});
