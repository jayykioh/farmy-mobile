import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { RefreshCcw, Info, Image as ImageIcon } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { Button } from '../src/components/Button';
import { useRouter } from 'expo-router';
import { api } from '../src/api/client';
import { CameraView, useCameraPermissions, type CameraCapturedPicture } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

type ScanState = 'viewfinder' | 'analyzing' | 'result';

type Diagnosis = {
  is_plant?: boolean;
  disease?: string;
  disease_name?: string;
  confidence?: number;
  symptoms?: string[];
  treatment?: {
    organic?: string;
    chemical?: string;
    phi_warning?: string;
  };
  safety_alert?: string;
};

type ImageUploadSource = {
  uri: string;
  name?: string | null;
  type?: string | null;
};

const getImageFileName = (source: ImageUploadSource) =>
  source.name || source.uri.split('/').pop()?.split('?')[0] || 'scan.jpg';

const getImageMimeType = (source: ImageUploadSource) => {
  if (source.type) return source.type;

  const extension = getImageFileName(source).split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'heic' || extension === 'heif') return `image/${extension}`;
  return 'image/jpeg';
};

const normalizeDiagnosis = (payload: unknown): Diagnosis | null => {
  if (!payload || typeof payload !== 'object') return null;

  const response = payload as { data?: unknown };
  const data = response.data as { diagnosis?: unknown } | undefined;
  const diagnosis = data && typeof data === 'object' && 'diagnosis' in data ? data.diagnosis : response.data;

  if (!diagnosis || typeof diagnosis !== 'object') return null;
  return diagnosis as Diagnosis;
};

export default function ScanScreen() {
  const [scanState, setScanState] = useState<ScanState>('viewfinder');
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const isProcessingRef = useRef(false);

  const resetToViewfinder = () => {
    setScanState('viewfinder');
    setIsCameraReady(false);
  };

  const processImage = async (source: ImageUploadSource) => {
    if (isProcessingRef.current) return;

    isProcessingRef.current = true;
    setScanState('analyzing');
    setScannedImage(source.uri);

    try {
      const formData = new FormData();
      const filename = getImageFileName(source);

      formData.append('image', {
        uri: source.uri,
        name: filename,
        type: getImageMimeType(source),
      } as unknown as Blob);

      const res = await api.post('/plant-scans', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const nextDiagnosis = normalizeDiagnosis(res.data);

      if (res.data?.success && nextDiagnosis) {
        setDiagnosis(nextDiagnosis);
        setScanState('result');
      } else {
        throw new Error('Không nhận được dữ liệu chẩn đoán.');
      }
    } catch (err) {
      console.error(err);
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = error.response?.data?.message || error.message || 'Hệ thống quét gặp sự cố.';
      Alert.alert('Lỗi chẩn đoán', errMsg, [
        { text: 'Quét lại', onPress: resetToViewfinder }
      ]);
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Máy ảnh chưa sẵn sàng', 'Vui lòng đợi camera khởi động xong rồi chụp lại.');
      return;
    }

    try {
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
        await processImage({ uri: photo.uri, type: `image/${photo.format || 'jpeg'}` });
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chụp ảnh.');
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để tải lên hình ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        await processImage({ uri: asset.uri, name: asset.fileName, type: asset.mimeType });
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện.');
    }
  };

  const handleRetake = () => {
    setDiagnosis(null);
    setScannedImage(null);
    resetToViewfinder();
  };

  const diseaseName = diagnosis?.disease_name || diagnosis?.disease || 'Cây khỏe mạnh (Không phát hiện bệnh)';
  const confidencePercent = typeof diagnosis?.confidence === 'number'
    ? Math.max(0, Math.min(100, Math.round(diagnosis.confidence * 100)))
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="PlantScan" />

      {scanState === 'viewfinder' && (
        <View style={styles.viewfinderContainer}>
          {!permission ? (
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : !permission.granted ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ textAlign: 'center', marginBottom: 20 }}>
                Chúng tôi cần quyền truy cập máy ảnh để quét bệnh cho cây.
              </Text>
              <Button title="Cấp quyền máy ảnh" onPress={requestPermission} />
            </View>
          ) : (
            <View style={styles.cameraBox}>
              <CameraView 
                style={styles.cameraPreview} 
                ref={cameraRef}
                facing="back"
                onCameraReady={() => setIsCameraReady(true)}
                onMountError={() => setIsCameraReady(false)}
              />
              <View style={styles.cameraFrame} />
              <View style={styles.captureOverlay}>
                <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage}>
                  <ImageIcon size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
                  <View style={styles.captureInner} />
                </TouchableOpacity>
                <View style={styles.galleryBtnPlaceholder} />
              </View>
            </View>
          )}
          {permission?.granted && (
            <Text style={styles.instructionText}>
              Giữ camera sát lá bị bệnh để AI chẩn đoán tốt nhất
            </Text>
          )}
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
              {diseaseName}
            </Text>
            
            {confidencePercent !== null && (
              <>
                <View style={styles.confidenceRow}>
                  <Text style={styles.confidenceLabel}>Độ chính xác AI</Text>
                  <Text style={styles.confidenceValue}>{confidencePercent}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${confidencePercent}%` }]} />
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
  cameraPreview: {
    ...StyleSheet.absoluteFill,
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryBtnPlaceholder: {
    width: 48,
    height: 48,
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
