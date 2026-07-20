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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Tag, 
  ImageIcon, 
  Sparkles,
  Lock
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { getAdminSkins, createAdminSkin, updateAdminSkin, deleteAdminSkin } from '../../src/api/admin';

export type ShopItemInfo = {
  _id: string;
  name: string;
  category: 'HAT' | 'OUTFIT' | 'EFFECT' | 'BACKGROUND';
  price: number;
  required_level: number;
  image_url: string;
  anchor?: {
    top?: string;
    left?: string;
    width?: string;
    transform?: string;
    zIndex?: number;
  };
};

function SkinItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: ShopItemInfo; 
  onEdit: (item: ShopItemInfo) => void;
  onDelete: (item: ShopItemInfo) => void;
}) {
  const [imgError, setImgError] = useState(false);
  // Backend stores relative paths like "/shop/non-la.svg".
  // Images are served at origin level (http://host:port/shop/...), NOT under /api/v1.
  // So we extract just the origin from the full API URL.
  const imageUri = React.useMemo(() => {
    if (!item.image_url) return null;
    if (item.image_url.startsWith('http')) return item.image_url;
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
      const origin = apiUrl ? new URL(apiUrl).origin : '';
      return `${origin}${item.image_url}`;
    } catch {
      return item.image_url;
    }
  }, [item.image_url]);
  return (
    <View style={styles.skinCard}>
      <View style={styles.skinMedia}>
        {imageUri && !imgError ? (
          <Image 
            source={{ uri: imageUri }} 
            style={styles.skinImg} 
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.imgPlaceholder}>
            <ImageIcon size={24} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.skinInfo}>
        <Text style={styles.skinName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaRow}>
          <Tag size={12} color={colors.primary} />
          <Text style={styles.metaText}>{item.price} Xu</Text>
        </View>
        <View style={styles.metaRow}>
          <Lock size={12} color={colors.textMuted} />
          <Text style={styles.metaText}>Cấp độ: {item.required_level}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(item)}
          activeOpacity={0.7}
        >
          <Edit size={14} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(item)}
          activeOpacity={0.7}
        >
          <Trash2 size={14} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminSkinsScreen() {
  const [skins, setSkins] = useState<ShopItemInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkin, setEditingSkin] = useState<ShopItemInfo | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fields State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'HAT' | 'OUTFIT' | 'EFFECT' | 'BACKGROUND'>('HAT');
  const [price, setPrice] = useState('100');
  const [requiredLevel, setRequiredLevel] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  
  // Anchor states
  const [anchorTop, setAnchorTop] = useState('');
  const [anchorLeft, setAnchorLeft] = useState('');
  const [anchorWidth, setAnchorWidth] = useState('');
  const [anchorTransform, setAnchorTransform] = useState('');
  const [anchorZIndex, setAnchorZIndex] = useState('');

  const fetchSkins = async () => {
    try {
      setLoading(true);
      const data = await getAdminSkins();
      setSkins(data);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách skin: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchSkins);
  }, []);

  const openAddModal = () => {
    setEditingSkin(null);
    setName('');
    setCategory('HAT');
    setPrice('100');
    setRequiredLevel('1');
    setImageUrl('');
    setAnchorTop('');
    setAnchorLeft('');
    setAnchorWidth('');
    setAnchorTransform('');
    setAnchorZIndex('');
    setIsModalOpen(true);
  };

  const openEditModal = (skin: ShopItemInfo) => {
    setEditingSkin(skin);
    setName(skin.name);
    setCategory(skin.category);
    setPrice(skin.price.toString());
    setRequiredLevel(skin.required_level.toString());
    setImageUrl(skin.image_url);
    setAnchorTop(skin.anchor?.top || '');
    setAnchorLeft(skin.anchor?.left || '');
    setAnchorWidth(skin.anchor?.width || '');
    setAnchorTransform(skin.anchor?.transform || '');
    setAnchorZIndex(skin.anchor?.zIndex?.toString() || '');
    setIsModalOpen(true);
  };

  const handleDelete = (skin: ShopItemInfo) => {
    Alert.alert(
      'Xóa skin',
      `Bạn có chắc chắn muốn xóa skin "${skin.name}" không?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAdminSkin(skin._id);
              Alert.alert('Thành công', 'Đã xóa skin thành công!');
              fetchSkins();
            } catch (err: any) {
              Alert.alert('Lỗi', 'Không thể xóa skin: ' + (err.message || err));
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !imageUrl.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tên và đường dẫn ảnh.');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      price: parseInt(price) || 0,
      required_level: parseInt(requiredLevel) || 1,
      image_url: imageUrl.trim(),
      anchor: {
        top: anchorTop.trim() || undefined,
        left: anchorLeft.trim() || undefined,
        width: anchorWidth.trim() || undefined,
        transform: anchorTransform.trim() || undefined,
        zIndex: parseInt(anchorZIndex) || undefined,
      }
    };

    try {
      setActionLoading(true);
      if (editingSkin) {
        await updateAdminSkin(editingSkin._id, payload);
        Alert.alert('Thành công', 'Cập nhật skin thành công!');
      } else {
        await createAdminSkin(payload);
        Alert.alert('Thành công', 'Tạo skin mới thành công!');
      }
      setIsModalOpen(false);
      fetchSkins();
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể lưu skin: ' + (err.message || err));
    } finally {
      setActionLoading(false);
    }
  };

  const renderSkinItem = ({ item }: { item: ShopItemInfo }) => (
    <SkinItem item={item} onEdit={openEditModal} onDelete={handleDelete} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader 
        title="Trang phục thú cưng" 
        showBack={true} 
        fallbackHref="/admin"
        rightElement={
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={openAddModal}
            activeOpacity={0.7}
          >
            <Plus size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />
      
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : skins.length === 0 ? (
        <View style={styles.centerContainer}>
          <Sparkles size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>Chưa có skin nào trong cửa hàng</Text>
        </View>
      ) : (
        <FlatList
          data={skins}
          keyExtractor={(item, index) => item._id ? `skin-${item._id}-${index}` : `skin-${index}`}
          renderItem={renderSkinItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add / Edit Skin Modal */}
      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingSkin ? 'Sửa phụ kiện' : 'Thêm phụ kiện mới'}</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={20} color={colors.textMain} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formContainer}>
              <Input 
                label="Tên phụ kiện"
                placeholder="Ví dụ: Nón rơm Bé Thóc..."
                value={name}
                onChangeText={setName}
              />
              
              {/* Category tabs selection */}
              <Text style={styles.fieldLabel}>Phân loại</Text>
              <View style={styles.tabsHeader}>
                {(['HAT', 'OUTFIT', 'EFFECT', 'BACKGROUND'] as const).map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.tab, category === cat && styles.tabActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.tabText, category === cat && styles.tabTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Input 
                    label="Giá bán (Xu)"
                    placeholder="100"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Input 
                    label="Cấp độ yêu cầu"
                    placeholder="1"
                    keyboardType="numeric"
                    value={requiredLevel}
                    onChangeText={setRequiredLevel}
                  />
                </View>
              </View>

              <Input 
                label="Đường dẫn hình ảnh (URL)"
                placeholder="Nhập link ảnh (PNG/JPG)..."
                value={imageUrl}
                onChangeText={setImageUrl}
              />

              {/* Anchor settings */}
              <View style={styles.anchorSection}>
                <Text style={styles.anchorSecTitle}>Thông số định vị Mascot (Anchor)</Text>
                
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Input 
                      label="Top"
                      placeholder="e.g. 20%"
                      value={anchorTop}
                      onChangeText={setAnchorTop}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Input 
                      label="Left"
                      placeholder="e.g. 5px"
                      value={anchorLeft}
                      onChangeText={setAnchorLeft}
                    />
                  </View>
                </View>
                <View style={styles.rowFields}>
                  <View style={{ flex: 1 }}>
                    <Input 
                      label="Width"
                      placeholder="e.g. 50%"
                      value={anchorWidth}
                      onChangeText={setAnchorWidth}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Input 
                      label="Transform"
                      placeholder="e.g. scaleX(-1)"
                      value={anchorTransform}
                      onChangeText={setAnchorTransform}
                    />
                  </View>
                </View>
                <Input 
                  label="Z-Index"
                  placeholder="e.g. 10"
                  keyboardType="numeric"
                  value={anchorZIndex}
                  onChangeText={setAnchorZIndex}
                />
              </View>

              <Button 
                title={editingSkin ? "Cập nhật" : "Tạo mới"}
                isLoading={actionLoading}
                onPress={handleSave}
                style={{ marginTop: 24, marginBottom: 20 }}
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
  skinCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  skinMedia: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    position: 'relative',
    overflow: 'hidden',
  },
  skinImg: {
    width: 60,
    height: 60,
  },
  imgPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 1,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 7,
    fontWeight: '900',
    color: '#FFF',
  },
  skinInfo: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 2,
  },
  skinName: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: colors.primaryLightest,
    borderColor: colors.primary + '30',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
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
  fieldLabel: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 8,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bgMain,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  rowFields: {
    flexDirection: 'row',
  },
  anchorSection: {
    backgroundColor: colors.bgMain,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    marginTop: 12,
    gap: 4,
  },
  anchorSecTitle: {
    ...typography.bodySmall,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 12,
  }
});
