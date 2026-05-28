import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { GlassCard } from '../../src/components/GlassCard';
import { MetricSlider } from '../../src/components/MetricSlider';
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { StepDots } from '../../src/components/StepDots';
import { VoltageButton } from '../../src/components/VoltageButton';
import { useUserStore } from '../../src/store/userStore';
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from '../../src/theme/tokens';

export default function OnboardingMetrics() {
  const router = useRouter();
  const { profile, updateProfile } = useUserStore();

  const [sleepQuality, setSleepQuality] = useState(profile?.sleepQuality || 5);
  const [energyLevel, setEnergyLevel] = useState(profile?.energyLevel || 5);
  const [attentionStability, setAttentionStability] = useState(
    profile?.attentionStability || 5,
  );
  const [anxietyTendency, setAnxietyTendency] = useState(
    profile?.anxietyTendency || 5,
  );
  const [socialConfidence, setSocialConfidence] = useState(
    profile?.socialConfidence || 5,
  );

  const handleNext = async () => {
    await updateProfile({
      sleepQuality,
      energyLevel,
      attentionStability,
      anxietyTendency,
      socialConfidence,
    });

    router.push('/onboarding/goals');
  };

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.modules.regulation} intensity={0.4} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenChrome
          title="Step 2 of 3"
          eyebrow="Onboarding"
          right={<StepDots total={3} current={1} />}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Eyebrow>Baseline State</Eyebrow>
            <Text style={styles.title}>Where are you, today?</Text>
            <Text style={styles.lede}>
              Honest ratings — these become the reference for everything that follows.
            </Text>
          </View>

          <View style={styles.metricsBlock}>
            <GlassCard immediate padding={spacing.xl} radius={borderRadius['2xl']}>
              <MetricSlider
                label="Sleep Quality"
                value={sleepQuality}
                onChange={setSleepQuality}
                lowLabel="Poor"
                highLabel="Excellent"
              />
              <MetricSlider
                label="Energy Level"
                value={energyLevel}
                onChange={setEnergyLevel}
                lowLabel="Exhausted"
                highLabel="Energized"
              />
              <MetricSlider
                label="Attention Stability"
                value={attentionStability}
                onChange={setAttentionStability}
                lowLabel="Scattered"
                highLabel="Focused"
              />
              <MetricSlider
                label="Anxiety Tendency"
                value={anxietyTendency}
                onChange={setAnxietyTendency}
                lowLabel="Calm"
                highLabel="Anxious"
              />
              <MetricSlider
                label="Social Confidence"
                value={socialConfidence}
                onChange={setSocialConfidence}
                lowLabel="Reserved"
                highLabel="Confident"
              />
            </GlassCard>
          </View>

          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.voltage.core}
            />
            <Text style={styles.infoText}>
              These baselines auto-adjust as MAXIM learns your patterns.
              No judgment, just data.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <VoltageButton
            title="Continue"
            onPress={handleNext}
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.void,
  },
  intro: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: 6,
  },
  lede: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 320,
  },
  metricsBlock: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 19,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg.void,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
});
