import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
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

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { id: 'light', label: 'Light', desc: '1-2 days per week' },
  { id: 'moderate', label: 'Moderate', desc: '3-4 days per week' },
  { id: 'active', label: 'Active', desc: '5+ days per week' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Starting my performance journey' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience with self-improvement' },
  { id: 'advanced', label: 'Advanced', desc: 'Experienced high-performer' },
];

const SEX_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const TIME_OPTIONS = ['30', '45', '60', '90', '120'];

export default function OnboardingBasics() {
  const router = useRouter();
  const { setProfile } = useUserStore();

  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other' | undefined>(undefined);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [level, setLevel] = useState('beginner');
  const [dailyTime, setDailyTime] = useState('60');

  const handleNext = async () => {
    await setProfile({
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      age: age ? parseInt(age) : undefined,
      sex,
      height: height ? parseFloat(height) : undefined,
      weight: weight ? parseFloat(weight) : undefined,
      sleepQuality: 5,
      energyLevel: 5,
      attentionStability: 5,
      anxietyTendency: 5,
      socialConfidence: 5,
      physicalActivity: activityLevel as any,
      learningGoals: [],
      dailyTimeAvailable: parseInt(dailyTime) || 60,
      level: level as any,
      onboardingComplete: false,
    });

    router.push('/onboarding/metrics');
  };

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.voltage.soft} intensity={0.4} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScreenChrome
            title="Step 1 of 3"
            eyebrow="Onboarding"
            right={<StepDots total={3} current={0} />}
          />

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.intro}>
              <Eyebrow>The Foundation</Eyebrow>
              <Text style={styles.title}>Tell us a bit about yourself.</Text>
              <Text style={styles.lede}>
                These calibrate your protocols. Skip what you don&apos;t want to share.
              </Text>
            </View>

            {/* Age + Sex row */}
            <View style={styles.section}>
              <SectionLabel>Identity</SectionLabel>

              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="—"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={[styles.field, { flex: 2 }]}>
                  <Text style={styles.fieldLabel}>Sex</Text>
                  <View style={styles.segmented}>
                    {SEX_OPTIONS.map((option) => (
                      <Pressable
                        key={option.id}
                        onPress={() =>
                          setSex(option.id as 'male' | 'female' | 'other')
                        }
                        style={({ pressed }) => [
                          styles.segment,
                          sex === option.id && styles.segmentActive,
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            sex === option.id && styles.segmentTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Body metrics */}
            <View style={styles.section}>
              <SectionLabel>Body</SectionLabel>
              <View style={styles.row}>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    value={height}
                    onChangeText={setHeight}
                    placeholder="—"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="—"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>

            {/* Experience */}
            <View style={styles.section}>
              <SectionLabel>Experience Level</SectionLabel>
              {LEVELS.map((item) => (
                <OptionRow
                  key={item.id}
                  active={level === item.id}
                  label={item.label}
                  desc={item.desc}
                  onPress={() => setLevel(item.id)}
                />
              ))}
            </View>

            {/* Activity */}
            <View style={styles.section}>
              <SectionLabel>Current Activity</SectionLabel>
              {ACTIVITY_LEVELS.map((item) => (
                <OptionRow
                  key={item.id}
                  active={activityLevel === item.id}
                  label={item.label}
                  desc={item.desc}
                  onPress={() => setActivityLevel(item.id)}
                />
              ))}
            </View>

            {/* Daily time */}
            <View style={styles.section}>
              <SectionLabel>Daily Time Available</SectionLabel>
              <View style={styles.timeRow}>
                {TIME_OPTIONS.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => setDailyTime(time)}
                    style={({ pressed }) => [
                      styles.timeBtn,
                      dailyTime === time && styles.timeBtnActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeBtnText,
                        dailyTime === time && styles.timeBtnTextActive,
                      ]}
                    >
                      {time}
                    </Text>
                    <Text
                      style={[
                        styles.timeBtnUnit,
                        dailyTime === time && styles.timeBtnUnitActive,
                      ]}
                    >
                      min
                    </Text>
                  </Pressable>
                ))}
              </View>
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Eyebrow style={{ marginBottom: spacing.md }}>{children as any}</Eyebrow>
  );
}

function OptionRow({
  active,
  label,
  desc,
  onPress,
}: {
  active: boolean;
  label: string;
  desc: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        optStyles.row,
        active && optStyles.rowActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={optStyles.label}>{label}</Text>
        <Text style={optStyles.desc}>{desc}</Text>
      </View>
      <View
        style={[optStyles.indicator, active && optStyles.indicatorActive]}
      >
        {active ? (
          <Ionicons name="checkmark" size={12} color={colors.bg.void} />
        ) : null}
      </View>
      {active ? <View pointerEvents="none" style={optStyles.tab} /> : null}
    </Pressable>
  );
}

const optStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
    gap: spacing.md,
  },
  rowActive: {
    borderColor: 'rgba(224, 231, 255, 0.42)',
    backgroundColor: 'rgba(224, 231, 255, 0.04)',
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  indicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorActive: {
    backgroundColor: colors.voltage.core,
    borderColor: colors.voltage.core,
  },
  tab: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.voltage.core,
  },
});

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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  field: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  segmented: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.bg.raised,
    padding: 3,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  segmentActive: {
    backgroundColor: colors.voltage.core,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  segmentTextActive: {
    color: colors.bg.void,
    fontWeight: '700',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  timeBtn: {
    flex: 1,
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  timeBtnActive: {
    backgroundColor: colors.voltage.core,
    borderColor: colors.voltage.core,
  },
  timeBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  timeBtnTextActive: {
    color: colors.bg.void,
  },
  timeBtnUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  timeBtnUnitActive: {
    color: 'rgba(6,6,11,0.65)',
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
