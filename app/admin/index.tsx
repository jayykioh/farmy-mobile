import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Switch, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, 
  Sprout, 
  BookOpen, 
  MessageSquare, 
  Database, 
  FileSearch, 
  Bell, 
  Settings, 
  Lock, 
  Sparkles,
  ChevronRight
} from 'lucide-react-native';
import { PageHeader } from '../../src/components/PageHeader';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { getAdminStats, getAdminConfig, updateAdminConfig } from '../../src/api/admin';
import Svg, { Path, Circle } from 'react-native-svg';

type StatsOverview = {
  totalUsers: number;
  totalPlots: number;
  totalDiaries: number;
  totalScans: number;
  totalRAGFiles: number;
  totalSessions: number;
  totalReminders: number;
};

type TrendPoint = {
  date: string;
  value: number;
};

type StatsData = {
  overview: StatsOverview;
  charts: {
    userTrends: TrendPoint[];
    scanTrends: TrendPoint[];
    chatTrends: TrendPoint[];
  };
};

export default function AdminHubScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [config, setConfig] = useState<{ maintenanceMode: boolean; rateLimit: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingConfig, setUpdatingConfig] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, configData] = await Promise.all([
        getAdminStats(),
        getAdminConfig()
      ]);
      setStats(statsData);
      setConfig(configData);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu quản trị: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchData);
  }, []);

  const handleToggleMaintenance = async (value: boolean) => {
    if (!config) return;
    try {
      setUpdatingConfig(true);
      const updated = await updateAdminConfig({ maintenanceMode: value });
      setConfig(updated);
    } catch (err: any) {
      Alert.alert('Lỗi', 'Không thể cập nhật cấu hình: ' + (err.message || err));
    } finally {
      setUpdatingConfig(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <PageHeader title="Hệ thống quản trị" showBack={true} fallbackHref="/(tabs)/profile" />
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải số liệu hệ thống...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cards = stats ? [
    { label: 'Thành viên', value: stats.overview.totalUsers, icon: Users, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Ô đất', value: stats.overview.totalPlots, icon: Sprout, color: '#10B981', bg: '#ECFDF5' },
    { label: 'Nhật ký', value: stats.overview.totalDiaries, icon: BookOpen, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Lượt quét sâu', value: stats.overview.totalScans, icon: FileSearch, color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'RAG Files', value: stats.overview.totalRAGFiles, icon: Database, color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Phiên Chat AI', value: stats.overview.totalSessions, icon: MessageSquare, color: '#F43F5E', bg: '#FFF1F2' },
    { label: 'Nhắc nhở', value: stats.overview.totalReminders, icon: Bell, color: '#14B8A6', bg: '#F0FDFA' },
  ] : [];

  const quickLinks = [
    { title: 'Quản lý thành viên', desc: 'Phân quyền, khóa/mở tài khoản', href: '/admin/users', icon: Users, color: '#3B82F6' },
    { title: 'Tài liệu RAG / AI', desc: 'Huấn luyện và chuẩn hóa RAG', href: '/admin/rag', icon: Database, color: '#6366F1' },
    { title: 'Lịch sử quét sâu', desc: 'Xem danh sách và kết quả quét', href: '/admin/scans', icon: FileSearch, color: '#8B5CF6' },
    { title: 'Nhắc nhở & Thông báo', desc: 'Quản lý lịch và gửi thông báo', href: '/admin/reminders', icon: Bell, color: '#14B8A6' },
    { title: 'Trang phục thú cưng', desc: 'Thêm, sửa, xóa skins thú cưng', href: '/admin/skins', icon: Sparkles, color: '#F59E0B' },
    { title: 'Đổi mật khẩu Admin', desc: 'Cập nhật thông tin bảo mật', href: '/admin/password', icon: Lock, color: '#EF4444' },
  ];

  const renderSparkline = (points: TrendPoint[], lineColor: string) => {
    if (!points || points.length < 2) return null;
    const width = 120;
    const height = 40;
    const padding = 4;
    const max = Math.max(...points.map(p => p.value), 1);
    const min = Math.min(...points.map(p => p.value), 0);
    const range = max - min;

    const coords = points.map((p, index) => {
      const x = padding + (index / (points.length - 1)) * (width - padding * 2);
      const y = padding + (height - padding * 2) - ((p.value - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const d = coords.reduce((path, c, i) => i === 0 ? `M ${c.x} ${c.y}` : `${path} L ${c.x} ${c.y}`, '');

    return (
      <Svg width={width} height={height}>
        <Path d={d} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3" fill={lineColor} />
      </Svg>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <PageHeader title="Hệ thống quản trị" showBack={true} fallbackHref="/(tabs)/profile" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Maintenance Toggle */}
        <View style={styles.configCard}>
          <View style={styles.configInfo}>
            <View style={styles.configTitleRow}>
              <Settings size={20} color={colors.primary} />
              <Text style={styles.configTitle}>Chế độ bảo trì hệ thống</Text>
            </View>
            <Text style={styles.configDesc}>
              Kích hoạt sẽ chặn người dùng thường truy cập app và hiển thị màn hình bảo trì.
            </Text>
          </View>
          <Switch
            value={config?.maintenanceMode || false}
            onValueChange={handleToggleMaintenance}
            disabled={updatingConfig || !config}
            trackColor={{ false: colors.borderMain, true: colors.primaryLight }}
            thumbColor={config?.maintenanceMode ? colors.primary : '#FFFFFF'}
          />
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Chỉ số tổng quan</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          {cards.map((c, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: c.bg }]}>
                <c.icon size={22} color={c.color} />
              </View>
              <View style={styles.statData}>
                <Text style={styles.statLabel}>{c.label}</Text>
                <Text style={styles.statValue}>{c.value}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Trends & Sparklines */}
        {stats && (
          <View style={styles.trendsSection}>
            <Text style={styles.sectionTitle}>Xu hướng hoạt động (7 ngày)</Text>
            <View style={styles.trendRow}>
              <View style={styles.trendTextContainer}>
                <Text style={styles.trendName}>Đăng ký mới</Text>
                <Text style={styles.trendDetail}>Thành viên đăng ký mới</Text>
              </View>
              {renderSparkline(stats.charts.userTrends, '#3B82F6')}
            </View>
            <View style={styles.trendRow}>
              <View style={styles.trendTextContainer}>
                <Text style={styles.trendName}>Chẩn đoán bệnh</Text>
                <Text style={styles.trendDetail}>Lượt quét sâu bệnh</Text>
              </View>
              {renderSparkline(stats.charts.scanTrends, '#8B5CF6')}
            </View>
            <View style={styles.trendRow}>
              <View style={styles.trendTextContainer}>
                <Text style={styles.trendName}>Tương tác AI</Text>
                <Text style={styles.trendDetail}>Số phiên Chat AI hoạt động</Text>
              </View>
              {renderSparkline(stats.charts.chatTrends, '#F43F5E')}
            </View>
          </View>
        )}

        {/* Action Panel Links */}
        <Text style={styles.sectionTitle}>Phân hệ quản lý</Text>
        <View style={styles.linksContainer}>
          {quickLinks.map((link, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.linkRow} 
              onPress={() => router.push(link.href as any)}
              activeOpacity={0.7}
            >
              <View style={styles.linkLeft}>
                <View style={[styles.linkIconBg, { backgroundColor: link.color + '15' }]}>
                  <link.icon size={20} color={link.color} />
                </View>
                <View>
                  <Text style={styles.linkTitle}>{link.title}</Text>
                  <Text style={styles.linkDesc}>{link.desc}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.borderMain} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 12,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  configCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  configInfo: {
    flex: 1,
    paddingRight: 16,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  configTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  configDesc: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 12,
    marginTop: 8,
    color: colors.textMain,
  },
  statsScroll: {
    gap: 12,
    paddingBottom: 16,
  },
  statCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '40',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statData: {
    justifyContent: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  statValue: {
    ...typography.h2,
    color: colors.textMain,
    marginTop: 2,
  },
  trendsSection: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 16,
    marginBottom: 24,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  trendTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  trendName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textMain,
  },
  trendDetail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  linksContainer: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '20',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  linkIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  linkDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  }
});
