import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBackOrReplace } from '../../src/utils/navigation';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { api } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { ChevronLeft } from 'lucide-react-native';
import { getErrorMessage } from '../../src/utils/errors';

export default function OnboardingStep3() {
  const router = useRouter();
  const { user, setSession } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const farmName = await AsyncStorage.getItem('onboarding_farmName') || 'Vườn Nhà Bé Thóc';
      const selectedCrop = await AsyncStorage.getItem('onboarding_selectedCrop') || 'lua-nuoc';

      // 1. Gọi API cập nhật onboardingCompleted
      await api.patch('/users/me', {
        onboardingCompleted: true,
        farmName,
        primaryCrop: selectedCrop,
      });

      // 2. Clear local storage keys
      await AsyncStorage.removeItem('onboarding_farmName');
      await AsyncStorage.removeItem('onboarding_selectedCrop');

      // 3. Cập nhật state session trong authStore để đồng bộ
      const token = await AsyncStorage.getItem('access_token');
      if (user && token) {
        await setSession(
          { ...user, onboardingCompleted: true },
          token
        );
      }

      Alert.alert('Thành công', 'Chúc mừng bạn đã hoàn thành thiết lập nông trại!', [
        { text: 'Bắt đầu ngay', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error) {
      Alert.alert('Lỗi thiết lập', getErrorMessage(error, 'Không thể hoàn tất thiết lập nông trại.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => goBackOrReplace(router, '/(auth)/onboarding-2')} style={styles.backBtn}>
            <ChevronLeft size={20} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.brandText}>FarmDiaries</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        {/* Mascot Info Box */}
        <View style={styles.mascotCard}>
          <Text style={styles.mascotEmoji}>🔔</Text>
          <View style={styles.mascotInfo}>
            <Text style={styles.mascotBadge}>Cảnh báo tức thì</Text>
            <Text style={styles.mascotTitle}>Bật thông báo ứng dụng</Text>
            <Text style={styles.mascotDesc}>
              Nhận thông báo nhanh về sâu bệnh hại và gợi ý chăm sóc cây trồng tức thì từ Bé Thóc.
            </Text>
          </View>
        </View>

        {/* Action Panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Cho phép thông báo</Text>
          <Text style={styles.panelDesc}>
            Bật thông báo ứng dụng để nhận cập nhật tình trạng sức khỏe cây trồng và lịch nhắc việc mỗi ngày.
          </Text>

          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={styles.finishBtn} 
              onPress={handleFinish}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.finishBtnText}>Cho phép thông báo</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipBtn} 
              onPress={handleFinish}
              disabled={loading}
            >
              <Text style={styles.skipBtnText}>Để sau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderMain + '50',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: colors.textMain,
  },
  mascotCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
  },
  mascotEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  mascotInfo: {
    flex: 1,
  },
  mascotBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  mascotTitle: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  mascotDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  panel: {
    backgroundColor: colors.bgSurface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  panelTitle: {
    ...typography.h2,
    fontWeight: '900',
    textAlign: 'center',
    color: colors.textMain,
    marginBottom: 8,
  },
  panelDesc: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 20,
  },
  ctaContainer: {
    gap: 12,
  },
  finishBtn: {
    backgroundColor: colors.textMain,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  skipBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  }
});
