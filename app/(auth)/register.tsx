import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Mail, Lock, User } from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { useState } from 'react';
import { useAuthStore } from '../../src/store/authStore';
import { goBackOrReplace } from '../../src/utils/navigation';
import { getErrorMessage } from '../../src/utils/errors';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerUser } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    try {
      setLoading(true);
      await registerUser({ name, email, password, role: 'user' });
      const u = useAuthStore.getState().user;
      if (u && !u.onboardingCompleted) {
        router.replace('/(auth)/onboarding-1');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      Alert.alert('Lỗi đăng ký', getErrorMessage(error, 'Không thể đăng ký tài khoản.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <PageHeader title="Đăng ký" fallbackHref="/(auth)/welcome" />
      <View style={styles.content}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Tham gia cùng FarmDiaries ngay hôm nay</Text>
        
        <View style={styles.formContainer}>
          <Input 
            label="Họ và tên"
            placeholder="Nhập họ và tên" 
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
            icon={<User color={colors.textMuted} size={20} />}
          />
          <Input 
            label="Email"
            placeholder="Nhập địa chỉ email" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            icon={<Mail color={colors.textMuted} size={20} />}
          />
          <Input 
            label="Mật khẩu"
            placeholder="Tạo mật khẩu" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            icon={<Lock color={colors.textMuted} size={20} />}
          />
        </View>

        <Button 
          title={loading ? "Đang xử lý..." : "Đăng ký"}
          onPress={handleRegister}
          disabled={loading}
          style={{ marginBottom: 16 }}
        />
        
        <Button 
          title="Đã có tài khoản? Đăng nhập"
          variant="outline"
          disabled={loading}
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
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
    color: colors.textMuted,
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  }
});
