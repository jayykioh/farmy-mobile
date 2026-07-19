import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../src/components/PageHeader';
import { colors } from '../src/theme/colors';
import { typography } from '../src/theme/typography';
import { MarkdownPreview } from '../src/components/MarkdownPreview';
import { weeklyInsights } from '../src/data/weeklyInsights';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <PageHeader title="Báo cáo tuần" fallbackHref="/(tabs)/home" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {weeklyInsights.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.date}>{new Date(item.generatedAt).toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <MarkdownPreview markdown={item.markdown} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgMain,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    padding: 18,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    ...typography.h3,
    marginBottom: 8,
  },
  summary: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 10,
  },
});
