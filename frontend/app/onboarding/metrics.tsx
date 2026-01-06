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
import { MetricSlider } from '../../src/components/MetricSlider';

export default function OnboardingMetrics() {
  const router = useRouter();
  const { profile, updateProfile } = useUserStore();
  
  const [sleepQuality, setSleepQuality] = useState(profile?.sleepQuality || 5);
  const [energyLevel, setEnergyLevel] = useState(profile?.energyLevel || 5);
  const [attentionStability, setAttentionStability] = useState(profile?.attentionStability || 5);
  const [anxietyTendency, setAnxietyTendency] = useState(profile?.anxietyTendency || 5);
  const [socialConfidence, setSocialConfidence] = useState(profile?.socialConfidence || 5);

  const handleNext = async () => {
    await updateProfile({
      sleepQuality,
      energyLevel,
      attentionStability,
      anxietyTendency,
      socialConfidence,
    });
    
    router.push('/onboarding/goals');
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
            <View style={[styles.progressDot, styles.progressActive]} />
            <View style={styles.progressDot} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.title}>Current State</Text>
        <Text style={styles.subtitle}>
          Rate yourself honestly. This establishes your baseline.
        </Text>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          <MetricSlider
            label="Sleep Quality"
            value={sleepQuality}
            onChange={setSleepQuality}
            lowLabel="Poor"
            highLabel="Excellent"
          />

          <MetricSlider
            label="Energy Level"
            value={energyLevel}
            onChange={setEnergyLevel}
            lowLabel="Exhausted"
            highLabel="Energized"
          />

          <MetricSlider
            label="Attention Stability"
            value={attentionStability}
            onChange={setAttentionStability}
            lowLabel="Scattered"
            highLabel="Focused"
          />

          <MetricSlider
            label="Anxiety Tendency"
            value={anxietyTendency}
            onChange={setAnxietyTendency}
            lowLabel="Calm"
            highLabel="Anxious"
          />

          <MetricSlider
            label="Social Confidence"
            value={socialConfidence}
            onChange={setSocialConfidence}
            lowLabel="Reserved"
            highLabel="Confident"
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.infoText}>
            These baselines will adjust automatically as MAXIM learns your patterns. Be honest - there's no judgment here.
          </Text>
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
  metricsContainer: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#93C5FD',
    lineHeight: 20,
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
