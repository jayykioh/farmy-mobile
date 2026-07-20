import type { PetAnchor, PetEquipmentItem, PetMood } from './types';
import { MASCOT_SVG_XML } from './mascotSvgs';

export interface MoodUIConfig {
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export type EquipmentSlot = 'HAT' | 'OUTFIT' | 'GLASSES' | 'ACCESSORY' | 'EFFECT' | 'BACKGROUND';

export interface AnchorConfig {
  top: string;
  left: string;
  width: string;
  transform: string;
  zIndex: number;
}

export const PET_MOOD_FALLBACK: PetMood = 'neutral';

export const PET_MOOD_UI_MAP: Record<PetMood, MoodUIConfig> = {
  excited: {
    label: 'Phấn khích',
    emoji: '🎉',
    description: 'Bé Thóc đang rất hào hứng vì chuỗi streak của bạn!',
    color: '#EAB308',
  },
  happy: {
    label: 'Vui vẻ',
    emoji: '😊',
    description: 'Bé Thóc rất vui vì bạn đã ghi nhật ký hôm nay!',
    color: '#087443',
  },
  neutral: {
    label: 'Bình thường',
    emoji: '😐',
    description: 'Bé Thóc đang chờ bạn bắt đầu ngày mới.',
    color: '#64748B',
  },
  sad: {
    label: 'Buồn',
    emoji: '😢',
    description: 'Bé Thóc buồn vì bạn đã bỏ quên nhật ký nhiều ngày.',
    color: '#315DA8',
  },
  worried: {
    label: 'Lo lắng',
    emoji: '😟',
    description: 'Bé Thóc lo lắng vì hôm qua bạn không ghi nhật ký.',
    color: '#F97316',
  },
  sleepy: {
    label: 'Buồn ngủ',
    emoji: '💤',
    description: 'Bé Thóc muốn ngủ rồi, nhưng vẫn đợi bạn ghi nhật ký!',
    color: '#8B5CF6',
  },
  hungry: {
    label: 'Đói bụng',
    emoji: '🍚',
    description: 'Bé Thóc đang đói, ghi nhật ký để cho Thóc ăn nào!',
    color: '#B45309',
  },
};

export const SLOT_DEFAULT_ANCHORS: Record<EquipmentSlot, AnchorConfig> = {
  BACKGROUND: { top: '0%', left: '0%', width: '100%', transform: 'none', zIndex: 0 },
  OUTFIT: { top: '55%', left: '50%', width: '75%', transform: 'translateX(-50%)', zIndex: 1 },
  HAT: { top: '-15%', left: '50%', width: '70%', transform: 'translateX(-50%)', zIndex: 2 },
  GLASSES: { top: '32%', left: '50%', width: '45%', transform: 'translateX(-50%)', zIndex: 3 },
  ACCESSORY: { top: '60%', left: '75%', width: '35%', transform: 'translateX(-50%)', zIndex: 4 },
  EFFECT: { top: '0%', left: '0%', width: '100%', transform: 'none', zIndex: 5 },
};

export const getSafePetMood = (mood: string | undefined | null): PetMood => {
  if (mood && mood in PET_MOOD_UI_MAP) {
    return mood as PetMood;
  }
  return PET_MOOD_FALLBACK;
};

export const getMascotSvgXml = (mood: string | undefined | null): string => {
  return MASCOT_SVG_XML[getSafePetMood(mood)];
};

export const getXpProgress = (exp: number, level: number): number => {
  const maxXp = Math.max(level, 1) * 100;
  return Math.min(100, Math.max(0, (exp / maxXp) * 100));
};

export const resolveAnchor = (item: { _id?: string; name?: string; category: string; anchor?: PetAnchor }): AnchorConfig => {
  let slot = (item.category as EquipmentSlot) || 'HAT';
  const isGlasses = (item.name || '').toLowerCase().includes('kính') || (item._id || '').includes('kinh');

  if (isGlasses && slot === 'HAT') {
    slot = 'GLASSES';
  }

  const base = SLOT_DEFAULT_ANCHORS[slot] ?? SLOT_DEFAULT_ANCHORS.HAT;

  return {
    top: item.anchor?.top ?? base.top,
    left: item.anchor?.left ?? base.left,
    width: item.anchor?.width ?? base.width,
    transform: item.anchor?.transform ?? base.transform,
    zIndex: item.anchor?.zIndex ?? base.zIndex,
  };
};

export const sortByLayer = <T extends PetEquipmentItem>(items: T[]): T[] => {
  return [...items].sort((a, b) => resolveAnchor(a).zIndex - resolveAnchor(b).zIndex);
};
