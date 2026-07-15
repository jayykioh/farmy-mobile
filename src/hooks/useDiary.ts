import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export interface Diary {
  _id: string;
  crop_type: string;
  season?: string;
  start_date: string;
  status: 'active' | 'archived';
  health_status: string;
  notes?: string;
}

export interface DiaryLog {
  _id: string;
  diary_id: string;
  activity_type: string;
  content: string;
  image_url?: string;
  photo_urls?: string[];
  created_at: string;
}

// Lấy danh sách Diary
export function useDiaries() {
  const [data, setData] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const fetchDiaries = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const res = await api.get('/diaries');
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch diaries error', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  return { data, isLoading, refetch: fetchDiaries };
}

// Lấy chi tiết Diary
export function useDiaryDetail(id: string) {
  const [data, setData] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const fetchDetail = useCallback(async () => {
    if (!isAuthenticated || !id) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/diaries/${id}`);
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch diary detail error', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { data, isLoading, refetch: fetchDetail };
}

// Lấy Logs của Diary
export function useDiaryLogs(id: string) {
  const [data, setData] = useState<DiaryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const fetchLogs = useCallback(async () => {
    if (!isAuthenticated || !id) return;
    try {
      setIsLoading(true);
      const res = await api.get(`/diaries/${id}/logs`);
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch diary logs error', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { data, isLoading, refetch: fetchLogs };
}
