import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { id: 'light', label: 'Light', desc: '1-2 days/week' },
  { id: 'moderate', label: 'Moderate', desc: '3-4 days/week' },
  { id: 'active', label: 'Active', desc: '5+ days/week' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Starting my performance journey' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience with self-improvement' },
  { id: 'advanced', label: 'Advanced', desc: 'Experienced high-performer' },
];

export default function OnboardingBasics() {
  const router = useRouter();
  const { setProfile } = useUserStore();
  
  const [age, setAge] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [level, setLevel] = useState('beginner');
  const [dailyTime, setDailyTime] = useState('60');

  const handleNext = async () => {
    // Create initial profile
    await setProfile({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      age: age ? parseInt(age) : undefined,
      sleepQuality: 5,
      energyLevel: 5,
      attentionStability: 5,
      anxietyTendency: 5,
      socialConfidence: 5,
      physicalActivity: activityLevel as any,
      learningGoals: [],
      dailyTimeAvailable: parseInt(dailyTime) || 60,
      level: level as any,
      onboardingComplete: false,
    });
    
    router.push('/onboarding/metrics');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
            </TouchableOpacity>
            <View style={styles.progress}>
              <View style={[styles.progressDot, styles.progressActive]} />
              <View style={styles.progressDot} />
              <View style={styles.progressDot} />
            </View>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.title}>Basic Information</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>

          {/* Age */}
          <View style={styles.section}>
            <Text style={styles.label}>Age (optional)</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
            />
          </View>

          {/* Experience Level */}
          <View style={styles.section}>
            <Text style={styles.label}>Experience Level</Text>
            {LEVELS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  level === item.id && styles.optionCardActive,
                ]}
                onPress={() => setLevel(item.id)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>
                {level === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Activity Level */}
          <View style={styles.section}>
            <Text style={styles.label}>Current Activity Level</Text>
            {ACTIVITY_LEVELS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionCard,
                  activityLevel === item.id && styles.optionCardActive,
                ]}
                onPress={() => setActivityLevel(item.id)}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  <Text style={styles.optionDesc}>{item.desc}</Text>
                </View>
                {activityLevel === item.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Daily Time */}
          <View style={styles.section}>
            <Text style={styles.label}>Daily Time Available (minutes)</Text>
            <View style={styles.timeOptions}>
              {['30', '45', '60', '90', '120'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    dailyTime === time && styles.timeButtonActive,
                  ]}
                  onPress={() => setDailyTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      dailyTime === time && styles.timeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#374151',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  optionCardActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A5F',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  optionDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timeTextActive: {
    color: '#FFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0F172A',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});
