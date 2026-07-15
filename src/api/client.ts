import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.203:3000/api/v1';

export const api = axios.create({
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
  } catch (error) {
    console.error('Error reading access token from AsyncStorage', error);
  }
  return config;
});

// Response interceptor to handle token refresh could be added here
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 and refresh token logic here in the future
    return Promise.reject(error);
  }
);
