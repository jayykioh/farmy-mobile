import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { PET_MOOD_UI_MAP } from '../constants';
import type { PetMood } from '../types';

interface PetMoodBubbleProps {
  mood: PetMood;
  message: string;
}

export const PetMoodBubble = ({ mood, message }: PetMoodBubbleProps) => {
  const ui = PET_MOOD_UI_MAP[mood];

  return (
    <View style={styles.bubble} accessibilityRole="text" accessibilityLiveRegion="polite">
      <Text style={styles.emoji}>{ui.emoji}</Text>
      <Text style={styles.text}>{message}</Text>
      <View style={styles.tail} />
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: 'relative',
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderMain + '55',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.08)',
    elevation: 3,
  },
  emoji: {
    fontSize: 18,
  },
  text: {
    ...typography.caption,
    color: colors.textMain,
    fontWeight: '700',
    flexShrink: 1,
  },
  tail: {
    position: 'absolute',
    bottom: -7,
    alignSelf: 'center',
    width: 14,
    height: 14,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderMain + '55',
    transform: [{ rotate: '45deg' }],
  },
});
