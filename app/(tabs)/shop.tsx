import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { PageHeader } from '../../src/components/PageHeader';
import { Star, Lock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { usePetStatus } from '../../src/hooks/usePet';
import { getErrorMessage } from '../../src/utils/errors';
import { PetMascot } from '../../src/features/pet/components/PetMascot';
import { ShopItemImage } from '../../src/features/shop/components/ShopItemImage';
import { buyShopItem, fetchShopItems, toggleEquipShopItem } from '../../src/features/shop/api';
import type { ShopItem, ShopItemViewModel } from '../../src/features/shop/types';
import type { PetEquipmentItem } from '../../src/features/pet/types';
import { useResponsiveLayout } from '../../src/hooks/useResponsiveLayout';

const toPetEquipmentItem = (item: ShopItemViewModel): PetEquipmentItem => ({
  _id: item._id,
  name: item.name,
  category: item.category,
  image_url: item.image_url,
  anchor: item.anchor,
});

export default function ShopScreen() {
  const { width, isCompact, isWide, gutter } = useResponsiveLayout();
  const gridGap = isCompact ? 10 : 12;
  const gridWidth = Math.min(width, 760) - gutter * 2;
  const cardWidth = isWide ? (gridWidth - gridGap * 2) / 3 : (gridWidth - gridGap) / 2;
  const itemArtBoxSize = isCompact ? 74 : 84;
  const mascotSize = isCompact ? 116 : 128;

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
      setItems(await fetchShopItems());
      setItemsError(null);
    } catch (err) {
      setItemsError(getErrorMessage(err, 'Không thể tải cửa hàng.'));
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
      const res = await buyShopItem(itemId);
      if (res.success) {
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
      const res = await toggleEquipShopItem(itemId);
      if (res.success) {
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
      const res = await toggleEquipShopItem(itemId);
      if (res.success) {
        Alert.alert('Thành công', 'Đã tháo phụ kiện khỏi Bé Thóc');
        await handleRefresh();
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể tháo vật phẩm.');
    } finally {
      setPendingItemId(null);
    }
  };

  const normalizedItems: ShopItemViewModel[] = items.map(item => ({
    ...item,
    owned: petStatus?.ownedItems?.includes(item._id) ?? false,
    equipped: petStatus?.equippedItems?.includes(item._id) ?? false,
  }));
  const filteredItems = normalizedItems
    .filter(item => item.category === activeCategory)
    .sort((a, b) => a.required_level - b.required_level || a.price - b.price || a.name.localeCompare(b.name));
  const equippedItems = normalizedItems.filter(item => item.equipped);
  const equippedItem = equippedItems[0];

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
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: gutter }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoadingItems} onRefresh={handleRefresh} />}
      >
        
        {/* Preview Card */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>ĐANG TRANG BỊ</Text>
          <View style={styles.previewBox}>
            <PetMascot
              status={petStatus}
              size={mascotSize}
              equippedItemsDetails={equippedItems.map(toPetEquipmentItem)}
            />
          </View>
          <Text style={styles.previewItemName} numberOfLines={1}>
            {equippedItem ? equippedItems.map(item => item.name).join(', ') : 'Chưa trang bị'}
          </Text>
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
          <View style={[styles.gridContainer, { gap: gridGap }]}>
            {filteredItems.map(item => {
              const isLocked = level < item.required_level;
              const canAfford = xp >= item.price;
              const isPending = pendingItemId === item._id;

              return (
                <View key={item._id} style={[styles.itemCard, { width: cardWidth }, item.equipped ? styles.itemCardEquipped : null]}>
                  <View style={[styles.itemImageContainer, { width: itemArtBoxSize, height: itemArtBoxSize }]}>
                    {!isLocked ? (
                      item.image_url ? (
                        <ShopItemImage imageUrl={item.image_url} name={item.name} style={styles.itemImage} />
                      ) : (
                        <Text style={{ fontSize: 40 }}>👑</Text>
                      )
                    ) : (
                      <View style={styles.lockedContainer}>
                        <Lock size={24} color={colors.borderMain} />
                         <Text style={styles.lockedText}>Cấp {item.required_level}</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  
                  <View style={styles.priceTag}>
                    <Star size={12} color="#EAB308" fill="#EAB308" />
                    <Text style={styles.priceText}>{item.price}</Text>
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
    backgroundColor: '#F2F2F7', // Apple system background
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  levelPill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
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
    paddingVertical: 10,
    borderRadius: 999, // Pill shape
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryChipActive: {
    backgroundColor: '#1C1C1E', // Dark mode contrast for active state
  },
  categoryText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: '#8E8E93',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32, // Squircle
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 16,
  },
  previewBox: {
    width: '100%',
    height: 160,
    backgroundColor: '#F2F2F7',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    position: 'relative',
  },
  previewItemName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  errorState: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  errorText: {
    ...typography.bodySmall,
    color: '#FF3B30', // Apple standard red
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    width: 140,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // Squircle
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  itemCardEquipped: {
    borderWidth: 2,
    borderColor: '#1C1C1E', // Apple active outline
  },
  itemImageContainer: {
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  itemImage: {
    width: '75%',
    height: '75%',
  },
  lockedContainer: {
    alignItems: 'center',
    gap: 6,
  },
  lockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  itemName: {
    ...typography.caption,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 6,
    textAlign: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 16,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 999, // Pill shape
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnUnequip: {
    backgroundColor: '#FF3B30', // Apple red
  },
  btnTextUnequip: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnOwned: {
    backgroundColor: '#F2F2F7',
  },
  btnTextOwned: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  btnBuy: {
    backgroundColor: '#1C1C1E', // Dark primary button
  },
  btnTextBuy: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnLocked: {
    backgroundColor: '#F2F2F7',
    opacity: 0.6,
  },
  btnTextLocked: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  }
});
