import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useWeeklyInsights } from '../hooks/useWeeklyInsights';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Card } from './Card';
import { Sparkles, Lightbulb, ChevronDown, ChevronUp, Loader2 } from 'lucide-react-native';

export const WeeklyInsightsSection: React.FC = () => {
  const { data: insights, isLoading, isTriggering, trigger } = useWeeklyInsights(1);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTrigger = async () => {
    try {
      await trigger();
      Alert.alert('Thành công', 'Đã tạo báo cáo phân tích tuần mới nhất bằng AI.');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tạo phân tích lúc này. Hãy chắc chắn bạn đã ghi nhật ký gần đây.');
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return (
      <Text style={styles.insightText}>
        {parts.map((part, index) => {
          if (index % 2 === 1) {
            return (
              <Text key={index} style={styles.boldText}>
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <Card style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải phân tích tuần...</Text>
      </Card>
    );
  }

  const latestInsight = insights[0];

  if (!latestInsight) {
    return (
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Lightbulb size={20} color={colors.textMuted} />
            <Text style={styles.title}>Phân tích tuần này</Text>
          </View>
        </View>
        <Text style={styles.emptyText}>
          Chưa có báo cáo tuần nào. Hãy ghi nhật ký chăm sóc cây thường xuyên rồi nhấn nút bên dưới để tạo phân tích nhé!
        </Text>
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={handleTrigger}
          disabled={isTriggering}
          activeOpacity={0.8}
        >
          {isTriggering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Sparkles size={16} color="#fff" />
              <Text style={styles.triggerButtonText}>Phân tích ngay</Text>
            </>
          )}
        </TouchableOpacity>
      </Card>
    );
  }

  // Format date
  const dateObj = new Date(latestInsight.week_start_date);
  const formattedDate = `Tuần từ ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.titleRow} 
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Sparkles size={20} color={colors.primary} />
          <View style={styles.titleColumn}>
            <Text style={styles.title}>Weekly Insights</Text>
            <Text style={styles.subtitle}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionIcon} 
            onPress={handleTrigger}
            disabled={isTriggering}
          >
            {isTriggering ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Sparkles size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionIcon} 
            onPress={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp size={20} color={colors.textMuted} />
            ) : (
              <ChevronDown size={20} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.content}>
          <View style={styles.divider} />
          {renderMarkdown(latestInsight.insight_text)}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderMain + '40',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  titleColumn: {
    flexDirection: 'column',
  },
  title: {
    ...typography.h3,
    color: colors.textH,
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.bgMain,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderMain + '30',
    marginBottom: 12,
  },
  insightText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  triggerButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  triggerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
