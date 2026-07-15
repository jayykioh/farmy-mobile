import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import * as Linking from 'expo-linking';
import { api } from '../src/api/client';

export default function RootLayout() {
  const { checkAuth, setSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Hứng link redirect khi đăng nhập Google thành công
    const handleDeepLink = async (event: { url: string }) => {
      const parsed = Linking.parse(event.url);
      const accessToken = parsed.queryParams?.accessToken as string;

      if (accessToken) {
        try {
          // Lấy profile user
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          if (response.data?.success && response.data?.data) {
            await setSession(response.data.data, accessToken);
            router.replace('/(tabs)/home');
          }
        } catch (error) {
          console.error('Lỗi xử lý Deep Link đăng nhập Google:', error);
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Kiểm tra link ban đầu khi mở app từ trạng thái tắt hẳn
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
    </Stack>
  );
}
