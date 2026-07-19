import { create } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerSessionExpired } from '../store/sessionExpiry';

const API_BASE_URL = Platform.select({
  web: process.env.EXPO_PUBLIC_API_URL_WEB ?? process.env.EXPO_PUBLIC_API_URL,
  android: process.env.EXPO_PUBLIC_API_URL_ANDROID ?? process.env.EXPO_PUBLIC_API_URL,
  ios: process.env.EXPO_PUBLIC_API_URL_IOS ?? process.env.EXPO_PUBLIC_API_URL,
  default: process.env.EXPO_PUBLIC_API_URL,
});

if (!API_BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL. Set it in your local .env file.');
}

export const api = create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await triggerSessionExpired();
    }

    return Promise.reject(error);
  }
);
