import React, { useState } from 'react';
import {
  Alert,
  Pressable,
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
import { Gradient } from '../../src/components/Gradient';
import { MetricSlider } from '../../src/components/MetricSlider';
import { VoltageButton } from '../../src/components/VoltageButton';
import { useUserStore } from '../../src/store/userStore';
import {
  borderRadius,
  colors,
  spacing,
  typography,
  shadows,
  moduleGradients,
} from '../../src/theme/tokens';

const TAB_BAR_OFFSET = 110;

const LEVEL_GRADIENTS: Record<string, readonly [string, string]> = {
  beginner: moduleGradients.regulation,
  intermediate: moduleGradients.cognitive,
  advanced: moduleGradients.physical,
};

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
      'Reset all data',
      'This will delete your profile, progress and history. This action cannot be undone.',
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

  const grad = LEVEL_GRADIENTS[profile.level] ?? moduleGradients.cognitive;

  return (
    <View style={styles.root}>
      <AuroraBackground tint={grad[0]} tintSecondary={grad[1]} intensity={0.45} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_OFFSET + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Eyebrow>Operator Profile</Eyebrow>
              <Text style={styles.title}>Profile</Text>
            </View>
            <Pressable
              onPress={() => (editing ? handleSave() : setEditing(true))}
              style={({ pressed }) => [
                styles.editBtn,
                editing && styles.editBtnActive,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Ionicons
                name={editing ? 'checkmark' : 'create-outline'}
                size={14}
                color={editing ? colors.bg.void : colors.text.primary}
              />
              <Text
                style={[
                  styles.editBtnText,
                  editing && { color: colors.bg.void },
                ]}
              >
                {editing ? 'Save' : 'Edit'}
              </Text>
            </Pressable>
          </View>

          {/* ── Hero level card ──────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.heroCard}>
              <Gradient colors={grad} borderRadius={borderRadius['2xl']} />
              <View style={styles.heroScrim} />

              <View style={styles.heroRow}>
                <View style={styles.medal}>
                  <Ionicons name="trophy" size={26} color={colors.text.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Eyebrow color="rgba(255,255,255,0.78)">Tier</Eyebrow>
                  <Text style={styles.heroLevel}>{profile.level}</Text>
                  <Text style={styles.heroSub}>
                    Member since{' '}
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.heroFoot}>
                <FootStat
                  icon="time"
                  label="time/day"
                  value={`${profile.dailyTimeAvailable}m`}
                />
                <View style={styles.footDivider} />
                <FootStat
                  icon="walk"
                  label="activity"
                  value={profile.physicalActivity}
                />
                {profile.age ? (
                  <>
                    <View style={styles.footDivider} />
                    <FootStat icon="person" label="age" value={`${profile.age}`} />
                  </>
                ) : null}
              </View>

              <View pointerEvents="none" style={styles.heroHair} />
            </View>
          </View>

          {/* ── Current state ───────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow>Current State</Eyebrow>
            </View>

            {editing ? (
              <GlassCard immediate padding={spacing.xl}>
                <MetricSlider
                  label="Energy Level"
                  value={tempProfile?.energyLevel || 5}
                  onChange={(val) =>
                    setTempProfile((p) => p && { ...p, energyLevel: val })
                  }
                  lowLabel="Exhausted"
                  highLabel="Energized"
                />
                <MetricSlider
                  label="Sleep Quality"
                  value={tempProfile?.sleepQuality || 5}
                  onChange={(val) =>
                    setTempProfile((p) => p && { ...p, sleepQuality: val })
                  }
                  lowLabel="Poor"
                  highLabel="Excellent"
                />
                <MetricSlider
                  label="Attention Stability"
                  value={tempProfile?.attentionStability || 5}
                  onChange={(val) =>
                    setTempProfile((p) => p && { ...p, attentionStability: val })
                  }
                  lowLabel="Scattered"
                  highLabel="Focused"
                />
                <MetricSlider
                  label="Anxiety Tendency"
                  value={tempProfile?.anxietyTendency || 5}
                  onChange={(val) =>
                    setTempProfile((p) => p && { ...p, anxietyTendency: val })
                  }
                  lowLabel="Calm"
                  highLabel="Anxious"
                />
                <MetricSlider
                  label="Social Confidence"
                  value={tempProfile?.socialConfidence || 5}
                  onChange={(val) =>
                    setTempProfile((p) => p && { ...p, socialConfidence: val })
                  }
                  lowLabel="Reserved"
                  highLabel="Confident"
                />
              </GlassCard>
            ) : (
              <View style={styles.metricGrid}>
                <MetricCell
                  icon="flash"
                  label="Energy"
                  value={profile.energyLevel}
                  tint={colors.modules.social}
                />
                <MetricCell
                  icon="moon"
                  label="Sleep"
                  value={profile.sleepQuality}
                  tint={colors.modules.cognitive}
                />
                <MetricCell
                  icon="eye"
                  label="Focus"
                  value={profile.attentionStability}
                  tint={colors.modules.systems}
                />
                <MetricCell
                  icon="pulse"
                  label="Anxiety"
                  value={profile.anxietyTendency}
                  tint={colors.modules.physical}
                />
                <MetricCell
                  icon="people"
                  label="Social"
                  value={profile.socialConfidence}
                  tint={colors.modules.regulation}
                />
                <MetricCell
                  icon="hourglass"
                  label="Daily min"
                  value={profile.dailyTimeAvailable}
                  suffix=""
                  tint={colors.voltage.bright}
                />
              </View>
            )}
          </View>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow>Manage</Eyebrow>
            </View>

            <RowAction
              icon="analytics-outline"
              tint={colors.modules.systems}
              title="Full progress history"
              subtitle="All-time analytics & sessions"
              onPress={() => router.push('/(tabs)/progress')}
            />
            <RowAction
              icon="document-text-outline"
              tint={colors.modules.cognitive}
              title="Weekly reviews"
              subtitle="System-level reflections"
              onPress={() => router.push('/modules/systems')}
            />
            <RowAction
              icon="settings-outline"
              tint={colors.text.tertiary}
              title="Settings & API key"
              subtitle="Customise your AI access"
              onPress={() => router.push('/(tabs)/settings')}
            />
          </View>

          {/* ── Danger zone ─────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow color={colors.modules.physical}>Danger Zone</Eyebrow>
            </View>
            <View style={styles.dangerCard}>
              <Ionicons name="warning" size={18} color={colors.modules.physical} />
              <View style={{ flex: 1 }}>
                <Text style={styles.dangerTitle}>Reset all data</Text>
                <Text style={styles.dangerSub}>
                  Permanently deletes profile, progress and history.
                </Text>
              </View>
              <VoltageButton
                title="Reset"
                onPress={handleReset}
                variant="ghost"
                size="sm"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function FootStat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={fst.col}>
      <View style={fst.row}>
        <Ionicons name={icon} size={11} color="rgba(255,255,255,0.78)" />
        <Text style={fst.label}>{label}</Text>
      </View>
      <Text style={fst.value} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const fst = StyleSheet.create({
  col: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
});

function MetricCell({
  icon,
  label,
  value,
  suffix,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  suffix?: string;
  tint: string;
}) {
  return (
    <View style={mc.cell}>
      <View
        style={[
          mc.iconCell,
          { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
        ]}
      >
        <Ionicons name={icon} size={14} color={tint} />
      </View>
      <Text style={mc.value}>
        {value}
        <Text style={mc.suffix}>{suffix ?? '/10'}</Text>
      </Text>
      <Text style={mc.label}>{label}</Text>
      <View pointerEvents="none" style={mc.hair} />
    </View>
  );
}

const mc = StyleSheet.create({
  cell: {
    width: '31.5%',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
  },
  iconCell: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.8,
  },
  suffix: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  hair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});

function RowAction({
  icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [ra.row, pressed && { opacity: 0.85 }]}
    >
      <View
        style={[
          ra.icon,
          { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
        ]}
      >
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ra.title}>{title}</Text>
        <Text style={ra.sub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
      <View pointerEvents="none" style={ra.hair} />
    </Pressable>
  );
}

const ra = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    marginBottom: spacing.sm,
    gap: spacing.md,
    overflow: 'hidden',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  hair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.void,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1.2,
    marginTop: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  editBtnActive: {
    backgroundColor: colors.voltage.core,
    borderColor: colors.voltage.core,
    ...shadows.voltage,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.4,
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHead: {
    marginBottom: spacing.md,
  },

  heroCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    ...shadows.lg,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,11,0.20)',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    marginBottom: spacing.lg,
  },
  medal: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  heroLevel: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  heroFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  footDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginHorizontal: spacing.sm,
  },
  heroHair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },

  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.30)',
  },
  dangerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  dangerSub: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
});
