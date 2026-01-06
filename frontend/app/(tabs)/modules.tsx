import React from 'react';
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
import { ModuleCard } from '../../src/components/ModuleCard';

const MODULES = [
  {
    id: 'physical',
    title: 'Physical Capability',
    subtitle: 'Strength, stamina, posture, energy',
    icon: 'fitness-outline' as const,
    color: '#EF4444',
    route: '/modules/physical',
  },
  {
    id: 'cognitive',
    title: 'Cognitive & Learning',
    subtitle: 'Focus, learning speed, clarity',
    icon: 'bulb-outline' as const,
    color: '#8B5CF6',
    route: '/modules/cognitive',
  },
  {
    id: 'regulation',
    title: 'Internal Regulation',
    subtitle: 'Anxiety, overthinking, control',
    icon: 'leaf-outline' as const,
    color: '#10B981',
    route: '/modules/regulation',
  },
  {
    id: 'social',
    title: 'Social Intelligence',
    subtitle: 'Confidence, communication, trust',
    icon: 'people-outline' as const,
    color: '#F59E0B',
    route: '/modules/social',
  },
  {
    id: 'systems',
    title: 'Systems & Consistency',
    subtitle: 'Habits, automation, friction',
    icon: 'settings-outline' as const,
    color: '#3B82F6',
    route: '/modules/systems',
  },
];

export default function ModulesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Modules</Text>
          <Text style={styles.subtitle}>
            Systematic training across all dimensions of human capability
          </Text>
        </View>

        <View style={styles.modulesContainer}>
          {MODULES.map((module) => (
            <ModuleCard
              key={module.id}
              title={module.title}
              subtitle={module.subtitle}
              icon={module.icon}
              color={module.color}
              onPress={() => router.push(module.route as any)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/modules/breathing')}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="fitness" size={20} color="#10B981" />
            </View>
            <View style={styles.quickContent}>
              <Text style={styles.quickTitle}>Start Breathing Exercise</Text>
              <Text style={styles.quickSubtitle}>2-5 minute protocols</Text>
            </View>
            <Ionicons name="play-circle" size={28} color="#10B981" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/modules/focus')}
          >
            <View style={[styles.quickIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="timer" size={20} color="#8B5CF6" />
            </View>
            <View style={styles.quickContent}>
              <Text style={styles.quickTitle}>Start Focus Block</Text>
              <Text style={styles.quickSubtitle}>Deep work session</Text>
            </View>
            <Ionicons name="play-circle" size={28} color="#8B5CF6" />
          </TouchableOpacity>
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
    lineHeight: 22,
  },
  modulesContainer: {
    paddingHorizontal: 20,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickContent: {
    flex: 1,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  quickSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
