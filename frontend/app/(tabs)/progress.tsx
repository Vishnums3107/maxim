import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { dailyEntries, breathingSessions, focusBlocks, habits } = useUserStore();

  const weekDays = useMemo(() => {
    const today = new Date();
    return eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
  }, []);

  const weekData = useMemo(() => {
    return weekDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = dailyEntries.find((e) => e.date === dateStr);
      let completed = 0;
      if (entry) {
        if (entry.physicalAction?.completed) completed++;
        if (entry.cognitiveAction?.completed) completed++;
        if (entry.regulationAction?.completed) completed++;
        if (entry.socialAction?.completed) completed++;
        if (entry.systemAction?.completed) completed++;
      }
      return {
        day: format(day, 'EEE'),
        date: format(day, 'd'),
        completed,
        total: 5,
      };
    });
  }, [weekDays, dailyEntries]);

  const stats = useMemo(() => {
    const totalBreathingTime = breathingSessions.reduce((acc, s) => acc + s.duration, 0);
    const totalFocusTime = focusBlocks
      .filter((b) => b.completedAt)
      .reduce((acc, b) => acc + b.duration, 0);
    const totalCompletedActions = dailyEntries.reduce((acc, entry) => {
      let count = 0;
      if (entry.physicalAction?.completed) count++;
      if (entry.cognitiveAction?.completed) count++;
      if (entry.regulationAction?.completed) count++;
      if (entry.socialAction?.completed) count++;
      if (entry.systemAction?.completed) count++;
      return acc + count;
    }, 0);

    return {
      breathingMinutes: Math.round(totalBreathingTime / 60),
      focusMinutes: totalFocusTime,
      completedActions: totalCompletedActions,
      activeDays: dailyEntries.length,
    };
  }, [breathingSessions, focusBlocks, dailyEntries]);

  const weeklyCompletion = useMemo(() => {
    const total = weekData.reduce((acc, d) => acc + d.completed, 0);
    const max = weekData.length * 5;
    return Math.round((total / max) * 100);
  }, [weekData]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>Track your performance journey</Text>
        </View>

        {/* Week Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weekCard}>
            <View style={styles.weekChart}>
              {weekData.map((day, index) => (
                <View key={index} style={styles.dayColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(day.completed / day.total) * 100}%`,
                          backgroundColor: day.completed > 0 ? '#3B82F6' : '#374151',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.day}</Text>
                  <Text style={styles.dateLabel}>{day.date}</Text>
                </View>
              ))}
            </View>
            <View style={styles.weekSummary}>
              <Text style={styles.weekPercent}>{weeklyCompletion}%</Text>
              <Text style={styles.weekLabel}>Weekly Completion</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All-Time Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              <Text style={styles.statValue}>{stats.completedActions}</Text>
              <Text style={styles.statLabel}>Actions Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={28} color="#8B5CF6" />
              <Text style={styles.statValue}>{stats.activeDays}</Text>
              <Text style={styles.statLabel}>Active Days</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="fitness" size={28} color="#10B981" />
              <Text style={styles.statValue}>{stats.breathingMinutes}</Text>
              <Text style={styles.statLabel}>Breathing (min)</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="timer" size={28} color="#3B82F6" />
              <Text style={styles.statValue}>{stats.focusMinutes}</Text>
              <Text style={styles.statLabel}>Focus (min)</Text>
            </View>
          </View>
        </View>

        {/* Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Habits</Text>
          {habits.length > 0 ? (
            habits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitMeta}>
                    {habit.frequency} • {habit.completions.length} completions
                  </Text>
                </View>
                <View style={styles.habitProgress}>
                  <Text style={styles.habitCount}>{habit.completions.length}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="repeat" size={40} color="#4B5563" />
              <Text style={styles.emptyText}>No habits tracked yet</Text>
              <Text style={styles.emptySubtext}>
                Start tracking habits in the Systems module
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
  },
  weekChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    flex: 1,
    width: 24,
    backgroundColor: '#374151',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F9FAFB',
    marginTop: 2,
  },
  weekSummary: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  weekPercent: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
  },
  weekLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  habitMeta: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  habitProgress: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  habitCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});
