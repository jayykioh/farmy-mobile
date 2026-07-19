import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, DeviceEventEmitter, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { Archive, Trash2, Activity, Clock, CheckCircle2, Droplets, Leaf, Shield, Plus } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDiaryDetail, useDiaryLogs } from '../../src/hooks/useDiary';
import { api } from '../../src/api/client';
import { getErrorMessage } from '../../src/utils/errors';
import { useEffect } from 'react';

export default function DiaryHistoryScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const diaryId = Array.isArray(id) ? id[0] : id;
  
  const { data: diary, isLoading: diaryLoading, refetch: refetchDiary } = useDiaryDetail(diaryId || '');
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useDiaryLogs(diaryId || '');

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('diary_updated', () => {
      refetchDiary();
      refetchLogs();
    });
    return () => sub.remove();
  }, [refetchDiary, refetchLogs]);

  const sortedLogs = [...logs].sort((a, b) => {
    const left = new Date(a.created_at || 0).getTime();
    const right = new Date(b.created_at || 0).getTime();
    return right - left;
  });

  const weekDays = [
    { label: 'T2', dayIndex: 1 },
    { label: 'T3', dayIndex: 2 },
    { label: 'T4', dayIndex: 3 },
    { label: 'T5', dayIndex: 4 },
    { label: 'T6', dayIndex: 5 },
    { label: 'T7', dayIndex: 6 },
    { label: 'CN', dayIndex: 0 },
  ];
  const weeklyCounts = weekDays.map(day => ({
    ...day,
    count: logs.filter(log => new Date(log.created_at).getDay() === day.dayIndex).length,
  }));
  const maxWeeklyCount = Math.max(...weeklyCounts.map(day => day.count), 1);

  const normalizeActivityType = (type?: string) => {
    const normalized = type?.toLowerCase?.() ?? '';
    if (normalized.includes('water') || normalized.includes('tưới')) return 'water';
    if (normalized.includes('fertilizer') || normalized.includes('bón')) return 'fertilizer';
    if (normalized.includes('pest') || normalized.includes('phun') || normalized.includes('sâu')) return 'pest';
    return 'other';
  };

  const getActivityLabel = (type: string) => {
    switch(type) {
      case 'water': return 'Tưới nước';
      case 'fertilizer': return 'Bón phân';
      case 'pest': return 'Phun thuốc';
      default: return 'Hoạt động khác';
    }
  };

  const getLogImageUrls = (log: typeof logs[number]) => [
    log.image_url,
    log.imageUrl,
    ...(log.photo_urls ?? []),
    ...(log.photoUrls ?? []),
  ].filter((url): url is string => Boolean(url));

  const getIcon = (type: string) => {
    switch(type) {
      case 'water': return <Droplets size={24} color="#3B82F6" />;
      case 'fertilizer': return <Leaf size={24} color="#10B981" />;
      case 'pest': return <Shield size={24} color="#F97316" />;
      default: return <Activity size={24} color={colors.primary} />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'water': return '#EFF6FF';
      case 'fertilizer': return '#ECFDF5';
      case 'pest': return '#FFF7ED';
      default: return colors.primary + '15';
    }
  };



  const handleRefresh = () => {
    refetchDiary();
    refetchLogs();
  };

  const handleArchive = async () => {
    try {
      await api.put(`/diaries/${diaryId}`, { status: 'archived' });
      Alert.alert('Thành công', 'Đã lưu trữ vụ mùa.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/diary') }
      ]);
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể lưu trữ vụ mùa.'));
    }
  };

  const handleDelete = async () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa vụ mùa này cùng toàn bộ nhật ký?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/diaries/${diaryId}`);
            Alert.alert('Thành công', 'Đã xóa vụ mùa.', [
              { text: 'OK', onPress: () => router.replace('/(tabs)/diary') }
            ]);
          } catch (err) {
            Alert.alert('Lỗi', getErrorMessage(err, 'Không thể xóa vụ mùa.'));
          }
        }
      }
    ]);
  };

  if (diaryLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <PageHeader title="Đang tải..." fallbackHref="/(tabs)/diary" />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerStateText}>Đang tải lịch sử mùa vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!diary) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <PageHeader title="Không tìm thấy" fallbackHref="/(tabs)/diary" />
        <View style={styles.centerState}>
          <Text style={styles.centerStateText}>Không tìm thấy mùa vụ này hoặc dữ liệu chưa sẵn sàng.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title={`Lịch sử: ${diary?.crop_type || 'Mùa vụ'} ${diary?.season ? `(${diary.season})` : ''}`} fallbackHref="/(tabs)/diary" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={diaryLoading || logsLoading} onRefresh={handleRefresh} />}
      >
        
        {/* Top actions */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.outlineBtn} onPress={handleArchive}>
            <Archive size={16} color={colors.primary} />
            <Text style={styles.outlineBtnText}>Lưu trữ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.outlineBtn, styles.dangerBtn]} onPress={handleDelete}>
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.outlineBtnText, { color: colors.error }]}>Xóa</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot Encouragement */}
        <View style={styles.mascotBanner}>
          <View style={styles.mascotAvatar}>
            <Text style={{ fontSize: 32 }}>🌱</Text>
          </View>
          <Text style={styles.mascotText}>
            Bạn đang duy trì chăm sóc cây trồng đều đặn. Tuyệt vời!
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardFull]}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Chăm sóc tuần này</Text>
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>Hiện tại</Text>
              </View>
            </View>
            
            <View style={styles.chartArea}>
              {weeklyCounts.map(day => (
                <View key={day.label} style={styles.chartCol}>
                  <View style={styles.chartBarBg}>
                    <View style={[styles.chartBarFill, { height: `${Math.max(8, (day.count / maxWeeklyCount) * 100)}%` }]} />
                  </View>
                  <Text style={styles.chartDay}>{day.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
            <Clock size={32} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.statLabel}>Bắt đầu</Text>
            <Text style={styles.statValueMain}>{diary ? new Date(diary.start_date).toLocaleDateString('vi-VN') : '-'}</Text>
          </View>

          <View style={{ flex: 1, gap: 8 }}>
            <View style={styles.statCardSmall}>
              <Activity size={24} color={colors.secondary} style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>Tổng hoạt động</Text>
              <Text style={styles.statValue}>{logs.length}</Text>
            </View>
            <View style={styles.statCardSmall}>
              <CheckCircle2 size={24} color="#10B981" style={{ marginBottom: 4 }} />
              <Text style={styles.statLabel}>Trạng thái</Text>
              <Text style={[styles.statValue, { fontSize: 14, textTransform: 'uppercase' }]}>
                {diary?.status === 'active' ? 'Đang trồng' : 'Đã thu'}
              </Text>
            </View>
          </View>
        </View>

        {/* Activity Logs */}
        <Text style={styles.sectionTitle}>Hoạt động chăm sóc</Text>
        <View style={styles.logsContainer}>
          {logsLoading && (
            <View style={styles.logsLoadingState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.emptyLogText}>Đang tải hoạt động...</Text>
            </View>
          )}

          {!logsLoading && sortedLogs.map(log => (
            <View key={log._id} style={styles.logCard}>
              <View style={[styles.logIcon, { backgroundColor: getBgColor(normalizeActivityType(log.activity_type ?? log.activityType)) }]}>                
                {getIcon(normalizeActivityType(log.activity_type ?? log.activityType))}
              </View>
               
              <View style={styles.logInfo}>
                <Text style={styles.logType}>
                  {getActivityLabel(normalizeActivityType(log.activity_type ?? log.activityType))}
                </Text>
                <Text style={styles.logContent}>{log.content}</Text>
                {getLogImageUrls(log).length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.logImagesRow}>
                    {getLogImageUrls(log).map(url => (
                      <Image key={url} source={{ uri: url }} style={styles.logImage} />
                    ))}
                  </ScrollView>
                )}
              </View>

              <View style={styles.logMeta}>
                <Text style={styles.logDate}>{new Date(log.created_at).toLocaleDateString('vi-VN')}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>Hoàn tất</Text>
                </View>
              </View>
            </View>
          ))}
          {!logsLoading && logs.length === 0 && (
            <Text style={styles.emptyLogText}>Chưa có hoạt động nào</Text>
          )}
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8} 
        onPress={() => router.push({ pathname: '/diary/create', params: { diaryId } })}
      >
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSurface1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  centerStateText: {
    ...typography.body,
    color: colors.textMain + 'B0',
    textAlign: 'center',
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    backgroundColor: colors.bgSurface,
    gap: 6,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  dangerBtn: {
    borderColor: colors.error + '50',
    backgroundColor: colors.error + '10',
  },
  mascotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 20,
    padding: 16,
    gap: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mascotAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotText: {
    flex: 1,
    ...typography.body,
    fontWeight: '600',
    color: colors.textMain,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardFull: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'stretch',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statTitle: {
    ...typography.h3,
  },
  badgePill: {
    backgroundColor: colors.secondaryLight + '30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.secondaryDark,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  chartCol: {
    alignItems: 'center',
    height: '100%',
    width: 24,
  },
  chartBarBg: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  chartDay: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMain + '80',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMain + '80',
    marginBottom: 4,
  },
  statValueMain: {
    ...typography.h2,
    color: colors.textMain,
  },
  statCardSmall: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: 16,
  },
  logsContainer: {
    gap: 12,
  },
  logsLoadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyLogText: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.textMuted,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
  },
  logIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logType: {
    ...typography.body,
    fontWeight: '800',
  },
  logContent: {
    ...typography.caption,
    color: colors.textMain + 'CC',
    marginTop: 2,
  },
  logImagesRow: {
    gap: 8,
    paddingTop: 10,
  },
  logImage: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
  },
  logMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  logDate: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMain + '80',
  },
  statusPill: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryContainer,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
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
