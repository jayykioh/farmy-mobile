import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { PageHeader } from '../../src/components/PageHeader';
import { Mail, Shield, User, Landmark, Calendar } from 'lucide-react-native';

export default function ProfileInfoScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  // Nhãn hiển thị cho vai trò
  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Quản trị viên';
      case 'user': return 'Nông dân';
      default: return role || 'Nông dân';
    }
  };

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
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsbCWDiuGTF5iEwK2O9pm1CMMzFdWx0hc4ellAPSIR0Fd0W04AaUk2McKFTBpkyt54F7qbz59AxRVm00X7l_paTxXsYAhKb0DJ2UtW18iwcftc8NpvHSUtky7QtZ3LYS_Jvnwzb_uyHj7Snd_GZJ5qRjx6kGvs2Y-yZafDMesEmvqIG9HZ3b06V39xa_0py0IGkepiBfpB_L-Nfe8YfQg-4VDdxhF78xd9seUk1RNYLfCuF3wEdwSvukiK2uu0wpN98-IjRJs9NRru' }} 
            style={styles.avatar}
          />
          <Text style={styles.avatarName}>{user?.name || 'Nông dân'}</Text>
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
