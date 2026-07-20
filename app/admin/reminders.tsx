import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  X
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { getAdminReminders, sendAdminManualNotification } from '../../src/api/admin';

type Reminder = {
  _id: string;
  user_id: { _id: string; name: string; email: string } | null;
  title: string;
  type: string;
  status: 'pending' | 'completed' | 'canceled';
  remind_at: string;
  created_at: string;
};

export default function AdminRemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // States for sending manual notification modal
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetchReminders = async (pageNumber: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await getAdminReminders({ page: pageNumber, limit: 10 });
      if (isInitial) {
        setReminders(res.reminders);
      } else {
        setReminders(prev => [...prev, ...res.reminders]);
      }
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải nhắc nhở: ' + (err.message || err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => fetchReminders(1, true));
  }, []);

  const handleSendNotification = async () => {
    if (!targetUserId.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập User ID người nhận.');
      return;
    }
    if (!notifyTitle.trim() || !notifyBody.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tiêu đề và nội dung.');
      return;
    }

    try {
      setSending(true);
      const res = await sendAdminManualNotification({
        userId: targetUserId.trim(),
        title: notifyTitle.trim(),
        body: notifyBody.trim(),
      });
      Alert.alert('Thành công', res.message || 'Gửi thông báo đẩy thành công!');
      setTargetUserId('');
      setNotifyTitle('');
      setNotifyBody('');
      setShowNotifyModal(false);
      fetchReminders(1, true);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể gửi thông báo: ' + (err.message || err));
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <View style={[styles.badge, styles.badgeSuccess]}>
            <CheckCircle size={10} color="#10B981" style={{ marginRight: 3 }} />
            <Text style={[styles.badgeText, styles.badgeTextSuccess]}>Đã xong</Text>
          </View>
        );
      case 'canceled':
        return (
          <View style={[styles.badge, styles.badgeDanger]}>
            <XCircle size={10} color="#EF4444" style={{ marginRight: 3 }} />
            <Text style={[styles.badgeText, styles.badgeTextDanger]}>Đã hủy</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, styles.badgeWarning]}>
            <Clock size={10} color="#F59E0B" style={{ marginRight: 3 }} />
            <Text style={[styles.badgeText, styles.badgeTextWarning]}>Chờ chạy</Text>
          </View>
        );
    }
  };

  const renderReminderItem = ({ item }: { item: Reminder }) => {
    const formattedDate = item.remind_at
      ? new Date(item.remind_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
      : 'Không rõ';

    return (
      <View style={styles.reminderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Bell size={16} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.reminderTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          {getStatusBadge(item.status)}
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.cardUser}>Nông dân: {item.user_id?.name || 'Ẩn danh'} ({item.user_id?.email || 'N/A'})</Text>
          <Text style={styles.cardMeta}>Mã người dùng: {item.user_id?._id || 'N/A'}</Text>
          <View style={styles.cardTimeRow}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.timeText}>Thời gian hẹn: {formattedDate}</Text>
          </View>
          <Text style={styles.cardType}>Loại lịch: {item.type.toUpperCase()}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader 
        title="Nhắc nhở & Gửi tin" 
        showBack={true} 
        fallbackHref="/admin" 
        rightElement={
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => setShowNotifyModal(true)}
            activeOpacity={0.7}
          >
            <Send size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : reminders.length === 0 ? (
        <View style={styles.centerContainer}>
          <AlertCircle size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>Chưa có lịch nhắc nhở nào hệ thống ({total})</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item, index) => item._id ? `reminder-${item._id}-${index}` : `reminder-${index}`}
          renderItem={renderReminderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (page < totalPages) fetchReminders(page + 1);
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
        />
      )}

      {/* Send Notification Modal */}
      <Modal
        visible={showNotifyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi thông báo thủ công</Text>
              <TouchableOpacity onPress={() => setShowNotifyModal(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Input 
                label="Mã người dùng (User ID)"
                placeholder="Nhập mã ID người dùng nhận..."
                value={targetUserId}
                onChangeText={setTargetUserId}
              />
              <Input 
                label="Tiêu đề thông báo"
                placeholder="Nhập tiêu đề..."
                value={notifyTitle}
                onChangeText={setNotifyTitle}
              />
              <Input 
                label="Nội dung thông báo (Body)"
                placeholder="Nhập chi tiết nội dung tin nhắn..."
                value={notifyBody}
                onChangeText={setNotifyBody}
                multiline={true}
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />

              <Button 
                title="Gửi thông báo"
                isLoading={sending}
                onPress={handleSendNotification}
                icon={<Send size={18} color="#FFF" style={{ marginRight: 6 }} />}
                style={{ marginTop: 16 }}
              />
            </ScrollView>
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
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
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
  reminderCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  reminderTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextSuccess: {
    color: '#10B981',
  },
  badgeTextDanger: {
    color: '#EF4444',
  },
  badgeTextWarning: {
    color: '#F59E0B',
  },
  cardBody: {
    gap: 4,
  },
  cardUser: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain,
  },
  cardMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  timeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cardType: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
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
    minHeight: '50%',
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
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  }
});
