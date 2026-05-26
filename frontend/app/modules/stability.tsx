import React, { useState, useMemo } from 'react';
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
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface MoodEntry {
    date: string;
    mood: number; // 1-10
    anxiety: number; // 1-10
    energy: number; // 1-10
}

const CALM_ROUTINES = [
    {
        id: 'micro',
        name: '60-Second Reset',
        duration: '1 min',
        icon: 'flash',
        steps: ['3 deep breaths', 'Unclench jaw', 'Drop shoulders', 'Relax hands'],
    },
    {
        id: 'grounding',
        name: '5-4-3-2-1 Grounding',
        duration: '3 min',
        icon: 'hand-left',
        steps: ['5 things you see', '4 you can touch', '3 you hear', '2 you smell', '1 you taste'],
    },
    {
        id: 'physiological',
        name: 'Physiological Sigh',
        duration: '30 sec',
        icon: 'leaf',
        steps: ['Double inhale through nose', 'Long exhale through mouth', 'Repeat 3 times'],
    },
    {
        id: 'cold-exposure',
        name: 'Cold Water Reset',
        duration: '1 min',
        icon: 'snow',
        steps: ['Cold water on face/wrists', 'Activates dive reflex', 'Lowers heart rate quickly'],
    },
];

export default function StabilityScreen() {
    const router = useRouter();
    const { profile, dailyEntries, breathingSessions } = useUserStore();
    const [moodLog, setMoodLog] = useState<MoodEntry[]>([]);
    const [todayMood, setTodayMood] = useState(5);
    const [todayAnxiety, setTodayAnxiety] = useState(5);
    const [logged, setLogged] = useState(false);

    // Calculate stability score
    const stability = useMemo(() => {
        const baseAnxiety = profile?.anxietyTendency || 5;
        const baseEnergy = profile?.energyLevel || 5;

        // Factors that improve stability
        const recentBreathing = breathingSessions.filter(
            s => new Date(s.completedAt) > subDays(new Date(), 7)
        ).length;

        const last7Days = eachDayOfInterval({
            start: subDays(new Date(), 6),
            end: new Date()
        }).map(d => format(d, 'yyyy-MM-dd'));

        const recentEntries = dailyEntries.filter(e => last7Days.includes(e.date));
        const avgSleep = recentEntries.length > 0
            ? recentEntries.reduce((acc, e) => acc + (e.sleepHours || 7), 0) / recentEntries.length
            : 7;

        // Calculate score (1-10, higher = more stable)
        let score = 5;

        // Baseline adjustments
        score -= (baseAnxiety - 5) * 0.3; // Higher anxiety = lower stability
        score += (baseEnergy - 5) * 0.2; // Higher energy helps

        // Recent behavior bonuses
        score += Math.min(recentBreathing * 0.3, 1.5); // Breathing practice helps
        score += avgSleep >= 7 ? 1 : avgSleep >= 6 ? 0.5 : -0.5;

        // Normalize
        score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

        // Stress warning
        const stressWarning = baseAnxiety > 7 || score < 4;

        return {
            score,
            trend: score >= 6 ? 'stable' : score >= 4 ? 'fluctuating' : 'unstable',
            stressWarning,
            breathingCount: recentBreathing,
            avgSleep: avgSleep.toFixed(1),
        };
    }, [profile, dailyEntries, breathingSessions]);

    const handleLogMood = () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        setMoodLog([
            { date: today, mood: todayMood, anxiety: todayAnxiety, energy: profile?.energyLevel || 5 },
            ...moodLog.filter(m => m.date !== today)
        ]);
        setLogged(true);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Stability & Calm</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Stability Score */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreRing}>
                        <Text style={styles.scoreValue}>{stability.score}</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreLabel}>Stability Score</Text>
                        <Text style={[
                            styles.scoreTrend,
                            {
                                color: stability.trend === 'stable' ? '#10B981' :
                                    stability.trend === 'fluctuating' ? '#F59E0B' : '#EF4444'
                            }
                        ]}>
                            {stability.trend.toUpperCase()}
                        </Text>
                        <Text style={styles.scoreMeta}>
                            {stability.breathingCount} sessions · {stability.avgSleep}h avg sleep
                        </Text>
                    </View>
                </View>

                {/* Stress Warning */}
                {stability.stressWarning && (
                    <View style={styles.warningCard}>
                        <Ionicons name="warning" size={20} color="#EF4444" />
                        <View style={styles.warningContent}>
                            <Text style={styles.warningTitle}>Elevated Stress Detected</Text>
                            <Text style={styles.warningText}>
                                Your anxiety indicators are high. Consider a regulation protocol.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Quick Mood Log */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Today's Check-in</Text>
                    {!logged ? (
                        <View style={styles.moodCard}>
                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>Mood</Text>
                                <View style={styles.sliderButtons}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                        <TouchableOpacity
                                            key={v}
                                            style={[styles.sliderBtn, todayMood === v && styles.sliderBtnActive]}
                                            onPress={() => setTodayMood(v)}
                                        >
                                            <Text style={[styles.sliderNum, todayMood === v && styles.sliderNumActive]}>{v}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <View style={styles.sliderRow}>
                                <Text style={styles.sliderLabel}>Anxiety</Text>
                                <View style={styles.sliderButtons}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                        <TouchableOpacity
                                            key={v}
                                            style={[styles.sliderBtn, todayAnxiety === v && styles.sliderBtnActiveRed]}
                                            onPress={() => setTodayAnxiety(v)}
                                        >
                                            <Text style={[styles.sliderNum, todayAnxiety === v && styles.sliderNumActive]}>{v}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity style={styles.logButton} onPress={handleLogMood}>
                                <Text style={styles.logButtonText}>Log Check-in</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.loggedCard}>
                            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                            <Text style={styles.loggedText}>Today's check-in complete</Text>
                        </View>
                    )}
                </View>

                {/* Calm Routines */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Calm Under Pressure</Text>
                    {CALM_ROUTINES.map((routine) => (
                        <View key={routine.id} style={styles.routineCard}>
                            <View style={styles.routineIcon}>
                                <Ionicons name={routine.icon as any} size={22} color="#10B981" />
                            </View>
                            <View style={styles.routineContent}>
                                <View style={styles.routineHeader}>
                                    <Text style={styles.routineName}>{routine.name}</Text>
                                    <Text style={styles.routineDuration}>{routine.duration}</Text>
                                </View>
                                <View style={styles.routineSteps}>
                                    {routine.steps.map((step, i) => (
                                        <Text key={i} style={styles.routineStep}>• {step}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F9FAFB' },
    content: { flex: 1, paddingHorizontal: 20 },
    scoreCard: { flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
    scoreRing: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    scoreValue: { fontSize: 28, fontWeight: '700', color: '#10B981' },
    scoreInfo: { flex: 1 },
    scoreLabel: { fontSize: 16, fontWeight: '600', color: '#F9FAFB' },
    scoreTrend: { fontSize: 13, fontWeight: '700', marginTop: 4 },
    scoreMeta: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    warningCard: { flexDirection: 'row', backgroundColor: '#EF444420', borderRadius: 12, padding: 14, marginBottom: 20, gap: 12 },
    warningContent: { flex: 1 },
    warningTitle: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    warningText: { fontSize: 13, color: '#D1D5DB', marginTop: 4 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F9FAFB', marginBottom: 12 },
    moodCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16 },
    sliderRow: { marginBottom: 16 },
    sliderLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
    sliderButtons: { flexDirection: 'row', gap: 4 },
    sliderBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 6, paddingVertical: 8, alignItems: 'center' },
    sliderBtnActive: { backgroundColor: '#10B981' },
    sliderBtnActiveRed: { backgroundColor: '#EF4444' },
    sliderNum: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
    sliderNumActive: { color: '#FFF' },
    logButton: { backgroundColor: '#10B981', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
    logButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
    loggedCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 24, alignItems: 'center', gap: 12 },
    loggedText: { fontSize: 15, color: '#10B981', fontWeight: '500' },
    routineCard: { flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 12, padding: 14, marginBottom: 8 },
    routineIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#10B98120', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    routineContent: { flex: 1 },
    routineHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    routineName: { fontSize: 15, fontWeight: '600', color: '#F9FAFB' },
    routineDuration: { fontSize: 12, color: '#9CA3AF' },
    routineSteps: {},
    routineStep: { fontSize: 13, color: '#D1D5DB', marginBottom: 2 },
});
