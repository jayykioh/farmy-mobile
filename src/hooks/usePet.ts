import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

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
  const [error, setError] = useState<any>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchPet = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.get('/pet/status');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Fetch pet status error', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  return { data, isLoading, error, refetch: fetchPet };
}
