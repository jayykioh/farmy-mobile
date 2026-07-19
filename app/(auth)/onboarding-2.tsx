import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { goBackOrReplace } from '../../src/utils/navigation';
import { useState } from 'react';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { api } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { ChevronLeft } from 'lucide-react-native';
import { getErrorMessage } from '../../src/utils/errors';

export default function OnboardingStep2() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isEmailTestLoading, setIsEmailTestLoading] = useState<boolean>(false);

  const hasEmail = !!user?.email;

  const handleNext = async () => {
    if (isConnected) {
      if (hasEmail) {
        try {
          setIsEmailTestLoading(true);
          await api.post('/auth/email-notification/test');
        } catch (error) {
          Alert.alert('Thông báo', `${getErrorMessage(error, 'Không thể gửi email kiểm tra.') } Bạn vẫn có thể tiếp tục thiết lập.`);
        } finally {
          setIsEmailTestLoading(false);
        }
      }
      router.push('/(auth)/onboarding-3');
    } else {
      setIsConnected(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => goBackOrReplace(router, '/(auth)/onboarding-1')} style={styles.backBtn}>
            <ChevronLeft size={20} color={colors.textMain} />
          </TouchableOpacity>
          <Text style={styles.brandText}>FarmDiaries</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>

        {/* Mascot Info Box */}
        <View style={styles.mascotCard}>
          <Text style={styles.mascotEmoji}>🌾</Text>
          <View style={styles.mascotInfo}>
            <Text style={styles.mascotBadge}>Cảnh báo thông minh</Text>
            <Text style={styles.mascotTitle}>Kết nối thông báo Email</Text>
            <Text style={styles.mascotDesc}>
              Nhận nhắc nhở tưới nước và bón phân trực tiếp qua Email để không bao giờ bỏ lỡ.
            </Text>
          </View>
        </View>

        {/* Action Panel */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Thông báo qua Email</Text>
          <Text style={styles.panelDesc}>
            Bé Thóc sẽ gửi email cho bạn khi đến lịch chăm sóc cây để tối ưu năng suất vụ mùa.
          </Text>

        {/* Notification setup card */}
          <TouchableOpacity 
            style={styles.connectCard}
            onPress={() => setIsConnected(!isConnected)}
            activeOpacity={0.8}
          >
            <View style={styles.connectLeft}>
              <View style={styles.emailIconBg}>
                <Text style={styles.emailIconText}>@</Text>
              </View>
              <View>
                <Text style={styles.connectTitle}>Nhận tin từ Bé Thóc</Text>
                <Text style={styles.connectSub}>{user?.email || 'Chưa có địa chỉ email'}</Text>
              </View>
            </View>
            <View style={[styles.toggleTrack, isConnected ? styles.toggleTrackActive : null]}>
              <View style={[styles.toggleThumb, isConnected ? styles.toggleThumbActive : null]} />
            </View>
          </TouchableOpacity>

          <View style={styles.ctaContainer}>
            <TouchableOpacity 
              style={[styles.nextBtn, isConnected ? styles.nextBtnActive : null]} 
              onPress={handleNext}
              disabled={isEmailTestLoading}
            >
              {isEmailTestLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.nextBtnText}>
                  {isConnected ? 'Tiếp theo' : 'Kết nối Email'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.skipBtn} 
              onPress={() => router.push('/(auth)/onboarding-3')}
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
  connectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgMain + '40',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    marginBottom: 24,
  },
  connectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  emailIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EA4335',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emailIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  connectTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMain,
  },
  connectSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.borderMain + '60',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  ctaContainer: {
    gap: 12,
  },
  nextBtn: {
    backgroundColor: colors.textMain,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnActive: {
    backgroundColor: colors.primary,
  },
  nextBtnText: {
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
