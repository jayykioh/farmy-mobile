import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getErrorMessage } from '../utils/errors';

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
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchDiaries = useCallback(async () => {
    if (!isAuthenticated) {
      setData([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get('/diaries');
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách nhật ký.'));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void Promise.resolve().then(fetchDiaries);
  }, [fetchDiaries]);

  return { data, isLoading, error, refetch: fetchDiaries };
}

// Lấy chi tiết Diary
export function useDiaryDetail(id: string) {
  const [data, setData] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchDetail = useCallback(async () => {
    if (!isAuthenticated || !id) {
      setData(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get(`/diaries/${id}`);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải chi tiết nhật ký.'));
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    void Promise.resolve().then(fetchDetail);
  }, [fetchDetail]);

  return { data, isLoading, error, refetch: fetchDetail };
}

// Lấy Logs của Diary
export function useDiaryLogs(id: string) {
  const [data, setData] = useState<DiaryLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetchLogs = useCallback(async () => {
    if (!isAuthenticated || !id) {
      setData([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await api.get(`/diaries/${id}/logs`);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải hoạt động nhật ký.'));
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    void Promise.resolve().then(fetchLogs);
  }, [fetchLogs]);

  return { data, isLoading, error, refetch: fetchLogs };
}
