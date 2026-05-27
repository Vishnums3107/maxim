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
  { id: 'grounding', name: 'Grounding Techniques', desc: '5-4-3-2-1 method', icon: 'hand-left-outline', route: '/modules/stability' },
  { id: 'reframe', name: 'Cognitive Reframe', desc: 'Challenge negative patterns', icon: 'swap-horizontal-outline', route: '/modules/stability' },
];
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { colors, moduleGradients } from '../../src/theme/tokens';

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
        <ScreenChrome title="Internal Regulation" />

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <ModuleHero
          icon="leaf"
          title="Mental Control & Calm"
          subtitle="Master your internal state. Control anxiety, overthinking, and emotional reactivity."
          gradient={moduleGradients.regulation}
          accent={colors.modules.regulation}
        />
        </View>

        {/* Current State */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Current State</Text>
          <View style={styles.stateCard}>
            <View style={styles.stateRow}>
              <Text style={styles.stateLabel}>Anxiety Tendency</Text>
              <View style={styles.stateBar}>
                <View style={[styles.stateFill, { width: `${(profile?.anxietyTendency || 5) * 10}%`, backgroundColor: '#F87171' }]} />
              </View>
              <Text style={styles.stateValue}>{profile?.anxietyTendency || 5}/10</Text>
            </View>
            <View style={styles.stateRow}>
              <Text style={styles.stateLabel}>Energy Level</Text>
              <View style={styles.stateBar}>
                <View style={[styles.stateFill, { width: `${(profile?.energyLevel || 5) * 10}%`, backgroundColor: '#FBBF24' }]} />
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
                <Ionicons name={tool.icon as any} size={24} color="#34D399" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Action */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/modules/breathing')}
          >
            <Ionicons name="play-circle" size={48} color="#34D399" />
            <Text style={styles.quickActionText}>Start Breathing Exercise</Text>
            <Text style={styles.quickActionSubtext}>2 minute calming protocol</Text>
          </TouchableOpacity>
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Regulation Coach</Text>
          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color="#34D399" />
              <Text style={styles.loadingText}>Generating regulation protocol...</Text>
            </View>
          ) : protocol ? (
            <View style={styles.protocolCard}>
              <Text style={styles.protocolText}>{protocol}</Text>
              <TouchableOpacity
                style={styles.regenerateButton}
                onPress={generateRegulationProtocol}
              >
                <Ionicons name="refresh" size={16} color="#34D399" />
                <Text style={[styles.regenerateText, { color: '#34D399' }]}>Generate New</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#34D399' }]}
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
  stateCard: {
    backgroundColor: '#11111C',
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
    color: '#9494A0',
    fontSize: 14,
  },
  stateBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1F1F2C',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  stateFill: {
    height: '100%',
    borderRadius: 4,
  },
  stateValue: {
    color: '#F5F5F7',
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34D39920',
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
    color: '#F5F5F7',
  },
  toolDesc: {
    fontSize: 13,
    color: '#9494A0',
    marginTop: 2,
  },
  quickAction: {
    backgroundColor: '#11111C',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34D399',
  },
  quickActionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F5F5F7',
    marginTop: 12,
  },
  quickActionSubtext: {
    fontSize: 14,
    color: '#9494A0',
    marginTop: 4,
  },
  loadingCard: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9494A0',
    marginTop: 12,
  },
  protocolCard: {
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
  },
  protocolText: {
    color: '#C4C4CC',
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
    borderTopColor: '#1F1F2C',
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
