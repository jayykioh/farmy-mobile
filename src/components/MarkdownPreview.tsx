import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface MarkdownPreviewProps {
  markdown: string;
  collapsed?: boolean;
}

export function MarkdownPreview({ markdown, collapsed = false }: MarkdownPreviewProps) {
  const lines = markdown.split('\n').filter(Boolean);
  const visibleLines = collapsed ? lines.slice(0, 4) : lines;

  return (
    <>
      {visibleLines.map((line, index) => {
        if (line.startsWith('## ')) {
          return <Text key={`${line}-${index}`} style={styles.heading}>{line.replace('## ', '')}</Text>;
        }

        if (line.startsWith('- ')) {
          return <Text key={`${line}-${index}`} style={styles.body}>• {line.replace('- ', '')}</Text>;
        }

        return <Text key={`${line}-${index}`} style={styles.body}>{line}</Text>;
      })}
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...typography.body,
    color: colors.textMain,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  body: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 4,
  },
});
