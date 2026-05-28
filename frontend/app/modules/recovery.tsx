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
import { format, subDays, differenceInDays } from 'date-fns';

const POSTURE_EXERCISES = [
    { id: 'chin-tuck', name: 'Chin Tucks', duration: '30 sec', reps: '10 reps', benefit: 'Neck alignment' },
    { id: 'wall-angel', name: 'Wall Angels', duration: '60 sec', reps: '8 reps', benefit: 'Shoulder mobility' },
    { id: 'thoracic-ext', name: 'Thoracic Extensions', duration: '45 sec', reps: '10 reps', benefit: 'Upper back' },
    { id: 'hip-flexor', name: 'Hip Flexor Stretch', duration: '60 sec', reps: '2 each side', benefit: 'Lower back relief' },
    { id: 'glute-bridge', name: 'Glute Bridges', duration: '45 sec', reps: '12 reps', benefit: 'Core stability' },
];
import { ScreenChrome } from '../../src/components/ScreenChrome';

const RECOVERY_PROTOCOLS = [
    {
        id: 'parasympathetic',
        name: 'Parasympathetic Activation',
        duration: '10 min',
        icon: 'leaf',
        color: '#34D399',
        steps: ['Legs up wall 5 min', 'Slow nasal breathing', 'Body scan relaxation']
    },
    {
        id: 'sleep-prep',
        name: 'Sleep Preparation',
        duration: '15 min',
        icon: 'moon',
        color: '#6366F1',
        steps: ['Dim lights 1hr before', 'Cool room temp', 'No screens 30 min']
    },
    {
        id: 'active-recovery',
        name: 'Active Recovery',
        duration: '20 min',
        icon: 'walk',
        color: '#FBBF24',
        steps: ['Light walking 10 min', 'Foam rolling 5 min', 'Static stretching 5 min']
    },
];

export default function RecoveryScreen() {
    const router = useRouter();
    const { profile, dailyEntries } = useUserStore();

    // Fatigue Detection Logic
    const fatigueAnalysis = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) =>
            format(subDays(new Date(), i), 'yyyy-MM-dd')
        );

        const recentEntries = dailyEntries.filter(e => last7Days.includes(e.date));

        // Calculate average metrics
        const avgSleep = recentEntries.length > 0
            ? recentEntries.reduce((acc, e) => acc + (e.sleepHours || 7), 0) / recentEntries.length
            : 7;

        const avgEnergy = profile?.energyLevel || 5;
        const anxietyLevel = profile?.anxietyTendency || 5;

        // Fatigue score (0-10, higher = more fatigued)
        let fatigueScore = 0;

        // Sleep deprivation factor
        if (avgSleep < 6) fatigueScore += 3;
        else if (avgSleep < 7) fatigueScore += 2;
        else if (avgSleep < 7.5) fatigueScore += 1;

        // Energy level factor
        fatigueScore += Math.max(0, 5 - avgEnergy);

        // Anxiety/stress factor
        if (anxietyLevel > 7) fatigueScore += 2;
        else if (anxietyLevel > 5) fatigueScore += 1;

        // Auto-deload recommendation
        const needsDeload = fatigueScore >= 6;
        const deloadRecommendation = needsDeload
            ? 'Consider a deload week: reduce intensity by 40%, focus on mobility'
            : fatigueScore >= 4
                ? 'Monitor fatigue. Prioritize sleep and recovery today.'
                : 'Systems nominal. Continue normal training.';

        return {
            score: Math.min(10, fatigueScore),
            avgSleep: avgSleep.toFixed(1),
            needsDeload,
            recommendation: deloadRecommendation,
            status: fatigueScore >= 6 ? 'high' : fatigueScore >= 4 ? 'moderate' : 'low',
        };
    }, [dailyEntries, profile]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Recovery & Posture" />

            <ScrollView style={styles.content}>
                {/* Fatigue Detection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Fatigue Detection</Text>
                    <View style={[
                        styles.fatigueCard,
                        {
                            borderLeftColor: fatigueAnalysis.status === 'high' ? '#F87171' :
                                fatigueAnalysis.status === 'moderate' ? '#FBBF24' : '#34D399'
                        }
                    ]}>
                        <View style={styles.fatigueHeader}>
                            <View style={styles.fatigueScore}>
                                <Text style={styles.fatigueNumber}>{fatigueAnalysis.score}</Text>
                                <Text style={styles.fatigueLabel}>/10</Text>
                            </View>
                            <View style={styles.fatigueInfo}>
                                <Text style={[
                                    styles.fatigueStatus,
                                    {
                                        color: fatigueAnalysis.status === 'high' ? '#F87171' :
                                            fatigueAnalysis.status === 'moderate' ? '#FBBF24' : '#34D399'
                                    }
                                ]}>
                                    {fatigueAnalysis.status.toUpperCase()} FATIGUE
                                </Text>
                                <Text style={styles.fatigueDetail}>
                                    Avg sleep: {fatigueAnalysis.avgSleep}hrs
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.fatigueRecommendation}>
                            {fatigueAnalysis.recommendation}
                        </Text>
                        {fatigueAnalysis.needsDeload && (
                            <View style={styles.deloadBadge}>
                                <Ionicons name="warning" size={16} color="#F87171" />
                                <Text style={styles.deloadText}>DELOAD RECOMMENDED</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Nervous System Recovery */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recovery Protocols</Text>
                    {RECOVERY_PROTOCOLS.map((protocol) => (
                        <TouchableOpacity key={protocol.id} style={styles.protocolCard}>
                            <View style={[styles.protocolIcon, { backgroundColor: protocol.color + '20' }]}>
                                <Ionicons name={protocol.icon as any} size={24} color={protocol.color} />
                            </View>
                            <View style={styles.protocolContent}>
                                <Text style={styles.protocolName}>{protocol.name}</Text>
                                <Text style={styles.protocolDuration}>{protocol.duration}</Text>
                                <View style={styles.protocolSteps}>
                                    {protocol.steps.map((step, i) => (
                                        <Text key={i} style={styles.protocolStep}>• {step}</Text>
                                    ))}
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Posture Module */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Posture Correction</Text>
                    <Text style={styles.sectionSubtitle}>
                        Counter sitting with targeted exercises
                    </Text>
                    {POSTURE_EXERCISES.map((exercise) => (
                        <View key={exercise.id} style={styles.exerciseCard}>
                            <View style={styles.exerciseRow}>
                                <Text style={styles.exerciseName}>{exercise.name}</Text>
                                <Text style={styles.exerciseBenefit}>{exercise.benefit}</Text>
                            </View>
                            <View style={styles.exerciseMeta}>
                                <View style={styles.exerciseTag}>
                                    <Ionicons name="time-outline" size={12} color="#9494A0" />
                                    <Text style={styles.exerciseTagText}>{exercise.duration}</Text>
                                </View>
                                <View style={styles.exerciseTag}>
                                    <Ionicons name="repeat-outline" size={12} color="#9494A0" />
                                    <Text style={styles.exerciseTagText}>{exercise.reps}</Text>
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
    container: {
        flex: 1,
        backgroundColor: '#06060B',
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F5F5F7',
        marginBottom: 12,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#9494A0',
        marginBottom: 16,
    },
    fatigueCard: {
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
    },
    fatigueHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fatigueScore: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginRight: 16,
    },
    fatigueNumber: {
        fontSize: 36,
        fontWeight: '700',
        color: '#F5F5F7',
    },
    fatigueLabel: {
        fontSize: 16,
        color: '#5E5E6A',
    },
    fatigueInfo: {
        flex: 1,
    },
    fatigueStatus: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    fatigueDetail: {
        fontSize: 13,
        color: '#9494A0',
    },
    fatigueRecommendation: {
        fontSize: 14,
        color: '#C4C4CC',
        lineHeight: 20,
    },
    deloadBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8717120',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
    },
    deloadText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F87171',
    },
    protocolCard: {
        flexDirection: 'row',
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    protocolIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    protocolContent: {
        flex: 1,
    },
    protocolName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F5F5F7',
    },
    protocolDuration: {
        fontSize: 12,
        color: '#9494A0',
        marginBottom: 8,
    },
    protocolSteps: {},
    protocolStep: {
        fontSize: 13,
        color: '#C4C4CC',
        marginBottom: 2,
    },
    exerciseCard: {
        backgroundColor: '#11111C',
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
    },
    exerciseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    exerciseName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F5F5F7',
    },
    exerciseBenefit: {
        fontSize: 12,
        color: '#34D399',
        backgroundColor: '#34D39920',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    exerciseMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    exerciseTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exerciseTagText: {
        fontSize: 12,
        color: '#9494A0',
    },
});
