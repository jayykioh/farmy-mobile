import { api } from './client';

export type WeeklyInsight = {
  id: string;
  user_id: string;
  week_start_date: string;
  insight_text: string;
  created_at: string;
};

export const fetchWeeklyInsights = async (limit: number = 10): Promise<WeeklyInsight[]> => {
  const { data } = await api.get('/weekly-insights', {
    params: { limit },
  });
  return data.data ? data.data : data;
};

export const triggerWeeklyInsight = async (): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/weekly-insights/trigger');
  return data;
};
