import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Wheat, Apple, Coffee, Leaf, Sprout } from 'lucide-react-native';

export default function OnboardingStep1() {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<string>('lua-nuoc');
  const [farmName, setFarmName] = useState<string>('');

  const crops = [
    { id: 'lua-nuoc', label: 'Lúa nước', icon: Wheat },
    { id: 'cay-an-trai', label: 'Cây ăn trái', icon: Apple },
    { id: 'ca-phe', label: 'Cà phê', icon: Coffee },
    { id: 'rau-mau', label: 'Rau màu', icon: Leaf },
    { id: 'khac', label: 'Khác', icon: Sprout },
  ];

  const handleNext = async () => {
    try {
      await AsyncStorage.setItem('onboarding_farmName', farmName || 'Vườn Nhà Bé Thóc');
      await AsyncStorage.setItem('onboarding_selectedCrop', selectedCrop);
      router.push('/(auth)/onboarding-2');
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin cấu hình.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header branding */}
          <View style={styles.header}>
            <Text style={styles.brandText}>FarmDiaries</Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>

          {/* Mascot Info Box */}
          <View style={styles.mascotCard}>
            <Text style={styles.mascotEmoji}>🌱</Text>
            <View style={styles.mascotInfo}>
              <Text style={styles.mascotBadge}>Thiết lập lần đầu</Text>
              <Text style={styles.mascotTitle}>Tạo không gian chăm vườn</Text>
              <Text style={styles.mascotDesc}>
                Bé Thóc sẽ dùng thông tin này để cá nhân hóa nhật ký, nhắc việc và gợi ý chăm sóc cây trồng hằng ngày.
              </Text>
            </View>
          </View>

          {/* Setup Panel */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Thiết lập nông trại</Text>
            <Text style={styles.panelDesc}>
              Hãy đặt tên cho mảnh vườn yêu thương để Bé Thóc cá nhân hóa trải nghiệm chăm sóc.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên nông trại của bạn</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="Ví dụ: Vườn Nhà Bé Thóc"
                placeholderTextColor={colors.textMain + '50'}
                value={farmName}
                onChangeText={setFarmName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại cây trồng chính</Text>
              <View style={styles.chipsContainer}>
                {crops.map((crop) => {
                  const Icon = crop.icon;
                  const isSelected = selectedCrop === crop.id;
                  return (
                    <TouchableOpacity
                      key={crop.id}
                      style={[styles.chip, isSelected ? styles.chipActive : null]}
                      onPress={() => setSelectedCrop(crop.id)}
                    >
                      <Icon size={16} color={isSelected ? '#fff' : colors.textMain + 'B0'} style={styles.chipIcon} />
                      <Text style={[styles.chipText, isSelected ? styles.chipTextActive : null]}>
                        {crop.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.textMain + 'B0',
    marginBottom: 8,
  },
  textInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    backgroundColor: colors.bgMain + '40',
    color: colors.textMain,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgMain + '60',
  },
  chipActive: {
    backgroundColor: colors.textMain,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain + 'C0',
  },
  chipTextActive: {
    color: '#fff',
  },
  nextBtn: {
    backgroundColor: colors.textMain,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  }
});
