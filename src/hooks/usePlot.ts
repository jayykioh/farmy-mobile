import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export interface FarmPlot {
  _id: string;
  name: string;
  location: string;
  area: number;
}

export function usePlots() {
  const [data, setData] = useState<FarmPlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    } catch (err) {
      console.error('Fetch plots error', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  return { data, isLoading, refetch: fetchPlots };
}
