import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { Plus, CheckCircle2, Leaf, Sprout, Wheat } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useDiaries } from '../../src/hooks/useDiary';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';

export default function DiaryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const { data: diaries = [], isLoading, refetch } = useDiaries();
  const { width, gutter, contentMaxWidth, isCompact, isWide } = useResponsiveLayout();
  const fabRight = isWide ? Math.max(gutter, (width - contentMaxWidth) / 2 + 8) : gutter;

  const filters = ['All', 'Lúa', 'Bưởi', 'Cà phê'];

  const filteredDiaries = diaries.filter(d => 
    filter === 'All' ? true : d.crop_type.includes(filter)
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Nhật ký mùa vụ" showBack={false} />

      {/* Filters */}
      <View style={[styles.filterContainer, { maxWidth: contentMaxWidth }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterScroll, { paddingHorizontal: gutter }]}>
          {filters.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f ? styles.filterChipActive : null]}
              onPress={() => setFilter(f)}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{ selected: filter === f }}
            >
              <Text style={[styles.filterText, filter === f ? styles.filterTextActive : null]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.listContainer, { paddingHorizontal: gutter, maxWidth: contentMaxWidth }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {filteredDiaries.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sprout size={36} color={colors.primary} />
            </View>
            <Text style={styles.emptyText}>Chưa có nhật ký nào.</Text>
          </View>
        )}

        {filteredDiaries.map(diary => (
          <TouchableOpacity 
            key={diary._id} 
            style={styles.diaryCard}
            onPress={() => router.push(`/diary/${diary._id}`)}
            activeOpacity={0.72}
            accessibilityRole="button"
            accessibilityLabel={`${diary.crop_type}${diary.season ? `, ${diary.season}` : ''}`}
          >
            <View style={[styles.cardHeader, isCompact && styles.cardHeaderCompact]}>
              <View style={styles.cropInfo}>
                <View style={styles.cropIconBg}>
                  {diary.crop_type.includes('Lúa')
                    ? <Wheat size={24} color={colors.warning} />
                    : <Leaf size={24} color={colors.primary} />}
                </View>
                <View style={styles.cropTextBlock}>
                  <Text style={styles.cropName}>{diary.crop_type} {diary.season ? `(${diary.season})` : ''}</Text>
                  <Text style={styles.startDate}>Bắt đầu: {new Date(diary.start_date).toLocaleDateString('vi-VN')}</Text>
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
                <Text style={styles.tagText}>{diary.health_status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
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
              { text: 'Hủy', style: 'cancel' }
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
    alignSelf: 'center',
    paddingTop: 12,
    paddingBottom: 100,
    gap: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightest,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain + '80',
  },
  diaryCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderCompact: {
    flexDirection: 'column',
    gap: 12,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  cropTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  cropIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgSurface1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropName: {
    ...typography.h3,
    marginBottom: 2,
  },
  startDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryContainer,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain + 'B0',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  }
});
