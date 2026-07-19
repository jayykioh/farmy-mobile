import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import * as Linking from 'expo-linking';
import { api } from '../src/api/client';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { getAccessTokenFromUrl, getRefreshTokenFromUrl } from '../src/utils/oauth';

export default function RootLayout() {
  const { checkAuth, setSession } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Hứng link redirect khi đăng nhập Google thành công
    const handleDeepLink = async (event: { url: string }) => {
      const accessToken = getAccessTokenFromUrl(event.url);
      const refreshToken = getRefreshTokenFromUrl(event.url);

      if (accessToken) {
        try {
          // Lấy profile user
          const response = await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          if (response.data?.success && response.data?.data) {
            await setSession(response.data.data, accessToken, refreshToken || undefined);
            router.replace('/(tabs)/home');
          }
        } catch {
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Kiểm tra link ban đầu khi mở app từ trạng thái tắt hẳn
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, [checkAuth, router, setSession]);

  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="scan" options={{ animation: 'fade' }} />
        <Stack.Screen name="shop" options={{ animation: 'fade' }} />
        <Stack.Screen name="insights" options={{ animation: 'fade' }} />
        <Stack.Screen name="reminders" options={{ animation: 'fade' }} />
        <Stack.Screen name="diary/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="diary/create" options={{ animation: 'fade' }} />
        <Stack.Screen name="diary/new-cycle" options={{ animation: 'fade' }} />
        <Stack.Screen name="profile/info" options={{ animation: 'fade' }} />
      </Stack>
    </ErrorBoundary>
  );
}
