import { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Alert, FlatList, ActivityIndicator, DeviceEventEmitter, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, CheckCircle2, Leaf, Sprout, Wheat, MapPin } from 'lucide-react-native';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { useDiaries, type Diary } from '../../src/hooks/useDiary';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';
import { api } from '../../src/api/client';
import { getErrorMessage } from '../../src/utils/errors';

export default function DiaryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // States for creating a plot
  const [showCreatePlotModal, setShowCreatePlotModal] = useState(false);
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotDescription, setPlotDescription] = useState('');
  const [isSavingPlot, setIsSavingPlot] = useState(false);

  const handleSavePlot = async () => {
    if (!plotName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên mảnh vườn.');
      return;
    }
    const areaNum = Number(plotArea);
    if (isNaN(areaNum) || areaNum <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập diện tích hợp lệ (lớn hơn 0).');
      return;
    }

    setIsSavingPlot(true);
    try {
      const res = await api.post('/plots', {
        name: plotName.trim(),
        area_size: areaNum,
        description: plotDescription.trim() || undefined,
      });

      const newPlot = res.data.data;
      setShowCreatePlotModal(false);
      
      // Reset form states
      setPlotName('');
      setPlotArea('');
      setPlotDescription('');

      Alert.alert('Thành công', `Đã tạo mảnh vườn "${newPlot.name}" thành công.`);
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tạo mảnh vườn.'));
    } finally {
      setIsSavingPlot(false);
    }
  };

  const { data: diaries = [], isLoading, isFetchingMore, refetch, loadMore } = useDiaries({ paginated: true, limit: 12 });
  const { width, gutter, contentMaxWidth, isCompact, isWide } = useResponsiveLayout();
  const fabRight = isWide ? Math.max(gutter, (width - contentMaxWidth) / 2 + 8) : gutter;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('diary_updated', () => {
      void refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const sortedDiaries = useMemo(
    () => [...diaries].sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()),
    [diaries]
  );

  const filters = useMemo(() => {
    const cropFilters = Array.from(new Set(sortedDiaries.map((diary) => diary.crop_type).filter(Boolean))).sort();
    return ['All', ...cropFilters];
  }, [sortedDiaries]);

  const activeFilter = filters.includes(filter) ? filter : 'All';

  const filteredDiaries = useMemo(() => {
    if (activeFilter === 'All') return sortedDiaries;
    return sortedDiaries.filter((diary) => diary.crop_type === activeFilter);
  }, [activeFilter, sortedDiaries]);

  const emptyText = sortedDiaries.length === 0
    ? 'Chưa có nhật ký nào.'
    : 'Không có mùa vụ phù hợp với bộ lọc này.';

  const renderDiaryItem = ({ item: diary }: { item: Diary }) => (
    <TouchableOpacity
      style={styles.diaryCard}
      onPress={() => router.push(`/diary/${diary._id}`)}
      activeOpacity={0.72}
      accessibilityRole="button"
      accessibilityLabel={`${diary.crop_type}${diary.season ? `, ${diary.season}` : ''}`}
    >
      <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
        <View style={styles.cropInfo}>
          <View style={styles.cropIconBg}>
            {diary.crop_type?.includes('Lúa')
              ? <Wheat size={24} color={colors.warning} />
              : <Leaf size={24} color={colors.primary} />}
          </View>
          <View style={styles.cropTextBlock}>
            <Text style={styles.cropName}>{diary.crop_type || 'Mùa vụ'} {diary.season ? `(${diary.season})` : ''}</Text>
            <Text style={styles.startDate}>Bắt đầu: {diary.start_date ? new Date(diary.start_date).toLocaleDateString('vi-VN') : 'Chưa thiết lập'}</Text>
          </View>
        </View>
        {diary.status === 'active' && (
          <View style={styles.statusBadge}>
            <CheckCircle2 size={12} color={colors.primary} />
            <Text style={styles.statusText}>Đang trồng</Text>
          </View>
        )}
      </View>

      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Leaf size={14} color={colors.textMain + '80'} />
          <Text style={styles.tagText}>{diary.health_status || 'Chưa cập nhật'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const listFooter = () => {
    if (!isFetchingMore) return <View style={{ height: 24 }} />;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Nhật ký mùa vụ" showBack={false} />

      <View style={[styles.filterContainer, { maxWidth: contentMaxWidth }]}> 
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterScroll, { paddingHorizontal: gutter }]}> 
          {filters.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.filterChip, activeFilter === item ? styles.filterChipActive : null]}
              onPress={() => setFilter(item)}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{ selected: activeFilter === item }}
            >
              <Text style={[styles.filterText, activeFilter === item ? styles.filterTextActive : null]}>
                {item === 'All' ? 'Tất cả' : item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredDiaries}
        renderItem={renderDiaryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.listContainer, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={!isLoading ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sprout size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyText}>Đang tải nhật ký...</Text>
          </View>
        )}
        ListFooterComponent={listFooter}
      />

      <TouchableOpacity
        style={[styles.fab, { right: fabRight }]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Thêm nhật ký hoặc vụ mùa"
        onPress={() => setShowCreateModal(true)}
      >
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCreateModal(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
              <Text style={styles.modalTitle}>Thêm mới</Text>
            </View>

            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.72}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/diary/new-cycle');
                }}
              >
                <View style={[styles.optionIconBg, { backgroundColor: colors.primary + '10' }]}>
                  <Sprout size={24} color={colors.primary} />
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionTitle}>Bắt đầu vụ mùa mới</Text>
                  <Text style={styles.optionSubtitle}>Thiết lập thông tin giống cây, diện tích, ngày bắt đầu</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.72}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/diary/create');
                }}
              >
                <View style={[styles.optionIconBg, { backgroundColor: colors.warning + '10' }]}>
                  <Leaf size={24} color={colors.warning} />
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionTitle}>Viết nhật ký hôm nay</Text>
                  <Text style={styles.optionSubtitle}>Ghi chép công việc tưới nước, bón phân, tình hình dịch bệnh</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                activeOpacity={0.72}
                onPress={() => {
                  setShowCreateModal(false);
                  setTimeout(() => setShowCreatePlotModal(true), 300);
                }}
              >
                <View style={[styles.optionIconBg, { backgroundColor: colors.info + '10' }]}>
                  <MapPin size={24} color={colors.info} />
                </View>
                <View style={styles.optionTextBlock}>
                  <Text style={styles.optionTitle}>Tạo mảnh vườn mới</Text>
                  <Text style={styles.optionSubtitle}>Thêm thửa ruộng hoặc khu vực đất trồng mới để canh tác</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              activeOpacity={0.72}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.closeButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCreatePlotModal}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!isSavingPlot) setShowCreatePlotModal(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => {
            if (!isSavingPlot) setShowCreatePlotModal(false);
          }}
        >
          <TouchableOpacity
            style={styles.modalCardCenter}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalCenterTitle}>Tạo mảnh vườn mới</Text>
            
            <Text style={styles.fieldLabel}>Tên mảnh vườn</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: Vườn lúa đông xuân, Thửa ruộng A"
              value={plotName}
              onChangeText={setPlotName}
              editable={!isSavingPlot}
              placeholderTextColor={colors.textMain + '40'}
            />

            <Text style={styles.fieldLabel}>Diện tích (m²)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ví dụ: 1000, 500"
              value={plotArea}
              onChangeText={setPlotArea}
              keyboardType="numeric"
              editable={!isSavingPlot}
              placeholderTextColor={colors.textMain + '40'}
            />

            <Text style={styles.fieldLabel}>Mô tả (Không bắt buộc)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalMultiline]}
              placeholder="Mô tả thêm về mảnh vườn..."
              value={plotDescription}
              onChangeText={setPlotDescription}
              multiline
              editable={!isSavingPlot}
              placeholderTextColor={colors.textMain + '40'}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionsBtnClose}
                onPress={() => setShowCreatePlotModal(false)}
                disabled={isSavingPlot}
              >
                <Text style={styles.closeButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePlot}
                disabled={isSavingPlot}
              >
                {isSavingPlot ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  filterContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 12,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + '80',
  },
  filterTextActive: {
    color: colors.bgSurface,
  },
  listContainer: {
    width: '100%',
    gap: 16,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMain + '80',
  },
  diaryCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardHeaderCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  cropInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cropIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropTextBlock: {
    flex: 1,
    gap: 4,
  },
  cropName: {
    ...typography.h3,
    color: colors.textMain,
  },
  startDate: {
    ...typography.bodySmall,
    color: colors.textMain + '80',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary + '12',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bgMain,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.textMain + '80',
    fontWeight: '600',
  },
  footerLoading: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderMain + '90',
    marginBottom: 12,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textMain,
    fontWeight: '700',
  },
  modalOptions: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.bgMain,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  optionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextBlock: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  },
  optionSubtitle: {
    ...typography.bodySmall,
    color: colors.textMain + '70',
    fontSize: 12,
  },
  closeButton: {
    backgroundColor: colors.borderMain + '20',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalCardCenter: {
    backgroundColor: colors.bgSurface,
    borderRadius: 28,
    padding: 24,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalCenterTitle: {
    ...typography.h3,
    color: colors.textMain,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  fieldLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + 'B3',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    ...typography.body,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textMain,
  },
  modalMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalActionsBtnClose: {
    flex: 1,
    backgroundColor: colors.borderMain + '20',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '700',
    color: '#ffffff',
  },
});
