import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ShopItemImage } from '../../shop/components/ShopItemImage';
import { getMascotSvgXml, getSafePetMood, PET_MOOD_UI_MAP, resolveAnchor, sortByLayer } from '../constants';
import type { PetEquipmentItem, PetMood, PetStatus } from '../types';
import { PetMoodBubble } from './PetMoodBubble';

interface PetMascotProps {
  status?: PetStatus | null;
  staticMood?: PetMood;
  size?: number;
  showBubble?: boolean;
  equippedItemsDetails?: PetEquipmentItem[];
  style?: StyleProp<ViewStyle>;
}

const parsePercent = (value: string): number => {
  const parsed = Number.parseFloat(value.replace('%', ''));
  return Number.isFinite(parsed) ? parsed / 100 : 1;
};

const getEquipmentImageUri = (item: PetEquipmentItem): string | undefined => {
  return item.image_url;
};

const getLayerStyle = (item: PetEquipmentItem, size: number): ViewStyle => {
  const anchor = resolveAnchor(item);
  const style: ViewStyle = {
    position: 'absolute',
    top: anchor.top as DimensionValue,
    left: anchor.left as DimensionValue,
    width: anchor.width as DimensionValue,
    aspectRatio: 1,
    zIndex: anchor.zIndex === 0 ? 0 : anchor.zIndex + 10,
  };

  if (anchor.transform.includes('translateX(-50%)')) {
    style.transform = [{ translateX: -(size * parsePercent(anchor.width)) / 2 }];
  }

  return style;
};

export const PetMascot = ({
  status,
  staticMood,
  size = 160,
  showBubble = false,
  equippedItemsDetails,
  style,
}: PetMascotProps) => {
  const mood = staticMood ?? getSafePetMood(status?.mood);
  const message = staticMood ? PET_MOOD_UI_MAP[mood].description : status?.bubbleMessage ?? PET_MOOD_UI_MAP[mood].description;
  const equipment = sortByLayer(equippedItemsDetails ?? status?.equippedItemsDetails ?? []);

  return (
    <View style={[styles.wrapper, { width: size }, style]} accessibilityLabel={`Bé Thóc đang ${PET_MOOD_UI_MAP[mood].label}`}>
      {showBubble && message ? <PetMoodBubble mood={mood} message={message} /> : null}
      <View style={{ width: size, height: size }}>
        <SvgXml xml={getMascotSvgXml(mood)} width={size} height={size} style={styles.baseMascot} />
        {equipment.map((item) => {
          const imageUri = getEquipmentImageUri(item);
          if (!imageUri) return null;

          return (
            <View key={item._id} style={getLayerStyle(item, size)}>
              <ShopItemImage imageUrl={imageUri} name={item.name} style={styles.equipmentImage} />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseMascot: {
    position: 'relative',
    zIndex: 10,
  },
  equipmentImage: {
    width: '100%',
    height: '100%',
  },
});
