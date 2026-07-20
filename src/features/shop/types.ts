import type { PetAnchor } from '../pet/types';

export type ShopItemCategory = 'HAT' | 'OUTFIT' | 'EFFECT' | 'BACKGROUND';

export interface ShopItem {
  _id: string;
  name: string;
  category: ShopItemCategory;
  price: number;
  required_level: number;
  image_url: string;
  anchor?: PetAnchor;
}

export interface ShopItemViewModel extends ShopItem {
  owned: boolean;
  equipped: boolean;
}
