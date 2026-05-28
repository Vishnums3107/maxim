import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays } from 'date-fns';
import { useUserStore } from '../../src/store/userStore';
import { generateDailyBriefing } from '../../src/utils/api';
import { ActionItem } from '../../src/components/ActionItem';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { GlassCard } from '../../src/components/GlassCard';
import { ProgressRing } from '../../src/components/ProgressRing';
import { Sparkline } from '../../src/components/Sparkline';
import { VoltageButton } from '../../src/components/VoltageButton';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../../src/theme/tokens';

const TAB_BAR_OFFSET = 110;

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export default function TodayScreen() {
  const { profile, dailyEntries, getTodayEntry, updateDailyEntry, addDailyEntry } =
    useUserStore();
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [todayActions, setTodayActions] = useState({
    physical: false,
    cognitive: false,
    regulation: false,
    social: false,
    system: false,
  });

  const todayEntry = getTodayEntry();
  const today = new Date();

  useEffect(() => {
    if (todayEntry) {
      setTodayActions({
        physical: !!todayEntry.physicalAction?.completed,
        cognitive: !!todayEntry.cognitiveAction?.completed,
        regulation: !!todayEntry.regulationAction?.completed,
        social: !!todayEntry.socialAction?.completed,
        system: !!todayEntry.systemAction?.completed,
      });
    }
  }, [todayEntry]);

  const fetchBriefing = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const response = await generateDailyBriefing(profile);
      setBriefing(response.briefing);
    } catch (error) {
      console.error('Error fetching briefing:', error);
      setBriefing('Unable to generate briefing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBriefing();
    setRefreshing(false);
  };

  const toggleAction = async (action: keyof typeof todayActions) => {
    const newValue = !todayActions[action];
    setTodayActions((p) => ({ ...p, [action]: newValue }));
    const dateStr = format(today, 'yyyy-MM-dd');
    const actionKey = `${action}Action` as const;

    if (todayEntry) {
      await updateDailyEntry(todayEntry.id, {
        [actionKey]: {
          title: action,
          completed: newValue,
          completedAt: newValue ? new Date().toISOString() : undefined,
        },
      });
    } else {
      await addDailyEntry({
        id: Date.now().toString(),
        date: dateStr,
        morningEnergy: profile?.energyLevel || 5,
        sleepHours: 7,
        sleepQuality: profile?.sleepQuality || 5,
        [actionKey]: {
          title: action,
          completed: newValue,
          completedAt: newValue ? new Date().toISOString() : undefined,
        },
      });
    }
  };

  const completedCount = Object.values(todayActions).filter(Boolean).length;
  const progressPercent = (completedCount / 5) * 100;

  // ── Sparkline data — last 7 days completion + simple metric trends ─────────
  const trendData = useMemo(() => {
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = format(subDays(today, 6 - i), 'yyyy-MM-dd');
      const e = dailyEntries.find((x) => x.date === d);
      let count = 0;
      if (e?.physicalAction?.completed) count++;
      if (e?.cognitiveAction?.completed) count++;
      if (e?.regulationAction?.completed) count++;
      if (e?.socialAction?.completed) count++;
      if (e?.systemAction?.completed) count++;
      return { date: d, count, energy: e?.morningEnergy ?? null, sleep: e?.sleepQuality ?? null };
    });
    const completion = last7.map((x) => x.count);
    const energy = last7.map((x) => (x.energy ?? profile?.energyLevel ?? 5));
    const sleep = last7.map((x) => (x.sleep ?? profile?.sleepQuality ?? 5));
    return { completion, energy, sleep };
  }, [dailyEntries, profile]);

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.voltage.soft} intensity={0.55} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_OFFSET + spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.voltage.core}
              progressBackgroundColor={colors.bg.raised}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ───────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Eyebrow>Good {getTimeOfDay()}</Eyebrow>
              <Text style={styles.dateBig}>{format(today, 'EEEE')}</Text>
              <Text style={styles.dateSmall}>{format(today, 'MMMM d, yyyy')}</Text>
            </View>
            <View style={styles.levelBadge}>
              <View style={styles.levelDot} />
              <Text style={styles.levelText}>{profile?.level ?? 'beginner'}</Text>
            </View>
          </View>

          {/* ── Hero performance card ────────────────────────────────── */}
          <View style={styles.heroWrap}>
            <GlassCard immediate padding={spacing.xl} radius={borderRadius['2xl']}>
              <View style={styles.heroRow}>
                <View style={styles.ringBlock}>
                  <ProgressRing
                    progress={progressPercent}
                    size={132}
                    strokeWidth={10}
                    color={colors.voltage.core}
                    colorStop={colors.voltage.soft}
                    showValue={false}
                  />
                  <View style={styles.ringInner} pointerEvents="none">
                    <Text style={styles.ringNum}>
                      {completedCount}
                      <Text style={styles.ringDenom}>/5</Text>
                    </Text>
                    <Text style={styles.ringLbl}>Today</Text>
                  </View>
                </View>

                <View style={styles.heroCopy}>
                  <Eyebrow color={colors.voltage.bright}>Daily Protocol</Eyebrow>
                  <Text style={styles.heroTitle}>
                    {completedCount === 5
                      ? 'Protocol complete.'
                      : completedCount === 0
                        ? 'Begin your day.'
                        : 'Keep momentum.'}
                  </Text>
                  <Text style={styles.heroSub}>
                    {completedCount === 5
                      ? 'Every domain attended to. Recover well.'
                      : `${5 - completedCount} action${5 - completedCount === 1 ? '' : 's'} remaining across your domains.`}
                  </Text>

                  <View style={styles.statsRow}>
                    <MetricChip
                      icon="flash"
                      tint={colors.modules.social}
                      value={profile?.energyLevel ?? 5}
                    />
                    <MetricChip
                      icon="moon"
                      tint={colors.modules.cognitive}
                      value={profile?.sleepQuality ?? 5}
                    />
                    <MetricChip
                      icon="eye"
                      tint={colors.modules.systems}
                      value={profile?.attentionStability ?? 5}
                    />
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>

          {/* ── Vital stat cards with sparklines ──────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eyebrow>Vitals — last 7 days</Eyebrow>
            </View>
            <View style={styles.vitalsRow}>
              <VitalCard
                label="Completion"
                value={`${trendData.completion.reduce((a, b) => a + b, 0)}`}
                unit=" actions"
                values={trendData.completion}
                tint={colors.voltage.core}
                delay={0}
              />
              <VitalCard
                label="Energy"
                value={`${(
                  trendData.energy.reduce((a, b) => a + b, 0) / trendData.energy.length
                ).toFixed(1)}`}
                unit="/10"
                values={trendData.energy}
                tint={colors.modules.social}
                delay={60}
              />
              <VitalCard
                label="Sleep"
                value={`${(
                  trendData.sleep.reduce((a, b) => a + b, 0) / trendData.sleep.length
                ).toFixed(1)}`}
                unit="/10"
                values={trendData.sleep}
                tint={colors.modules.cognitive}
                delay={120}
              />
            </View>
          </View>

          {/* ── Today's Protocol — actions ────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eyebrow>Today&apos;s Protocol</Eyebrow>
              <Text style={styles.sectionMicro}>{completedCount}/5</Text>
            </View>

            <ActionItem
              title="Physical"
              subtitle="Movement, strength or recovery"
              completed={todayActions.physical}
              onToggle={() => toggleAction('physical')}
              color={colors.modules.physical}
            />
            <ActionItem
              title="Cognitive"
              subtitle="Focus block or learning session"
              completed={todayActions.cognitive}
              onToggle={() => toggleAction('cognitive')}
              color={colors.modules.cognitive}
            />
            <ActionItem
              title="Regulation"
              subtitle="Breath or mental control work"
              completed={todayActions.regulation}
              onToggle={() => toggleAction('regulation')}
              color={colors.modules.regulation}
            />
            <ActionItem
              title="Social"
              subtitle="Communication or connection"
              completed={todayActions.social}
              onToggle={() => toggleAction('social')}
              color={colors.modules.social}
            />
            <ActionItem
              title="System Check"
              subtitle="Habit or routine maintenance"
              completed={todayActions.system}
              onToggle={() => toggleAction('system')}
              color={colors.modules.systems}
            />
          </View>

          {/* ── AI Briefing ───────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Eyebrow>Intelligence Briefing</Eyebrow>
              {briefing ? (
                <Pressable onPress={fetchBriefing} disabled={loading} hitSlop={8}>
                  <Text style={styles.regen}>
                    {loading ? 'thinking…' : 'regenerate'}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {loading && !briefing ? (
              <GlassCard immediate padding={spacing.xl}>
                <View style={styles.briefingLoading}>
                  <ActivityIndicator color={colors.voltage.core} />
                  <Text style={styles.loadingText}>
                    Synthesising today&apos;s briefing…
                  </Text>
                </View>
              </GlassCard>
            ) : briefing ? (
              <GlassCard immediate padding={spacing.xl}>
                <View style={styles.briefHeader}>
                  <Ionicons name="sparkles" size={14} color={colors.voltage.core} />
                  <Text style={styles.briefHeaderText}>Personalised for you</Text>
                </View>
                <Text style={styles.briefingText}>{briefing}</Text>
              </GlassCard>
            ) : (
              <GlassCard immediate padding={spacing.xl}>
                <Text style={styles.briefEmpty}>
                  An AI briefing tailored to your current state, energy and goals — generated on demand.
                </Text>
                <View style={{ height: spacing.base }} />
                <VoltageButton
                  title="Generate today's briefing"
                  icon="sparkles"
                  iconPosition="left"
                  onPress={fetchBriefing}
                  loading={loading}
                  fullWidth
                />
              </GlassCard>
            )}
          </View>

          <DailyQuote />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MetricChip({
  icon,
  tint,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  value: number;
}) {
  return (
    <View style={chipStyles.row}>
      <View style={[chipStyles.dot, { backgroundColor: tint }]} />
      <Ionicons name={icon} size={12} color={colors.text.secondary} />
      <Text style={chipStyles.value}>{value}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  value: {
    color: colors.text.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

function VitalCard({
  label,
  value,
  unit,
  values,
  tint,
  delay = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  values: number[];
  tint: string;
  delay?: number;
}) {
  return (
    <View style={vitalStyles.card}>
      <Text style={vitalStyles.label}>{label}</Text>
      <Text style={vitalStyles.value}>
        {value}
        {unit ? <Text style={vitalStyles.unit}>{unit}</Text> : null}
      </Text>
      <Sparkline values={values} color={tint} width={92} height={28} strokeWidth={1.6} />
    </View>
  );
}

const vitalStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  unit: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
  },
});

function DailyQuote() {
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 800,
      delay: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View style={[styles.quote, { opacity: fade }]}>
      <Text style={styles.quoteMark}>“</Text>
      <Text style={styles.quoteText}>
        Capability is the residue of repeated, considered effort.
      </Text>
      <Text style={styles.quoteAttr}>MAXIM principle no. 7</Text>
    </Animated.View>
  );
}

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
    marginBottom: spacing.lg,
  },
  dateBig: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: 4,
  },
  dateSmall: {
    fontSize: 13,
    color: colors.text.tertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.voltage.core,
    ...shadows.glow(colors.voltage.soft),
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },

  heroWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  ringBlock: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNum: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1.5,
  },
  ringDenom: {
    fontSize: 18,
    color: colors.text.muted,
    fontWeight: '600',
  },
  ringLbl: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.6,
    marginTop: 6,
  },
  heroSub: {
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 19,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionMicro: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
    letterSpacing: 0.4,
  },

  vitalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  briefingLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.tertiary,
    fontSize: 13,
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  briefHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.voltage.core,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  briefingText: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  briefEmpty: {
    color: colors.text.tertiary,
    fontSize: 14,
    lineHeight: 21,
  },
  regen: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'lowercase',
  },

  quote: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    alignItems: 'center',
  },
  quoteMark: {
    fontSize: 42,
    color: colors.voltage.glow,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 4,
  },
  quoteText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: spacing.xl,
  },
  quoteAttr: {
    marginTop: spacing.sm,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});
