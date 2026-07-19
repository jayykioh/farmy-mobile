import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Star, Lock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { usePetStatus } from '../src/hooks/usePet';
import { api } from '../src/api/client';
import { getErrorMessage } from '../src/utils/errors';

interface ShopItem {
  _id: string;
  name: string;
  category: string;
  price?: number;
  requiredLevel?: number;
  owned?: boolean;
  equipped?: boolean;
  img?: string;
}

export default function ShopScreen() {
  const categories = [
    { id: 'HAT', label: 'Mũ' },
    { id: 'OUTFIT', label: 'Trang phục' },
    { id: 'EFFECT', label: 'Hiệu ứng' },
    { id: 'BACKGROUND', label: 'Nền' },
  ];

  const [activeCategory, setActiveCategory] = useState('HAT');
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  
  const { data: petStatus, refetch: refetchPet } = usePetStatus();
  
  const level = petStatus?.level || 1;
  const xp = petStatus?.exp || 0;

  const fetchItems = async () => {
    try {
      setIsLoadingItems(true);
      const res = await api.get('/shop/items');
      if (res.data.success) {
        setItems(res.data.data);
        setItemsError(null);
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể tải cửa hàng.'));
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchItems);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([fetchItems(), refetchPet()]);
  };

  const handleBuy = async (itemId: string) => {
    try {
      setPendingItemId(itemId);
      const res = await api.post('/shop/buy', { itemId });
      if (res.data.success) {
        Alert.alert('Thành công', 'Mua phụ kiện thành công');
        await handleRefresh();
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể mua vật phẩm.'));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      setPendingItemId(itemId);
      const res = await api.post('/shop/equip', { itemId });
      if (res.data.success) {
        Alert.alert('Thành công', 'Thay đổi trang bị thành công');
        await handleRefresh();
      }
    } catch (err) {
      Alert.alert('Lỗi', getErrorMessage(err, 'Không thể trang bị vật phẩm.'));
    } finally {
      setPendingItemId(null);
    }
  };

  const handleUnequip = async (itemId: string) => {
    try {
      setPendingItemId(itemId);
      const res = await api.post('/shop/unequip', { itemId });
      if (res.data.success) {
        Alert.alert('Thành công', 'Đã tháo phụ kiện khỏi Bé Thóc');
        await handleRefresh();
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tháo vật phẩm.');
    } finally {
      setPendingItemId(null);
    }
  };

  const normalizedItems = items.map(item => ({
    ...item,
    price: item.price ?? 0,
    requiredLevel: item.requiredLevel ?? 1,
    owned: item.owned || petStatus?.ownedItems?.includes(item._id),
    equipped: item.equipped || petStatus?.equippedItems?.includes(item._id),
  }));
  const filteredItems = normalizedItems
    .filter(item => item.category === activeCategory)
    .sort((a, b) => (a.requiredLevel || 1) - (b.requiredLevel || 1) || (a.price || 0) - (b.price || 0) || a.name.localeCompare(b.name));
  const equippedItem = normalizedItems.find(item => item.equipped);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader 
        title="Cửa hàng" 
        fallbackHref="/(tabs)/profile"
        rightElement={
          <View style={styles.xpBadge}>
            <View style={styles.levelPill}>
              <Text style={styles.levelPillText}>Lv.{level}</Text>
            </View>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        } 
      />

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              style={[styles.categoryChip, activeCategory === cat.id ? styles.categoryChipActive : null]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={[styles.categoryText, activeCategory === cat.id ? styles.categoryTextActive : null]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoadingItems} onRefresh={handleRefresh} />}
      >
        
        {/* Preview Card */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>ĐANG TRANG BỊ</Text>
          <View style={styles.previewBox}>
            <View style={styles.mascotPlaceholder}>
              <Text style={styles.mascotEmoji}>🌱</Text>
            </View>
            {equippedItem && equippedItem.img && (
              <Image source={{ uri: equippedItem.img }} style={styles.equippedItemImg} />
            )}
          </View>
          <Text style={styles.previewItemName}>{equippedItem ? equippedItem.name : 'Chưa trang bị'}</Text>
        </View>

        {/* Items Grid */}
        {isLoadingItems ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : itemsError ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{itemsError}</Text>
            <TouchableOpacity style={[styles.actionBtn, styles.btnBuy, styles.retryBtn]} onPress={fetchItems}>
              <Text style={styles.btnTextBuy}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : filteredItems.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 24, color: colors.textMuted }}>Không có phụ phẩm nào thuộc mục này.</Text>
        ) : (
          <View style={styles.gridContainer}>
            {filteredItems.map(item => {
              const isLocked = level < (item.requiredLevel || 1);
              const canAfford = xp >= (item.price || 0);
              const isPending = pendingItemId === item._id;

              return (
                <View key={item._id} style={[styles.itemCard, item.equipped ? styles.itemCardEquipped : null]}>
                  <View style={styles.itemImageContainer}>
                    {!isLocked ? (
                      item.img ? (
                        <Image source={{ uri: item.img }} style={styles.itemImage} />
                      ) : (
                        <Text style={{ fontSize: 40 }}>👑</Text>
                      )
                    ) : (
                      <View style={styles.lockedContainer}>
                        <Lock size={24} color={colors.borderMain} />
                         <Text style={styles.lockedText}>Cấp {item.requiredLevel || 1}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  
                  <View style={styles.priceTag}>
                    <Star size={12} color="#EAB308" fill="#EAB308" />
                    <Text style={styles.priceText}>{item.price || 0}</Text>
                  </View>

                  {item.equipped ? (
                    <TouchableOpacity style={[styles.actionBtn, styles.btnUnequip]} onPress={() => handleUnequip(item._id)} disabled={!!pendingItemId}>
                      <Text style={styles.btnTextUnequip}>{isPending ? 'Đang tháo...' : 'Tháo'}</Text>
                    </TouchableOpacity>
                  ) : item.owned ? (
                    <TouchableOpacity style={[styles.actionBtn, styles.btnOwned]} onPress={() => handleEquip(item._id)} disabled={!!pendingItemId}>
                      <Text style={styles.btnTextOwned}>{isPending ? 'Đang mặc...' : 'Mặc thử'}</Text>
                    </TouchableOpacity>
                  ) : isLocked ? (
                    <View style={[styles.actionBtn, styles.btnLocked]}>
                      <Text style={styles.btnTextLocked}>Khóa</Text>
                    </View>
                  ) : canAfford ? (
                    <TouchableOpacity style={[styles.actionBtn, styles.btnBuy]} onPress={() => handleBuy(item._id)} disabled={!!pendingItemId}>
                      <Text style={styles.btnTextBuy}>{isPending ? 'Đang mua...' : 'Mua ngay'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.actionBtn, styles.btnLocked]}>
                      <Text style={styles.btnTextLocked}>Thiếu XP</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d0e5fa',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEF08A',
    gap: 4,
  },
  levelPill: {
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#854D0E',
  },
  categoryWrapper: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain + 'B0',
  },
  categoryTextActive: {
    color: colors.bgSurface,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 28,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMain + '60',
    letterSpacing: 1,
    marginBottom: 12,
  },
  previewBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    position: 'relative',
  },
  mascotPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bgSurface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.bgSurface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mascotEmoji: {
    fontSize: 50,
  },
  equippedItemImg: {
    position: 'absolute',
    top: 20,
    right: '20%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bgSurface,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },
  previewItemName: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  itemCard: {
    width: '47%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
  },
  itemCardEquipped: {
    borderColor: colors.primary + '50',
    backgroundColor: colors.primary + '05',
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: colors.bgSurface1,
    borderWidth: 1,
    borderColor: colors.borderMain + '20',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '80%',
    height: '80%',
  },
  lockedContainer: {
    alignItems: 'center',
    gap: 4,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.borderMain,
    textTransform: 'uppercase',
  },
  itemName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
    textAlign: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFCE8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEF08A',
    gap: 4,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#854D0E',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnUnequip: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  btnTextUnequip: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.error,
  },
  btnOwned: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.primary + '50',
  },
  btnTextOwned: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  btnBuy: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderMain + '50',
  },
  btnTextBuy: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMain,
  },
  btnLocked: {
    backgroundColor: colors.bgSurface1,
    borderColor: colors.borderMain + '20',
  },
  btnTextLocked: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMain + '50',
  }
});
