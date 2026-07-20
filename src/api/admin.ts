import { api } from './client';

export type UserAdminInfo = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_deleted?: boolean;
  onboardingCompleted?: boolean;
  created_at?: string;
  createdAt?: string;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const getAdminUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  const response = await api.get('/admin/users', { params });
  return response.data.data;
};

export const updateAdminUserRole = async (userId: string, role: string) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data.data;
};

export const deleteAdminUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data.data;
};

export const getAdminChatSessions = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/chat/sessions', { params });
  return response.data.data;
};

export const getAdminRAGFiles = async () => {
  const response = await api.get('/admin/knowledge');
  return response.data.data;
};

export const deleteAdminRAGFile = async (fileId: string) => {
  const response = await api.delete(`/admin/knowledge/${fileId}`);
  return response.data.data;
};

export const createAdminRAGFile = async (data: FormData | { title: string; category: string; content: string }) => {
  const response = await api.post('/admin/knowledge', data);
  return response.data.data;
};

export const validateAdminRAGFile = async (fileId: string) => {
  const response = await api.post(`/admin/knowledge/${fileId}/validate`);
  return response.data;
};

export const confirmAdminRAGFile = async (fileId: string, payload: { action: 'confirm' | 'reject'; note?: string }) => {
  const response = await api.post(`/admin/knowledge/${fileId}/confirm`, payload);
  return response.data;
};

export const batchEmbedAdminRAGFiles = async () => {
  const response = await api.post('/admin/knowledge/batch-embed');
  return response.data;
};

export const getAdminScans = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/scans', { params });
  return response.data.data;
};

export const getAdminConfig = async () => {
  const response = await api.get('/admin/config');
  return response.data.data;
};

export const updateAdminConfig = async (config: { maintenanceMode?: boolean; rateLimit?: number }) => {
  const response = await api.post('/admin/config', config);
  return response.data.data;
};

export const getAdminReminders = async (params: { page?: number; limit?: number }) => {
  const response = await api.get('/admin/reminders', { params });
  return response.data.data;
};

export const sendAdminManualNotification = async (payload: {
  userId: string;
  title: string;
  body: string;
}) => {
  const response = await api.post('/admin/reminders/notify', payload);
  return response.data.data;
};

export const changeAdminPassword = async (payload: {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}) => {
  const response = await api.patch('/admin/change-password', payload);
  return response.data.data;
};

export const getAdminSkins = async () => {
  const response = await api.get('/admin/skins');
  return response.data.data;
};

export const createAdminSkin = async (payload: {
  name: string;
  category: string;
  price: number;
  required_level: number;
  image_url: string;
  anchor?: any;
}) => {
  const response = await api.post('/admin/skins', payload);
  return response.data.data;
};

export const updateAdminSkin = async (
  id: string,
  payload: {
    name?: string;
    category?: string;
    price?: number;
    required_level?: number;
    image_url?: string;
    anchor?: any;
  },
) => {
  const response = await api.put(`/admin/skins/${id}`, payload);
  return response.data.data;
};

export const deleteAdminSkin = async (id: string) => {
  const response = await api.delete(`/admin/skins/${id}`);
  return response.data.data;
};
