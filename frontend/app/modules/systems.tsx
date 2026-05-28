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
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { colors, moduleGradients } from '../../src/theme/tokens';

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
        <ScreenChrome title="Systems & Consistency" />

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <ModuleHero
          icon="settings"
          title="Replace Motivation with Systems"
          subtitle="Build automatic behaviors. Track what matters. Simplify when overwhelmed."
          gradient={moduleGradients.systems}
          accent={colors.modules.systems}
        />
        </View>

        {/* System Health Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Health</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthScoreContainer}>
              <View style={[
                styles.healthScoreRing,
                { borderColor: systemHealth >= 7 ? '#34D399' : systemHealth >= 4 ? '#FBBF24' : '#F87171' }
              ]}>
                <Text style={styles.healthScoreText}>{systemHealth.toFixed(1)}</Text>
                <Text style={styles.healthScoreLabel}>/10</Text>
              </View>
            </View>
            <View style={styles.healthDetails}>
              <View style={styles.healthRow}>
                <Ionicons name="repeat" size={16} color="#9494A0" />
                <Text style={styles.healthRowText}>Habit consistency</Text>
                <View style={[styles.healthDot, { backgroundColor: habits.length > 0 ? '#34D399' : '#1F1F2C' }]} />
              </View>
              <View style={styles.healthRow}>
                <Ionicons name="checkmark-circle" size={16} color="#9494A0" />
                <Text style={styles.healthRowText}>Daily protocols</Text>
                <View style={[styles.healthDot, { backgroundColor: dailyEntries.length > 0 ? '#34D399' : '#1F1F2C' }]} />
              </View>
              <View style={styles.healthRow}>
                <Ionicons name="person" size={16} color="#9494A0" />
                <Text style={styles.healthRowText}>Profile complete</Text>
                <View style={[styles.healthDot, { backgroundColor: profile?.learningGoals?.length ? '#34D399' : '#FBBF24' }]} />
              </View>
            </View>
          </View>
        </View>
        {/* Habits Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit Tracker</Text>
            <TouchableOpacity onPress={() => setShowAddHabit(true)}>
              <Ionicons name="add-circle" size={28} color="#60A5FA" />
            </TouchableOpacity>
          </View>

          {showAddHabit && (
            <View style={styles.addHabitCard}>
              <TextInput
                style={styles.habitInput}
                value={newHabitName}
                onChangeText={setNewHabitName}
                placeholder="Enter habit name..."
                placeholderTextColor="#5E5E6A"
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
              <Ionicons name="repeat" size={40} color="#37373F" />
              <Text style={styles.emptyText}>No habits yet</Text>
              <Text style={styles.emptySubtext}>Add your first habit to start tracking</Text>
            </View>
          )}
        </View>

        {/* Weekly Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Review</Text>
          <TouchableOpacity style={styles.reviewCard} onPress={handleGenerateReview}>
            <Ionicons name="document-text" size={24} color="#60A5FA" />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewTitle}>Generate Weekly Review</Text>
              <Text style={styles.reviewDesc}>AI analysis of your week</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
          </TouchableOpacity>
        </View>

        {/* System Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Tools</Text>
          <TouchableOpacity
            style={styles.reviewCard}
            onPress={() => router.push('/modules/friction')}
          >
            <Ionicons name="construct" size={24} color="#FBBF24" />
            <View style={styles.reviewContent}>
              <Text style={styles.reviewTitle}>Friction Audit</Text>
              <Text style={styles.reviewDesc}>Find and remove friction from your systems</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
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
              <ActivityIndicator color="#60A5FA" />
              <Text style={styles.loadingText}>Generating systems protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateSystemsProtocol}
              >
                <Ionicons name="refresh" size={16} color="#60A5FA" />
                <Text style={[styles.regenerateText, { color: '#60A5FA' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#60A5FA' }]}
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
    <Ionicons name={icon as any} size={20} color="#60A5FA" />
    <View style={styles.principleContent}>
      <Text style={styles.principleTitle}>{title}</Text>
      <Text style={styles.principleDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06060B',
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
    color: '#F5F5F7',
  },
  heroCard: {
    backgroundColor: '#11111C',
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
    color: '#F5F5F7',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9494A0',
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
    color: '#F5F5F7',
  },
  addHabitCard: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitInput: {
    backgroundColor: '#1F1F2C',
    borderRadius: 8,
    padding: 12,
    color: '#F5F5F7',
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
    color: '#9494A0',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#60A5FA',
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
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  habitCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#37373F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  habitChecked: {
    backgroundColor: '#60A5FA',
    borderColor: '#60A5FA',
  },
  habitContent: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F7',
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
    color: '#60A5FA',
  },
  habitStatLabel: {
    fontSize: 12,
    color: '#9494A0',
    marginLeft: 2,
  },
  emptyState: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9494A0',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#5E5E6A',
    marginTop: 4,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11111C',
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
    color: '#F5F5F7',
  },
  reviewDesc: {
    fontSize: 13,
    color: '#9494A0',
    marginTop: 2,
  },
  principlesCard: {
    backgroundColor: '#11111C',
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
    color: '#F5F5F7',
  },
  principleDesc: {
    fontSize: 13,
    color: '#9494A0',
    marginTop: 2,
    lineHeight: 18,
  },
  loadingCard: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9494A0',
    marginTop: 12,
  },
  protocolCard: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
  },
  protocolText: {
    color: '#C4C4CC',
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
    borderTopColor: '#1F1F2C',
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
    backgroundColor: '#11111C',
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
    color: '#F5F5F7',
  },
  healthScoreLabel: {
    fontSize: 12,
    color: '#9494A0',
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
    color: '#C4C4CC',
  },
  healthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
