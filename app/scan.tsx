import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Camera, RefreshCcw, Info } from 'lucide-react-native';
import { useState } from 'react';
import { Button } from '../src/components/Button';
import { useRouter } from 'expo-router';

type ScanState = 'viewfinder' | 'analyzing' | 'result';

export default function ScanScreen() {
  const [scanState, setScanState] = useState<ScanState>('viewfinder');
  const router = useRouter();

  const handleCapture = () => {
    setScanState('analyzing');
    setTimeout(() => {
      setScanState('result');
    }, 2000); // mock analyzing time
  };

  const handleRetake = () => {
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
            <Text style={{ fontSize: 60 }}>🌱</Text>
          </View>
          <Text style={styles.analyzingTitle}>Đang phân tích...</Text>
          <Text style={styles.analyzingSubtitle}>
            Bé Thóc đang xem xét lá cây, vui lòng đợi một chút nhé!
          </Text>
        </View>
      )}

      {scanState === 'result' && (
        <ScrollView contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          {/* Result Image Preview */}
          <View style={styles.previewImageContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsbCWDiuGTF5iEwK2O9pm1CMMzFdWx0hc4ellAPSIR0Fd0W04AaUk2McKFTBpkyt54F7qbz59AxRVm00X7l_paTxXsYAhKb0DJ2UtW18iwcftc8NpvHSUtky7QtZ3LYS_Jvnwzb_uyHj7Snd_GZJ5qRjx6kGvs2Y-yZafDMesEmvqIG9HZ3b06V39xa_0py0IGkepiBfpB_L-Nfe8YfQg-4VDdxhF78xd9seUk1RNYLfCuF3wEdwSvukiK2uu0wpN98-IjRJs9NRru' }} 
              style={styles.previewImage} 
            />
          </View>

          {/* Dialogue */}
          <View style={styles.dialogueRow}>
            <View style={styles.mascotAvatar}>
              <Text style={{ fontSize: 24 }}>🌱</Text>
            </View>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>Oh no! Looks like we found something.</Text>
            </View>
          </View>

          {/* Result Card */}
          <View style={styles.resultCard}>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>ANALYSIS COMPLETE</Text>
            </View>
            <Text style={styles.diseaseName}>Bệnh đốm lá (Leaf Spot)</Text>
            
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
              <Text style={styles.confidenceValue}>92%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92%' }]} />
            </View>

            <View style={styles.symptomsBox}>
              <Text style={styles.sectionTitle}>Triệu chứng:</Text>
              <Text style={styles.symptomItem}>• Đốm nâu viền vàng trên lá</Text>
              <Text style={styles.symptomItem}>• Lá bị khô và rụng sớm</Text>
            </View>

            <View style={styles.warningBox}>
              <Info size={16} color="#9A3412" />
              <Text style={styles.warningText}>
                ⚠️ Cần cách ly cây bệnh để tránh lây lan sang các cây khác trong vườn.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionButtons}>
            <Button 
              title="Save treatment" 
              onPress={() => {}} 
              style={{ marginBottom: 12 }}
            />
            <Button 
              title="Ask AI advice" 
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
    ...StyleSheet.absoluteFillObject,
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
