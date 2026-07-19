import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Droplets, Clock, Plus, Trash2, Repeat, FlaskConical, BugOff } from 'lucide-react-native';
import { Button } from '../src/components/Button';
import { useState, useEffect } from 'react';
import { api } from '../src/api/client';
import { getErrorMessage } from '../src/utils/errors';
import { usePetStatus } from '../src/hooks/usePet';

interface ReminderItem {
  _id: string;
  title: string;
  scheduled_at: string;
  status: 'pending' | 'completed' | 'cancelled';
  frequency?: 'none' | 'daily' | 'weekly' | 'monthly';
  type?: ReminderType;
}

type ReminderType = 'water' | 'fertilizer' | 'pest';
type ReminderFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

const reminderTypes: { id: ReminderType; label: string }[] = [
  { id: 'water', label: 'Tưới nước' },
  { id: 'fertilizer', label: 'Bón phân' },
  { id: 'pest', label: 'Trừ sâu' },
];

const reminderFrequencies: { id: ReminderFrequency; label: string }[] = [
  { id: 'none', label: 'Không lặp lại' },
  { id: 'daily', label: 'Hàng ngày' },
  { id: 'weekly', label: 'Hàng tuần' },
  { id: 'monthly', label: 'Hàng tháng' },
];

const getTodayDateInput = () => new Date().toISOString().slice(0, 10);

const getDefaultTimeInput = () => {
  const nextHour = new Date(Date.now() + 60 * 60 * 1000);
  return `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;
};

const getReminderTypeLabel = (type?: ReminderType) => reminderTypes.find(item => item.id === type)?.label ?? 'Tưới nước';

const getReminderTypeIcon = (type?: ReminderType) => {
  switch (type) {
    case 'fertilizer': return <FlaskConical size={24} color="#10B981" />;
    case 'pest': return <BugOff size={24} color="#F97316" />;
    default: return <Droplets size={24} color="#3B82F6" />;
  }
};

export default function RemindersScreen() {
  const [now] = useState(() => Date.now());
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTodayDateInput());
  const [scheduledTime, setScheduledTime] = useState(getDefaultTimeInput());
  const [reminderType, setReminderType] = useState<ReminderType>('water');
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setError(getErrorMessage(err, 'Không thể tải nhắc nhở.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchReminders);
  }, []);

  const handleComplete = async (id: string) => {
    try {
      setPendingReminderId(id);
      const res = await api.patch(`/reminders/${id}/complete`);
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã hoàn thành nhắc nhở chăm sóc!');
        await Promise.all([fetchReminders(), refetchPet()]);
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể cập nhật nhắc nhở.'));
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
          } catch (err) {
            Alert.alert('Lỗi', getErrorMessage(err, 'Không thể hủy nhắc nhở.'));
          } finally {
            setPendingReminderId(null);
          }
        }}
    ]);
  };

  const handleCreateReminder = async () => {
    try {
      if (!title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề nhắc nhở.');
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate.trim()) || !/^\d{2}:\d{2}$/.test(scheduledTime.trim())) {
        Alert.alert('Lỗi', 'Vui lòng nhập ngày giờ hợp lệ theo định dạng YYYY-MM-DD và HH:mm.');
        return;
      }

      const scheduledAtDate = new Date(`${scheduledDate.trim()}T${scheduledTime.trim()}:00`);
      if (Number.isNaN(scheduledAtDate.getTime())) {
        Alert.alert('Lỗi', 'Thời gian nhắc nhở không hợp lệ.');
        return;
      }

      setIsSubmitting(true);
      const res = await api.post('/reminders', {
        title: title.trim(),
        description: description.trim(),
        scheduled_at: scheduledAtDate.toISOString(),
        type: reminderType,
        frequency,
      });
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã tạo nhắc nhở mới!');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setScheduledDate(getTodayDateInput());
        setScheduledTime(getDefaultTimeInput());
        setReminderType('water');
        setFrequency('daily');
        fetchReminders();
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tạo nhắc nhở.'));
    } finally {
      setIsSubmitting(false);
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
              const isPending = pendingReminderId === item._id;
              const isOverdue = new Date(item.scheduled_at).getTime() < now;
              return (
              <View key={item._id} style={styles.reminderCard}>
                <View style={styles.iconContainer}>
                  {getReminderTypeIcon(item.type)}
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.reminderTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.timeRow}>
                    <Clock size={12} color={colors.textMain + '80'} />
                    <Text style={styles.timeText}>{new Date(item.scheduled_at).toLocaleString('vi-VN')}</Text>
                  </View>
                  
                  <View style={styles.tagsRow}>
                    <View style={styles.tagPush}>
                      <Text style={styles.tagPushText}>{getReminderTypeLabel(item.type)}</Text>
                    </View>
                    <View style={styles.tagPush}>
                      <Text style={styles.tagPushText}>{item.status}</Text>
                    </View>
                    {isOverdue && (
                      <View style={styles.tagOverdue}>
                        <Text style={styles.tagOverdueText}>Quá hạn</Text>
                      </View>
                    )}
                    {item.frequency && item.frequency !== 'none' && (
                      <View style={styles.tagRepeat}>
                        <Repeat size={10} color="#B45309" />
                        <Text style={styles.tagRepeatText}>{item.frequency === 'daily' ? 'Hàng ngày' : item.frequency === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}</Text>
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
                      isLoading={isPending}
                      disabled={!!pendingReminderId}
                      fullWidth={false}
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

      {/* FAB: Thêm nhắc nhở tùy chỉnh */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setShowCreateModal(true)}>
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tạo nhắc nhở</Text>
            <TextInput style={styles.modalInput} placeholder="Tiêu đề" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.modalInput, styles.modalMultiline]} placeholder="Mô tả" value={description} onChangeText={setDescription} multiline />
            <View style={styles.fieldRow}>
              <TextInput style={[styles.modalInput, styles.fieldInput]} placeholder="YYYY-MM-DD" value={scheduledDate} onChangeText={setScheduledDate} />
              <TextInput style={[styles.modalInput, styles.fieldInput]} placeholder="HH:mm" value={scheduledTime} onChangeText={setScheduledTime} />
            </View>
            <Text style={styles.fieldLabel}>Phân loại</Text>
            <View style={styles.frequencyRow}>
              {reminderTypes.map(item => (
                <TouchableOpacity key={item.id} style={[styles.frequencyChip, reminderType === item.id && styles.frequencyChipActive]} onPress={() => setReminderType(item.id)} disabled={isSubmitting}>
                  <Text style={[styles.frequencyText, reminderType === item.id && styles.frequencyTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.fieldLabel}>Tần suất</Text>
            <View style={styles.frequencyRow}>
              {reminderFrequencies.map(item => (
                <TouchableOpacity key={item.id} style={[styles.frequencyChip, frequency === item.id && styles.frequencyChipActive]} onPress={() => setFrequency(item.id)} disabled={isSubmitting}>
                  <Text style={[styles.frequencyText, frequency === item.id && styles.frequencyTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Button title="Hủy" variant="outline" onPress={() => setShowCreateModal(false)} disabled={isSubmitting} style={styles.modalButton} />
              <Button title="Tạo" onPress={handleCreateReminder} isLoading={isSubmitting} disabled={isSubmitting} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    ...typography.h3,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.bgMain,
    ...typography.body,
  },
  modalMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  frequencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  frequencyChip: {
    flex: 1,
    minWidth: 96,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.bgMain,
  },
  frequencyChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  frequencyTextActive: {
    color: colors.primary,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldInput: {
    flex: 1,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  }
});
