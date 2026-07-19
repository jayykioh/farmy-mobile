import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  farmId?: string;
  avatarUrl?: string;
  location?: string;
  onboardingCompleted?: boolean;
}

type RawUser = Partial<User> & {
  _id?: string;
  farm_id?: string;
  avatar_url?: string;
  picture?: string;
  onboarding_completed?: boolean;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setSession: (user: User, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  login: (payload: any) => Promise<void>;
  registerUser: (payload: any) => Promise<void>;
}

const normalizeUser = (rawUser: RawUser): User => ({
  ...rawUser,
  id: rawUser?.id ?? rawUser?._id ?? '',
  email: rawUser?.email ?? '',
  name: rawUser?.name ?? '',
  role: rawUser?.role ?? 'farmer',
  farmId: rawUser?.farmId ?? rawUser?.farm_id,
  avatarUrl: rawUser?.avatarUrl ?? rawUser?.avatar_url ?? rawUser?.picture,
  onboardingCompleted: rawUser?.onboardingCompleted ?? rawUser?.onboarding_completed,
});

const getAccessToken = (data: { access_token?: string; accessToken?: string }): string | undefined => data.access_token ?? data.accessToken;

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
      const rawUser = response.data.data?.user ?? response.data.data;
      set({
        user: normalizeUser(rawUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.warn('Check auth failed (token expired/invalid), redirecting to login');
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: async (user: User, accessToken: string) => {
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user: normalizeUser(user), isAuthenticated: true, isLoading: false });
  },

  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    const accessToken = getAccessToken(data.data);
    const { user } = data.data;
    if (!accessToken) throw new Error('Không nhận được access token từ máy chủ.');
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user: normalizeUser(user), isAuthenticated: true, isLoading: false });
  },

  registerUser: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const accessToken = getAccessToken(data.data);
    const { user } = data.data;
    if (!accessToken) throw new Error('Không nhận được access token từ máy chủ.');
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user: normalizeUser(user), isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
