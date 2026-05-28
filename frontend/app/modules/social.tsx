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
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { ProtocolPanel } from '../../src/components/ProtocolPanel';
import { Eyebrow } from '../../src/components/Eyebrow';
import { colors, moduleGradients } from '../../src/theme/tokens';

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
  const { socialTasksCompleted, toggleSocialTask } = useUserStore();

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
    toggleSocialTask(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <ScreenChrome title="Social Intelligence" />

        {/* Hero */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <ModuleHero
          icon="people"
          title="Build Social Confidence"
          subtitle="Develop calm confidence, clear communication, and authentic connection."
          gradient={moduleGradients.social}
          accent={colors.modules.social}
        />
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
                  socialTasksCompleted.includes(index) && styles.taskChecked,
                ]}>
                  {socialTasksCompleted.includes(index) && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
                <Text style={[
                  styles.taskText,
                  socialTasksCompleted.includes(index) && styles.taskTextCompleted,
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
              <Ionicons name="trending-up" size={24} color="#FBBF24" />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolName}>Social Exposure</Text>
              <Text style={styles.toolDesc}>Gradual confidence building</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/modules/conversation')}
          >
            <View style={styles.toolIcon}>
              <Ionicons name="chatbubbles" size={24} color="#FBBF24" />
            </View>
            <View style={styles.toolContent}>
              <Text style={styles.toolName}>Conversation Reflection</Text>
              <Text style={styles.toolDesc}>Learn from every interaction</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
          </TouchableOpacity>
          {SOCIAL_TOOLS.slice(0, 2).map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => router.push('/modules/social-skills')}
            >
              <View style={styles.toolIcon}>
                <Ionicons name={tool.icon as any} size={24} color="#FBBF24" />
              </View>
              <View style={styles.toolContent}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc}>{tool.desc}</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#5E5E6A" />
            </TouchableOpacity>
          ))}
        </View>

        {/* AI Protocol */}
        <View style={styles.section}>
          <Eyebrow style={{ marginBottom: 12 }}>AI Social Coach</Eyebrow>
          <ProtocolPanel
            label="Social Coach"
            generateLabel="Get personalised protocol"
            emptyDescription="Generate a social-confidence protocol tailored to your current comfort level and growth zone."
            protocol={protocol}
            loading={loading}
            accent={colors.modules.social}
            onGenerate={generateSocialProtocol}
            onRegenerate={generateSocialProtocol}
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
  confidenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11111C',
    borderRadius: 12,
    padding: 16,
  },
  confidenceRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FBBF2420',
    borderWidth: 3,
    borderColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexDirection: 'row',
  },
  confidenceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FBBF24',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#9494A0',
  },
  confidenceInfo: {
    flex: 1,
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F7',
  },
  confidenceDesc: {
    fontSize: 13,
    color: '#9494A0',
    marginTop: 4,
    lineHeight: 18,
  },
  tasksCard: {
    backgroundColor: '#11111C',
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
    borderColor: '#37373F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskChecked: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  taskText: {
    flex: 1,
    color: '#C4C4CC',
    fontSize: 14,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#5E5E6A',
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
    backgroundColor: '#FBBF2420',
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
