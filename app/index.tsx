import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/theme/colors';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (user && !user.onboardingCompleted) {
          router.replace('/(auth)/onboarding-1');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgMain }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
