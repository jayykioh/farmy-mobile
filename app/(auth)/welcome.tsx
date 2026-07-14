import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout } from 'lucide-react-native';
import { Button } from '../../src/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Sprout color={colors.primary} size={80} />
        </View>
        <Text style={styles.title}>FarmDiaries</Text>
        <Text style={styles.subtitle}>Nền tảng Nông nghiệp Thông minh</Text>
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Đăng nhập" 
          onPress={() => router.push('/(auth)/login')} 
          style={{ marginBottom: 16 }}
        />
        <Button 
          title="Đăng ký tài khoản" 
          variant="outline"
          onPress={() => router.push('/(auth)/register')} 
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.h1,
    color: colors.textH,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    maxWidth: '80%',
  },
  footer: {
    padding: 24,
    paddingBottom: 48,
  }
});
