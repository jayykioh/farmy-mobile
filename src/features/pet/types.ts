export type PetMood = 'excited' | 'happy' | 'neutral' | 'sad' | 'worried' | 'sleepy' | 'hungry';

export type PetMoodReason =
  | 'STREAK_MILESTONE'
  | 'USER_LOGGED_DIARY_TODAY'
  | 'MISSED_MULTIPLE_DAYS'
  | 'MISSED_ONE_DAY'
  | 'LATE_DAY_NO_DIARY'
  | 'NEEDS_DAILY_DIARY'
  | 'DEFAULT_STATE';

export interface PetAnchor {
  top?: string;
  left?: string;
  width?: string;
  transform?: string;
  zIndex?: number;
}

export interface PetEquipmentItem {
  _id: string;
  name: string;
  category: string;
  image_url?: string;
  img?: string;
  anchor?: PetAnchor;
}

export interface PetStatus {
  _id?: string;
  user_id?: string;
  mood: PetMood;
  previousMood?: PetMood;
  streakCount: number;
  level: number;
  exp: number;
  lastDiaryDate?: string;
  missedDays: number;
  moodReason: PetMoodReason | string;
  bubbleMessage: string;
  ownedItems: string[];
  equippedItems: string[];
  equippedItemsDetails?: PetEquipmentItem[];
  last_interaction_at?: string;
  updatedAt?: string;
}

export const PET_STATUS_FALLBACK: PetStatus = {
  mood: 'neutral',
  streakCount: 0,
  level: 1,
  exp: 0,
  missedDays: 0,
  moodReason: 'DEFAULT_STATE',
  bubbleMessage: 'Chào chủ vườn!',
  ownedItems: [],
  equippedItems: [],
};
