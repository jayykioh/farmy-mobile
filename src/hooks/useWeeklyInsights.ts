import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { fetchWeeklyInsights, triggerWeeklyInsight, WeeklyInsight } from '../api/weekly-insights';

export function useWeeklyInsights(limit: number = 5) {
  const [data, setData] = useState<WeeklyInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const loadInsights = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const insights = await fetchWeeklyInsights(limit);
      setData(insights);
    } catch (err) {
      console.error('Fetch weekly insights error', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, limit]);

  const trigger = useCallback(async (diaryId: string) => {
    if (!isAuthenticated) return;
    try {
      setIsTriggering(true);
      const result = await triggerWeeklyInsight(diaryId);
      if (result.already_exists) {
        setIsTriggering(false);
        return result;
      }
      // Wait a moment for background processing to finish, then reload
      setTimeout(async () => {
        await loadInsights();
        setIsTriggering(false);
      }, 2000);
      return result;
    } catch (err) {
      console.error('Trigger weekly insight error', err);
      setIsTriggering(false);
      throw err;
    }
  }, [isAuthenticated, loadInsights]);

  useEffect(() => {
    void Promise.resolve().then(loadInsights);
  }, [loadInsights]);

  return {
    data,
    isLoading,
    isTriggering,
    refetch: loadInsights,
    trigger,
  };
}
