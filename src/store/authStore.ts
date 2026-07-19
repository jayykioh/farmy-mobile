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
  avatarUrl?: string;
  location?: string;
  onboardingCompleted?: boolean;
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
  login: (payload: LoginPayload) => Promise<void>;
  registerUser: (payload: RegisterPayload) => Promise<void>;
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
    } catch {
      await AsyncStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: async (user: User, accessToken: string) => {
    await AsyncStorage.setItem('access_token', accessToken);
    set({ user: normalizeUser(user), isAuthenticated: true, isLoading: false });
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
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

registerSessionExpiredHandler(async () => {
  await AsyncStorage.removeItem('access_token');
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});
