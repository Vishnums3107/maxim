import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { MetricSlider } from '../../src/components/MetricSlider';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, clearAllData } = useUserStore();
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  const handleSave = async () => {
    if (tempProfile) {
      await updateProfile(tempProfile);
      setEditing(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your data including your profile, progress, and history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => (editing ? handleSave() : setEditing(true))}
          >
            <Text style={styles.editButtonText}>
              {editing ? 'Save' : 'Edit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Level Badge */}
        <View style={styles.levelSection}>
          <View style={styles.levelBadgeLarge}>
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text style={styles.levelTitle}>{profile.level}</Text>
            <Text style={styles.levelSubtitle}>Experience Level</Text>
          </View>
        </View>

        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          
          {editing ? (
            <>
              <MetricSlider
                label="Energy Level"
                value={tempProfile?.energyLevel || 5}
                onChange={(val) => setTempProfile((p) => p && { ...p, energyLevel: val })}
                lowLabel="Exhausted"
                highLabel="Energized"
              />
              <MetricSlider
                label="Sleep Quality"
                value={tempProfile?.sleepQuality || 5}
                onChange={(val) => setTempProfile((p) => p && { ...p, sleepQuality: val })}
                lowLabel="Poor"
                highLabel="Excellent"
              />
              <MetricSlider
                label="Attention Stability"
                value={tempProfile?.attentionStability || 5}
                onChange={(val) => setTempProfile((p) => p && { ...p, attentionStability: val })}
                lowLabel="Scattered"
                highLabel="Focused"
              />
              <MetricSlider
                label="Anxiety Tendency"
                value={tempProfile?.anxietyTendency || 5}
                onChange={(val) => setTempProfile((p) => p && { ...p, anxietyTendency: val })}
                lowLabel="Calm"
                highLabel="Anxious"
              />
              <MetricSlider
                label="Social Confidence"
                value={tempProfile?.socialConfidence || 5}
                onChange={(val) => setTempProfile((p) => p && { ...p, socialConfidence: val })}
                lowLabel="Reserved"
                highLabel="Confident"
              />
            </>
          ) : (
            <View style={styles.metricsGrid}>
              <MetricDisplay
                icon="flash"
                label="Energy"
                value={profile.energyLevel}
                color="#F59E0B"
              />
              <MetricDisplay
                icon="moon"
                label="Sleep"
                value={profile.sleepQuality}
                color="#8B5CF6"
              />
              <MetricDisplay
                icon="eye"
                label="Focus"
                value={profile.attentionStability}
                color="#3B82F6"
              />
              <MetricDisplay
                icon="pulse"
                label="Anxiety"
                value={profile.anxietyTendency}
                color="#EF4444"
              />
              <MetricDisplay
                icon="people"
                label="Social"
                value={profile.socialConfidence}
                color="#10B981"
              />
              <MetricDisplay
                icon="timer"
                label="Time/Day"
                value={profile.dailyTimeAvailable}
                suffix="min"
                color="#6366F1"
              />
            </View>
          )}
        </View>

        {/* Activity Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Level</Text>
          <View style={styles.activityBadge}>
            <Ionicons name="walk" size={24} color="#10B981" />
            <Text style={styles.activityText}>{profile.physicalActivity}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/progress')}>
            <Ionicons name="analytics" size={20} color="#3B82F6" />
            <Text style={styles.actionText}>View Full History</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/modules/systems')}>
            <Ionicons name="document-text" size={20} color="#8B5CF6" />
            <Text style={styles.actionText}>Weekly Reviews</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleReset}
          >
            <Ionicons name="trash" size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.dangerText]}>Reset All Data</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const MetricDisplay = ({
  icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) => (
  <View style={styles.metricCard}>
    <Ionicons name={icon as any} size={20} color={color} />
    <Text style={styles.metricValue}>
      {value}{suffix || '/10'}
    </Text>
    <Text style={styles.metricLabel}>{label}</Text>
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
    paddingTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  levelSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  levelBadgeLarge: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 160,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
    textTransform: 'capitalize',
    marginTop: 12,
  },
  levelSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '31%',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9FAFB',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  activityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    textTransform: 'capitalize',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: '#F9FAFB',
    marginLeft: 12,
  },
  dangerButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  dangerText: {
    color: '#EF4444',
  },
});
