import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../src/theme/typography';
import { colors } from '../src/theme/colors';
import { PageHeader } from '../src/components/PageHeader';
import { Droplets, Clock, Plus, Trash2, Repeat } from 'lucide-react-native';
import { Button } from '../src/components/Button';
import { useRouter } from 'expo-router';

const mockReminders = [
  { id: '1', title: 'Tưới nước Lúa Đài Thơm', time: '15:30 - Hôm nay', type: 'water', repeat: 'daily' },
  { id: '2', title: 'Bón phân Cà chua', time: '08:00 - Ngày mai', type: 'fertilizer', repeat: 'none' },
];

export default function RemindersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader title="Nhắc nhở của tôi" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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

        <View style={styles.listContainer}>
          {mockReminders.map(item => (
            <View key={item.id} style={styles.reminderCard}>
              <View style={styles.iconContainer}>
                <Droplets size={24} color="#3B82F6" />
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.reminderTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.timeRow}>
                  <Clock size={12} color={colors.textMain + '80'} />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                
                <View style={styles.tagsRow}>
                  <View style={styles.tagPush}>
                    <Text style={styles.tagPushText}>Push</Text>
                  </View>
                  {item.repeat !== 'none' && (
                    <View style={styles.tagRepeat}>
                      <Repeat size={10} color="#B45309" />
                      <Text style={styles.tagRepeatText}>Hàng ngày</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <Button 
                  title="Xong" 
                  onPress={() => {}} 
                  style={styles.doneBtn}
                />
                <TouchableOpacity style={styles.cancelBtn}>
                  <Trash2 size={12} color={colors.error} />
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => {}}>
        <Plus color={colors.bgSurface} size={32} />
      </TouchableOpacity>
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
  }
});
