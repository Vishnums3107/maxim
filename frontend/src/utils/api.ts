/**
 * MAXIM API Client
 * REFACTORED: Now uses on-device AI via aiService.ts
 * No longer requires backend server.
 */

import { UserProfile } from '../types';
import {
  generateProtocol as localGenerateProtocol,
  generateDailyBriefing as localGenerateDailyBriefing,
  generateWeeklyReview as localGenerateWeeklyReview,
  chatWithCoach as localChatWithCoach,
  checkHealth as localCheckHealth
} from '../services/aiService';
import { ModuleType } from '../constants/prompts';

export const generateProtocol = async (
  profile: UserProfile,
  module: string,
  context?: string
) => {
  return localGenerateProtocol(profile, module as ModuleType, context);
};

export const generateDailyBriefing = async (profile: UserProfile) => {
  return localGenerateDailyBriefing(profile);
};

export const generateWeeklyReview = async (profile: UserProfile, weekData?: any) => {
  return localGenerateWeeklyReview(profile, weekData);
};

export const chatWithCoach = async (
  message: string,
  profile: UserProfile,
  module: string,
  sessionId: string
) => {
  return localChatWithCoach(message, profile, module as ModuleType, sessionId);
};

export const checkHealth = async () => {
  return localCheckHealth();
};

export default { generateProtocol, generateDailyBriefing, generateWeeklyReview, chatWithCoach, checkHealth };
