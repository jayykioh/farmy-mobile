import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { logout, user } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ</Text>
        <Text style={styles.body}>{user?.name}</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
  },
  title: {
    ...typography.h2,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
  },
  content: {
    padding: 24,
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: colors.error + '20',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  logoutText: {
    ...typography.buttonText,
    color: colors.error,
  }
});
