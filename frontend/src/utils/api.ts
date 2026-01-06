import axios from 'axios';
import { UserProfile } from '../types';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000, // AI responses can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProfileForAPI {
  age?: number;
  sex?: string;
  height?: number;
  weight?: number;
  sleep_quality: number;
  energy_level: number;
  attention_stability: number;
  anxiety_tendency: number;
  physical_activity: string;
  learning_goals: string[];
  social_confidence: number;
  daily_time_available: number;
  level: string;
}

export const convertProfileForAPI = (profile: UserProfile): ProfileForAPI => ({
  age: profile.age,
  sex: profile.sex,
  height: profile.height,
  weight: profile.weight,
  sleep_quality: profile.sleepQuality,
  energy_level: profile.energyLevel,
  attention_stability: profile.attentionStability,
  anxiety_tendency: profile.anxietyTendency,
  physical_activity: profile.physicalActivity,
  learning_goals: profile.learningGoals,
  social_confidence: profile.socialConfidence,
  daily_time_available: profile.dailyTimeAvailable,
  level: profile.level,
});

export const generateProtocol = async (
  profile: UserProfile,
  module: string,
  context?: string
) => {
  const response = await api.post('/generate-protocol', {
    profile: convertProfileForAPI(profile),
    module,
    context,
  });
  return response.data;
};

export const generateDailyBriefing = async (profile: UserProfile) => {
  const response = await api.post('/daily-briefing', convertProfileForAPI(profile));
  return response.data;
};

export const generateWeeklyReview = async (profile: UserProfile, weekData?: any) => {
  const response = await api.post('/weekly-review', {
    profile: convertProfileForAPI(profile),
    week_data: weekData,
  });
  return response.data;
};

export const chatWithCoach = async (
  message: string,
  profile: UserProfile,
  module: string,
  sessionId: string
) => {
  const response = await api.post('/chat', {
    message,
    profile: convertProfileForAPI(profile),
    module,
    session_id: sessionId,
  });
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
