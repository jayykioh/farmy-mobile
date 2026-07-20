import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Image, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  AlertCircle, 
  X, 
  Cpu, 
  ImageIcon, 
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { getAdminScans } from '../../src/api/admin';

type ScanLog = {
  _id: string;
  user_id: { name: string; email: string } | null;
  crop_type: string;
  status: 'completed' | 'failed';
  diagnosis?: {
    is_plant: boolean;
    disease_name?: string;
    confidence?: number;
    symptoms?: string[];
  };
  imageUrl?: string;
  thumbnailUrl?: string;
  model_used?: string;
  latency_ms?: number;
  created_at: string;
};

export default function AdminScansScreen() {
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // States for modals
  const [selectedScan, setSelectedScan] = useState<ScanLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchScans = async (pageNumber: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const res = await getAdminScans({ page: pageNumber, limit: 10 });
      if (isInitial) {
        setScans(res.scans);
      } else {
        setScans(prev => [...prev, ...res.scans]);
      }
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải lịch sử quét: ' + (err.message || err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => fetchScans(1, true));
  }, []);

  const renderScanItem = ({ item }: { item: ScanLog }) => {
    const diseaseName = item.diagnosis?.disease_name || 'Khỏe mạnh / Không phát hiện bệnh';
    const confidence = item.diagnosis?.confidence 
      ? `${Math.round(item.diagnosis.confidence * 100)}%` 
      : 'N/A';
    const formattedDate = item.created_at
      ? new Date(item.created_at).toLocaleString('vi-VN', { 
          dateStyle: 'short', 
          timeStyle: 'short' 
        })
      : 'Không rõ';

    const imageUri = item.thumbnailUrl || item.imageUrl;

    return (
      <TouchableOpacity 
        style={styles.scanCard}
        onPress={() => {
          setSelectedScan(item);
          setShowDetailModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.scanHeader}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <ImageIcon size={20} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.scanSummary}>
            <Text style={styles.cropType}>{item.crop_type.toUpperCase()}</Text>
            <Text style={styles.diseaseName} numberOfLines={1}>{diseaseName}</Text>
            <Text style={styles.userName}>Nông dân: {item.user_id?.name || 'Ẩn danh'}</Text>
            <View style={styles.metaRow}>
              <Calendar size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.scanScore}>
            <Text style={styles.scoreText}>{confidence}</Text>
            <Text style={styles.scoreLabel}>Tin cậy</Text>
            <ChevronRight size={16} color={colors.borderMain} style={{ marginTop: 8 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader title="Lịch sử chẩn đoán" showBack={true} fallbackHref="/admin" />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.centerContainer}>
          <AlertCircle size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>Chưa có lịch sử quét sâu bệnh nào ({total})</Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item, index) => item._id ? `scan-${item._id}-${index}` : `scan-${index}`}
          renderItem={renderScanItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (page < totalPages) fetchScans(page + 1);
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
        />
      )}

      {/* Detail Scan Modal */}
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết quét sâu bệnh</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            
            {selectedScan && (
              <FlatList
                data={[]}
                renderItem={null}
                ListHeaderComponent={
                  <View style={styles.detailContainer}>
                    {selectedScan.imageUrl ? (
                      <View style={styles.imageContainer}>
                        <Image source={{ uri: selectedScan.imageUrl }} style={styles.fullImage} resizeMode="cover" />
                      </View>
                    ) : (
                      <View style={styles.noImageBg}>
                        <ImageIcon size={48} color={colors.textMuted} />
                        <Text style={styles.noImageText}>Không có ảnh đính kèm</Text>
                      </View>
                    )}

                    <View style={styles.detailBody}>
                      <Text style={styles.detailCrop}>{selectedScan.crop_type.toUpperCase()}</Text>
                      <Text style={styles.detailDisease}>
                        {selectedScan.diagnosis?.disease_name || 'Khỏe mạnh / Không phát hiện bệnh'}
                      </Text>
                      
                      <View style={styles.detailScoreSection}>
                        <View style={styles.scoreDetailBox}>
                          <Text style={styles.scoreDetailVal}>
                            {selectedScan.diagnosis?.confidence 
                              ? `${Math.round(selectedScan.diagnosis.confidence * 100)}%` 
                              : 'N/A'}
                          </Text>
                          <Text style={styles.scoreDetailLbl}>Độ tin cậy</Text>
                        </View>
                        <View style={styles.scoreDetailBox}>
                          <Text style={styles.scoreDetailVal}>
                            {selectedScan.status.toUpperCase()}
                          </Text>
                          <Text style={styles.scoreDetailLbl}>Trạng thái</Text>
                        </View>
                      </View>

                      {/* Symptoms */}
                      {selectedScan.diagnosis?.symptoms && selectedScan.diagnosis.symptoms.length > 0 && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailSecTitle}>Triệu chứng nhận biết</Text>
                          {selectedScan.diagnosis.symptoms.map((symptom, idx) => (
                            <Text key={idx} style={styles.symptomText}>• {symptom}</Text>
                          ))}
                        </View>
                      )}

                      {/* System parameters */}
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSecTitle}>Thông số hệ thống</Text>
                        <View style={styles.paramRow}>
                          <Cpu size={14} color={colors.textMuted} />
                          <Text style={styles.paramText}>Model: {selectedScan.model_used || 'GPT-4o-mini'}</Text>
                        </View>
                        <View style={styles.paramRow}>
                          <Clock size={14} color={colors.textMuted} />
                          <Text style={styles.paramText}>Độ trễ: {selectedScan.latency_ms ? `${selectedScan.latency_ms} ms` : 'N/A'}</Text>
                        </View>
                        <View style={styles.paramRow}>
                          <Calendar size={14} color={colors.textMuted} />
                          <Text style={styles.paramText}>Thời gian: {selectedScan.created_at ? new Date(selectedScan.created_at).toLocaleString('vi-VN') : 'N/A'}</Text>
                        </View>
                      </View>

                      {/* User Info */}
                      <View style={[styles.detailSection, { borderBottomWidth: 0 }]}>
                        <Text style={styles.detailSecTitle}>Thông tin người thực hiện</Text>
                        <Text style={styles.userInfoText}>Tên: {selectedScan.user_id?.name || 'Ẩn danh'}</Text>
                        <Text style={styles.userInfoText}>Email: {selectedScan.user_id?.email || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  scanCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.bgMain,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
  },
  scanSummary: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cropType: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  diseaseName: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
    marginTop: 2,
  },
  userName: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  scanScore: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textH,
  },
  detailContainer: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000000',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  noImageBg: {
    width: '100%',
    height: 180,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  noImageText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: '700',
  },
  detailBody: {
    padding: 20,
  },
  detailCrop: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  detailDisease: {
    ...typography.h2,
    color: colors.textMain,
    marginTop: 4,
    marginBottom: 16,
  },
  detailScoreSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  scoreDetailBox: {
    flex: 1,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  scoreDetailVal: {
    ...typography.h2,
    color: colors.primary,
  },
  scoreDetailLbl: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 2,
  },
  detailSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
    paddingVertical: 16,
    gap: 8,
  },
  detailSecTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 4,
  },
  symptomText: {
    ...typography.bodySmall,
    color: colors.textMain,
    lineHeight: 18,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paramText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  userInfoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  }
});
