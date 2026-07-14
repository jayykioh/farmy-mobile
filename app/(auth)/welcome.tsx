import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sprout } from 'lucide-react-native';

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
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Bắt đầu ngay</Text>
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
    color: colors.primaryDark,
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
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    ...typography.buttonText,
  }
});
