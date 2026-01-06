import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';

const GOALS = [
  { id: 'fitness', label: 'Build Physical Strength', icon: 'fitness-outline', color: '#EF4444' },
  { id: 'energy', label: 'Increase Daily Energy', icon: 'flash-outline', color: '#F59E0B' },
  { id: 'focus', label: 'Improve Focus & Attention', icon: 'eye-outline', color: '#8B5CF6' },
  { id: 'learning', label: 'Learn Faster & Better', icon: 'bulb-outline', color: '#3B82F6' },
  { id: 'anxiety', label: 'Reduce Anxiety & Stress', icon: 'leaf-outline', color: '#10B981' },
  { id: 'sleep', label: 'Improve Sleep Quality', icon: 'moon-outline', color: '#6366F1' },
  { id: 'confidence', label: 'Build Social Confidence', icon: 'people-outline', color: '#EC4899' },
  { id: 'habits', label: 'Develop Better Habits', icon: 'repeat-outline', color: '#14B8A6' },
];

export default function OnboardingGoals() {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = async () => {
    await updateProfile({
      learningGoals: selectedGoals,
      onboardingComplete: true,
    });
    
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <View style={styles.progress}>
            <View style={[styles.progressDot, styles.progressDone]} />
            <View style={[styles.progressDot, styles.progressDone]} />
            <View style={[styles.progressDot, styles.progressActive]} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Your Goals</Text>
        <Text style={styles.subtitle}>
          Select what you want to improve. Choose as many as apply.
        </Text>

        {/* Goals Grid */}
        <View style={styles.goalsContainer}>
          {GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  isSelected && { borderColor: goal.color },
                ]}
                onPress={() => toggleGoal(goal.id)}
              >
                <View
                  style={[
                    styles.goalIcon,
                    { backgroundColor: goal.color + '20' },
                  ]}
                >
                  <Ionicons name={goal.icon as any} size={24} color={goal.color} />
                </View>
                <Text style={styles.goalLabel}>{goal.label}</Text>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: goal.color }]}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            selectedGoals.length === 0 && styles.disabledButton,
          ]}
          onPress={handleComplete}
          disabled={selectedGoals.length === 0}
        >
          <Ionicons name="rocket" size={20} color="#FFF" />
          <Text style={styles.completeButtonText}>Start My Journey</Text>
        </TouchableOpacity>
        
        {selectedGoals.length === 0 && (
          <Text style={styles.hintText}>Select at least one goal</Text>
        )}
      </View>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 32,
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  progressActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  progressDone: {
    backgroundColor: '#10B981',
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
    marginBottom: 32,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '47%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0F172A',
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#374151',
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  hintText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
