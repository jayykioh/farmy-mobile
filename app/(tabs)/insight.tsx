import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../src/components/PageHeader';
import { useWeeklyInsights } from '../../src/hooks/useWeeklyInsights';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { Sparkles, FileText, ChevronRight, ChevronDown, Calendar, Lightbulb, Zap } from 'lucide-react-native';

export default function InsightScreen() {
  const { data: insights = [], isLoading, isTriggering, trigger, refetch } = useWeeklyInsights(15);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleTrigger = async () => {
    try {
      await trigger();
      Alert.alert('Thành công 🎉', 'Đã khởi tạo bản phân tích tuần mới nhất bằng AI.');
      refetch();
    } catch (error) {
      Alert.alert('Thất bại ❌', 'Không thể tạo phân tích lúc này. Hãy chắc chắn bạn đã ghi nhật ký chăm sóc cây gần đây.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Safe and clean custom Markdown formatter for React Native
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');

    return (
      <View style={styles.markdownContainer}>
        {lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) return <View key={index} style={styles.paragraphSpacer} />;

          // 1. Heading 3 (e.g., ### Title)
          if (trimmed.startsWith('###')) {
            const headingText = trimmed.replace(/^###\s*/, '');
            return (
              <Text key={index} style={styles.heading3}>
                {headingText}
              </Text>
            );
          }

          // 2. Heading 2 (e.g., ## Title)
          if (trimmed.startsWith('##')) {
            const headingText = trimmed.replace(/^##\s*/, '');
            return (
              <Text key={index} style={styles.heading2}>
                {headingText}
              </Text>
            );
          }

          // 3. List Item (e.g., - Item or * Item)
          if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const itemText = trimmed.replace(/^[-*]\s*/, '');
            return (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listBullet}>•</Text>
                <Text style={styles.listText}>{parseBoldText(itemText)}</Text>
              </View>
            );
          }

          // 4. Numbered List Item (e.g., 1. Item)
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(/^(\d+\.)\s*(.*)/);
            const prefix = match ? match[1] : '';
            const itemText = match ? match[2] : '';
            return (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listNumber}>{prefix}</Text>
                <Text style={styles.listText}>{parseBoldText(itemText)}</Text>
              </View>
            );
          }

          // Default Paragraph
          return (
            <Text key={index} style={styles.paragraph}>
              {parseBoldText(trimmed)}
            </Text>
          );
        })}
      </View>
    );
  };

  // Parses **bold** blocks inside text
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <Text key={index} style={styles.boldText}>
            {part}
          </Text>
        );
      }
      return part;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Tuần từ ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Phân Tích & Báo Cáo" />

      {/* Floating Sparkles Trigger Button */}
      <View style={styles.triggerContainer}>
        <TouchableOpacity
          style={styles.triggerButton}
          onPress={handleTrigger}
          disabled={isTriggering || isLoading}
          activeOpacity={0.8}
        >
          {isTriggering ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.triggerButtonText}>Đang tạo phân tích...</Text>
            </View>
          ) : (
            <View style={styles.loadingRow}>
              <Sparkles size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.triggerButtonText}>Phân tích tuần này</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {insights.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Lightbulb size={36} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có bản tin phân tích nào</Text>
            <Text style={styles.emptyDescription}>
              Hãy đảm bảo bạn đã ghi nhật ký chăm sóc cây trong tuần này, sau đó nhấn nút "Phân tích tuần này" để AI tổng hợp thông tin và cho bạn các khuyến nghị kỹ thuật.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {insights.map((insight) => {
              const isExpanded = expandedId === insight._id;
              return (
                <View key={insight._id} style={[styles.card, isExpanded && styles.expandedCard]}>
                  {/* Card Header */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => toggleExpand(insight._id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.headerLeft}>
                      <View style={[styles.iconBg, isExpanded ? styles.iconBgActive : {}]}>
                        <FileText size={20} color={isExpanded ? colors.primary : colors.textMuted} />
                      </View>
                      <View style={styles.headerInfo}>
                        <Text style={styles.cardTitle}>Phân tích & Khuyến nghị</Text>
                        <View style={styles.dateRow}>
                          <Calendar size={12} color={colors.textMuted} style={{ marginRight: 4 }} />
                          <Text style={styles.cardDate}>{formatDate(insight.week_start_date)}</Text>
                        </View>
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronDown size={20} color={colors.textMuted} />
                    ) : (
                      <ChevronRight size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {/* Card Body */}
                  {isExpanded && (
                    <View style={styles.cardBody}>
                      <View style={styles.divider} />
                      
                      {renderFormattedMarkdown(insight.insight_text)}

                      {/* Metadata Details */}
                      <View style={styles.metadataRow}>
                        <Zap size={10} color={colors.textMuted} style={{ marginRight: 4 }} />
                        <Text style={styles.metadataText}>
                          Mô hình: {insight.model_used || 'gemini-1.5-flash'} | Tokens: {insight.tokens_used || 0}
                        </Text>
                      </View>
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
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  triggerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMain + '40',
  },
  triggerButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerButtonText: {
    color: '#fff',
    fontFamily: typography.bold,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: typography.bold,
    color: colors.textMain,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: typography.regular,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderMain + '30',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  expandedCard: {
    borderColor: colors.primary + '30',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBgActive: {
    backgroundColor: colors.primaryLightest,
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.bold,
    color: colors.textMain,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    fontFamily: typography.medium,
    color: colors.textMuted,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderMain + '20',
    marginBottom: 16,
  },
  markdownContainer: {
    gap: 10,
  },
  paragraphSpacer: {
    height: 4,
  },
  heading2: {
    fontSize: 16,
    fontFamily: typography.bold,
    color: colors.textMain,
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 14.5,
    fontFamily: typography.bold,
    color: colors.textMain,
    marginTop: 6,
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 13.5,
    fontFamily: typography.regular,
    color: colors.textMain + 'e6',
    lineHeight: 20,
  },
  boldText: {
    fontFamily: typography.bold,
    color: colors.textMain,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 6,
    marginTop: 2,
  },
  listBullet: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 6,
    lineHeight: 18,
  },
  listNumber: {
    fontSize: 13,
    fontFamily: typography.bold,
    color: colors.primary,
    marginRight: 6,
    lineHeight: 18,
  },
  listText: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: typography.regular,
    color: colors.textMain + 'e6',
    lineHeight: 19,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderMain + '10',
  },
  metadataText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: colors.textMuted,
  },
});
