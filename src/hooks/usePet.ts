import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/errors';

export interface PetStatus {
  _id: string;
  user_id: string;
  exp: number;
  level: number;
  mood: 'happy' | 'neutral' | 'sad';
  last_interaction_at?: string;
  ownedItems: string[];
  equippedItems: string[];
}

export function usePetStatus() {
  const [data, setData] = useState<PetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchPet = useCallback(async () => {
    if (!isAuthenticated) {
      setData(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/pet/status');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải trạng thái Bé Thóc.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void Promise.resolve().then(fetchPet);
  }, [fetchPet]);

  return { data, isLoading, error, refetch: fetchPet };
}
