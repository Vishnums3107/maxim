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
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { ProtocolPanel } from '../../src/components/ProtocolPanel';
import { Eyebrow } from '../../src/components/Eyebrow';
import { colors, moduleGradients } from '../../src/theme/tokens';

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
        <ScreenChrome title="Cognitive & Learning" />

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <ModuleHero
          icon="bulb"
          title="Maximize Mental Performance"
          subtitle="Focus training, learning optimization, and cognitive clarity systems."
          gradient={moduleGradients.cognitive}
          accent={colors.modules.cognitive}
        />
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
                <Ionicons name={tool.icon as any} size={24} color="#A78BFA" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
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
          <Eyebrow style={{ marginBottom: 12 }}>AI Learning Coach</Eyebrow>
          <ProtocolPanel
            label="Cognitive Coach"
            generateLabel="Generate learning protocol"
            emptyDescription="Generate a learning and focus protocol calibrated to your attention level and goals."
            protocol={protocol}
            loading={loading}
            accent={colors.modules.cognitive}
            onGenerate={generateCognitiveProtocol}
            onRegenerate={generateCognitiveProtocol}
          />
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
    backgroundColor: '#A78BFA20',
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
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modelChip: {
    backgroundColor: '#11111C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modelText: {
    color: '#C4C4CC',
    fontSize: 13,
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
