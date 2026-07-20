import { api } from './client';

export type WeeklyInsight = {
  id: string;
  user_id: string;
  week_start_date: string;
  insight_text: string;
  created_at: string;
  model_used?: string;
  tokens_used?: number;
  diary_id?: string;
  crop_type?: string;
  season?: string;
};

export const fetchWeeklyInsights = async (limit: number = 10): Promise<WeeklyInsight[]> => {
  const { data } = await api.get('/weekly-insights', {
    params: { limit },
  });
  return data.data ? data.data : data;
};

export type TriggerWeeklyInsightResult = {
  success: boolean;
  already_exists?: boolean;
  message: string;
};

export const triggerWeeklyInsight = async (diaryId: string): Promise<TriggerWeeklyInsightResult> => {
  const { data } = await api.post('/weekly-insights/trigger', { diary_id: diaryId });
  return data;
};
