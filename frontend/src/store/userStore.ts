import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile, DailyEntry, Protocol, WeeklyReview, HabitTracker,
  BreathingSession, FocusBlock, ThoughtEntry, LearningGoal,
  DistractionEntry, ConversationReflection, FrictionPoint, MoodEntry,
} from '../types';

const STORAGE_KEYS = {
  PROFILE: '@maxim_profile',
  DAILY_ENTRIES: '@maxim_daily_entries',
  PROTOCOLS: '@maxim_protocols',
  WEEKLY_REVIEWS: '@maxim_weekly_reviews',
  HABITS: '@maxim_habits',
  BREATHING_SESSIONS: '@maxim_breathing',
  FOCUS_BLOCKS: '@maxim_focus_blocks',
  CUSTOM_API_KEY: '@maxim_custom_api_key',
  THOUGHT_ENTRIES: '@maxim_thought_entries',
  LEARNING_GOALS: '@maxim_learning_goals',
  DISTRACTION_ENTRIES: '@maxim_distraction_entries',
  EXPOSURE_COMPLETED: '@maxim_exposure_completed',
  CONVERSATION_REFLECTIONS: '@maxim_conversation_reflections',
  FRICTION_POINTS: '@maxim_friction_points',
  IDENTITY_STATEMENTS: '@maxim_identity_statements',
  MOOD_ENTRIES: '@maxim_mood_entries',
  SOCIAL_TASKS_COMPLETED: '@maxim_social_tasks',
  SOCIAL_PRACTICE_LOG: '@maxim_social_practice',
  SOCIAL_RESPONSE_DELAY: '@maxim_social_delay',
};

interface UserState {
  profile: UserProfile | null;
  dailyEntries: DailyEntry[];
  protocols: Protocol[];
  weeklyReviews: WeeklyReview[];
  habits: HabitTracker[];
  breathingSessions: BreathingSession[];
  focusBlocks: FocusBlock[];
  customApiKey: string | null;
  isLoading: boolean;

  thoughtEntries: ThoughtEntry[];
  learningGoals: LearningGoal[];
  distractionEntries: DistractionEntry[];
  exposureCompleted: string[];
  conversationReflections: ConversationReflection[];
  frictionPoints: FrictionPoint[];
  identityStatements: string[];
  moodEntries: MoodEntry[];
  socialTasksCompleted: number[];
  socialPracticeLog: string[];
  socialResponseDelay: number;

  // Actions
  loadData: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addDailyEntry: (entry: DailyEntry) => Promise<void>;
  updateDailyEntry: (id: string, updates: Partial<DailyEntry>) => Promise<void>;
  getTodayEntry: () => DailyEntry | undefined;
  addProtocol: (protocol: Protocol) => Promise<void>;
  addWeeklyReview: (review: WeeklyReview) => Promise<void>;
  addHabit: (habit: HabitTracker) => Promise<void>;
  completeHabit: (habitId: string, date: string) => Promise<void>;
  addBreathingSession: (session: BreathingSession) => Promise<void>;
  addFocusBlock: (block: FocusBlock) => Promise<void>;
  updateFocusBlock: (id: string, updates: Partial<FocusBlock>) => Promise<void>;
  clearAllData: () => Promise<void>;
  setCustomApiKey: (key: string | null) => Promise<void>;
  getCustomApiKey: () => string | null;

  addThoughtEntry: (entry: ThoughtEntry) => Promise<void>;
  addLearningGoal: (goal: LearningGoal) => Promise<void>;
  updateLearningGoals: (goals: LearningGoal[]) => Promise<void>;
  addDistractionEntry: (entry: DistractionEntry) => Promise<void>;
  toggleExposureItem: (id: string) => Promise<void>;
  addConversationReflection: (reflection: ConversationReflection) => Promise<void>;
  addFrictionPoint: (point: FrictionPoint) => Promise<void>;
  addIdentityStatement: (statement: string) => Promise<void>;
  addMoodEntry: (entry: MoodEntry) => Promise<void>;
  toggleSocialTask: (index: number) => Promise<void>;
  addSocialPractice: (drillId: string) => Promise<void>;
  setSocialResponseDelay: (delay: number) => Promise<void>;
}

const getToday = () => new Date().toISOString().split('T')[0];

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  dailyEntries: [],
  protocols: [],
  weeklyReviews: [],
  habits: [],
  breathingSessions: [],
  focusBlocks: [],
  customApiKey: null,
  isLoading: true,

  thoughtEntries: [],
  learningGoals: [],
  distractionEntries: [],
  exposureCompleted: [],
  conversationReflections: [],
  frictionPoints: [],
  identityStatements: [],
  moodEntries: [],
  socialTasksCompleted: [],
  socialPracticeLog: [],
  socialResponseDelay: 1,

  loadData: async () => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const results = await AsyncStorage.multiGet(keys);
      const data: Record<string, string | null> = {};
      results.forEach(([key, value]) => { data[key] = value; });

      set({
        profile: data[STORAGE_KEYS.PROFILE] ? JSON.parse(data[STORAGE_KEYS.PROFILE]!) : null,
        dailyEntries: data[STORAGE_KEYS.DAILY_ENTRIES] ? JSON.parse(data[STORAGE_KEYS.DAILY_ENTRIES]!) : [],
        protocols: data[STORAGE_KEYS.PROTOCOLS] ? JSON.parse(data[STORAGE_KEYS.PROTOCOLS]!) : [],
        weeklyReviews: data[STORAGE_KEYS.WEEKLY_REVIEWS] ? JSON.parse(data[STORAGE_KEYS.WEEKLY_REVIEWS]!) : [],
        habits: data[STORAGE_KEYS.HABITS] ? JSON.parse(data[STORAGE_KEYS.HABITS]!) : [],
        breathingSessions: data[STORAGE_KEYS.BREATHING_SESSIONS] ? JSON.parse(data[STORAGE_KEYS.BREATHING_SESSIONS]!) : [],
        focusBlocks: data[STORAGE_KEYS.FOCUS_BLOCKS] ? JSON.parse(data[STORAGE_KEYS.FOCUS_BLOCKS]!) : [],
        customApiKey: data[STORAGE_KEYS.CUSTOM_API_KEY] || null,
        thoughtEntries: data[STORAGE_KEYS.THOUGHT_ENTRIES] ? JSON.parse(data[STORAGE_KEYS.THOUGHT_ENTRIES]!) : [],
        learningGoals: data[STORAGE_KEYS.LEARNING_GOALS] ? JSON.parse(data[STORAGE_KEYS.LEARNING_GOALS]!) : [],
        distractionEntries: data[STORAGE_KEYS.DISTRACTION_ENTRIES] ? JSON.parse(data[STORAGE_KEYS.DISTRACTION_ENTRIES]!) : [],
        exposureCompleted: data[STORAGE_KEYS.EXPOSURE_COMPLETED] ? JSON.parse(data[STORAGE_KEYS.EXPOSURE_COMPLETED]!) : [],
        conversationReflections: data[STORAGE_KEYS.CONVERSATION_REFLECTIONS] ? JSON.parse(data[STORAGE_KEYS.CONVERSATION_REFLECTIONS]!) : [],
        frictionPoints: data[STORAGE_KEYS.FRICTION_POINTS] ? JSON.parse(data[STORAGE_KEYS.FRICTION_POINTS]!) : [],
        identityStatements: data[STORAGE_KEYS.IDENTITY_STATEMENTS] ? JSON.parse(data[STORAGE_KEYS.IDENTITY_STATEMENTS]!) : [],
        moodEntries: data[STORAGE_KEYS.MOOD_ENTRIES] ? JSON.parse(data[STORAGE_KEYS.MOOD_ENTRIES]!) : [],
        socialTasksCompleted: data[STORAGE_KEYS.SOCIAL_TASKS_COMPLETED] ? JSON.parse(data[STORAGE_KEYS.SOCIAL_TASKS_COMPLETED]!) : [],
        socialPracticeLog: data[STORAGE_KEYS.SOCIAL_PRACTICE_LOG] ? JSON.parse(data[STORAGE_KEYS.SOCIAL_PRACTICE_LOG]!) : [],
        socialResponseDelay: data[STORAGE_KEYS.SOCIAL_RESPONSE_DELAY] ? JSON.parse(data[STORAGE_KEYS.SOCIAL_RESPONSE_DELAY]!) : 1,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  setProfile: async (profile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    set({ profile });
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    if (!current) return;
    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    set({ profile: updated });
  },

  addDailyEntry: async (entry) => {
    const entries = [...get().dailyEntries, entry];
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries));
    set({ dailyEntries: entries });
  },

  updateDailyEntry: async (id, updates) => {
    const entries = get().dailyEntries.map(e => e.id === id ? { ...e, ...updates } : e);
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries));
    set({ dailyEntries: entries });
  },

  getTodayEntry: () => {
    const today = getToday();
    return get().dailyEntries.find(e => e.date === today);
  },

  addProtocol: async (protocol) => {
    const protocols = [protocol, ...get().protocols].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.PROTOCOLS, JSON.stringify(protocols));
    set({ protocols });
  },

  addWeeklyReview: async (review) => {
    const reviews = [review, ...get().weeklyReviews].slice(0, 20);
    await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_REVIEWS, JSON.stringify(reviews));
    set({ weeklyReviews: reviews });
  },

  addHabit: async (habit) => {
    const habits = [...get().habits, habit];
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    set({ habits });
  },

  completeHabit: async (habitId, date) => {
    const habits = get().habits.map(h => {
      if (h.id === habitId) {
        const completions = h.completions.includes(date)
          ? h.completions.filter(d => d !== date)
          : [...h.completions, date];
        return { ...h, completions };
      }
      return h;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    set({ habits });
  },

  addBreathingSession: async (session) => {
    const sessions = [session, ...get().breathingSessions].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.BREATHING_SESSIONS, JSON.stringify(sessions));
    set({ breathingSessions: sessions });
  },

  addFocusBlock: async (block) => {
    const blocks = [block, ...get().focusBlocks].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_BLOCKS, JSON.stringify(blocks));
    set({ focusBlocks: blocks });
  },

  updateFocusBlock: async (id, updates) => {
    const blocks = get().focusBlocks.map(b => b.id === id ? { ...b, ...updates } : b);
    await AsyncStorage.setItem(STORAGE_KEYS.FOCUS_BLOCKS, JSON.stringify(blocks));
    set({ focusBlocks: blocks });
  },

  clearAllData: async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    set({
      profile: null,
      dailyEntries: [],
      protocols: [],
      weeklyReviews: [],
      habits: [],
      breathingSessions: [],
      focusBlocks: [],
      customApiKey: null,
      thoughtEntries: [],
      learningGoals: [],
      distractionEntries: [],
      exposureCompleted: [],
      conversationReflections: [],
      frictionPoints: [],
      identityStatements: [],
      moodEntries: [],
      socialTasksCompleted: [],
      socialPracticeLog: [],
      socialResponseDelay: 1,
    });
  },

  setCustomApiKey: async (key: string | null) => {
    if (key) {
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_API_KEY, key);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_API_KEY);
    }
    set({ customApiKey: key });
  },

  getCustomApiKey: () => {
    return get().customApiKey;
  },

  addThoughtEntry: async (entry) => {
    const entries = [entry, ...get().thoughtEntries].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.THOUGHT_ENTRIES, JSON.stringify(entries));
    set({ thoughtEntries: entries });
  },

  addLearningGoal: async (goal) => {
    const goals = [goal, ...get().learningGoals].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_GOALS, JSON.stringify(goals));
    set({ learningGoals: goals });
  },

  updateLearningGoals: async (goals) => {
    await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_GOALS, JSON.stringify(goals));
    set({ learningGoals: goals });
  },

  addDistractionEntry: async (entry) => {
    const entries = [entry, ...get().distractionEntries].slice(0, 200);
    await AsyncStorage.setItem(STORAGE_KEYS.DISTRACTION_ENTRIES, JSON.stringify(entries));
    set({ distractionEntries: entries });
  },

  toggleExposureItem: async (id) => {
    const current = get().exposureCompleted;
    const updated = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    await AsyncStorage.setItem(STORAGE_KEYS.EXPOSURE_COMPLETED, JSON.stringify(updated));
    set({ exposureCompleted: updated });
  },

  addConversationReflection: async (reflection) => {
    const reflections = [reflection, ...get().conversationReflections].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATION_REFLECTIONS, JSON.stringify(reflections));
    set({ conversationReflections: reflections });
  },

  addFrictionPoint: async (point) => {
    const points = [point, ...get().frictionPoints].slice(0, 100);
    await AsyncStorage.setItem(STORAGE_KEYS.FRICTION_POINTS, JSON.stringify(points));
    set({ frictionPoints: points });
  },

  addIdentityStatement: async (statement) => {
    const statements = [...get().identityStatements, statement].slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.IDENTITY_STATEMENTS, JSON.stringify(statements));
    set({ identityStatements: statements });
  },

  addMoodEntry: async (entry) => {
    const existing = get().moodEntries.filter(m => m.date !== entry.date);
    const entries = [entry, ...existing].slice(0, 365);
    await AsyncStorage.setItem(STORAGE_KEYS.MOOD_ENTRIES, JSON.stringify(entries));
    set({ moodEntries: entries });
  },

  toggleSocialTask: async (index) => {
    const current = get().socialTasksCompleted;
    const updated = current.includes(index)
      ? current.filter(i => i !== index)
      : [...current, index];
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_TASKS_COMPLETED, JSON.stringify(updated));
    set({ socialTasksCompleted: updated });
  },

  addSocialPractice: async (drillId) => {
    const log = [...get().socialPracticeLog, drillId].slice(-500);
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_PRACTICE_LOG, JSON.stringify(log));
    set({ socialPracticeLog: log });
  },

  setSocialResponseDelay: async (delay) => {
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_RESPONSE_DELAY, JSON.stringify(delay));
    set({ socialResponseDelay: delay });
  },
}));
