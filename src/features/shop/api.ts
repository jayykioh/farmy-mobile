import { api } from '../../api/client';
import type { ShopItem } from './types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const fetchShopItems = async (): Promise<ShopItem[]> => {
  const { data } = await api.get<ApiResponse<ShopItem[]>>('/shop/items');
  return data.data;
};

export const buyShopItem = async (itemId: string) => {
  const { data } = await api.post('/shop/buy', { itemId });
  return data;
};

export const toggleEquipShopItem = async (itemId: string) => {
  const { data } = await api.post('/shop/equip', { itemId });
  return data;
};
