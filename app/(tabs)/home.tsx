import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tổng quan</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.body}>Chào mừng bạn đến với FarmDiaries Mobile.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
  },
  title: {
    ...typography.h2,
  },
  content: {
    padding: 24,
  },
  body: {
    ...typography.body,
  }
});
