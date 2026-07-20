import { useRef, useState, type ComponentRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { RefreshCcw, Info } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { api } from '../src/api/client';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Button } from '../src/components/Button';
import { getErrorMessage } from '../src/utils/errors';

type ScanState = 'viewfinder' | 'analyzing' | 'result';
type CameraFacing = 'back' | 'front';

type PlantScanErrorCode =
  | 'SCAN_INVALID_FILE'
  | 'SCAN_INVALID_INPUT'
  | 'SCAN_IMAGE_BLURRY'
  | 'SCAN_QUOTA_EXCEEDED'
  | 'AI_SCAN_QUOTA_BUSY'
  | 'NOT_A_PLANT_IMAGE'
  | 'PLANT_SCAN_PERSISTENCE_FAILED'
  | 'SCAN_NOT_FOUND'
  | 'INVALID_IMAGE_TYPE'
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'LLM_ERROR'
  | 'UNKNOWN';

const CROP_OPTIONS = ['Lúa', 'Bưởi', 'Cà phê'];

interface PlantDiagnosis {
  is_plant?: boolean;
  disease?: string;
  disease_name?: string;
  confidence?: number;
  symptoms?: string[];
  treatment?: {
    organic?: string;
    chemical?: string;
    phi_warning?: string;
    safety_alert?: string;
  };
  low_confidence_warning?: string;
  disclaimer?: string;
  safety_alert?: string;
}

interface PlantScanResult {
  scan_id?: string;
  status?: 'completed' | 'cached';
  crop_type?: string;
  diagnosis?: PlantDiagnosis;
  image_url?: string;
  thumbnail_url?: string;
  cache_hit_from_scan_id?: string | null;
}

const normalizeScanResult = (data: any): PlantScanResult | null => {
  const raw = data?.data ?? data;
  if (!raw) return null;
  if (raw.diagnosis || raw.scan_id || raw.image_url || raw.thumbnail_url) return raw as PlantScanResult;
  return { diagnosis: raw as PlantDiagnosis };
};

const extractPlantScanErrorCode = (error: unknown): PlantScanErrorCode => {
  const response = (error as { response?: { status?: number; data?: { errorCode?: string; error_code?: string } } })?.response;
  const errorCode = response?.data?.errorCode ?? response?.data?.error_code;
  if (errorCode) return errorCode as PlantScanErrorCode;
  if (response?.status === 429) return 'SCAN_QUOTA_EXCEEDED';
  if (response?.status === 422) return 'NOT_A_PLANT_IMAGE';
  return 'UNKNOWN';
};

const getPlantScanErrorMessage = (error: unknown) => {
  switch (extractPlantScanErrorCode(error)) {
    case 'SCAN_IMAGE_BLURRY':
      return 'Ảnh quá mờ. Hãy giữ chắc tay, đưa lá vào khung rồi chụp lại.';
    case 'NOT_A_PLANT_IMAGE':
      return 'Ảnh chưa thấy cây trồng. Hãy chụp sát lá/cành bị bệnh, không chụp người hoặc cảnh phòng.';
    case 'SCAN_QUOTA_EXCEEDED':
      return 'Bạn đã hết lượt quét hôm nay. Hãy thử lại vào ngày mai.';
    case 'AI_SCAN_QUOTA_BUSY':
      return 'Hệ thống AI đang quá tải. Vui lòng đợi vài phút rồi thử lại.';
    case 'PLANT_SCAN_PERSISTENCE_FAILED':
      return 'Lỗi lưu trữ dữ liệu. Vui lòng thử lại.';
    case 'SCAN_INVALID_FILE':
    case 'INVALID_IMAGE_TYPE':
      return 'Vui lòng tải lên file ảnh hợp lệ (JPG, PNG, WebP) dưới 5MB.';
    case 'INVALID_JSON':
    case 'INVALID_SCHEMA':
      return 'Bé Thóc chưa đọc được ảnh này. Hãy thử một ảnh rõ hơn nhé.';
    case 'SCAN_INVALID_INPUT':
      return 'Vui lòng chọn loại cây trồng trước khi quét.';
    default:
      return getErrorMessage(error, 'Có lỗi xảy ra trong quá trình quét. Vui lòng thử lại.');
  }
};

const toFormData = async (uri: string, name: string, type: string, cropType: string) => {
  const formData = new FormData();

  if (uri.startsWith('data:')) {
    const blob = await fetch(uri).then((response) => response.blob());
    formData.append('image', blob, name);
  } else {
    formData.append('image', { uri, type, name } as unknown as Blob);
  }

  formData.append('crop_type', cropType);
  return formData;
};

export default function ScanScreen() {
  const [scanState, setScanState] = useState<ScanState>('viewfinder');
  const [scanResult, setScanResult] = useState<PlantScanResult | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(CROP_OPTIONS[0]);
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<ComponentRef<typeof CameraView> | null>(null);
  const router = useRouter();

  const submitScan = async (uri: string, name: string, type?: string) => {
    setScannedImage(uri);
    setScanState('analyzing');

    const formData = await toFormData(uri, name, type || 'image/jpeg', selectedCrop);
    const res = await api.post('/plant-scans', formData, {
      timeout: 60000,
    });

    const nextScanResult = normalizeScanResult(res.data);
    if (!res.data?.success || !nextScanResult) {
      throw new Error('Không nhận được dữ liệu chẩn đoán.');
    }

    setScanResult(nextScanResult);
    setScannedImage(nextScanResult.image_url || nextScanResult.thumbnail_url || uri);
    setScanState('result');
  };

  const handleCapture = async () => {
    if (isProcessing) return;
    if (!cameraRef.current || !isCameraReady) {
      Alert.alert('Máy ảnh chưa sẵn sàng', 'Vui lòng đợi camera khởi động xong rồi chụp lại.');
      return;
    }

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) {
        throw new Error('Không thể chụp ảnh.');
      }

      await submitScan(photo.uri, 'plant-scan.jpg', photo.format ? `image/${photo.format}` : 'image/jpeg');
    } catch (err) {
      setScanState('viewfinder');
      Alert.alert('Lỗi chẩn đoán', getPlantScanErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickImage = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
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
        await submitScan(asset.uri, asset.fileName || 'plant-scan.jpg', asset.mimeType || 'image/jpeg');
      }
    } catch (err) {
      Alert.alert('Lỗi', getPlantScanErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setScanResult(null);
    setScannedImage(null);
    setScanState('viewfinder');
  };

  const toggleCamera = () => {
    setIsCameraReady(false);
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const diagnosis = scanResult?.diagnosis;
  const confidence = diagnosis?.confidence ?? 0;
  const isScanUncertain = !diagnosis || confidence < 0.5 || Boolean(diagnosis.low_confidence_warning);
  const diseaseName = !diagnosis
    ? 'Kết quả chưa sẵn sàng'
    : diagnosis.is_plant === false
      ? 'Ảnh không phải cây trồng'
      : diagnosis.disease_name && !isScanUncertain
        ? diagnosis.disease_name
        : diagnosis.disease || 'Cần kiểm tra thêm';
  const mascotMessage = !diagnosis
    ? 'Bé Thóc đang xem xét lá cây.'
    : diagnosis.is_plant === false
      ? 'Đây có vẻ chưa phải cây trồng.'
      : isScanUncertain
        ? 'Ảnh này chưa đủ chắc chắn, cần kiểm tra thêm.'
        : 'Mình đã thấy dấu hiệu rõ hơn rồi.';
  const confidencePercent = typeof diagnosis?.confidence === 'number'
    ? Math.max(0, Math.min(100, Math.round(diagnosis.confidence * 100)))
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="PlantScan" />

      {scanState === 'viewfinder' && (
        <View style={styles.viewfinderContainer}>
          {!permission ? (
            <View style={styles.permissionState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionState}>
              <Text style={styles.permissionText}>Farmy cần quyền camera để chụp ảnh lá cây và phân tích bằng AI.</Text>
              <View style={{ gap: 12, width: '100%', paddingHorizontal: 20, alignItems: 'center' }}>
                <Button title="Cấp quyền máy ảnh" onPress={requestPermission} />
                <Button title="Chọn ảnh từ thư viện" variant="outline" onPress={handlePickImage} disabled={isProcessing} />
              </View>
            </View>
          ) : (
            <View style={styles.cameraBox}>
              <CameraView
                ref={cameraRef}
                style={styles.cameraPreview}
                facing={cameraFacing}
                onCameraReady={() => setIsCameraReady(true)}
                onMountError={() => setIsCameraReady(false)}
              />
              <View style={styles.topOverlay}>
                <View style={styles.cropSelector}>
                  {CROP_OPTIONS.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[styles.cropChip, selectedCrop === crop && styles.cropChipActive]}
                      onPress={() => setSelectedCrop(crop)}
                      disabled={isProcessing}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedCrop === crop }}
                    >
                      <Text style={[styles.cropChipText, selectedCrop === crop && styles.cropChipTextActive]}>{crop}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.flipBtn} onPress={toggleCamera} disabled={isProcessing} accessibilityRole="button">
                  <RefreshCcw size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.cameraFrame} />
              <View style={styles.captureOverlay}>
                <TouchableOpacity style={[styles.galleryBtn, isProcessing && styles.disabledAction]} onPress={handlePickImage} disabled={isProcessing} accessibilityRole="button">
                  <Text style={styles.galleryBtnText}>Ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.captureBtn, (!isCameraReady || isProcessing) && styles.disabledAction]} onPress={handleCapture} disabled={!isCameraReady || isProcessing} accessibilityRole="button">
                  {isProcessing ? <ActivityIndicator color={colors.bgSurface} /> : <View style={styles.captureInner} />}
                </TouchableOpacity>
                <View style={styles.galleryBtnPlaceholder} />
              </View>
            </View>
          )}

          <Text style={styles.instructionText}>
            Giữ camera sát lá bị bệnh rồi bấm chụp để gửi ảnh lên AI.
          </Text>
        </View>
      )}

      {scanState === 'analyzing' && (
        <View style={styles.analyzingContainer}>
          <View style={styles.spinner}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={styles.analyzingTitle}>Đang phân tích...</Text>
          <Text style={styles.analyzingSubtitle}>Bé Thóc đang xem xét lá cây bằng Gemini AI, vui lòng đợi một chút nhé!</Text>
        </View>
      )}

      {scanState === 'result' && scanResult && (
        <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.previewImageContainer}>
            {scannedImage && <Image source={{ uri: scannedImage }} style={styles.previewImage} />}
          </View>

          <View style={styles.dialogueRow}>
            <View style={styles.mascotAvatar}>
              <Text style={{ fontSize: 24 }}>🌱</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                {mascotMessage}
              </Text>
            </View>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>PHÂN TÍCH THÀNH CÔNG{scanResult.status === 'cached' ? ' (CACHE)' : ''}</Text>
            </View>

            <Text style={styles.diseaseName}>{diseaseName}</Text>

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

            {diagnosis?.symptoms && diagnosis.symptoms.length > 0 && (
              <View style={styles.symptomsBox}>
                <Text style={styles.sectionTitle}>Triệu chứng phát hiện:</Text>
                {diagnosis.symptoms.map((symptom, index) => (
                  <Text key={index} style={styles.symptomItem}>• {symptom}</Text>
                ))}
              </View>
            )}

            {diagnosis?.treatment && (
              <View style={styles.treatmentBox}>
                <Text style={styles.sectionTitle}>Giải pháp điều trị:</Text>
                <Text style={styles.treatmentTitle}>Hữu cơ / Sinh học:</Text>
                <Text style={styles.treatmentDesc}>{diagnosis.treatment.organic}</Text>

                <Text style={[styles.treatmentTitle, { marginTop: 8 }]}>Hóa học (Nếu bệnh nặng):</Text>
                <Text style={styles.treatmentDesc}>{diagnosis.treatment.chemical}</Text>

                {diagnosis.treatment.phi_warning && (
                  <View style={[styles.warningBox, { marginTop: 12 }]}>
                    <Info size={16} color="#9A3412" />
                    <Text style={styles.warningText}>⚠️ Khuyến cáo cách ly (PHI): {diagnosis.treatment.phi_warning}</Text>
                  </View>
                )}
              </View>
            )}

            {(diagnosis?.safety_alert || diagnosis?.treatment?.safety_alert) && (
              <View style={[styles.warningBox, { marginTop: 16 }]}> 
                <Info size={16} color="#9A3412" />
                <Text style={styles.warningText}>{diagnosis?.safety_alert || diagnosis?.treatment?.safety_alert}</Text>
              </View>
            )}

            {diagnosis?.low_confidence_warning && (
              <View style={[styles.warningBox, { marginTop: 16 }]}> 
                <Info size={16} color="#9A3412" />
                <Text style={styles.warningText}>{diagnosis.low_confidence_warning}</Text>
              </View>
            )}

            {diagnosis?.disclaimer && (
              <Text style={styles.disclaimerText}>* {diagnosis.disclaimer}</Text>
            )}
          </View>

          <View style={styles.actionButtons}>
            <Button title="Quay lại Nhật ký" onPress={() => router.push('/(tabs)/diary')} style={{ marginBottom: 12 }} />
            <Button
              title="Hỏi ý kiến Bé Thóc AI"
              variant="outline"
              onPress={() => {
                router.push({
                  pathname: '/(tabs)/chat',
                  params: {
                    initialMessage: `Tôi muốn hỏi chi tiết về kết quả chẩn đoán: ${diseaseName}`,
                    initialImage: scanResult?.image_url || scannedImage || '',
                  },
                });
              }}
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
  permissionState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  permissionText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMain + '90',
  },
  cameraBox: {
    width: '100%',
    aspectRatio: 3 / 4,
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
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cropSelector: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  cropChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cropChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cropChipText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
  },
  cropChipTextActive: {
    color: colors.bgSurface,
  },
  flipBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    minWidth: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  galleryBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 12,
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
  disabledAction: {
    opacity: 0.5,
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
    marginBottom: -40,
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
  disclaimerText: {
    ...typography.caption,
    color: colors.textMain + '80',
    fontStyle: 'italic',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderMain + '30',
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
  },
});
