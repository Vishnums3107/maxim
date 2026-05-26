import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Animated,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../src/store/userStore';

const DURATION_PRESETS = [15, 25, 45, 60, 90];

export default function FocusScreen() {
    const router = useRouter();
    const { profile, addFocusBlock, updateFocusBlock } = useUserStore();

    const [duration, setDuration] = useState(25);
    const [customDuration, setCustomDuration] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [taskTitle, setTaskTitle] = useState('');

    const progressAnim = useRef(new Animated.Value(0)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startSession = async () => {
        const totalSeconds = duration * 60;
        setTimeRemaining(totalSeconds);
        setIsActive(true);
        setIsPaused(false);
        setDistractions(0);

        const id = Date.now().toString();
        setSessionId(id);

        await addFocusBlock({
            id,
            title: taskTitle || 'Focus Session',
            duration: duration,
            startedAt: new Date().toISOString(),
            distractions: 0,
        });

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const pauseSession = () => {
        setIsPaused(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const resumeSession = () => {
        setIsPaused(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const endSession = async (completed: boolean = false) => {
        if (sessionId) {
            await updateFocusBlock(sessionId, {
                completedAt: completed ? new Date().toISOString() : undefined,
                distractions,
            });
        }

        setIsActive(false);
        setIsPaused(false);
        setTimeRemaining(0);
        setSessionId(null);
        progressAnim.setValue(0);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (completed) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const recordDistraction = () => {
        setDistractions((prev) => prev + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    useEffect(() => {
        if (!isActive || isPaused) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            return;
        }

        const totalSeconds = duration * 60;

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    endSession(true);
                    return 0;
                }

                // Update progress animation
                const progress = 1 - (prev - 1) / totalSeconds;
                Animated.timing(progressAnim, {
                    toValue: progress,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }).start();

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, isPaused]);

    if (isActive) {
        const totalSeconds = duration * 60;
        const progress = 1 - timeRemaining / totalSeconds;

        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.activeHeader}>
                    <TouchableOpacity onPress={() => endSession(false)}>
                        <Ionicons name="close" size={28} color="#F9FAFB" />
                    </TouchableOpacity>
                    <Text style={styles.activeTitle}>{taskTitle || 'Focus Session'}</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.activeContent}>
                    <View style={styles.timerContainer}>
                        <View style={styles.timerRing}>
                            <Animated.View
                                style={[
                                    styles.timerProgress,
                                    {
                                        transform: [
                                            {
                                                rotate: progressAnim.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['0deg', '360deg'],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            />
                            <View style={styles.timerInner}>
                                <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                                <Text style={styles.timerLabel}>
                                    {isPaused ? 'Paused' : 'Remaining'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.controlsRow}>
                        {isPaused ? (
                            <TouchableOpacity style={styles.controlButton} onPress={resumeSession}>
                                <Ionicons name="play" size={32} color="#8B5CF6" />
                                <Text style={styles.controlLabel}>Resume</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.controlButton} onPress={pauseSession}>
                                <Ionicons name="pause" size={32} color="#F59E0B" />
                                <Text style={styles.controlLabel}>Pause</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.controlButton} onPress={recordDistraction}>
                            <View style={styles.distractionBadge}>
                                <Ionicons name="alert-circle" size={32} color="#EF4444" />
                                {distractions > 0 && (
                                    <View style={styles.distractionCount}>
                                        <Text style={styles.distractionCountText}>{distractions}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.controlLabel}>Distraction</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>Stay Focused</Text>
                        <Text style={styles.tipsText}>
                            • Close unnecessary tabs{'\n'}
                            • Phone on silent, face down{'\n'}
                            • One task at a time
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.endButton}
                    onPress={() => endSession(false)}
                >
                    <Text style={styles.endButtonText}>End Session Early</Text>
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
                <Text style={styles.title}>Focus Block</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="timer" size={40} color="#8B5CF6" />
                    </View>
                    <Text style={styles.heroTitle}>Deep Work Session</Text>
                    <Text style={styles.heroSubtitle}>
                        Eliminate distractions. Single-task.{'\n'}Build focus capacity.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>What are you working on?</Text>
                    <TextInput
                        style={styles.taskInput}
                        value={taskTitle}
                        onChangeText={setTaskTitle}
                        placeholder="e.g., Writing report, Learning React..."
                        placeholderTextColor="#6B7280"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Duration (minutes)</Text>
                    <View style={styles.durationRow}>
                        {DURATION_PRESETS.map((preset) => (
                            <TouchableOpacity
                                key={preset}
                                style={[
                                    styles.durationButton,
                                    duration === preset && styles.durationButtonActive,
                                ]}
                                onPress={() => setDuration(preset)}
                            >
                                <Text
                                    style={[
                                        styles.durationText,
                                        duration === preset && styles.durationTextActive,
                                    ]}
                                >
                                    {preset}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#8B5CF6" />
                    <Text style={styles.infoText}>
                        Track distractions during your session to understand your focus patterns.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.startButton} onPress={startSession}>
                    <Ionicons name="play" size={24} color="#FFF" />
                    <Text style={styles.startButtonText}>Start {duration} Min Session</Text>
                </TouchableOpacity>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#8B5CF620',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F9FAFB',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F9FAFB',
        marginBottom: 12,
    },
    taskInput: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#374151',
    },
    durationRow: {
        flexDirection: 'row',
        gap: 8,
    },
    durationButton: {
        flex: 1,
        backgroundColor: '#1F2937',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#374151',
    },
    durationButtonActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    durationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    durationTextActive: {
        color: '#FFF',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        gap: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    startButton: {
        flexDirection: 'row',
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    // Active session styles
    activeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    activeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    activeContent: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    timerContainer: {
        marginTop: 20,
        marginBottom: 40,
    },
    timerRing: {
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 6,
        borderColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerProgress: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 6,
        borderColor: '#8B5CF6',
        borderLeftColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    timerInner: {
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#F9FAFB',
    },
    timerLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 4,
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 40,
        marginBottom: 32,
    },
    controlButton: {
        alignItems: 'center',
        padding: 16,
    },
    controlLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    distractionBadge: {
        position: 'relative',
    },
    distractionCount: {
        position: 'absolute',
        top: -6,
        right: -10,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    distractionCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFF',
    },
    tipsCard: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        width: '100%',
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F9FAFB',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 22,
    },
    endButton: {
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#374151',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    endButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9CA3AF',
    },
});
