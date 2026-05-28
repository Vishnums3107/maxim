import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { GlassCard } from '../../src/components/GlassCard';
import { Sparkline } from '../../src/components/Sparkline';
import { useUserStore } from '../../src/store/userStore';
import {
  borderRadius,
  colors,
  spacing,
  typography,
  shadows,
} from '../../src/theme/tokens';

const TAB_BAR_OFFSET = 110;

export default function ProgressScreen() {
  const { dailyEntries, breathingSessions, focusBlocks, habits } = useUserStore();

  // ── 7-day series ───────────────────────────────────────────────────────────
  const weekDays = useMemo(() => {
    const today = new Date();
    return eachDayOfInterval({ start: subDays(today, 6), end: today });
  }, []);

  const weekData = useMemo(() => {
    return weekDays.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const entry = dailyEntries.find((e) => e.date === dateStr);
      let completed = 0;
      if (entry) {
        if (entry.physicalAction?.completed) completed++;
        if (entry.cognitiveAction?.completed) completed++;
        if (entry.regulationAction?.completed) completed++;
        if (entry.socialAction?.completed) completed++;
        if (entry.systemAction?.completed) completed++;
      }
      return {
        day: format(day, 'EEEEE'), // M T W T F S S
        date: format(day, 'd'),
        completed,
        total: 5,
        isToday:
          format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      };
    });
  }, [weekDays, dailyEntries]);

  const stats = useMemo(() => {
    const totalBreathingTime = breathingSessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );
    const totalFocusTime = focusBlocks
      .filter((b) => b.completedAt)
      .reduce((acc, b) => acc + b.duration, 0);
    const totalCompletedActions = dailyEntries.reduce((acc, entry) => {
      let count = 0;
      if (entry.physicalAction?.completed) count++;
      if (entry.cognitiveAction?.completed) count++;
      if (entry.regulationAction?.completed) count++;
      if (entry.socialAction?.completed) count++;
      if (entry.systemAction?.completed) count++;
      return acc + count;
    }, 0);

    return {
      breathingMinutes: Math.round(totalBreathingTime / 60),
      focusMinutes: totalFocusTime,
      completedActions: totalCompletedActions,
      activeDays: dailyEntries.length,
    };
  }, [breathingSessions, focusBlocks, dailyEntries]);

  const weeklyCompletion = useMemo(() => {
    const total = weekData.reduce((acc, d) => acc + d.completed, 0);
    const max = weekData.length * 5;
    return Math.round((total / max) * 100);
  }, [weekData]);

  // ── streak: consecutive trailing days with ≥1 completed action ─────────────
  const streak = useMemo(() => {
    let s = 0;
    for (let i = weekData.length - 1; i >= 0; i--) {
      if (weekData[i].completed > 0) s++;
      else break;
    }
    // Extend beyond the last 7 days using full history
    if (s === weekData.length) {
      // walk further back through dailyEntries
      const sortedDates = dailyEntries
        .map((e) => e.date)
        .sort()
        .reverse();
      let cursor = subDays(new Date(), 7);
      for (const d of sortedDates) {
        if (d <= format(cursor, 'yyyy-MM-dd')) {
          s++;
          cursor = subDays(cursor, 1);
        } else {
          break;
        }
      }
    }
    return s;
  }, [weekData, dailyEntries]);

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.modules.regulation} tintSecondary={colors.voltage.soft} intensity={0.4} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_OFFSET + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Eyebrow>Time-Series Performance</Eyebrow>
            <Text style={styles.title}>Progress</Text>
            <Text style={styles.subtitle}>
              The compounding picture of your practice over time.
            </Text>
          </View>

          {/* ── Hero week chart ─────────────────────────────────────── */}
          <View style={styles.section}>
            <GlassCard immediate padding={spacing.xl} radius={borderRadius['2xl']}>
              <View style={styles.weekHeader}>
                <View>
                  <Eyebrow color={colors.text.tertiary}>Last 7 Days</Eyebrow>
                  <View style={styles.weekTitleRow}>
                    <Text style={styles.weekPercent}>{weeklyCompletion}</Text>
                    <Text style={styles.weekPercentSign}>%</Text>
                  </View>
                  <Text style={styles.weekCaption}>weekly completion</Text>
                </View>

                <View style={styles.streakCol}>
                  <View style={styles.streakBadge}>
                    <Ionicons
                      name="flame"
                      size={12}
                      color={colors.modules.physical}
                    />
                    <Text style={styles.streakNum}>{streak}</Text>
                    <Text style={styles.streakUnit}>day{streak === 1 ? '' : 's'}</Text>
                  </View>
                  <Text style={styles.streakLabel}>active streak</Text>
                </View>
              </View>

              {/* Bars */}
              <View style={styles.barRow}>
                {weekData.map((d, i) => {
                  const ratio = d.total > 0 ? d.completed / d.total : 0;
                  return (
                    <View key={i} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: `${Math.max(4, ratio * 100)}%`,
                              backgroundColor:
                                ratio === 0
                                  ? 'rgba(255,255,255,0.05)'
                                  : ratio < 0.5
                                    ? 'rgba(165,180,252,0.45)'
                                    : ratio < 1
                                      ? 'rgba(165,180,252,0.78)'
                                      : colors.voltage.core,
                            },
                            ratio === 1 && shadows.glow(colors.voltage.soft),
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.barDay,
                          d.isToday && { color: colors.voltage.core, fontWeight: '700' },
                        ]}
                      >
                        {d.day}
                      </Text>
                      <Text
                        style={[
                          styles.barDate,
                          d.isToday && { color: colors.text.primary },
                        ]}
                      >
                        {d.date}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Trend sparkline at the bottom */}
              <View style={styles.sparkRow}>
                <Sparkline
                  values={weekData.map((d) => d.completed)}
                  color={colors.voltage.core}
                  width={300}
                  height={28}
                  strokeWidth={1.6}
                />
              </View>
            </GlassCard>
          </View>

          {/* ── All-time stats grid ──────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow>All-Time</Eyebrow>
            </View>
            <View style={styles.statGrid}>
              <StatTile
                icon="checkmark-circle"
                label="Actions"
                value={stats.completedActions}
                tint={colors.modules.regulation}
              />
              <StatTile
                icon="calendar"
                label="Active days"
                value={stats.activeDays}
                tint={colors.modules.cognitive}
              />
              <StatTile
                icon="water"
                label="Breath (min)"
                value={stats.breathingMinutes}
                tint={colors.modules.regulation}
              />
              <StatTile
                icon="timer"
                label="Focus (min)"
                value={stats.focusMinutes}
                tint={colors.modules.systems}
              />
            </View>
          </View>

          {/* ── Habits ───────────────────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow>Tracked Habits</Eyebrow>
              {habits.length > 0 ? (
                <Text style={styles.sectionMicro}>{habits.length} active</Text>
              ) : null}
            </View>

            {habits.length > 0 ? (
              habits.map((habit) => {
                const last = habit.completions.slice(-7);
                const series = Array.from({ length: 7 }).map((_, i) => {
                  const day = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
                  return last.includes(day) ? 1 : 0;
                });
                return (
                  <View key={habit.id} style={hs.card}>
                    <View style={hs.colorTab} />
                    <View style={{ flex: 1 }}>
                      <Text style={hs.name}>{habit.name}</Text>
                      <Text style={hs.meta}>
                        {habit.frequency} · {habit.completions.length} total
                      </Text>
                    </View>
                    <Sparkline
                      values={series}
                      color={colors.voltage.core}
                      width={70}
                      height={22}
                      strokeWidth={1.4}
                    />
                    <View style={hs.count}>
                      <Text style={hs.countNum}>{habit.completions.length}</Text>
                    </View>
                    <View pointerEvents="none" style={hs.hair} />
                  </View>
                );
              })
            ) : (
              <GlassCard immediate padding={spacing['2xl']}>
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="repeat"
                      size={22}
                      color={colors.text.tertiary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No habits yet</Text>
                  <Text style={styles.emptyText}>
                    Start tracking habits in the Systems module to surface
                    patterns here.
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Stat tile with sparkline-free numeric display ──────────────────────────
function StatTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <View style={st.tile}>
      <View
        style={[
          st.iconCell,
          { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
        ]}
      >
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={st.value}>{value}</Text>
      <Text style={st.label}>{label}</Text>
      <View pointerEvents="none" style={st.hair} />
    </View>
  );
}

const st = StyleSheet.create({
  tile: {
    width: '48.5%',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
  },
  iconCell: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  hair: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});

const hs = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    gap: spacing.md,
  },
  colorTab: {
    width: 3,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.voltage.core,
  },
  name: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  count: {
    minWidth: 36,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glassStrong,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: 'center',
  },
  countNum: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
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
  subtitle: {
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
  sectionHead: {
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
    textTransform: 'lowercase',
  },

  weekHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  weekTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  weekPercent: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -2,
    lineHeight: 56,
  },
  weekPercentSign: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.tertiary,
    marginLeft: 4,
  },
  weekCaption: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  streakCol: {
    alignItems: 'flex-end',
    paddingTop: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  streakNum: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
  },
  streakUnit: {
    fontSize: 11,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  streakLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.muted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 110,
    marginBottom: spacing.md,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    width: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 9,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  barDay: {
    fontSize: 10,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.6,
  },
  barDate: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '600',
    marginTop: 1,
  },
  sparkRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
    alignItems: 'center',
  },

  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.hairline,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 280,
  },
});
