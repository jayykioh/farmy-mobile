import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { setSession } = useAuthStore();

  const handleLogin = () => {
    // Mock login for now
    setSession({
      id: '1',
      email: 'nongdan@farmy.com',
      name: 'Nông dân',
      role: 'farmer'
    }, 'mock_token');
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại với FarmDiaries</Text>
        
        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Mật khẩu" 
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    marginBottom: 32,
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    ...typography.body,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    ...typography.buttonText,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.buttonText,
    color: colors.primary,
  }
});
