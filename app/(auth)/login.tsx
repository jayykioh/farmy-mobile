import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Mail, Lock, Sparkles, Leaf, ArrowRight } from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { goBackOrReplace } from '../../src/utils/navigation';
import { getErrorMessage } from '../../src/utils/errors';
import { getAccessTokenFromUrl, getRefreshTokenFromUrl } from '../../src/utils/oauth';

// Đăng ký WebBrowser
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login, setSession } = useAuthStore();
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
      const u = useAuthStore.getState().user;
      if (u && !u.onboardingCompleted) {
        router.replace('/(auth)/onboarding-1');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      let errorMessage = getErrorMessage(error, 'Không thể đăng nhập. Vui lòng kiểm tra lại thông tin.');
      if (errorMessage.includes('Network Error')) {
        errorMessage = `${errorMessage} (Base URL: ${api.defaults.baseURL || 'Chưa thiết lập'})`;
      }
      Alert.alert('Lỗi đăng nhập', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    let authSessionResult;
    try {
      setLoading(true);
      // Tạo link callback động (exp://... nếu chạy qua Expo Go, farmy://... nếu chạy standalone)
      const redirectUrl = Linking.createURL('oauth-callback');
      const query = new URLSearchParams({
        state: redirectUrl,
        redirect_uri: redirectUrl,
        returnTo: redirectUrl,
      });
      const authUrl = `${api.defaults.baseURL}/auth/google?${query.toString()}`;
      
      // Sử dụng openAuthSessionAsync để trình duyệt tự động đóng lại khi nhận link redirect
      authSessionResult = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
    } catch (error) {
      let errorMessage = getErrorMessage(error, 'Không thể mở trình duyệt đăng nhập Google. Vui lòng kiểm tra lại.');
      if (errorMessage.includes('Network Error')) {
        errorMessage = `${errorMessage} (Base URL: ${api.defaults.baseURL || 'Chưa thiết lập'})`;
      }
      Alert.alert('Lỗi kết nối', errorMessage);
      setLoading(false);
      return;
    }

    try {
      if (authSessionResult.type === 'success' && authSessionResult.url) {
        const token = getAccessTokenFromUrl(authSessionResult.url);
        const refreshToken = getRefreshTokenFromUrl(authSessionResult.url);
        if (token) {
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const rawUser = response.data.data?.user ?? response.data.data;
          
          await setSession(rawUser, token, refreshToken || undefined);
          if (rawUser && !rawUser.onboardingCompleted) {
            router.replace('/(auth)/onboarding-1');
          } else {
            router.replace('/(tabs)/home');
          }
        } else {
          Alert.alert('Lỗi xác thực', 'Không tìm thấy access token trong phản hồi xác thực.');
        }
      } else if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
        Alert.alert('Đăng nhập bị hủy', 'Bạn đã hủy luồng đăng nhập Google.');
      }
    } catch (error) {
      let errorMessage = getErrorMessage(error, 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.');
      if (errorMessage.includes('Network Error')) {
        errorMessage = `${errorMessage} (Base URL: ${api.defaults.baseURL || 'Chưa thiết lập'})`;
      }
      Alert.alert('Lỗi kết nối', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.bgOrbTop} />
      <View style={styles.bgOrbBottom} />
      <PageHeader title="Đăng nhập" fallbackHref="/(auth)/welcome" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color={colors.primaryContainer} />
              <Text style={styles.heroBadgeText}>Secure access</Text>
            </View>
            <Text style={styles.title}>Chào mừng trở lại.</Text>
            <Text style={styles.subtitle}>
              Đăng nhập để tiếp tục theo dõi cây trồng, diary và nhịp vận hành trong một nơi duy nhất.
            </Text>

            <View style={styles.signalRow}>
              <View style={styles.signalPill}>
                <Leaf size={14} color={colors.primaryContainer} />
                <Text style={styles.signalText}>Theo dõi nhanh</Text>
              </View>
              <View style={styles.signalPill}>
                <ArrowRight size={14} color={colors.primaryContainer} />
                <Text style={styles.signalText}>Vào thẳng dashboard</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
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
              title={loading ? 'Đang xử lý...' : 'Đăng nhập'}
              onPress={handleLogin}
              disabled={loading}
              style={styles.primaryButton}
            />

            <TouchableOpacity
              style={[styles.googleBtn, loading ? styles.googleBtnDisabled : null]}
              onPress={handleGoogleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Quay lại"
            variant="outline"
            disabled={loading}
            onPress={() => goBackOrReplace(router, '/(auth)/welcome')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
    position: 'relative',
  },
  bgOrbTop: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: colors.primaryLight + '28',
  },
  bgOrbBottom: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.secondaryLight + '24',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 16,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(188,202,187,0.45)',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bgSurface1,
    marginBottom: 16,
  },
  heroBadgeText: {
    ...typography.caption,
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  signalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain,
  },
  signalText: {
    ...typography.caption,
    color: colors.textMain,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(188,202,187,0.55)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  formContainer: {
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain,
    borderRadius: 22,
    paddingVertical: 14,
  },
  googleBtnDisabled: {
    opacity: 0.6,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryContainer,
    color: colors.bgSurface,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 8,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 12,
  },
  googleBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  }
});
