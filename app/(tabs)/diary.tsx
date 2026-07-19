import { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Alert, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, CheckCircle2, Leaf, Sprout, Wheat } from 'lucide-react-native';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { useDiaries, type Diary } from '../../src/hooks/useDiary';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';

export default function DiaryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const { data: diaries = [], isLoading, isFetchingMore, refetch, loadMore } = useDiaries({ paginated: true, limit: 12 });
  const { width, gutter, contentMaxWidth, isCompact, isWide } = useResponsiveLayout();
  const fabRight = isWide ? Math.max(gutter, (width - contentMaxWidth) / 2 + 8) : gutter;

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch])
  );

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
        onPress={() => {
          Alert.alert(
            'Thêm mới',
            'Bạn muốn thêm gì?',
            [
              { text: 'Bắt đầu vụ mùa mới', onPress: () => router.push('/diary/new-cycle') },
              { text: 'Viết nhật ký hôm nay', onPress: () => router.push('/diary/create') },
              { text: 'Hủy', style: 'cancel' },
            ]
          );
        }}
      >
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>
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
});
