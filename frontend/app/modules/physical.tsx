import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { generateProtocol } from '../../src/utils/api';
import { ProtocolPanel } from '../../src/components/ProtocolPanel';

const WORKOUTS = [
  { id: 'strength', name: 'Strength Training', duration: '30-45 min', icon: 'barbell-outline' },
  { id: 'mobility', name: 'Mobility Flow', duration: '15-20 min', icon: 'body-outline' },
  { id: 'cardio', name: 'Cardio Session', duration: '20-30 min', icon: 'heart-outline' },
  { id: 'recovery', name: 'Active Recovery', duration: '15 min', icon: 'leaf-outline' },
];
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { colors, moduleGradients } from '../../src/theme/tokens';

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
        <ScreenChrome title="Physical Capability" />

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <ModuleHero
          icon="fitness"
          title="Build Strength & Energy"
          subtitle="Sustainable physical development through smart training, recovery, and nervous system regulation."
          gradient={moduleGradients.physical}
          accent={colors.modules.physical}
        />
        </View>

        {/* Quick Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Tools</Text>
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/modules/workouts')}
            >
              <Ionicons name="barbell" size={24} color="#F87171" />
              <Text style={styles.toolLabel}>Workouts</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/modules/sleep')}
            >
              <Ionicons name="moon" size={24} color="#6366F1" />
              <Text style={styles.toolLabel}>Sleep Log</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toolCard}
              onPress={() => router.push('/modules/recovery')}
            >
              <Ionicons name="leaf" size={24} color="#34D399" />
              <Text style={styles.toolLabel}>Recovery</Text>
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
                <Ionicons name={workout.icon as any} size={24} color="#F87171" />
              </View>
              <View style={styles.workoutContent}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <ProtocolPanel
            label="AI Physical Coach"
            emptyDescription="Generate a personalised physical protocol tuned to your current energy, activity level, and goals."
            protocol={protocol}
            loading={loading}
            accent="#F87171"
            generateLabel="Generate Today's Protocol"
            onGenerate={() => generatePhysicalProtocol()}
            onRegenerate={() => generatePhysicalProtocol()}
          />
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
    <Ionicons name="checkmark-circle" size={18} color="#34D399" />
    <Text style={styles.tipText}>{text}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5F5F7',
    marginBottom: 16,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8717120',
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
    color: '#F5F5F7',
  },
  workoutDuration: {
    fontSize: 13,
    color: '#9494A0',
    marginTop: 2,
  },
  tipsCard: {
    backgroundColor: '#11111C',
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
    color: '#C4C4CC',
    fontSize: 14,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F5F7',
  },
});
