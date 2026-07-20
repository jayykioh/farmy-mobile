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
  ScrollView,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Database, 
  MessageSquare, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Plus,
  RefreshCw,
  X
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { 
  getAdminChatSessions, 
  getAdminRAGFiles, 
  deleteAdminRAGFile, 
  validateAdminRAGFile, 
  confirmAdminRAGFile,
  batchEmbedAdminRAGFiles,
  createAdminRAGFile 
} from '../../src/api/admin';

type ChatSession = {
  _id: string;
  title: string;
  user_id: { name: string; email: string } | null;
  last_message_at: string;
  created_at: string;
};

type RAGFile = {
  _id: string;
  title: string;
  category: string;
  content?: string;
  embed_status: 'pending' | 'processing' | 'done' | 'error';
  validation_status: 'unvalidated' | 'validating' | 'validated' | 'rejected' | 'confirmed';
  validation_report?: {
    score?: number;
    issues?: string[];
    summary?: string;
    note?: string;
  };
  created_at: string;
};

export default function AdminRAGScreen() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'files'>('sessions');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [files, setFiles] = useState<RAGFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sessions pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Modal / Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review detail modal state
  const [selectedFile, setSelectedFile] = useState<RAGFile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNote, setReviewNote] = useState('');

  const fetchSessions = async (pageNumber: number, isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const res = await getAdminChatSessions({ page: pageNumber, limit: 10 });
      if (isInitial) {
        setSessions(res.sessions);
      } else {
        setSessions(prev => [...prev, ...res.sessions]);
      }
      setTotalPages(res.totalPages);
      setPage(pageNumber);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải phiên chat: ' + (err.message || err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await getAdminRAGFiles();
      setFiles(res);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải tài liệu RAG: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      void Promise.resolve().then(() => fetchSessions(1, true));
    } else {
      void Promise.resolve().then(fetchFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDeleteFile = (file: RAGFile) => {
    Alert.alert(
      'Xóa tri thức RAG',
      `Bạn có chắc chắn muốn xóa tài liệu "${file.title}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAdminRAGFile(file._id);
              Alert.alert('Thành công', 'Đã xóa tài liệu tri thức thành công!');
              setShowReviewModal(false);
              setSelectedFile(null);
              fetchFiles();
            } catch (err: any) {
              Alert.alert('Lỗi', 'Không thể xóa tài liệu: ' + (err.message || err));
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleValidateFile = async (fileId: string) => {
    try {
      setActionLoading('validate');
      await validateAdminRAGFile(fileId);
      Alert.alert('Thành công', 'Đã gửi yêu cầu kiểm định AI thành công!');
      setShowReviewModal(false);
      setSelectedFile(null);
      fetchFiles();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Lỗi khi kiểm định RAG: ' + (err.message || err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmFile = async (fileId: string, action: 'confirm' | 'reject') => {
    try {
      setActionLoading(action);
      await confirmAdminRAGFile(fileId, { action, note: reviewNote });
      Alert.alert('Thành công', `Đã ${action === 'confirm' ? 'duyệt' : 'từ chối'} tài liệu tri thức.`);
      setShowReviewModal(false);
      setSelectedFile(null);
      setReviewNote('');
      fetchFiles();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Lỗi khi duyệt RAG: ' + (err.message || err));
    } finally {
      setActionLoading(null);
    }
  };

  const handleBatchEmbed = () => {
    Alert.alert(
      'Đồng bộ AI Vector',
      'Đồng bộ toàn bộ tài liệu đã được duyệt vào Vector Database. Quá trình này có thể mất vài phút.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng bộ', 
          onPress: async () => {
            try {
              setLoading(true);
              const res = await batchEmbedAdminRAGFiles();
              Alert.alert('Thành công', res.message || 'Đã gửi yêu cầu đồng bộ Vector DB!');
              fetchFiles();
            } catch (err: any) {
              Alert.alert('Lỗi', 'Lỗi đồng bộ: ' + (err.message || err));
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddFile = async () => {
    if (!newTitle.trim() || !newCategory.trim() || !newContent.trim()) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    try {
      setActionLoading('create');
      await createAdminRAGFile({
        title: newTitle,
        category: newCategory,
        content: newContent
      });
      Alert.alert('Thành công', 'Đã thêm tài liệu tri thức mới thành công!');
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewCategory('');
      setNewContent('');
      fetchFiles();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tạo tài liệu: ' + (err.message || err));
    } finally {
      setActionLoading(null);
    }
  };

  const renderEmbedStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={16} color="#10B981" />;
      case 'processing':
        return <ActivityIndicator size="small" color="#3B82F6" style={{ width: 16, height: 16 }} />;
      case 'error':
        return <XCircle size={16} color="#EF4444" />;
      default:
        return <HelpCircle size={16} color={colors.borderMain} />;
    }
  };

  const renderValidationBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'validated':
        return (
          <View style={[styles.badge, styles.badgeSuccess]}>
            <Text style={[styles.badgeText, styles.badgeTextSuccess]}>Hợp lệ</Text>
          </View>
        );
      case 'validating':
        return (
          <View style={[styles.badge, styles.badgeInfo]}>
            <Text style={[styles.badgeText, styles.badgeTextInfo]}>Kiểm định...</Text>
          </View>
        );
      case 'rejected':
        return (
          <View style={[styles.badge, styles.badgeDanger]}>
            <Text style={[styles.badgeText, styles.badgeTextDanger]}>Từ chối</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, styles.badgeNeutral]}>
            <Text style={[styles.badgeText, styles.badgeTextNeutral]}>Chưa kiểm định</Text>
          </View>
        );
    }
  };

  const renderSessionItem = ({ item }: { item: ChatSession }) => {
    const lastActive = item.last_message_at
      ? new Date(item.last_message_at).toLocaleDateString('vi-VN')
      : 'Không rõ';
    return (
      <View style={styles.card}>
        <View style={styles.sessionMain}>
          <MessageSquare size={20} color={colors.primary} style={styles.cardIcon} />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle} numberOfLines={1}>{item.title || 'Hội thoại AI'}</Text>
            <Text style={styles.sessionUser}>Người dùng: {item.user_id?.name || 'Ẩn danh'}</Text>
            <View style={styles.cardMeta}>
              <Calendar size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>Cuối: {lastActive}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderRAGItem = ({ item }: { item: RAGFile }) => {
    const createdDate = item.created_at
      ? new Date(item.created_at).toLocaleDateString('vi-VN')
      : 'Không rõ';
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          setSelectedFile(item);
          setShowReviewModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.ragMain}>
          <FileText size={20} color="#6366F1" style={styles.cardIcon} />
          <View style={styles.ragInfo}>
            <Text style={styles.ragTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.ragCategory}>Danh mục: {item.category}</Text>
            <View style={styles.cardMeta}>
              <Calendar size={12} color={colors.textMuted} />
              <Text style={styles.metaText}>{createdDate}</Text>
            </View>
          </View>
          <View style={styles.ragStatus}>
            {renderEmbedStatusIcon(item.embed_status)}
            {renderValidationBadge(item.validation_status)}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader title="Quản lý tri thức RAG" showBack={true} fallbackHref="/admin" />
      
      {/* Top Tab Bar */}
      <View style={styles.tabsHeader}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'sessions' && styles.tabActive]}
          onPress={() => setActiveTab('sessions')}
        >
          <MessageSquare size={16} color={activeTab === 'sessions' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.tabTextActive]}>Phiên Chat AI</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'files' && styles.tabActive]}
          onPress={() => setActiveTab('files')}
        >
          <Database size={16} color={activeTab === 'files' ? colors.primary : colors.textMuted} />
          <Text style={[styles.tabText, activeTab === 'files' && styles.tabTextActive]}>Tài liệu RAG</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons for Files */}
      {activeTab === 'files' && !loading && (
        <View style={styles.actionHeader}>
          <TouchableOpacity 
            style={[styles.miniBtn, styles.miniBtnSecondary]}
            onPress={handleBatchEmbed}
          >
            <RefreshCw size={14} color={colors.primary} />
            <Text style={styles.miniBtnTextSecondary}>Đồng bộ AI (Batch)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.miniBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus size={14} color="#FFFFFF" />
            <Text style={styles.miniBtnText}>Thêm tài liệu</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === 'sessions' ? (
        <FlatList
          data={sessions}
          keyExtractor={(item, index) => item._id ? `session-${item._id}-${index}` : `session-${index}`}
          renderItem={renderSessionItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => fetchSessions(page + 1)}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không tìm thấy phiên chat nào</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item, index) => item._id ? `file-${item._id}-${index}` : `file-${index}`}
          renderItem={renderRAGItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không tìm thấy tài liệu tri thức nào</Text>
            </View>
          }
        />
      )}

      {/* Create RAG File Modal */}
      <Modal
        visible={isAddModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm tri thức RAG mới</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Input 
                label="Tiêu đề tài liệu"
                placeholder="Ví dụ: Kỹ thuật chăm sóc cải ngọt..."
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <Input 
                label="Danh mục (Category)"
                placeholder="Ví dụ: crops, diseases, tips..."
                value={newCategory}
                onChangeText={setNewCategory}
              />
              
              <Text style={styles.textareaLabel}>Nội dung tri thức</Text>
              <View style={styles.textareaContainer}>
                <TextInput
                  style={styles.textarea}
                  multiline={true}
                  numberOfLines={10}
                  placeholder="Nhập nội dung văn bản cho tài liệu tri thức huấn luyện AI..."
                  value={newContent}
                  onChangeText={setNewContent}
                  textAlignVertical="top"
                />
              </View>

              <Button 
                title="Lưu tài liệu"
                isLoading={actionLoading === 'create'}
                onPress={handleAddFile}
                style={{ marginTop: 16 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail & Review RAG File Modal */}
      <Modal
        visible={showReviewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDetail}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>Kiểm định & Duyệt RAG</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            {selectedFile && (
              <ScrollView contentContainerStyle={styles.detailBody}>
                <Text style={styles.detailTitle}>{selectedFile.title}</Text>
                <View style={styles.detailTags}>
                  <View style={styles.detailTag}><Text style={styles.detailTagText}>Danh mục: {selectedFile.category}</Text></View>
                  <View style={styles.detailTag}>{renderEmbedStatusIcon(selectedFile.embed_status)}<Text style={styles.detailTagText}> Vector DB: {selectedFile.embed_status.toUpperCase()}</Text></View>
                </View>

                {/* Validation report status */}
                <View style={styles.reportCard}>
                  <Text style={styles.reportTitle}>Kết quả kiểm định AI</Text>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Trạng thái:</Text>
                    {renderValidationBadge(selectedFile.validation_status)}
                  </View>
                  {selectedFile.validation_report && (
                    <View style={styles.reportExtra}>
                      <Text style={styles.reportLabel}>Điểm tin cậy: <Text style={{fontWeight: '700'}}>{selectedFile.validation_report.score ?? 'N/A'}/10</Text></Text>
                      {selectedFile.validation_report.summary && (
                        <Text style={styles.reportText}>Tóm tắt: {selectedFile.validation_report.summary}</Text>
                      )}
                      {selectedFile.validation_report.issues && selectedFile.validation_report.issues.length > 0 && (
                        <View style={{marginTop: 8}}>
                          <Text style={[styles.reportLabel, {color: colors.error}]}>Vấn đề phát hiện:</Text>
                          {selectedFile.validation_report.issues.map((iss: string, idx: number) => (
                            <Text key={idx} style={styles.issueText}>• {iss}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Decision review input */}
                {(selectedFile.validation_status === 'unvalidated' || selectedFile.validation_status === 'validating') ? (
                  <Button 
                    title="Gửi kiểm định AI (Validate)"
                    variant="secondary"
                    isLoading={actionLoading === 'validate'}
                    onPress={() => handleValidateFile(selectedFile._id)}
                    style={{ marginBottom: 12 }}
                  />
                ) : (
                  <View style={styles.reviewForm}>
                    <Input 
                      label="Ghi chú duyệt/từ chối"
                      placeholder="Nhập lý do duyệt hoặc ghi chú lỗi tài liệu..."
                      value={reviewNote}
                      onChangeText={setReviewNote}
                    />
                    <View style={styles.reviewActions}>
                      <TouchableOpacity 
                        style={[styles.actionConfirmBtn, {backgroundColor: '#10B981'}]}
                        onPress={() => handleConfirmFile(selectedFile._id, 'confirm')}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'confirm' ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.actionBtnText}>Phê duyệt</Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionConfirmBtn, {backgroundColor: '#EF4444'}]}
                        onPress={() => handleConfirmFile(selectedFile._id, 'reject')}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'reject' ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.actionBtnText}>Từ chối</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <Button 
                  title="Xóa tài liệu tri thức"
                  variant="danger"
                  isLoading={actionLoading === 'delete'}
                  onPress={() => handleDeleteFile(selectedFile)}
                  style={{ marginTop: 16 }}
                />
              </ScrollView>
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
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '40',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  miniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  miniBtnSecondary: {
    backgroundColor: colors.primaryLightest,
  },
  miniBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  miniBtnTextSecondary: {
    fontSize: 11,
    fontWeight: '800',
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
  card: {
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
  cardIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  sessionMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  sessionUser: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  ragMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ragInfo: {
    flex: 1,
  },
  ragTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  ragCategory: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  ragStatus: {
    alignItems: 'flex-end',
    gap: 8,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  badgeInfo: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  badgeDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  badgeNeutral: {
    backgroundColor: colors.bgMain,
    borderColor: colors.borderMain + '40',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextSuccess: {
    color: '#10B981',
  },
  badgeTextInfo: {
    color: '#3B82F6',
  },
  badgeTextDanger: {
    color: '#EF4444',
  },
  badgeTextNeutral: {
    color: colors.textMuted,
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
    minHeight: '60%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
  },
  modalContentDetail: {
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
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  textareaLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  textareaContainer: {
    borderWidth: 1,
    borderColor: colors.borderMain,
    backgroundColor: colors.bgSurface,
    borderRadius: 14,
    minHeight: 140,
    padding: 12,
  },
  textarea: {
    flex: 1,
    ...typography.body,
    color: colors.textMain,
  },
  detailBody: {
    padding: 20,
    paddingBottom: 40,
  },
  detailTitle: {
    ...typography.h3,
    color: colors.textMain,
    marginBottom: 8,
  },
  detailTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  detailTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
  },
  reportCard: {
    backgroundColor: colors.bgMain,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  reportTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8,
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reportLabel: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textMuted,
  },
  reportExtra: {
    borderTopWidth: 1,
    borderTopColor: colors.borderMain + '30',
    paddingTop: 8,
    marginTop: 4,
    gap: 6,
  },
  reportText: {
    ...typography.bodySmall,
    color: colors.textMain,
  },
  issueText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewForm: {
    marginTop: 8,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionConfirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    ...typography.buttonText,
    color: '#FFFFFF',
  }
});
