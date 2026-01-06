import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { generateDailyBriefing } from '../../src/utils/api';
import { ActionItem } from '../../src/components/ActionItem';
import { format } from 'date-fns';

export default function TodayScreen() {
  const { profile, getTodayEntry, updateDailyEntry, addDailyEntry } = useUserStore();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayActions, setTodayActions] = useState({
    physical: false,
    cognitive: false,
    regulation: false,
    social: false,
    system: false,
  });

  const todayEntry = getTodayEntry();
  const today = new Date();

  useEffect(() => {
    if (todayEntry) {
      setTodayActions({
        physical: !!todayEntry.physicalAction?.completed,
        cognitive: !!todayEntry.cognitiveAction?.completed,
        regulation: !!todayEntry.regulationAction?.completed,
        social: !!todayEntry.socialAction?.completed,
        system: !!todayEntry.systemAction?.completed,
      });
    }
  }, [todayEntry]);

  const fetchBriefing = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateDailyBriefing(profile);
      setBriefing(response.briefing);
    } catch (error) {
      console.error('Error fetching briefing:', error);
      setBriefing('Unable to generate briefing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBriefing();
    setRefreshing(false);
  };

  const toggleAction = async (action: keyof typeof todayActions) => {
    const newValue = !todayActions[action];
    setTodayActions(prev => ({ ...prev, [action]: newValue }));

    const dateStr = format(today, 'yyyy-MM-dd');
    const actionKey = `${action}Action` as const;

    if (todayEntry) {
      await updateDailyEntry(todayEntry.id, {
        [actionKey]: {
          title: action,
          completed: newValue,
          completedAt: newValue ? new Date().toISOString() : undefined,
        },
      });
    } else {
      await addDailyEntry({
        id: Date.now().toString(),
        date: dateStr,
        morningEnergy: profile?.energyLevel || 5,
        sleepHours: 7,
        sleepQuality: profile?.sleepQuality || 5,
        [actionKey]: {
          title: action,
          completed: newValue,
          completedAt: newValue ? new Date().toISOString() : undefined,
        },
      });
    }
  };

  const completedCount = Object.values(todayActions).filter(Boolean).length;
  const progressPercent = (completedCount / 5) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.date}>{format(today, 'EEEE, MMMM d')}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{profile?.level || 'beginner'}</Text>
          </View>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <View style={styles.progressInner}>
              <Text style={styles.progressNumber}>{completedCount}/5</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Daily Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Protocol</Text>
          
          <ActionItem
            title="Physical Action"
            subtitle="Movement, strength, or recovery"
            completed={todayActions.physical}
            onToggle={() => toggleAction('physical')}
            color="#EF4444"
          />
          
          <ActionItem
            title="Cognitive Action"
            subtitle="Focus block or learning session"
            completed={todayActions.cognitive}
            onToggle={() => toggleAction('cognitive')}
            color="#8B5CF6"
          />
          
          <ActionItem
            title="Regulation Action"
            subtitle="Breathing or mental control exercise"
            completed={todayActions.regulation}
            onToggle={() => toggleAction('regulation')}
            color="#10B981"
          />
          
          <ActionItem
            title="Social Action"
            subtitle="Communication or connection task"
            completed={todayActions.social}
            onToggle={() => toggleAction('social')}
            color="#F59E0B"
          />
          
          <ActionItem
            title="System Check"
            subtitle="Habit or routine maintenance"
            completed={todayActions.system}
            onToggle={() => toggleAction('system')}
            color="#3B82F6"
          />
        </View>

        {/* AI Briefing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Briefing</Text>
            <TouchableOpacity onPress={fetchBriefing} disabled={loading}>
              <Ionicons 
                name={loading ? "hourglass-outline" : "refresh-outline"} 
                size={20} 
                color="#3B82F6" 
              />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.briefingLoading}>
              <ActivityIndicator color="#3B82F6" />
              <Text style={styles.loadingText}>Generating your personalized briefing...</Text>
            </View>
          ) : briefing ? (
            <View style={styles.briefingCard}>
              <Text style={styles.briefingText}>{briefing}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.generateButton} onPress={fetchBriefing}>
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Generate Daily Briefing</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="flash" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{profile?.energyLevel || 5}/10</Text>
            <Text style={styles.statLabel}>Energy</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="moon" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{profile?.sleepQuality || 5}/10</Text>
            <Text style={styles.statLabel}>Sleep</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="eye" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{profile?.attentionStability || 5}/10</Text>
            <Text style={styles.statLabel}>Focus</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  date: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 4,
  },
  levelBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  progressSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    borderWidth: 4,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressInner: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  briefingLoading: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 14,
  },
  briefingCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  briefingText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
