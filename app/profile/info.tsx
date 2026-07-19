import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { PageHeader } from '../../src/components/PageHeader';
import { Mail, Shield, User, Landmark, Calendar } from 'lucide-react-native';

export default function ProfileInfoScreen() {
  const { user, isLoading } = useAuthStore();

  // Nhãn hiển thị cho vai trò
  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'user': return 'Nông dân';
      case 'farmer': return 'Nông dân';
      default: return role || 'Nông dân';
    }
  };

  const displayName = user?.name || 'Nông dân Farmy';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'F';

  const infoItems = [
    {
      icon: <User size={22} color={colors.primary} />,
      label: 'Họ và tên',
      value: user?.name || 'Chưa thiết lập',
    },
    {
      icon: <Mail size={22} color={colors.primary} />,
      label: 'Địa chỉ Email',
      value: user?.email || 'Chưa thiết lập',
    },
    {
      icon: <Shield size={22} color={colors.primary} />,
      label: 'Vai trò tài khoản',
      value: getRoleLabel(user?.role),
    },
    {
      icon: <Landmark size={22} color={colors.primary} />,
      label: 'Mã nông trại (Farm ID)',
      value: user?.farmId || 'Chưa liên kết',
    },
    {
      icon: <Calendar size={22} color={colors.primary} />,
      label: 'ID người dùng',
      value: user?.id || 'Không khả dụng',
      isId: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Thông tin cá nhân" showBack={true} fallbackHref="/(tabs)/profile" />
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerStateText}>Đang tải hồ sơ...</Text>
        </View>
      ) : !user ? (
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>Bạn cần đăng nhập để xem thông tin cá nhân.</Text>
        </View>
      ) : (
      
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{avatarInitial}</Text>
            </View>
          )}
          <Text style={styles.avatarName}>{displayName}</Text>
          <Text style={styles.avatarSub}>{getRoleLabel(user?.role)} • Farmy</Text>
        </View>

        {/* Info Card List */}
        <View style={styles.infoCard}>
          {infoItems.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.infoRow, 
                index === infoItems.length - 1 ? styles.infoRowLast : null
              ]}
            >
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.label}>{item.label}</Text>
                <Text 
                  style={[styles.value, item.isId ? styles.idText : null]} 
                  numberOfLines={1} 
                  ellipsizeMode="middle"
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        </ScrollView>
      )}
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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  centerStateText: {
    ...typography.body,
    color: colors.textMain + 'B0',
    textAlign: 'center',
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: colors.bgSurface,
    backgroundColor: colors.bgSurface1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryLightest,
  },
  avatarInitial: {
    ...typography.h1,
    color: colors.primary,
    fontWeight: '800',
  },
  avatarName: {
    ...typography.h2,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  avatarSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  },
  idText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: colors.textMuted,
  }
});
