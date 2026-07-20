import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getErrorMessage } from '../../../utils/errors';
import { fetchShopItems } from '../api';
import type { ShopItem } from '../types';

export const useShopItems = () => {
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setItems(await fetchShopItems());
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải cửa hàng.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
  }, [isAuthenticated]);

  return { items, isLoading, error, refetch };
};
