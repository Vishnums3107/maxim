import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { generateProtocol, generateWeeklyReview } from '../../src/utils/api';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export default function SystemsModule() {
  const router = useRouter();
  const { profile, habits, dailyEntries, addHabit, completeHabit, addProtocol, addWeeklyReview } = useUserStore();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');

  // Calculate System Health Score (1-10)
  const systemHealth = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    }).map(d => format(d, 'yyyy-MM-dd'));

    // Habit consistency (40%)
    let habitScore = 0;
    if (habits.length > 0) {
      const totalPossible = habits.length * 7;
      const totalCompleted = habits.reduce((acc, habit) => {
        return acc + last7Days.filter(d => habit.completions.includes(d)).length;
      }, 0);
      habitScore = (totalCompleted / totalPossible) * 4;
    } else {
      habitScore = 2; // Neutral if no habits
    }

    // Daily protocol completion (40%)
    let protocolScore = 0;
    const recentEntries = dailyEntries.filter(e => last7Days.includes(e.date));
    if (recentEntries.length > 0) {
      const totalActions = recentEntries.reduce((acc, entry) => {
        let completed = 0;
        if (entry.physicalAction?.completed) completed++;
        if (entry.cognitiveAction?.completed) completed++;
        if (entry.regulationAction?.completed) completed++;
        if (entry.socialAction?.completed) completed++;
        if (entry.systemAction?.completed) completed++;
        return acc + completed;
      }, 0);
      protocolScore = (totalActions / (recentEntries.length * 5)) * 4;
    } else {
      protocolScore = 0;
    }

    // Profile completeness (20%)
    let profileScore = 1;
    if (profile) {
      if (profile.age) profileScore += 0.2;
      if (profile.learningGoals.length > 0) profileScore += 0.4;
      if (profile.dailyTimeAvailable) profileScore += 0.2;
      if (profile.level !== 'beginner') profileScore += 0.2;
    }

    const total = Math.min(10, Math.round((habitScore + protocolScore + profileScore) * 10) / 10);
    return total;
  }, [habits, dailyEntries, profile]);

  // Calculate individual habit consistency rates
  const getHabitStats = (habit: typeof habits[0]) => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    }).map(d => format(d, 'yyyy-MM-dd'));

    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    }).map(d => format(d, 'yyyy-MM-dd'));

    const weeklyRate = last7Days.filter(d => habit.completions.includes(d)).length;
    const monthlyRate = last30Days.filter(d => habit.completions.includes(d)).length;

    return {
      weeklyRate,
      monthlyRate,
      totalCompletions: habit.completions.length,
    };
  };

  const generateSystemsProtocol = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateProtocol(profile, 'systems');
      setProtocol(response.protocol);
      await addProtocol({
        id: Date.now().toString(),
        module: 'systems',
        content: response.protocol,
        generatedAt: response.generated_at,
        sessionId: response.session_id,
      });
    } catch (error) {
      console.error('Error:', error);
      setProtocol('Unable to generate protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReview = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateWeeklyReview(profile);
      await addWeeklyReview({
        id: Date.now().toString(),
        weekEnding: response.week_ending,
        content: response.review,
        generatedAt: response.generated_at,
      });
      Alert.alert('Review Generated', 'Your weekly review has been saved to your profile.');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unable to generate review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async () => {
    if (!newHabitName.trim()) return;
    await addHabit({
      id: Date.now().toString(),
      name: newHabitName.trim(),
      module: 'systems',
      frequency: 'daily',
      completions: [],
      createdAt: new Date().toISOString(),
    });
    setNewHabitName('');
    setShowAddHabit(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={styles.title}>Systems & Consistency</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: '#3B82F620' }]}>
            <Ionicons name="settings" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.heroTitle}>Replace Motivation with Systems</Text>
          <Text style={styles.heroSubtitle}>
            Build automatic behaviors. Track what matters. Simplify when overwhelmed.
          </Text>
        </View>

        {/* System Health Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthScoreContainer}>
              <View style={[
                styles.healthScoreRing,
                { borderColor: systemHealth >= 7 ? '#10B981' : systemHealth >= 4 ? '#F59E0B' : '#EF4444' }
              ]}>
                <Text style={styles.healthScoreText}>{systemHealth.toFixed(1)}</Text>
                <Text style={styles.healthScoreLabel}>/10</Text>
              </View>
            </View>
            <View style={styles.healthDetails}>
              <View style={styles.healthRow}>
                <Ionicons name="repeat" size={16} color="#9CA3AF" />
                <Text style={styles.healthRowText}>Habit consistency</Text>
                <View style={[styles.healthDot, { backgroundColor: habits.length > 0 ? '#10B981' : '#374151' }]} />
              </View>
              <View style={styles.healthRow}>
                <Ionicons name="checkmark-circle" size={16} color="#9CA3AF" />
                <Text style={styles.healthRowText}>Daily protocols</Text>
                <View style={[styles.healthDot, { backgroundColor: dailyEntries.length > 0 ? '#10B981' : '#374151' }]} />
              </View>
              <View style={styles.healthRow}>
                <Ionicons name="person" size={16} color="#9CA3AF" />
                <Text style={styles.healthRowText}>Profile complete</Text>
                <View style={[styles.healthDot, { backgroundColor: profile?.learningGoals?.length ? '#10B981' : '#F59E0B' }]} />
              </View>
            </View>
          </View>
        </View>
        {/* Habits Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit Tracker</Text>
            <TouchableOpacity onPress={() => setShowAddHabit(true)}>
              <Ionicons name="add-circle" size={28} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {showAddHabit && (
            <View style={styles.addHabitCard}>
              <TextInput
                style={styles.habitInput}
                value={newHabitName}
                onChangeText={setNewHabitName}
                placeholder="Enter habit name..."
                placeholderTextColor="#6B7280"
                autoFocus
              />
              <View style={styles.addHabitButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddHabit(false);
                    setNewHabitName('');
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addButton} onPress={handleAddHabit}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {habits.length > 0 ? (
            habits.map((habit) => {
              const isCompletedToday = habit.completions.includes(today);
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.habitCard}
                  onPress={() => completeHabit(habit.id, today)}
                >
                  <View style={[
                    styles.habitCheckbox,
                    isCompletedToday && styles.habitChecked,
                  ]}>
                    {isCompletedToday && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                  <View style={styles.habitContent}>
                    <Text style={styles.habitName}>{habit.name}</Text>
                    <View style={styles.habitStats}>
                      <View style={styles.habitStatItem}>
                        <Text style={styles.habitStatValue}>{getHabitStats(habit).weeklyRate}</Text>
                        <Text style={styles.habitStatLabel}>/7 this week</Text>
                      </View>
                      <View style={styles.habitStatItem}>
                        <Text style={styles.habitStatValue}>{getHabitStats(habit).monthlyRate}</Text>
                        <Text style={styles.habitStatLabel}>/30 this month</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="repeat" size={40} color="#4B5563" />
              <Text style={styles.emptyText}>No habits yet</Text>
              <Text style={styles.emptySubtext}>Add your first habit to start tracking</Text>
            </View>
          )}
        </View>

        {/* Weekly Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Review</Text>
          <TouchableOpacity style={styles.reviewCard} onPress={handleGenerateReview}>
            <Ionicons name="document-text" size={24} color="#3B82F6" />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewTitle}>Generate Weekly Review</Text>
              <Text style={styles.reviewDesc}>AI analysis of your week</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* System Principles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Principles</Text>
          <View style={styles.principlesCard}>
            <PrincipleItem
              icon="id-card"
              title="Identity-Based Habits"
              desc="Focus on who you want to become, not what you want to achieve"
            />
            <PrincipleItem
              icon="remove-circle"
              title="Friction Reduction"
              desc="Make good behaviors easier, bad behaviors harder"
            />
            <PrincipleItem
              icon="trending-down"
              title="Auto-Simplification"
              desc="When overwhelmed, reduce scope rather than pushing through"
            />
          </View>
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Systems Coach</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#3B82F6" />
              <Text style={styles.loadingText}>Generating systems protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateSystemsProtocol}
              >
                <Ionicons name="refresh" size={16} color="#3B82F6" />
                <Text style={[styles.regenerateText, { color: '#3B82F6' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#3B82F6' }]}
              onPress={generateSystemsProtocol}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Get System Recommendations</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PrincipleItem = ({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) => (
  <View style={styles.principleItem}>
    <Ionicons name={icon as any} size={20} color="#3B82F6" />
    <View style={styles.principleContent}>
      <Text style={styles.principleTitle}>{title}</Text>
      <Text style={styles.principleDesc}>{desc}</Text>
    </View>
  </View>
);

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  heroCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  addHabitCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#F9FAFB',
    fontSize: 16,
    marginBottom: 12,
  },
  addHabitButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  habitCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  habitContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  habitStats: {
    flexDirection: 'row',
    gap: 16,
  },
  habitStatItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  habitStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  habitStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 2,
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
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  reviewContent: {
    flex: 1,
    marginLeft: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  reviewDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  principlesCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  principleItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  principleContent: {
    flex: 1,
    marginLeft: 12,
  },
  principleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  principleDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    lineHeight: 18,
  },
  loadingCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
  },
  protocolCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  protocolText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 8,
  },
  regenerateText: {
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
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
  healthCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScoreContainer: {
    marginRight: 20,
  },
  healthScoreRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthScoreText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  healthScoreLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  healthDetails: {
    flex: 1,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  healthRowText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
