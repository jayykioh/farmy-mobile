import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Star, Lock } from 'lucide-react-native';
import { useState } from 'react';

const mockItems = [
  { id: '1', name: 'Mũ rơm nông dân', price: 100, category: 'HAT', requiredLevel: 1, owned: true, equipped: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDsbCWDiuGTF5iEwK2O9pm1CMMzFdWx0hc4ellAPSIR0Fd0W04AaUk2McKFTBpkyt54F7qbz59AxRVm00X7l_paTxXsYAhKb0DJ2UtW18iwcftc8NpvHSUtky7QtZ3LYS_Jvnwzb_uyHj7Snd_GZJ5qRjx6kGvs2Y-yZafDMesEmvqIG9HZ3b06V39xa_0py0IGkepiBfpB_L-Nfe8YfQg-4VDdxhF78xd9seUk1RNYLfCuF3wEdwSvukiK2uu0wpN98-IjRJs9NRru' },
  { id: '2', name: 'Nón lá', price: 250, category: 'HAT', requiredLevel: 5, owned: false, equipped: false, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzBjvc2DnHkU5kbDFMSwtv8BlsaiWbQudALcZbuYhJy8SPHAFmGOkRmm-l4KC5VSOUk3atkwm00nuuz6Z2ZTKRVAhQjwV3GoTebXZfy1o2eAujMFFziKt-smBZYu6Z5Y1OVRnyLwO5JVfFyoo6FbCJJv1cckKZSMi83YrGWZ_7RpHiVKx2k0l6Z-YKvzETxUD2sLP4FyEfy0ttKsrdDJkHT2IBS62yJLWXk_d0dEaJPZWKTLQH6XjW6IIrIL0y_y0AlbCNPcThctr7' },
  { id: '3', name: 'Vương miện', price: 1500, category: 'HAT', requiredLevel: 20, owned: false, equipped: false, img: '' },
];

export default function ShopScreen() {
  const categories = [
    { id: 'HAT', label: 'Mũ' },
    { id: 'OUTFIT', label: 'Trang phục' },
    { id: 'EFFECT', label: 'Hiệu ứng' },
    { id: 'BACKGROUND', label: 'Nền' },
  ];

  const [activeCategory, setActiveCategory] = useState('HAT');
  const level = 12;
  const xp = 850;

  const filteredItems = mockItems.filter(item => item.category === activeCategory);
  const equippedItem = filteredItems.find(item => item.equipped);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader 
        title="Cửa hàng" 
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
        <View style={styles.gridContainer}>
          {filteredItems.map(item => {
            const isLocked = level < item.requiredLevel;
            const canAfford = xp >= item.price;

            return (
              <View key={item.id} style={[styles.itemCard, item.equipped ? styles.itemCardEquipped : null]}>
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
                      <Text style={styles.lockedText}>Cấp {item.requiredLevel}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                
                <View style={styles.priceTag}>
                  <Star size={12} color="#EAB308" fill="#EAB308" />
                  <Text style={styles.priceText}>{item.price}</Text>
                </View>

                {item.equipped ? (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnEquipped]}>
                    <Text style={styles.btnTextEquipped}>Đã trang bị</Text>
                  </TouchableOpacity>
                ) : item.owned ? (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnOwned]}>
                    <Text style={styles.btnTextOwned}>Mặc thử</Text>
                  </TouchableOpacity>
                ) : isLocked ? (
                  <View style={[styles.actionBtn, styles.btnLocked]}>
                    <Text style={styles.btnTextLocked}>Khóa</Text>
                  </View>
                ) : canAfford ? (
                  <TouchableOpacity style={[styles.actionBtn, styles.btnBuy]}>
                    <Text style={styles.btnTextBuy}>Mua ngay</Text>
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

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d0e5fa', // Match web gradient start
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
    fontFamily: 'Courier',
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
    fontFamily: 'Courier',
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnEquipped: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    borderBottomWidth: 3,
  },
  btnTextEquipped: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.bgSurface,
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
