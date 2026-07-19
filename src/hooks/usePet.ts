import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { usePetStore, type PetStatus } from '../store/petStore';

export type { PetStatus };

export function usePetStatus() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, error, fetchPet } = usePetStore();

  useEffect(() => {
    if (!isAuthenticated) {
      usePetStore.getState().setData(null);
    } else {
      void fetchPet();
    }
  }, [isAuthenticated, fetchPet]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = DeviceEventEmitter.addListener('pet_updated', () => {
      void fetchPet();
    });
    return () => sub.remove();
  }, [isAuthenticated, fetchPet]);

  return { data, isLoading, error, refetch: fetchPet };
}

