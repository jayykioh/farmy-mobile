import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Modal 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search as SearchIcon, 
  Shield, 
  User as UserIcon, 
  Edit, 
  X, 
  Calendar 
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { getAdminUsers, updateAdminUserRole, deleteAdminUser, type UserAdminInfo } from '../../src/api/admin';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserAdminInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal / Action state
  const [selectedUser, setSelectedUser] = useState<UserAdminInfo | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async (pageNumber: number, isInitial = false) => {
    if (pageNumber > totalPages && !isInitial) return;
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const res = await getAdminUsers({ 
        page: pageNumber, 
        limit: 10, 
        search, 
        role: roleFilter 
      });

      if (isInitial) {
        setUsers(res.users);
      } else {
        setUsers(prev => [...prev, ...res.users]);
      }
      setTotal(res.total);
      setTotalPages(res.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng: ' + (err.message || err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [totalPages, search, roleFilter]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchUsers(1, true));
  }, [roleFilter, fetchUsers]);

  const handleSearch = () => {
    void Promise.resolve().then(() => fetchUsers(1, true));
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      setActionLoading(true);
      await updateAdminUserRole(userId, newRole);
      Alert.alert('Thành công', 'Cập nhật vai trò người dùng thành công!');
      setShowActionModal(false);
      setSelectedUser(null);
      fetchUsers(1, true);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò: ' + (err.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = (user: UserAdminInfo) => {
    Alert.alert(
      'Xóa người dùng',
      `Bạn có chắc chắn muốn xóa/khóa tài khoản "${user.name}" không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAdminUser(user.id);
              Alert.alert('Thành công', 'Đã khóa tài khoản thành công!');
              setShowActionModal(false);
              setSelectedUser(null);
              fetchUsers(1, true);
            } catch (err: any) {
              Alert.alert('Lỗi', 'Không thể khóa tài khoản: ' + (err.message || err));
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderRoleBadge = (role: string) => {
    const isAdmin = role.toLowerCase() === 'admin';
    return (
      <View style={[styles.badge, isAdmin ? styles.badgeAdmin : styles.badgeUser]}>
        {isAdmin ? (
          <Shield size={12} color="#EF4444" style={{ marginRight: 4 }} />
        ) : (
          <UserIcon size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
        )}
        <Text style={[styles.badgeText, isAdmin ? styles.badgeTextAdmin : styles.badgeTextUser]}>
          {isAdmin ? 'Admin' : 'Farmer'}
        </Text>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: UserAdminInfo }) => {
    const formattedDate = item.createdAt || item.created_at
      ? new Date(item.createdAt || item.created_at || '').toLocaleDateString('vi-VN')
      : 'Không rõ';

    return (
      <View style={styles.userCard}>
        <View style={styles.userMain}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.userMeta}>
              <Calendar size={12} color={colors.textMuted} />
              <Text style={styles.userDate}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.rightActions}>
            {renderRoleBadge(item.role)}
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => {
                setSelectedUser(item);
                setShowActionModal(true);
              }}
              activeOpacity={0.7}
            >
              <Edit size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader title="Quản lý thành viên" showBack={true} fallbackHref="/admin" />
      
      {/* Search & Filter Header */}
      <View style={styles.filterSection}>
        <Input 
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          icon={<SearchIcon size={18} color={colors.textMuted} />}
          style={{ height: 46 }}
        />
        <View style={styles.filterTabs}>
          <TouchableOpacity 
            style={[styles.filterTab, roleFilter === '' && styles.filterTabActive]}
            onPress={() => setRoleFilter('')}
          >
            <Text style={[styles.filterTabText, roleFilter === '' && styles.filterTabTextActive]}>Tất cả ({total})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, roleFilter === 'farmer' && styles.filterTabActive]}
            onPress={() => setRoleFilter('farmer')}
          >
            <Text style={[styles.filterTabText, roleFilter === 'farmer' && styles.filterTabTextActive]}>Nông dân</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterTab, roleFilter === 'admin' && styles.filterTabActive]}
            onPress={() => setRoleFilter('admin')}
          >
            <Text style={[styles.filterTabText, roleFilter === 'admin' && styles.filterTabTextActive]}>Quản trị viên</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* User list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Không tìm thấy thành viên nào</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, index) => item.id ? String(item.id) : `user-${index}`}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => fetchUsers(page + 1)}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
        />
      )}

      {/* User Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật tài khoản</Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            
            {selectedUser && (
              <View style={styles.modalBody}>
                <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                <Text style={styles.modalUserRoleLabel}>Vai trò hiện tại: <Text style={{fontWeight: '700'}}>{selectedUser.role.toUpperCase()}</Text></Text>

                <View style={styles.modalActions}>
                  {selectedUser.role.toLowerCase() === 'admin' ? (
                    <Button 
                      title="Gỡ quyền Admin (Demote)"
                      variant="outline"
                      isLoading={actionLoading}
                      onPress={() => handleUpdateRole(selectedUser.id, 'farmer')}
                      style={{ marginBottom: 12 }}
                    />
                  ) : (
                    <Button 
                      title="Thăng quyền Admin (Promote)"
                      variant="primary"
                      isLoading={actionLoading}
                      onPress={() => handleUpdateRole(selectedUser.id, 'admin')}
                      style={{ marginBottom: 12 }}
                    />
                  )}
                  
                  <Button 
                    title="Khóa/Xóa tài khoản"
                    variant="danger"
                    isLoading={actionLoading}
                    onPress={() => handleDeleteUser(selectedUser)}
                  />
                </View>
              </View>
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
  filterSection: {
    backgroundColor: colors.bgSurface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '40',
    paddingBottom: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
  },
  filterTabActive: {
    backgroundColor: colors.primaryLightest,
    borderColor: colors.primary + '50',
  },
  filterTabText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: colors.primary,
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
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  userCard: {
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
  userMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    paddingRight: 12,
  },
  userName: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  userDate: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  rightActions: {
    alignItems: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeAdmin: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgeUser: {
    backgroundColor: colors.bgMain,
    borderColor: colors.borderMain + '40',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  badgeTextAdmin: {
    color: '#EF4444',
  },
  badgeTextUser: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
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
  modalBody: {
    padding: 20,
  },
  modalUserName: {
    ...typography.h3,
    textAlign: 'center',
    color: colors.textMain,
  },
  modalUserEmail: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  modalUserRoleLabel: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.textMain,
  },
  modalActions: {
    marginTop: 8,
  }
});
