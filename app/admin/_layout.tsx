import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../../src/theme/colors';

export default function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgMain }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role?.toLowerCase() !== 'admin') {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="rag" />
      <Stack.Screen name="scans" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="skins" />
      <Stack.Screen name="password" />
    </Stack>
  );
}
