import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { PageHeader } from '../../src/components/PageHeader';
import { Button } from '../../src/components/Button';
import { MapPin, Award, Medal, Droplets, ShieldAlert, User, Settings, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { usePetStatus } from '../../src/hooks/usePet';

export default function ProfileScreen() {
  const { logout, user } = useAuthStore();
  const { data: petStatus } = usePetStatus();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const level = petStatus?.level || 1;
  const xp = petStatus?.exp || 0;
  const maxXp = level * 100;
  const progress = Math.min((xp / maxXp) * 100, 100);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader title="Hồ sơ cá nhân" showBack={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsbCWDiuGTF5iEwK2O9pm1CMMzFdWx0hc4ellAPSIR0Fd0W04AaUk2McKFTBpkyt54F7qbz59AxRVm00X7l_paTxXsYAhKb0DJ2UtW18iwcftc8NpvHSUtky7QtZ3LYS_Jvnwzb_uyHj7Snd_GZJ5qRjx6kGvs2Y-yZafDMesEmvqIG9HZ3b06V39xa_0py0IGkepiBfpB_L-Nfe8YfQg-4VDdxhF78xd9seUk1RNYLfCuF3wEdwSvukiK2uu0wpN98-IjRJs9NRru' }} 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Nông dân Ẩn danh'}</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textMuted} />
              <Text style={styles.locationText}>Mekong Delta, Vietnam</Text>
            </View>
          </View>
          
          <View style={styles.badgeOverlay}>
            <Award size={14} color="#B45309" />
            <Text style={styles.badgeText}>Chuyên Gia</Text>
          </View>
        </View>

        {/* Level XP Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.levelTitle}>Cấp độ {level}</Text>
              <Text style={styles.levelSubtitle}>Chuyên Gia Trồng Trọt</Text>
            </View>
            <View style={styles.xpRight}>
              <Text style={styles.xpAmount}>{xp} XP</Text>
              <Text style={styles.xpTarget}>/ {maxXp} XP lên cấp {level + 1}</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Badge Shelf */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Badge Shelf</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Go to Shop →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
                <Medal size={28} color="#EAB308" />
              </View>
              <Text style={styles.badgeName}>First Harvest</Text>
            </View>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                <Droplets size={28} color="#3B82F6" />
              </View>
              <Text style={styles.badgeName}>Water Saver</Text>
            </View>
            <View style={styles.badgeCard}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <ShieldAlert size={28} color={colors.error} />
              </View>
              <Text style={styles.badgeName}>Pest Hunter</Text>
            </View>
          </ScrollView>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/profile/info')}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <User size={20} color={colors.textMain + 'B0'} />
                </View>
                <Text style={styles.settingText}>Thông tin cá nhân</Text>
              </View>
              <ChevronRight size={20} color={colors.borderMain} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <Settings size={20} color={colors.textMain + 'B0'} />
                </View>
                <Text style={styles.settingText}>App Settings</Text>
              </View>
              <ChevronRight size={20} color={colors.borderMain} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.settingItemLast]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconBg}>
                  <HelpCircle size={20} color={colors.textMain + 'B0'} />
                </View>
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color={colors.borderMain} />
            </TouchableOpacity>
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
    padding: 24,
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
  profileInfo: {
    flex: 1,
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
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF08A',
    gap: 4,
    transform: [{ rotate: '3deg' }],
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
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '30',
  },
  settingItemLast: {
    borderBottomWidth: 0,
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
  }
});
