import type { ModuleType } from '../constants/prompts';
export type { ModuleType };

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  
  // Basic Info
  age?: number;
  sex?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  
  // Self-Reported Metrics (1-10)
  sleepQuality: number;
  energyLevel: number;
  attentionStability: number;
  anxietyTendency: number;
  socialConfidence: number;
  
  // Activity & Goals
  physicalActivity: 'sedentary' | 'light' | 'moderate' | 'active';
  learningGoals: string[];
  dailyTimeAvailable: number; // minutes
  
  // Experience Level
  level: 'beginner' | 'intermediate' | 'advanced';
  
  // Onboarding Complete
  onboardingComplete: boolean;
}

export interface DailyEntry {
  id: string;
  date: string;
  
  // Morning Check-in
  morningEnergy: number;
  sleepHours: number;
  sleepQuality: number;
  
  // Completed Actions
  physicalAction?: CompletedAction;
  cognitiveAction?: CompletedAction;
  regulationAction?: CompletedAction;
  socialAction?: CompletedAction;
  systemAction?: CompletedAction;
  
  // Evening Reflection
  eveningEnergy?: number;
  stressLevel?: number;
  notes?: string;
}

export interface CompletedAction {
  title: string;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  difficulty?: number; // 1-5
}

export interface Protocol {
  id: string;
  module: ModuleType;
  content: string;
  generatedAt: string;
  sessionId: string;
}

export interface WeeklyReview {
  id: string;
  weekEnding: string;
  content: string;
  systemHealthScore?: number;
  generatedAt: string;
}

export interface HabitTracker {
  id: string;
  name: string;
  module: ModuleType;
  frequency: 'daily' | 'weekly';
  completions: string[]; // dates completed
  createdAt: string;
}

export interface BreathingSession {
  id: string;
  type: 'box' | 'physiological-sigh' | '4-7-8' | 'coherent';
  duration: number; // seconds
  completedAt: string;
}

export interface FocusBlock {
  id: string;
  title: string;
  duration: number; // minutes
  startedAt?: string;
  completedAt?: string;
  distractions: number;
}

export interface ThoughtEntry {
  id: string;
  thought: string;
  action: string;
  createdAt: string;
}

export interface LearningGoal {
  id: string;
  title: string;
  subgoals: SubGoal[];
  createdAt: string;
}

export interface SubGoal {
  id: string;
  title: string;
  completed: boolean;
}

export interface DistractionEntry {
  id: string;
  type: string;
  trigger: string;
  time: string;
  severity: 1 | 2 | 3;
}

export interface ConversationReflection {
  id: string;
  context: string;
  wentWell: string;
  improve: string;
  rating: number;
  createdAt: string;
}

export interface FrictionPoint {
  id: string;
  habit: string;
  friction: string;
  solution: string;
  resolved: boolean;
}

export interface MoodEntry {
  date: string;
  mood: number;
  anxiety: number;
  energy: number;
}
