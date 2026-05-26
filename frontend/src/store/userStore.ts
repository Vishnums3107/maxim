import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DailyEntry, Protocol, WeeklyReview, HabitTracker, BreathingSession, FocusBlock } from '../types';

const STORAGE_KEYS = {
  PROFILE: '@maxim_profile',
  DAILY_ENTRIES: '@maxim_daily_entries',
  PROTOCOLS: '@maxim_protocols',
  WEEKLY_REVIEWS: '@maxim_weekly_reviews',
  HABITS: '@maxim_habits',
  BREATHING_SESSIONS: '@maxim_breathing',
  FOCUS_BLOCKS: '@maxim_focus_blocks',
  CUSTOM_API_KEY: '@maxim_custom_api_key',
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

  loadData: async () => {
    try {
      const [profile, dailyEntries, protocols, weeklyReviews, habits, breathing, focus, customApiKey] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_ENTRIES),
        AsyncStorage.getItem(STORAGE_KEYS.PROTOCOLS),
        AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_REVIEWS),
        AsyncStorage.getItem(STORAGE_KEYS.HABITS),
        AsyncStorage.getItem(STORAGE_KEYS.BREATHING_SESSIONS),
        AsyncStorage.getItem(STORAGE_KEYS.FOCUS_BLOCKS),
        AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_API_KEY),
      ]);

      set({
        profile: profile ? JSON.parse(profile) : null,
        dailyEntries: dailyEntries ? JSON.parse(dailyEntries) : [],
        protocols: protocols ? JSON.parse(protocols) : [],
        weeklyReviews: weeklyReviews ? JSON.parse(weeklyReviews) : [],
        habits: habits ? JSON.parse(habits) : [],
        breathingSessions: breathing ? JSON.parse(breathing) : [],
        focusBlocks: focus ? JSON.parse(focus) : [],
        customApiKey: customApiKey || null,
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
    const protocols = [protocol, ...get().protocols].slice(0, 50); // Keep last 50
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
}));
