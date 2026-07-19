import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, ChevronDown, ChevronUp, Sparkles } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Button } from './Button';
import { MarkdownPreview } from './MarkdownPreview';
import { weeklyInsights } from '../data/weeklyInsights';

export function WeeklyInsightsSection() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const latestInsight = weeklyInsights[0];

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setHasGenerated(false);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasGenerated(true);
    }, 2500);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <BarChart3 size={22} color={colors.primary} />
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Báo cáo tuần</Text>
          <Text style={styles.subtitle}>Tóm tắt nhịp chăm sóc và gợi ý tuần tới.</Text>
        </View>
      </View>

      {isAnalyzing ? (
        <View style={styles.skeletonBlock} accessibilityLabel="Đang phân tích báo cáo tuần">
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ) : hasGenerated ? (
        <View style={styles.resultBox}>
          <View style={styles.resultHeader}>
            <Sparkles size={16} color={colors.secondaryDark} />
            <Text style={styles.resultTitle}>{latestInsight.title}</Text>
          </View>
          <MarkdownPreview markdown={latestInsight.markdown} collapsed={!isExpanded} />
          <TouchableOpacity style={styles.expandBtn} onPress={() => setIsExpanded(value => !value)} accessibilityRole="button">
            <Text style={styles.expandText}>{isExpanded ? 'Thu gọn' : 'Xem thêm'}</Text>
            {isExpanded ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color={colors.primary} />}
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.emptyText}>Chưa phân tích tuần này. Bấm nút bên dưới để tạo bản tóm tắt mới.</Text>
      )}

      <View style={styles.actionsRow}>
        <Button title="Phân tích tuần này" onPress={handleAnalyze} isLoading={isAnalyzing} disabled={isAnalyzing} style={styles.actionButton} />
        <Button title="Xem tất cả" variant="outline" onPress={() => router.push('/insights')} disabled={isAnalyzing} style={styles.actionButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 18,
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconShell: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLightest,
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 14,
  },
  resultBox: {
    backgroundColor: colors.bgMain,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    padding: 14,
    marginBottom: 14,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resultTitle: {
    ...typography.body,
    fontWeight: '800',
    color: colors.textMain,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingTop: 6,
  },
  expandText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  skeletonBlock: {
    gap: 10,
    marginBottom: 14,
  },
  skeletonLineWide: {
    height: 16,
    width: '92%',
    borderRadius: 999,
    backgroundColor: colors.bgSurface2,
  },
  skeletonLine: {
    height: 16,
    width: '72%',
    borderRadius: 999,
    backgroundColor: colors.bgSurface2,
  },
  skeletonLineShort: {
    height: 16,
    width: '48%',
    borderRadius: 999,
    backgroundColor: colors.bgSurface2,
  },
});
