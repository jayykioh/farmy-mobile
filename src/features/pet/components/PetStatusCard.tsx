import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Flame, Star } from 'lucide-react-native';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { getSafePetMood, getXpProgress, PET_MOOD_UI_MAP } from '../constants';
import type { PetEquipmentItem, PetStatus } from '../types';
import { PetMascot } from './PetMascot';

interface PetStatusCardProps {
  status: PetStatus;
  showMascot?: boolean;
  equippedItemsDetails?: PetEquipmentItem[];
}

export const PetStatusCard = ({ status, showMascot = true, equippedItemsDetails }: PetStatusCardProps) => {
  const mood = getSafePetMood(status.mood);
  const ui = PET_MOOD_UI_MAP[mood];
  const maxXp = Math.max(status.level, 1) * 100;
  const progress = getXpProgress(status.exp, status.level);

  return (
    <View style={styles.card} accessibilityLabel="Trạng thái Bé Thóc">
      {showMascot ? (
        <View style={styles.mascotArea}>
          <PetMascot status={status} size={132} showBubble equippedItemsDetails={equippedItemsDetails} />
        </View>
      ) : null}

      <View style={styles.moodRow}>
        <View style={[styles.moodIcon, { borderColor: ui.color + '44', backgroundColor: ui.color + '14' }]}>
          <Text style={styles.moodEmoji}>{ui.emoji}</Text>
        </View>
        <Text style={[styles.moodLabel, { color: ui.color }]}>{ui.label}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Flame size={16} color={colors.warning} />
          <Text style={styles.statValue}>{status.streakCount}</Text>
          <Text style={styles.statLabel}>ngày liên tiếp</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={16} color="#EAB308" fill="#EAB308" />
          <Text style={styles.statValue}>Cấp {status.level}</Text>
        </View>
      </View>

      <View style={styles.xpContainer}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpValue}>{status.exp}/{maxXp}</Text>
        </View>
        <View style={styles.progressBar} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: maxXp, now: status.exp }}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {status.missedDays > 0 ? (
        <View style={styles.warningRow}>
          <AlertTriangle size={15} color={colors.warning} />
          <Text style={styles.warningText}>Bé Thóc đã bỏ lỡ {status.missedDays} ngày...</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSurface,
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderMain + '50',
    boxShadow: '0px 3px 10px rgba(0, 0, 0, 0.04)',
    elevation: 2,
  },
  mascotArea: {
    minHeight: 180,
    backgroundColor: colors.primaryLightest,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.primaryLight + '66',
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
  },
  moodIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  moodEmoji: {
    fontSize: 17,
  },
  moodLabel: {
    ...typography.body,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgSurface1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statValue: {
    ...typography.caption,
    color: colors.textMain,
    fontWeight: '900',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  xpContainer: {
    gap: 8,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  xpValue: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '800',
    fontFamily: 'Courier',
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.bgSurface1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  warningText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '800',
  },
});
