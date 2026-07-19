import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Droplets, Clock, Plus, Trash2, Repeat } from 'lucide-react-native';
import { Button } from '../src/components/Button';
import { useState, useEffect } from 'react';
import { api } from '../src/api/client';
import { getErrorMessage } from '../src/utils/errors';

interface ReminderItem {
  _id: string;
  title: string;
  scheduled_at: string;
  status: 'pending' | 'completed' | 'cancelled';
  frequency?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hoursAhead, setHoursAhead] = useState('1');
  const [frequency, setFrequency] = useState<'none' | 'daily'>('daily');

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/reminders');
      if (res.data.success) {
        setReminders(res.data.data);
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tải nhắc nhở.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchReminders);
  }, []);

  const handleComplete = async (id: string) => {
    try {
      const res = await api.patch(`/reminders/${id}/complete`);
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã hoàn thành nhắc nhở chăm sóc!');
        fetchReminders();
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể cập nhật nhắc nhở.'));
    }
  };

  const handleCancel = async (id: string) => {
    Alert.alert('Xác nhận', 'Bạn muốn hủy nhắc nhở này?', [
      { text: 'Quay lại', style: 'cancel' },
          { text: 'Xác nhận hủy', style: 'destructive', onPress: async () => {
            try {
              await api.patch(`/reminders/${id}/cancel`);
              Alert.alert('Thành công', 'Đã hủy nhắc nhở.');
              fetchReminders();
            } catch (err) {
              Alert.alert('Lỗi', getErrorMessage(err, 'Không thể hủy nhắc nhở.'));
            }
          }}
      ]);
  };

  const handleCreateReminder = async () => {
    try {
      const parsedHours = Number(hoursAhead);
      if (!title.trim()) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề nhắc nhở.');
        return;
      }
      if (!Number.isFinite(parsedHours) || parsedHours <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập số giờ hợp lệ.');
        return;
      }
      const scheduledAt = new Date(Date.now() + Math.max(parsedHours, 1) * 60 * 60 * 1000).toISOString();
      const res = await api.post('/reminders', {
        title: title.trim(),
        description: description.trim(),
        scheduled_at: scheduledAt,
        type: 'water',
        frequency,
      });
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã tạo nhắc nhở mới!');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setHoursAhead('1');
        setFrequency('daily');
        fetchReminders();
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tạo nhắc nhở.'));
    }
  };

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
        ) : reminders.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24, color: colors.textMuted }}>Không có nhắc nhở nào sắp tới.</Text>
        ) : (
          <View style={styles.listContainer}>
            {reminders.map(item => (
              <View key={item._id} style={styles.reminderCard}>
                <View style={styles.iconContainer}>
                  <Droplets size={24} color="#3B82F6" />
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
                    />
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item._id)}>
                      <Trash2 size={12} color={colors.error} />
                      <Text style={styles.cancelText}>Hủy</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* FAB: Thêm nhắc nhở mẫu nhanh */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => setShowCreateModal(true)}>
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>

      <Modal visible={showCreateModal} animationType="slide" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Tạo nhắc nhở</Text>
            <TextInput style={styles.modalInput} placeholder="Tiêu đề" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.modalInput, styles.modalMultiline]} placeholder="Mô tả" value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.modalInput} placeholder="Sau bao nhiêu giờ" keyboardType="numeric" value={hoursAhead} onChangeText={setHoursAhead} />
            <View style={styles.frequencyRow}>
              <TouchableOpacity style={[styles.frequencyChip, frequency === 'daily' && styles.frequencyChipActive]} onPress={() => setFrequency('daily')}>
                <Text style={[styles.frequencyText, frequency === 'daily' && styles.frequencyTextActive]}>Hàng ngày</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.frequencyChip, frequency === 'none' && styles.frequencyChipActive]} onPress={() => setFrequency('none')}>
                <Text style={[styles.frequencyText, frequency === 'none' && styles.frequencyTextActive]}>Một lần</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalActions}>
              <Button title="Hủy" variant="outline" onPress={() => setShowCreateModal(false)} style={styles.modalButton} />
              <Button title="Tạo" onPress={handleCreateReminder} style={styles.modalButton} />
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
    gap: 8,
  },
  frequencyChip: {
    flex: 1,
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
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  }
});
