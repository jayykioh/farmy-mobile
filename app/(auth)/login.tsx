import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Mail, Lock } from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';

// Đăng ký WebBrowser
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }
    try {
      setLoading(true);
      await login({ email, password });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Lỗi đăng nhập', error.response?.data?.message || 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // Mở trình duyệt đến cổng Auth Google của NestJS backend dựa trên biến môi trường và truyền state=mobile
      const authUrl = `${api.defaults.baseURL}/auth/google?state=mobile`;
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể mở trình duyệt đăng nhập Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <PageHeader title="Đăng nhập" />
      <View style={styles.content}>
        <Text style={styles.title}>Chào mừng trở lại!</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục quản lý nông trại của bạn</Text>
        
        <View style={styles.formContainer}>
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
            placeholder="Nhập mật khẩu" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            icon={<Lock color={colors.textMuted} size={20} />}
          />
        </View>

        <Button 
          title={loading ? "Đang xử lý..." : "Đăng nhập"}
          onPress={handleLogin}
          disabled={loading}
          style={{ marginBottom: 12 }}
        />

        <TouchableOpacity 
          style={[styles.googleBtn, loading ? styles.googleBtnDisabled : null]} 
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔴</Text>
          <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
        </TouchableOpacity>
        
        <View style={{ height: 16 }} />
        
        <Button 
          title="Quay lại"
          variant="outline"
          disabled={loading}
          onPress={() => router.back()}
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
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 24,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#333',
  }
});
