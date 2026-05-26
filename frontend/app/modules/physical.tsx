import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { generateProtocol } from '../../src/utils/api';

const WORKOUTS = [
  { id: 'strength', name: 'Strength Training', duration: '30-45 min', icon: 'barbell-outline' },
  { id: 'mobility', name: 'Mobility Flow', duration: '15-20 min', icon: 'body-outline' },
  { id: 'cardio', name: 'Cardio Session', duration: '20-30 min', icon: 'heart-outline' },
  { id: 'recovery', name: 'Active Recovery', duration: '15 min', icon: 'leaf-outline' },
];

export default function PhysicalModule() {
  const router = useRouter();
  const { profile, addProtocol } = useUserStore();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePhysicalProtocol = async (type?: string) => {
    if (!profile) return;
    setLoading(true);
    try {
      const context = type ? `User wants to focus on: ${type}` : undefined;
      const response = await generateProtocol(profile, 'physical', context);
      setProtocol(response.protocol);
      await addProtocol({
        id: Date.now().toString(),
        module: 'physical',
        content: response.protocol,
        generatedAt: response.generated_at,
        sessionId: response.session_id,
      });
    } catch (error) {
      console.error('Error generating protocol:', error);
      setProtocol('Unable to generate protocol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={styles.title}>Physical Capability</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="fitness" size={32} color="#EF4444" />
          </View>
          <Text style={styles.heroTitle}>Build Strength & Energy</Text>
          <Text style={styles.heroSubtitle}>
            Sustainable physical development through smart training, recovery, and nervous system regulation.
          </Text>
        </View>

        {/* Quick Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/modules/workouts')}
            >
              <Ionicons name="barbell" size={24} color="#EF4444" />
              <Text style={styles.toolLabel}>Workouts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/modules/sleep')}
            >
              <Ionicons name="moon" size={24} color="#6366F1" />
              <Text style={styles.toolLabel}>Sleep Log</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Workout Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Options</Text>
          {WORKOUTS.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => generatePhysicalProtocol(workout.name)}
            >
              <View style={styles.workoutIcon}>
                <Ionicons name={workout.icon as any} size={24} color="#EF4444" />
              </View>
              <View style={styles.workoutContent}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Protocol Generator</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#EF4444" />
              <Text style={styles.loadingText}>Generating personalized protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={() => generatePhysicalProtocol()}
              >
                <Ionicons name="refresh" size={16} color="#EF4444" />
                <Text style={styles.regenerateText}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => generatePhysicalProtocol()}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Generate Today's Protocol</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Principles</Text>
          <View style={styles.tipsCard}>
            <TipItem text="Progressive overload over time, not intensity spikes" />
            <TipItem text="Recovery is where growth happens" />
            <TipItem text="Consistency beats perfection" />
            <TipItem text="Listen to fatigue signals" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
    <Text style={styles.tipText}>{text}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EF444420',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutContent: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  workoutDuration: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
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
    color: '#EF4444',
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
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
  tipsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  tipText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 14,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
});
