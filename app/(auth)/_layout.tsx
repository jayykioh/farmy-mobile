import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';

export default function AuthLayout() {
  const segments = useSegments();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const currentRoute = segments[segments.length - 1];
  const isOnboardingRoute = currentRoute?.startsWith('onboarding-') ?? false;

  if (isOnboardingRoute) {
    if (isLoading) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgMain }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!isAuthenticated || !user) {
      return <Redirect href="/(auth)/login" />;
    }

    if (user.role?.toLowerCase() === 'admin') {
      return <Redirect href="/admin" />;
    }

    if (user.onboardingCompleted) {
      return <Redirect href="/(tabs)/home" />;
    }
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding-1" />
      <Stack.Screen name="onboarding-2" />
      <Stack.Screen name="onboarding-3" />
    </Stack>
  );
}
