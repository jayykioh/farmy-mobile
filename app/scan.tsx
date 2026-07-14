import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Camera, RefreshCcw, Info } from 'lucide-react-native';
import { useState } from 'react';
import { Button } from '../src/components/Button';
import { useRouter } from 'expo-router';
import { api } from '../src/api/client';

type ScanState = 'viewfinder' | 'analyzing' | 'result';

export default function ScanScreen() {
  const [scanState, setScanState] = useState<ScanState>('viewfinder');
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const router = useRouter();

  const handleCapture = async () => {
    setScanState('analyzing');
    
    // Sử dụng ảnh lá cây thật từ Unsplash để Gemini phân tích chính xác
    const leafImageUrl = 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=400&auto=format&fit=crop';
    setScannedImage(leafImageUrl);

    try {
      // 1. Tải ảnh về dưới dạng Blob
      const response = await fetch(leafImageUrl);
      const blob = await response.blob();

      // 2. Tạo FormData
      const formData = new FormData();
      formData.append('crop_type', 'Lúa');
      // React Native FormData yêu cầu object đặc biệt cho file
      formData.append('image', {
        uri: leafImageUrl,
        type: 'image/jpeg',
        name: 'plant-leaf.jpg',
      } as any);

      // 3. Gọi API quét sâu bệnh
      const res = await api.post('/plant-scans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success && res.data.data) {
        setDiagnosis(res.data.data.diagnosis);
        setScanState('result');
      } else {
        throw new Error('Không nhận được dữ liệu chẩn đoán.');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Hệ thống quét gặp sự cố.';
      Alert.alert('Lỗi chẩn đoán', errMsg, [
        { text: 'Chụp lại', onPress: () => setScanState('viewfinder') }
      ]);
    }
  };

  const handleRetake = () => {
    setDiagnosis(null);
    setScannedImage(null);
    setScanState('viewfinder');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader title="PlantScan" />

      {scanState === 'viewfinder' && (
        <View style={styles.viewfinderContainer}>
          <View style={styles.cameraBox}>
            <View style={styles.cameraFrame} />
            <View style={styles.captureOverlay}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.instructionText}>
            Giữ camera sát lá bị bệnh để AI chẩn đoán tốt nhất
          </Text>
        </View>
      )}

      {scanState === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          <View style={styles.spinner}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.analyzingTitle}>Đang phân tích...</Text>
          <Text style={styles.analyzingSubtitle}>
            Bé Thóc đang xem xét lá cây bằng Gemini AI, vui lòng đợi một chút nhé!
          </Text>
        </View>
      )}

      {scanState === 'result' && diagnosis && (
        <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          {/* Result Image Preview */}
          <View style={styles.previewImageContainer}>
            {scannedImage && (
              <Image 
                source={{ uri: scannedImage }} 
                style={styles.previewImage} 
              />
            )}
          </View>

          {/* Dialogue */}
          <View style={styles.dialogueRow}>
            <View style={styles.mascotAvatar}>
              <Text style={{ fontSize: 24 }}>🌱</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                {diagnosis.is_plant 
                  ? 'Bé Thóc đã chẩn đoán xong bệnh cho cây rồi đây!' 
                  : 'Hình ảnh này có vẻ không phải là lá cây nông nghiệp.'}
              </Text>
            </View>
          </View>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>PHÂN TÍCH THÀNH CÔNG</Text>
            </View>
            
            <Text style={styles.diseaseName}>
              {diagnosis.disease || 'Cây khỏe mạnh (Không phát hiện bệnh)'}
            </Text>
            
            {diagnosis.confidence !== undefined && (
              <>
                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>Độ chính xác AI</Text>
                  <Text style={styles.confidenceValue}>{Math.round(diagnosis.confidence * 100)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${diagnosis.confidence * 100}%` }]} />
                </View>
              </>
            )}

            {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
              <View style={styles.symptomsBox}>
                <Text style={styles.sectionTitle}>Triệu chứng phát hiện:</Text>
                {diagnosis.symptoms.map((symptom: string, index: number) => (
                  <Text key={index} style={styles.symptomItem}>• {symptom}</Text>
                ))}
              </View>
            )}

            {diagnosis.treatment && (
              <View style={styles.treatmentBox}>
                <Text style={styles.sectionTitle}>Giải pháp điều trị:</Text>
                <Text style={styles.treatmentTitle}>Hữu cơ / Sinh học:</Text>
                <Text style={styles.treatmentDesc}>{diagnosis.treatment.organic}</Text>
                
                <Text style={[styles.treatmentTitle, { marginTop: 8 }]}>Hóa học (Nếu bệnh nặng):</Text>
                <Text style={styles.treatmentDesc}>{diagnosis.treatment.chemical}</Text>

                {diagnosis.treatment.phi_warning && (
                  <View style={[styles.warningBox, { marginTop: 12 }]}>
                    <Info size={16} color="#9A3412" />
                    <Text style={styles.warningText}>
                      ⚠️ Khuyến cáo cách ly (PHI): {diagnosis.treatment.phi_warning}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {diagnosis.safety_alert && (
              <View style={[styles.warningBox, { marginTop: 16 }]}>
                <Info size={16} color="#9A3412" />
                <Text style={styles.warningText}>{diagnosis.safety_alert}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <Button 
              title="Quay lại Nhật ký" 
              onPress={() => router.push('/(tabs)/diary')} 
              style={{ marginBottom: 12 }}
            />
            <Button 
              title="Hỏi ý kiến Bé Thóc AI" 
              variant="outline" 
              onPress={() => router.push('/(tabs)/chat')}
            />
            
            <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
              <RefreshCcw size={16} color={colors.textMain + '80'} />
              <Text style={styles.retakeText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSurface1,
  },
  viewfinderContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBox: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#000',
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.borderMain + '50',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 24,
  },
  cameraFrame: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    margin: 20,
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  captureOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  instructionText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain + '80',
    textAlign: 'center',
  },
  analyzingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary + '30',
    borderTopColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  analyzingTitle: {
    ...typography.h2,
    marginBottom: 12,
  },
  analyzingSubtitle: {
    ...typography.body,
    color: colors.textMain + '80',
    textAlign: 'center',
  },
  resultContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  previewImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    marginBottom: -40, // overlap
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  dialogueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    zIndex: 10,
    marginBottom: 16,
  },
  mascotAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bubble: {
    backgroundColor: colors.bgSurface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    maxWidth: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  statusPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryLight + '50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.secondaryDark,
  },
  diseaseName: {
    ...typography.h2,
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  confidenceLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + '80',
  },
  confidenceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBar: {
    height: 16,
    backgroundColor: colors.bgSurface1,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  symptomsBox: {
    marginBottom: 24,
  },
  treatmentBox: {
    marginBottom: 16,
  },
  treatmentTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  treatmentDesc: {
    ...typography.bodySmall,
    color: colors.textMain,
    marginTop: 2,
  },
  sectionTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.textMain + '80',
    marginBottom: 8,
  },
  symptomItem: {
    ...typography.bodySmall,
    color: colors.textMain,
    marginBottom: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#9A3412',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 8,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  retakeText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain + '80',
  }
});
