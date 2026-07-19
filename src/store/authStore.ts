import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { getErrorMessage } from '../utils/errors';
import { registerSessionExpiredHandler } from './sessionExpiry';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  farmId?: string;
  onboardingCompleted?: boolean;
  avatarUrl?: string;
  location?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setSession: (user: User, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
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
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: async (user: User, accessToken: string) => {
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  login: async (payload) => {
    try {
      set({ isLoading: true });
      const { data } = await api.post('/auth/login', payload);
      const { access_token, user } = data.data;
      await AsyncStorage.setItem('access_token', access_token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw new Error(getErrorMessage(error, 'Đăng nhập thất bại.'));
    }
  },

  registerUser: async (payload) => {
    try {
      set({ isLoading: true });
      const { data } = await api.post('/auth/register', payload);
      const { access_token, user } = data.data;
      await AsyncStorage.setItem('access_token', access_token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw new Error(getErrorMessage(error, 'Đăng ký thất bại.'));
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
    } finally {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false });
    }
  },
}));

registerSessionExpiredHandler(async () => {
  await AsyncStorage.removeItem('access_token');
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});
