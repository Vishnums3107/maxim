import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/store/userStore';

type BreathingType = 'box' | 'physiological-sigh' | '4-7-8' | 'coherent';

interface BreathingPattern {
    id: BreathingType;
    name: string;
    desc: string;
    phases: { action: string; duration: number }[];
    totalCycles: number;
}

const BREATHING_PATTERNS: BreathingPattern[] = [
    {
        id: 'box',
        name: 'Box Breathing',
        desc: 'Equal inhale, hold, exhale, hold. Great for focus.',
        phases: [
            { action: 'Inhale', duration: 4 },
            { action: 'Hold', duration: 4 },
            { action: 'Exhale', duration: 4 },
            { action: 'Hold', duration: 4 },
        ],
        totalCycles: 4,
    },
    {
        id: 'physiological-sigh',
        name: 'Physiological Sigh',
        desc: 'Double inhale, long exhale. Fastest calm down.',
        phases: [
            { action: 'Inhale', duration: 2 },
            { action: 'Inhale more', duration: 1 },
            { action: 'Long Exhale', duration: 6 },
        ],
        totalCycles: 6,
    },
    {
        id: '4-7-8',
        name: '4-7-8 Breathing',
        desc: 'Inhale 4, hold 7, exhale 8. Deep relaxation.',
        phases: [
            { action: 'Inhale', duration: 4 },
            { action: 'Hold', duration: 7 },
            { action: 'Exhale', duration: 8 },
        ],
        totalCycles: 4,
    },
    {
        id: 'coherent',
        name: 'Coherent Breathing',
        desc: '5 seconds in, 5 seconds out. Heart rate variability.',
        phases: [
            { action: 'Inhale', duration: 5 },
            { action: 'Exhale', duration: 5 },
        ],
        totalCycles: 6,
    },
];

export default function BreathingScreen() {
    const router = useRouter();
    const { addBreathingSession } = useUserStore();

    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startSession = (pattern: BreathingPattern) => {
        setSelectedPattern(pattern);
        setIsActive(true);
        setCurrentPhase(0);
        setCurrentCycle(0);
        setCountdown(pattern.phases[0].duration);
        setSessionStartTime(Date.now());

        // Trigger haptic
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const stopSession = async () => {
        if (sessionStartTime && selectedPattern) {
            const duration = Math.round((Date.now() - sessionStartTime) / 1000);
            await addBreathingSession({
                id: Date.now().toString(),
                type: selectedPattern.id,
                duration,
                completedAt: new Date().toISOString(),
            });
        }

        setIsActive(false);
        setSelectedPattern(null);
        setCurrentPhase(0);
        setCurrentCycle(0);
        setCountdown(0);
        setSessionStartTime(null);
        scaleAnim.setValue(1);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        if (!isActive || !selectedPattern) return;

        const phase = selectedPattern.phases[currentPhase];

        // Animate circle based on action
        const isInhale = phase.action.toLowerCase().includes('inhale');
        const isExhale = phase.action.toLowerCase().includes('exhale');

        Animated.timing(scaleAnim, {
            toValue: isInhale ? 1.5 : isExhale ? 0.8 : 1,
            duration: phase.duration * 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start();

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    // Move to next phase
                    const nextPhase = currentPhase + 1;

                    if (nextPhase >= selectedPattern.phases.length) {
                        // Cycle complete
                        const nextCycle = currentCycle + 1;

                        if (nextCycle >= selectedPattern.totalCycles) {
                            // Session complete
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            stopSession();
                            return 0;
                        }

                        setCurrentCycle(nextCycle);
                        setCurrentPhase(0);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        return selectedPattern.phases[0].duration;
                    }

                    setCurrentPhase(nextPhase);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    return selectedPattern.phases[nextPhase].duration;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, currentPhase, selectedPattern]);

    if (isActive && selectedPattern) {
        const phase = selectedPattern.phases[currentPhase];

        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.activeHeader}>
                    <TouchableOpacity onPress={stopSession}>
                        <Ionicons name="close" size={28} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.patternName}>{selectedPattern.name}</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.activeContent}>
                    <Text style={styles.cycleText}>
                        Cycle {currentCycle + 1} of {selectedPattern.totalCycles}
                    </Text>

                    <Animated.View
                        style={[
                            styles.breathingCircle,
                            { transform: [{ scale: scaleAnim }] },
                        ]}
                    >
                        <Text style={styles.countdownText}>{countdown}</Text>
                    </Animated.View>

                    <Text style={styles.actionText}>{phase.action}</Text>

                    <View style={styles.phaseIndicators}>
                        {selectedPattern.phases.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.phaseIndicator,
                                    index === currentPhase && styles.phaseIndicatorActive,
                                    index < currentPhase && styles.phaseIndicatorComplete,
                                ]}
                            />
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.stopButton} onPress={stopSession}>
                    <Text style={styles.stopButtonText}>End Session</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Breathing Exercises</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Ionicons name="fitness" size={40} color="#10B981" />
                </View>
                <Text style={styles.heroTitle}>Regulate Your Nervous System</Text>
                <Text style={styles.heroSubtitle}>
                    Choose a breathing pattern to calm your mind and body
                </Text>
            </View>

            <View style={styles.patternsContainer}>
                {BREATHING_PATTERNS.map((pattern) => (
                    <TouchableOpacity
                        key={pattern.id}
                        style={styles.patternCard}
                        onPress={() => startSession(pattern)}
                    >
                        <View style={styles.patternHeader}>
                            <Text style={styles.patternTitle}>{pattern.name}</Text>
                            <View style={styles.patternDuration}>
                                <Text style={styles.durationText}>
                                    ~{Math.round(
                                        pattern.phases.reduce((acc, p) => acc + p.duration, 0) *
                                        pattern.totalCycles / 60
                                    )} min
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.patternDesc}>{pattern.desc}</Text>
                        <View style={styles.patternPhases}>
                            {pattern.phases.map((phase, index) => (
                                <View key={index} style={styles.phaseChip}>
                                    <Text style={styles.phaseChipText}>
                                        {phase.action} ({phase.duration}s)
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
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
        color: '#F9FAFB',
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#10B98120',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F9FAFB',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    patternsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    patternCard: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#374151',
    },
    patternHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    patternTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    patternDuration: {
        backgroundColor: '#10B98120',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    durationText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
    patternDesc: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    patternPhases: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    phaseChip: {
        backgroundColor: '#374151',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    phaseChipText: {
        fontSize: 12,
        color: '#D1D5DB',
    },
    // Active session styles
    activeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    patternName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    activeContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cycleText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 40,
    },
    breathingCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    countdownText: {
        fontSize: 56,
        fontWeight: '700',
        color: '#FFF',
    },
    actionText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#F9FAFB',
        marginBottom: 40,
    },
    phaseIndicators: {
        flexDirection: 'row',
        gap: 8,
    },
    phaseIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#374151',
    },
    phaseIndicatorActive: {
        backgroundColor: '#10B981',
        transform: [{ scale: 1.2 }],
    },
    phaseIndicatorComplete: {
        backgroundColor: '#10B98180',
    },
    stopButton: {
        marginHorizontal: 20,
        marginBottom: 40,
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
    },
    stopButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F9FAFB',
    },
});
