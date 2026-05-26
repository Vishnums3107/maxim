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

const REGULATION_TOOLS = [
  { id: 'breathing', name: 'Breathing Exercises', desc: 'Nervous system regulation', icon: 'fitness-outline', route: '/modules/breathing' },
  { id: 'thoughts', name: 'Thought Externalization', desc: 'Dump racing thoughts', icon: 'cloud-outline', route: '/modules/thoughts' },
  { id: 'grounding', name: 'Grounding Techniques', desc: '5-4-3-2-1 method', icon: 'hand-left-outline' },
  { id: 'reframe', name: 'Cognitive Reframe', desc: 'Challenge negative patterns', icon: 'swap-horizontal-outline' },
];

export default function RegulationModule() {
  const router = useRouter();
  const { profile, addProtocol } = useUserStore();
  const [protocol, setProtocol] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRegulationProtocol = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateProtocol(profile, 'regulation');
      setProtocol(response.protocol);
      await addProtocol({
        id: Date.now().toString(),
        module: 'regulation',
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
          <Text style={styles.title}>Internal Regulation</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="leaf" size={32} color="#10B981" />
          </View>
          <Text style={styles.heroTitle}>Mental Control & Calm</Text>
          <Text style={styles.heroSubtitle}>
            Master your internal state. Control anxiety, overthinking, and emotional reactivity.
          </Text>
        </View>

        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Current State</Text>
          <View style={styles.stateCard}>
            <View style={styles.stateRow}>
              <Text style={styles.stateLabel}>Anxiety Tendency</Text>
              <View style={styles.stateBar}>
                <View style={[styles.stateFill, { width: `${(profile?.anxietyTendency || 5) * 10}%`, backgroundColor: '#EF4444' }]} />
              </View>
              <Text style={styles.stateValue}>{profile?.anxietyTendency || 5}/10</Text>
            </View>
            <View style={styles.stateRow}>
              <Text style={styles.stateLabel}>Energy Level</Text>
              <View style={styles.stateBar}>
                <View style={[styles.stateFill, { width: `${(profile?.energyLevel || 5) * 10}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.stateValue}>{profile?.energyLevel || 5}/10</Text>
            </View>
          </View>
        </View>

        {/* Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regulation Tools</Text>
          {REGULATION_TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => tool.route ? router.push(tool.route as any) : null}
            >
              <View style={styles.toolIcon}>
                <Ionicons name={tool.icon as any} size={24} color="#10B981" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Action */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/modules/breathing')}
          >
            <Ionicons name="play-circle" size={48} color="#10B981" />
            <Text style={styles.quickActionText}>Start Breathing Exercise</Text>
            <Text style={styles.quickActionSubtext}>2 minute calming protocol</Text>
          </TouchableOpacity>
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Regulation Coach</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#10B981" />
              <Text style={styles.loadingText}>Generating regulation protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateRegulationProtocol}
              >
                <Ionicons name="refresh" size={16} color="#10B981" />
                <Text style={[styles.regenerateText, { color: '#10B981' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#10B981' }]}
              onPress={generateRegulationProtocol}
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
  stateCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stateLabel: {
    width: 120,
    color: '#9CA3AF',
    fontSize: 14,
  },
  stateBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  stateFill: {
    height: '100%',
    borderRadius: 4,
  },
  stateValue: {
    color: '#F9FAFB',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
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
    backgroundColor: '#10B98120',
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
  quickAction: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginTop: 12,
  },
  quickActionSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
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
