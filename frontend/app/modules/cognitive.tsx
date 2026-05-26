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

const COGNITIVE_TOOLS = [
  { id: 'focus', name: 'Focus Block', desc: 'Deep work session', icon: 'timer-outline', route: '/modules/focus' },
  { id: 'learning', name: 'Learning Tools', desc: 'Goal decomposition & Feynman', icon: 'book-outline', route: '/modules/learning' },
  { id: 'distractions', name: 'Distraction Diagnostics', desc: 'Pattern analysis', icon: 'alert-circle-outline', route: '/modules/distractions' },
  { id: 'insights', name: 'Intelligence Insights', desc: 'Trends & overload detection', icon: 'analytics-outline', route: '/modules/insights' },
];

const MENTAL_MODELS = [
  'First Principles Thinking',
  'Second-Order Effects',
  'Inversion',
  'Pareto Principle (80/20)',
  'Occam\'s Razor',
  'Circle of Competence',
];

export default function CognitiveModule() {
  const router = useRouter();
  const { profile, addProtocol } = useUserStore();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateCognitiveProtocol = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateProtocol(profile, 'cognitive');
      setProtocol(response.protocol);
      await addProtocol({
        id: Date.now().toString(),
        module: 'cognitive',
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <Text style={styles.title}>Cognitive & Learning</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: '#8B5CF620' }]}>
            <Ionicons name="bulb" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.heroTitle}>Maximize Mental Performance</Text>
          <Text style={styles.heroSubtitle}>
            Focus training, learning optimization, and cognitive clarity systems.
          </Text>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cognitive Tools</Text>
          {COGNITIVE_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => tool.route ? router.push(tool.route as any) : null}
            >
              <View style={styles.toolIcon}>
                <Ionicons name={tool.icon as any} size={24} color="#8B5CF6" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Mental Models */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mental Model Library</Text>
          <View style={styles.modelsGrid}>
            {MENTAL_MODELS.map((model, index) => (
              <View key={index} style={styles.modelChip}>
                <Text style={styles.modelText}>{model}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Learning Coach</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#8B5CF6" />
              <Text style={styles.loadingText}>Generating cognitive protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateCognitiveProtocol}
              >
                <Ionicons name="refresh" size={16} color="#8B5CF6" />
                <Text style={[styles.regenerateText, { color: '#8B5CF6' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#8B5CF6' }]}
              onPress={generateCognitiveProtocol}
            >
              <Ionicons name="sparkles" size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Generate Learning Protocol</Text>
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
    backgroundColor: '#8B5CF620',
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
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelChip: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modelText: {
    color: '#D1D5DB',
    fontSize: 13,
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
