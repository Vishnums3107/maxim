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

const SOCIAL_TOOLS = [
  { id: 'speaking', name: 'Speaking Clarity', desc: 'Articulation drills', icon: 'mic-outline' },
  { id: 'listening', name: 'Active Listening', desc: 'Response delay training', icon: 'ear-outline' },
  { id: 'boundaries', name: 'Boundaries', desc: 'Assertiveness practice', icon: 'shield-outline' },
  { id: 'exposure', name: 'Social Exposure', desc: 'Gradual confidence building', icon: 'people-outline' },
];

const MICRO_TASKS = [
  'Make eye contact with 3 strangers today',
  'Ask one open-ended question in a conversation',
  'Give one genuine compliment',
  'Pause 2 seconds before responding',
  'Introduce yourself to someone new',
];

export default function SocialModule() {
  const router = useRouter();
  const { profile, addProtocol } = useUserStore();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);

  const generateSocialProtocol = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateProtocol(profile, 'social');
      setProtocol(response.protocol);
      await addProtocol({
        id: Date.now().toString(),
        module: 'social',
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

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={styles.title}>Social Intelligence</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="people" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>Build Social Confidence</Text>
          <Text style={styles.heroSubtitle}>
            Develop calm confidence, clear communication, and authentic connection.
          </Text>
        </View>

        {/* Confidence Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Confidence</Text>
          <View style={styles.confidenceCard}>
            <View style={styles.confidenceRing}>
              <Text style={styles.confidenceValue}>{profile?.socialConfidence || 5}</Text>
              <Text style={styles.confidenceLabel}>/10</Text>
            </View>
            <View style={styles.confidenceInfo}>
              <Text style={styles.confidenceTitle}>Current Level</Text>
              <Text style={styles.confidenceDesc}>
                {profile?.socialConfidence && profile.socialConfidence >= 7
                  ? 'Strong foundation. Focus on refinement.'
                  : profile?.socialConfidence && profile.socialConfidence >= 4
                    ? 'Room for growth. Consistent practice helps.'
                    : 'Start with small exposures. Build gradually.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Micro-Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Micro-Tasks</Text>
          <View style={styles.tasksCard}>
            {MICRO_TASKS.map((task, index) => (
              <TouchableOpacity
                key={index}
                style={styles.taskItem}
                onPress={() => toggleTask(index)}
              >
                <View style={[
                  styles.taskCheckbox,
                  completedTasks.includes(index) && styles.taskChecked,
                ]}>
                  {completedTasks.includes(index) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={[
                  styles.taskText,
                  completedTasks.includes(index) && styles.taskTextCompleted,
                ]}>
                  {task}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Tools</Text>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/modules/exposure')}
          >
            <View style={styles.toolIcon}>
              <Ionicons name="trending-up" size={24} color="#F59E0B" />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolName}>Social Exposure</Text>
              <Text style={styles.toolDesc}>Gradual confidence building</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/modules/conversation')}
          >
            <View style={styles.toolIcon}>
              <Ionicons name="chatbubbles" size={24} color="#F59E0B" />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolName}>Conversation Reflection</Text>
              <Text style={styles.toolDesc}>Learn from every interaction</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
          {SOCIAL_TOOLS.slice(0, 2).map((tool) => (
            <TouchableOpacity key={tool.id} style={styles.toolCard}>
              <View style={styles.toolIcon}>
                <Ionicons name={tool.icon as any} size={24} color="#F59E0B" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Social Coach</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#F59E0B" />
              <Text style={styles.loadingText}>Generating social protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateSocialProtocol}
              >
                <Ionicons name="refresh" size={16} color="#F59E0B" />
                <Text style={[styles.regenerateText, { color: '#F59E0B' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#F59E0B' }]}
              onPress={generateSocialProtocol}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Get Personalized Protocol</Text>
            </TouchableOpacity>
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
  confidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  confidenceRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F59E0B20',
    borderWidth: 3,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexDirection: 'row',
  },
  confidenceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F59E0B',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  confidenceInfo: {
    flex: 1,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  confidenceDesc: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    lineHeight: 18,
  },
  tasksCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskChecked: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  taskText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 14,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolContent: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  toolDesc: {
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
});
