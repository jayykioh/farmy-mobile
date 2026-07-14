import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual backend URL or use ngrok/local IP for testing
const API_BASE_URL = 'http://192.168.1.xxx:3000/api/v1'; // TODO: Update with actual IP

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
