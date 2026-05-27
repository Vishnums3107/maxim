import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { format, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import { ScreenChrome } from '../../src/components/ScreenChrome';

export default function InsightsScreen() {
    const router = useRouter();
    const { profile, dailyEntries, habits, focusBlocks, breathingSessions, protocols } = useUserStore();

    // Overload Detection
    const overloadAnalysis = useMemo(() => {
        const activeHabits = habits.length;
        const anxietyLevel = profile?.anxietyTendency || 5;
        const energyLevel = profile?.energyLevel || 5;

        let overloadScore = 0;
        const warnings: string[] = [];

        // Too many habits
        if (activeHabits > 7) {
            overloadScore += 2;
            warnings.push(`${activeHabits} active habits may be too many. Focus on 3-5.`);
        } else if (activeHabits > 5) {
            overloadScore += 1;
        }

        // High anxiety + low energy = overload risk
        if (anxietyLevel > 7 && energyLevel < 4) {
            overloadScore += 3;
            warnings.push('High anxiety + low energy indicates burnout risk.');
        } else if (anxietyLevel > 6) {
            overloadScore += 1;
            warnings.push('Elevated anxiety detected. Prioritize regulation.');
        }

        // Recent incomplete days
        const last7Days = eachDayOfInterval({
            start: subDays(new Date(), 6),
            end: new Date()
        }).map(d => format(d, 'yyyy-MM-dd'));

        const recentEntries = dailyEntries.filter(e => last7Days.includes(e.date));
        const countCompletedActions = (e: typeof dailyEntries[0]) => {
            let count = 0;
            if (e.physicalAction?.completed) count++;
            if (e.cognitiveAction?.completed) count++;
            if (e.regulationAction?.completed) count++;
            if (e.socialAction?.completed) count++;
            if (e.systemAction?.completed) count++;
            return count;
        };
        const lowCompletionDays = recentEntries.filter(e =>
            countCompletedActions(e) < 2
        ).length;

        if (lowCompletionDays > 4) {
            overloadScore += 2;
            warnings.push('Low completion rate this week. Consider simplifying.');
        }

        return {
            score: Math.min(10, overloadScore),
            level: overloadScore >= 5 ? 'high' : overloadScore >= 3 ? 'moderate' : 'low',
            warnings,
        };
    }, [habits, profile, dailyEntries]);

    // Stagnation Detection
    const stagnationAnalysis = useMemo(() => {
        const warnings: string[] = [];
        let stagnationScore = 0;

        // Check for protocol generation activity
        const recentProtocols = protocols.filter(p => {
            const days = differenceInDays(new Date(), new Date(p.generatedAt));
            return days < 14;
        });

        if (recentProtocols.length === 0) {
            stagnationScore += 2;
            warnings.push('No new protocols in 2 weeks. Try generating fresh guidance.');
        }

        // Check focus block variety
        const recentFocus = focusBlocks.filter(fb => {
            if (!fb.startedAt) return false;
            const days = differenceInDays(new Date(), new Date(fb.startedAt));
            return days < 7;
        });

        if (recentFocus.length < 3) {
            stagnationScore += 1;
            warnings.push('Few focus sessions recently. Deep work may be stagnating.');
        }

        // Habit plateau - same completion rate for 2+ weeks
        habits.forEach(habit => {
            const daysSinceCreation = differenceInDays(new Date(), new Date(habit.createdAt));
            if (daysSinceCreation > 21) {
                const recentCompletions = habit.completions.filter(d => {
                    const days = differenceInDays(new Date(), new Date(d));
                    return days < 14;
                }).length;

                if (recentCompletions < 5) {
                    stagnationScore += 1;
                }
            }
        });

        if (stagnationScore >= 3 && warnings.length === 0) {
            warnings.push('Activity patterns suggest plateau. Consider new challenges.');
        }

        return {
            score: Math.min(10, stagnationScore),
            level: stagnationScore >= 4 ? 'stagnant' : stagnationScore >= 2 ? 'slowing' : 'active',
            warnings,
        };
    }, [protocols, focusBlocks, habits]);

    // Trend Analysis
    const trends = useMemo(() => {
        const last14Days = eachDayOfInterval({
            start: subDays(new Date(), 13),
            end: new Date()
        }).map(d => format(d, 'yyyy-MM-dd'));

        const week1 = last14Days.slice(0, 7);
        const week2 = last14Days.slice(7);

        // Focus trend
        const week1Focus = focusBlocks.filter(fb =>
            fb.startedAt && week1.includes(format(new Date(fb.startedAt), 'yyyy-MM-dd'))
        ).reduce((acc, fb) => acc + fb.duration, 0);

        const week2Focus = focusBlocks.filter(fb =>
            fb.startedAt && week2.includes(format(new Date(fb.startedAt), 'yyyy-MM-dd'))
        ).reduce((acc, fb) => acc + fb.duration, 0);

        const focusTrend = week2Focus > week1Focus ? 'up' : week2Focus < week1Focus ? 'down' : 'stable';

        // Breathing trend
        const week1Breathing = breathingSessions.filter(bs =>
            week1.includes(format(new Date(bs.completedAt), 'yyyy-MM-dd'))
        ).length;

        const week2Breathing = breathingSessions.filter(bs =>
            week2.includes(format(new Date(bs.completedAt), 'yyyy-MM-dd'))
        ).length;

        const breathingTrend = week2Breathing > week1Breathing ? 'up' : week2Breathing < week1Breathing ? 'down' : 'stable';

        // Completion trend
        const week1Entries = dailyEntries.filter(e => week1.includes(e.date));
        const week2Entries = dailyEntries.filter(e => week2.includes(e.date));

        const countActions = (e: typeof dailyEntries[0]) => {
            let count = 0;
            if (e.physicalAction?.completed) count++;
            if (e.cognitiveAction?.completed) count++;
            if (e.regulationAction?.completed) count++;
            if (e.socialAction?.completed) count++;
            if (e.systemAction?.completed) count++;
            return count;
        };
        const week1Completions = week1Entries.reduce((acc, e) => acc + countActions(e), 0);
        const week2Completions = week2Entries.reduce((acc, e) => acc + countActions(e), 0);

        const completionTrend = week2Completions > week1Completions ? 'up' : week2Completions < week1Completions ? 'down' : 'stable';

        return {
            focus: { trend: focusTrend, current: week2Focus, previous: week1Focus },
            breathing: { trend: breathingTrend, current: week2Breathing, previous: week1Breathing },
            completion: { trend: completionTrend, current: week2Completions, previous: week1Completions },
        };
    }, [focusBlocks, breathingSessions, dailyEntries]);

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return { name: 'trending-up', color: '#34D399' };
        if (trend === 'down') return { name: 'trending-down', color: '#F87171' };
        return { name: 'remove', color: '#5E5E6A' };
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Intelligence Insights" />

            <ScrollView style={styles.content}>
                {/* Overload Detection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚡ Overload Detection</Text>
                    <View style={[
                        styles.statusCard,
                        {
                            borderLeftColor: overloadAnalysis.level === 'high' ? '#F87171' :
                                overloadAnalysis.level === 'moderate' ? '#FBBF24' : '#34D399'
                        }
                    ]}>
                        <View style={styles.statusHeader}>
                            <Text style={[
                                styles.statusLevel,
                                {
                                    color: overloadAnalysis.level === 'high' ? '#F87171' :
                                        overloadAnalysis.level === 'moderate' ? '#FBBF24' : '#34D399'
                                }
                            ]}>
                                {overloadAnalysis.level.toUpperCase()} LOAD
                            </Text>
                        </View>
                        {overloadAnalysis.warnings.length > 0 ? (
                            overloadAnalysis.warnings.map((w, i) => (
                                <View key={i} style={styles.warningRow}>
                                    <Ionicons name="alert-circle" size={14} color="#FBBF24" />
                                    <Text style={styles.warningText}>{w}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.allClearText}>Systems operating within capacity.</Text>
                        )}
                    </View>
                </View>

                {/* Stagnation Detection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Stagnation Detection</Text>
                    <View style={[
                        styles.statusCard,
                        {
                            borderLeftColor: stagnationAnalysis.level === 'stagnant' ? '#F87171' :
                                stagnationAnalysis.level === 'slowing' ? '#FBBF24' : '#34D399'
                        }
                    ]}>
                        <Text style={[
                            styles.statusLevel,
                            {
                                color: stagnationAnalysis.level === 'stagnant' ? '#F87171' :
                                    stagnationAnalysis.level === 'slowing' ? '#FBBF24' : '#34D399'
                            }
                        ]}>
                            {stagnationAnalysis.level.toUpperCase()}
                        </Text>
                        {stagnationAnalysis.warnings.length > 0 ? (
                            stagnationAnalysis.warnings.map((w, i) => (
                                <View key={i} style={styles.warningRow}>
                                    <Ionicons name="information-circle" size={14} color="#6366F1" />
                                    <Text style={styles.warningText}>{w}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.allClearText}>Good momentum. Keep building.</Text>
                        )}
                    </View>
                </View>

                {/* Trend Analysis */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📈 Weekly Trends</Text>
                    <View style={styles.trendsGrid}>
                        <View style={styles.trendCard}>
                            <Ionicons
                                name={getTrendIcon(trends.focus.trend).name as any}
                                size={24}
                                color={getTrendIcon(trends.focus.trend).color}
                            />
                            <Text style={styles.trendLabel}>Focus Time</Text>
                            <Text style={styles.trendValue}>{trends.focus.current} min</Text>
                            <Text style={styles.trendCompare}>vs {trends.focus.previous} last week</Text>
                        </View>
                        <View style={styles.trendCard}>
                            <Ionicons
                                name={getTrendIcon(trends.breathing.trend).name as any}
                                size={24}
                                color={getTrendIcon(trends.breathing.trend).color}
                            />
                            <Text style={styles.trendLabel}>Breathing</Text>
                            <Text style={styles.trendValue}>{trends.breathing.current} sessions</Text>
                            <Text style={styles.trendCompare}>vs {trends.breathing.previous} last week</Text>
                        </View>
                        <View style={styles.trendCard}>
                            <Ionicons
                                name={getTrendIcon(trends.completion.trend).name as any}
                                size={24}
                                color={getTrendIcon(trends.completion.trend).color}
                            />
                            <Text style={styles.trendLabel}>Completions</Text>
                            <Text style={styles.trendValue}>{trends.completion.current}</Text>
                            <Text style={styles.trendCompare}>vs {trends.completion.previous} last week</Text>
                        </View>
                    </View>
                </View>

                {/* Adaptive Recommendations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎯 Adaptive Protocol</Text>
                    <View style={styles.recommendCard}>
                        {overloadAnalysis.level === 'high' ? (
                            <>
                                <Ionicons name="heart" size={24} color="#F87171" />
                                <Text style={styles.recommendText}>
                                    Focus on recovery today. Skip non-essential tasks. Prioritize sleep and one regulation session.
                                </Text>
                            </>
                        ) : stagnationAnalysis.level === 'stagnant' ? (
                            <>
                                <Ionicons name="rocket" size={24} color="#6366F1" />
                                <Text style={styles.recommendText}>
                                    Time to challenge yourself. Try a new module, increase intensity, or set a stretch goal.
                                </Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#34D399" />
                                <Text style={styles.recommendText}>
                                    Systems healthy. Maintain consistency with current protocols. Consider deepening one area.
                                </Text>
                            </>
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#06060B' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F5F5F7' },
    content: { flex: 1, paddingHorizontal: 20 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F5F5F7', marginBottom: 12 },
    statusCard: { backgroundColor: '#11111C', borderRadius: 12, padding: 16, borderLeftWidth: 4 },
    statusHeader: { marginBottom: 8 },
    statusLevel: { fontSize: 13, fontWeight: '700' },
    warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
    warningText: { flex: 1, fontSize: 13, color: '#C4C4CC', lineHeight: 18 },
    allClearText: { fontSize: 14, color: '#34D399', marginTop: 4 },
    trendsGrid: { flexDirection: 'row', gap: 10 },
    trendCard: { flex: 1, backgroundColor: '#11111C', borderRadius: 12, padding: 14, alignItems: 'center' },
    trendLabel: { fontSize: 11, color: '#9494A0', marginTop: 8 },
    trendValue: { fontSize: 16, fontWeight: '700', color: '#F5F5F7', marginTop: 4 },
    trendCompare: { fontSize: 10, color: '#5E5E6A', marginTop: 4 },
    recommendCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#11111C', borderRadius: 12, padding: 16, gap: 14 },
    recommendText: { flex: 1, fontSize: 14, color: '#C4C4CC', lineHeight: 22 },
});
