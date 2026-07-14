import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  farmId?: string;
  hasCompletedOnboarding?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setSession: (user: User, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      
      const response = await api.get('/auth/me');
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Check auth failed', error);
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: async (user: User, accessToken: string) => {
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));
