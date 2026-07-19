import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/errors';

export interface FarmPlot {
  _id: string;
  name: string;
  location: string;
  area: number;
}

export function usePlots() {
  const [data, setData] = useState<FarmPlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchPlots = useCallback(async () => {
    if (!isAuthenticated) {
      setData([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/plots');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách thửa ruộng.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void Promise.resolve().then(fetchPlots);
  }, [fetchPlots]);

  return { data, isLoading, error, refetch: fetchPlots };
}
