import { useState, useEffect, useCallback, useRef } from 'react';
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
  activity_type?: string;
  activityType?: string;
  content: string;
  image_url?: string;
  imageUrl?: string;
  photo_urls?: string[];
  photoUrls?: string[];
  created_at: string;
}

interface UseDiariesOptions {
  paginated?: boolean;
  limit?: number;
}

const normalizeListResponse = (data: unknown): Diary[] => {
  if (Array.isArray(data)) return data as Diary[];
  if (data && typeof data === 'object') {
    const value = data as { items?: unknown; data?: unknown; results?: unknown };
    if (Array.isArray(value.items)) return value.items as Diary[];
    if (Array.isArray(value.data)) return value.data as Diary[];
    if (Array.isArray(value.results)) return value.results as Diary[];
  }
  return [];
};

// Lấy danh sách Diary
export function useDiaries(options: UseDiariesOptions = {}) {
  const { paginated = false, limit = 12 } = options;
  const [data, setData] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const pageRef = useRef(1);
  const fallbackAllDataRef = useRef<Diary[] | null>(null);

  const setFallbackPage = useCallback((page: number) => {
    const allData = fallbackAllDataRef.current ?? [];
    const nextData = allData.slice(0, page * limit);
    setData(nextData);
    setHasMore(nextData.length < allData.length);
    pageRef.current = page;
  }, [limit]);

  const fetchDiaries = useCallback(async (page = 1) => {
    if (!isAuthenticated) {
      setData([]);
      setIsLoading(false);
      setIsFetchingMore(false);
      setHasMore(false);
      return;
    }
    try {
      const isFirstPage = page === 1;
      if (isFirstPage) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      if (paginated && fallbackAllDataRef.current && !isFirstPage) {
        setFallbackPage(page);
        setError(null);
        return;
      }

      const res = await api.get('/diaries', paginated ? { params: { page, limit } } : undefined);
      const list = normalizeListResponse(res.data.data);

      if (!paginated) {
        setData(list);
        setHasMore(false);
      } else if (page === 1 && list.length > limit) {
        fallbackAllDataRef.current = list;
        setFallbackPage(1);
      } else {
        fallbackAllDataRef.current = null;
        setData(prev => {
          const merged = page === 1 ? list : [...prev, ...list];
          return Array.from(new Map(merged.map(item => [item._id, item])).values());
        });
        setHasMore(list.length >= limit);
        pageRef.current = page;
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể tải danh sách nhật ký.'));
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [isAuthenticated, limit, paginated, setFallbackPage]);

  const refetch = useCallback(async () => {
    pageRef.current = 1;
    fallbackAllDataRef.current = null;
    await fetchDiaries(1);
  }, [fetchDiaries]);

  const loadMore = useCallback(async () => {
    if (!paginated || isLoading || isFetchingMore || !hasMore) return;
    await fetchDiaries(pageRef.current + 1);
  }, [fetchDiaries, hasMore, isFetchingMore, isLoading, paginated]);

  useEffect(() => {
    void Promise.resolve().then(refetch);
  }, [refetch]);

  return { data, isLoading, isFetchingMore, hasMore, error, refetch, loadMore };
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
