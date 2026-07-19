import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Droplets, Clock, Trash2, Repeat, Leaf, BugOff } from 'lucide-react-native';
import { Button } from '../src/components/Button';
import { useState, useEffect } from 'react';
import { api } from '../src/api/client';
import { usePetStatus } from '../src/hooks/usePet';

type Reminder = {
  _id: string;
  title: string;
  scheduled_at: string;
  status: string;
  type?: string;
  frequency?: string;
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReminderId, setPendingReminderId] = useState<string | null>(null);
  const { refetch: refetchPet } = usePetStatus();

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reminders');
      if (res.data.success) {
        setReminders(res.data.data);
        setError(null);
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải nhắc nhở. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      setPendingReminderId(id);
      const res = await api.patch(`/reminders/${id}/complete`);
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã hoàn thành nhắc nhở chăm sóc!');
        await Promise.all([fetchReminders(), refetchPet()]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật nhắc nhở.');
    } finally {
      setPendingReminderId(null);
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn muốn hủy nhắc nhở này?', [
      { text: 'Quay lại', style: 'cancel' },
      { text: 'Xác nhận hủy', style: 'destructive', onPress: async () => {
          try {
            setPendingReminderId(id);
            await api.patch(`/reminders/${id}/cancel`);
            Alert.alert('Thành công', 'Đã hủy nhắc nhở.');
            await fetchReminders();
          } catch (err: any) {
            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy nhắc nhở.');
          } finally {
            setPendingReminderId(null);
          }
        }
      }
    ]);
  };

  const getReminderIcon = (type?: string) => {
    switch (type) {
      case 'fertilizer': return <Leaf size={24} color="#10B981" />;
      case 'pest': return <BugOff size={24} color="#F97316" />;
      default: return <Droplets size={24} color="#3B82F6" />;
    }
  };

  const getFrequencyLabel = (frequency?: string) => {
    switch (frequency) {
      case 'daily': return 'Hàng ngày';
      case 'weekly': return 'Hàng tuần';
      case 'monthly': return 'Hàng tháng';
      default: return null;
    }
  };

  const upcomingReminders = reminders
    .filter(item => item.status === 'pending')
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Nhắc nhở của tôi" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchReminders} />}
      >
        
        {/* Mascot Banner */}
        <View style={styles.banner}>
          <View style={styles.mascotAvatar}>
            <Text style={{ fontSize: 32 }}>🌱</Text>
          </View>
          <Text style={styles.bannerText}>
            Đừng quên chăm sóc cây đúng giờ để nhận được <Text style={styles.highlightText}>gấp đôi XP</Text> nhé!
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Sắp tới</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : error ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Thử lại" onPress={fetchReminders} style={styles.retryBtn} />
          </View>
        ) : upcomingReminders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24, color: colors.textMuted }}>Không có nhắc nhở nào sắp tới.</Text>
        ) : (
          <View style={styles.listContainer}>
            {upcomingReminders.map(item => {
              const frequencyLabel = getFrequencyLabel(item.frequency);
              const isPending = pendingReminderId === item._id;
              const isOverdue = new Date(item.scheduled_at).getTime() < Date.now();
              return (
              <View key={item._id} style={styles.reminderCard}>
                <View style={styles.iconContainer}>
                  {getReminderIcon(item.type)}
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.reminderTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textMain + '80'} />
                    <Text style={styles.timeText}>{new Date(item.scheduled_at).toLocaleString('vi-VN')}</Text>
                  </View>
                  
                  <View style={styles.tagsRow}>
                    <View style={styles.tagPush}>
                      <Text style={styles.tagPushText}>{item.status}</Text>
                    </View>
                    {isOverdue && (
                      <View style={styles.tagOverdue}>
                        <Text style={styles.tagOverdueText}>Quá hạn</Text>
                      </View>
                    )}
                    {frequencyLabel && (
                      <View style={styles.tagRepeat}>
                        <Repeat size={10} color="#B45309" />
                        <Text style={styles.tagRepeatText}>{frequencyLabel}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {item.status === 'pending' && (
                  <View style={styles.actionsContainer}>
                    <Button 
                      title="Xong" 
                      onPress={() => handleComplete(item._id)} 
                      style={styles.doneBtn}
                      disabled={!!pendingReminderId}
                    />
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)} disabled={!!pendingReminderId}>
                      <Trash2 size={12} color={colors.error} />
                      <Text style={styles.cancelText}>{isPending ? 'Đang xử lý' : 'Hủy'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )})}
          </View>
        )}

      </ScrollView>

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
  banner: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mascotAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    ...typography.bodySmall,
    lineHeight: 20,
  },
  highlightText: {
    color: colors.secondaryDark,
    fontWeight: '800',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  errorState: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryBtn: {
    width: 140,
  },
  reminderCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  reminderTitle: {
    ...typography.body,
    fontWeight: '800',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMain + '80',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagPush: {
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagPushText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMain + 'B0',
    textTransform: 'uppercase',
  },
  tagOverdue: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagOverdueText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.error,
    textTransform: 'uppercase',
  },
  tagRepeat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  tagRepeatText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  actionsContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  doneBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 0,
    borderRadius: 12,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.error + 'B0',
  },
});
