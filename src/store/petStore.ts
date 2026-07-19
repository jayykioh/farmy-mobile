import { create } from 'zustand';
import { api } from '../api/client';
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

interface PetState {
  data: PetStatus | null;
  isLoading: boolean;
  error: string | null;
  fetchPet: () => Promise<void>;
  setData: (data: PetStatus | null) => void;
}

export const usePetStore = create<PetState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchPet: async () => {
    if (get().isLoading) return;
    try {
      set({ isLoading: true, error: null });
      const res = await api.get('/pet/status');
      set({ data: res.data.data });
    } catch (err) {
      set({ error: getErrorMessage(err, 'Không thể tải trạng thái Bé Thóc.') });
    } finally {
      set({ isLoading: false });
    }
  },
  setData: (data) => set({ data }),
}));
