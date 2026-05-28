import React, { useEffect, useId, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient as SvgLinearGradient,
    Stop,
} from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useUserStore } from '../../src/store/userStore';
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { GlassCard } from '../../src/components/GlassCard';
import { VoltageButton } from '../../src/components/VoltageButton';
import {
    borderRadius,
    colors,
    moduleGradients,
    shadows,
    spacing,
    typography,
} from '../../src/theme/tokens';
import { haptics } from '../../src/utils/haptics';

const ACCENT = colors.modules.cognitive;
const ACCENT_DEEP = colors.modules.cognitiveDeep;
const DURATION_PRESETS = [15, 25, 45, 60, 90];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function FocusScreen() {
    const router = useRouter();
    const { addFocusBlock, updateFocusBlock } = useUserStore();

    const [duration, setDuration] = useState(25);
    const [taskTitle, setTaskTitle] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [distractions, setDistractions] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
            duration,
            startedAt: new Date().toISOString(),
            distractions: 0,
        });

        haptics.press();
    };

    const togglePause = () => {
        setIsPaused((p) => !p);
        haptics.tap();
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

        if (intervalRef.current) clearInterval(intervalRef.current);
        if (completed) haptics.success();
        else haptics.tap();
    };

    const recordDistraction = () => {
        setDistractions((p) => p + 1);
        haptics.warn();
    };

    useEffect(() => {
        if (!isActive || isPaused) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    endSession(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, isPaused]);

    // ────────────────────────────────────────────────────────────────────────
    // ACTIVE SESSION
    // ────────────────────────────────────────────────────────────────────────
    if (isActive) {
        const totalSeconds = duration * 60;
        const progress = totalSeconds > 0 ? 1 - timeRemaining / totalSeconds : 0;

        return (
            <View style={styles.activeRoot}>
                <AuroraBackground
                    tint={ACCENT}
                    tintSecondary={colors.voltage.soft}
                    intensity={0.5}
                />

                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <View style={styles.activeHeader}>
                        <Pressable
                            onPress={() => endSession(false)}
                            hitSlop={10}
                            style={({ pressed }) => [
                                styles.closeBtn,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Ionicons name="close" size={18} color={colors.text.primary} />
                        </Pressable>

                        <View style={styles.activeHeaderCenter}>
                            <Eyebrow color={ACCENT}>
                                {isPaused ? 'Paused' : 'Focusing'}
                            </Eyebrow>
                            <Text style={styles.activeTitle} numberOfLines={1}>
                                {taskTitle || 'Focus Session'}
                            </Text>
                        </View>

                        <View
                            style={[
                                styles.distractionPill,
                                distractions === 0 && { opacity: 0.55 },
                            ]}
                        >
                            <Ionicons
                                name="alert-circle"
                                size={11}
                                color={colors.modules.physical}
                            />
                            <Text style={styles.distractionPillText}>
                                {distractions}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.activeBody}>
                        <FocusTimerRing
                            progress={progress}
                            timeText={formatTime(timeRemaining)}
                            paused={isPaused}
                            accent={ACCENT}
                            accentDeep={ACCENT_DEEP}
                        />

                        <Text style={styles.subCaption}>
                            {isPaused ? 'Tap resume when ready' : `Single-task • ${duration} min block`}
                        </Text>

                        <View style={styles.controlsRow}>
                            <ControlButton
                                icon={isPaused ? 'play' : 'pause'}
                                label={isPaused ? 'Resume' : 'Pause'}
                                tint={isPaused ? colors.modules.regulation : colors.modules.social}
                                onPress={togglePause}
                            />
                            <ControlButton
                                icon="alert-circle"
                                label="Distraction"
                                tint={colors.modules.physical}
                                onPress={recordDistraction}
                            />
                        </View>
                    </View>

                    <View style={styles.activeFooter}>
                        <VoltageButton
                            title="End session early"
                            onPress={() => endSession(false)}
                            variant="ghost"
                            fullWidth
                        />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // SETUP / PICKER
    // ────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <AuroraBackground tint={ACCENT} intensity={0.4} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScreenChrome title="Focus Block" eyebrow="Cognitive" />

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.heroWrap}>
                            <ModuleHero
                                icon="aperture"
                                title="Deep work, undivided"
                                subtitle="Eliminate distractions. Single-task. Build attention capacity over weeks."
                                gradient={moduleGradients.cognitive}
                                accent={ACCENT}
                            />
                        </View>

                        <View style={styles.section}>
                            <Eyebrow style={{ marginBottom: spacing.md }}>
                                What are you working on?
                            </Eyebrow>
                            <View style={styles.inputWrap}>
                                <Ionicons
                                    name="document-text-outline"
                                    size={16}
                                    color={colors.text.muted}
                                    style={{ marginRight: 10 }}
                                />
                                <TextInput
                                    style={styles.taskInput}
                                    value={taskTitle}
                                    onChangeText={setTaskTitle}
                                    placeholder="e.g. Design review, study session…"
                                    placeholderTextColor={colors.text.muted}
                                    returnKeyType="done"
                                />
                                {taskTitle ? (
                                    <Pressable
                                        onPress={() => {
                                            haptics.tap();
                                            setTaskTitle('');
                                        }}
                                        hitSlop={6}
                                    >
                                        <Ionicons
                                            name="close-circle"
                                            size={16}
                                            color={colors.text.muted}
                                        />
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHead}>
                                <Eyebrow>Duration</Eyebrow>
                                <Text style={styles.minutesPreview}>
                                    {duration}
                                    <Text style={styles.minutesPreviewUnit}> min</Text>
                                </Text>
                            </View>
                            <View style={styles.durationRow}>
                                {DURATION_PRESETS.map((preset) => {
                                    const active = duration === preset;
                                    return (
                                        <Pressable
                                            key={preset}
                                            onPress={() => {
                                                haptics.select();
                                                setDuration(preset);
                                            }}
                                            style={({ pressed }) => [
                                                styles.durationPill,
                                                active && styles.durationPillActive,
                                                pressed && { opacity: 0.85 },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.durationNum,
                                                    active && styles.durationNumActive,
                                                ]}
                                            >
                                                {preset}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.durationUnit,
                                                    active && styles.durationUnitActive,
                                                ]}
                                            >
                                                min
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <GlassCard immediate padding={spacing.base + 2}>
                                <View style={styles.tipsHead}>
                                    <Ionicons
                                        name="bulb"
                                        size={14}
                                        color={ACCENT}
                                    />
                                    <Text style={[styles.tipsHeadText, { color: ACCENT }]}>
                                        While you work
                                    </Text>
                                </View>
                                <Tip text="Phone face-down or in another room" />
                                <Tip text="Tap the distraction button when you notice an urge" />
                                <Tip text="Single tab. Single tool. Single task." />
                            </GlassCard>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <VoltageButton
                            title={`Start ${duration}-minute block`}
                            onPress={startSession}
                            icon="play"
                            iconPosition="left"
                            variant="accent"
                            accent={[ACCENT, ACCENT_DEEP] as const}
                            fullWidth
                            size="lg"
                        />
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// FOCUS TIMER RING — proper SVG circle progress
// ────────────────────────────────────────────────────────────────────────────
function FocusTimerRing({
    progress,
    timeText,
    paused,
    accent,
    accentDeep,
}: {
    progress: number; // 0–1
    timeText: string;
    paused: boolean;
    accent: string;
    accentDeep: string;
}) {
    const size = 280;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const animated = useRef(new Animated.Value(0)).current;
    const breathScale = useRef(new Animated.Value(1)).current;
    const gradId = useId();

    useEffect(() => {
        Animated.timing(animated, {
            toValue: Math.max(0, Math.min(1, progress)),
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [progress]);

    // Subtle breathing on the inner copy when not paused
    useEffect(() => {
        if (paused) {
            breathScale.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(breathScale, {
                    toValue: 1.015,
                    duration: 2400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breathScale, {
                    toValue: 1,
                    duration: 2400,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [paused]);

    const strokeDashoffset = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [circumference, 0],
    });

    return (
        <View style={tr.wrap}>
            {/* outer halo */}
            <View
                pointerEvents="none"
                style={[
                    tr.halo,
                    {
                        backgroundColor: accent,
                        opacity: paused ? 0.15 : 0.32,
                    },
                ]}
            />

            <Svg width={size} height={size}>
                <Defs>
                    <SvgLinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                        <Stop offset="55%" stopColor={accent} stopOpacity="1" />
                        <Stop offset="100%" stopColor={accentDeep} stopOpacity="0.85" />
                    </SvgLinearGradient>
                </Defs>

                {/* track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            <Animated.View
                pointerEvents="none"
                style={[tr.label, { transform: [{ scale: breathScale }] }]}
            >
                <Text style={tr.timer}>{timeText}</Text>
                <Text style={tr.timerCaption}>
                    {paused ? 'Paused' : 'remaining'}
                </Text>
            </Animated.View>
        </View>
    );
}

const tr = StyleSheet.create({
    wrap: {
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    halo: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
    },
    label: {
        position: 'absolute',
        alignItems: 'center',
    },
    timer: {
        fontSize: 64,
        fontWeight: '300',
        color: colors.text.primary,
        letterSpacing: -2,
        fontVariant: ['tabular-nums'] as any,
    },
    timerCaption: {
        marginTop: 4,
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.tertiary,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});

// ────────────────────────────────────────────────────────────────────────────
// CONTROL BUTTON — large pill with icon + label, tinted
// ────────────────────────────────────────────────────────────────────────────
function ControlButton({
    icon,
    label,
    tint,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    tint: string;
    onPress: () => void;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <Pressable
                onPress={onPress}
                onPressIn={() =>
                    Animated.spring(scale, {
                        toValue: 0.94,
                        useNativeDriver: true,
                        friction: 7,
                    }).start()
                }
                onPressOut={() =>
                    Animated.spring(scale, {
                        toValue: 1,
                        useNativeDriver: true,
                        friction: 5,
                    }).start()
                }
                style={cb.btn}
            >
                <View
                    style={[
                        cb.iconCell,
                        {
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            borderColor: `${tint}55`,
                        },
                    ]}
                >
                    <Ionicons name={icon} size={22} color={tint} />
                </View>
                <Text style={cb.label}>{label}</Text>
            </Pressable>
        </Animated.View>
    );
}

const cb = StyleSheet.create({
    btn: {
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
    },
    iconCell: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.text.secondary,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
});

// ────────────────────────────────────────────────────────────────────────────
// PAGE STYLES
// ────────────────────────────────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
    return (
        <View style={tipStyles.row}>
            <View style={[tipStyles.dot, { backgroundColor: ACCENT }]} />
            <Text style={tipStyles.text}>{text}</Text>
        </View>
    );
}

const tipStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 8,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    text: {
        flex: 1,
        fontSize: 13,
        color: colors.text.secondary,
        lineHeight: 19,
    },
});

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: colors.bg.void,
    },
    heroWrap: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
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
    minutesPreview: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.6,
        fontVariant: ['tabular-nums'] as any,
    },
    minutesPreviewUnit: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.base,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    taskInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: typography.size.md,
        color: colors.text.primary,
    },

    durationRow: {
        flexDirection: 'row',
        gap: 6,
    },
    durationPill: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        backgroundColor: colors.bg.raised,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    durationPillActive: {
        backgroundColor: 'rgba(167, 139, 250, 0.16)',
        borderColor: 'rgba(167, 139, 250, 0.55)',
        ...shadows.glow(ACCENT),
    },
    durationNum: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.6,
        fontVariant: ['tabular-nums'] as any,
    },
    durationNumActive: {
        color: ACCENT,
    },
    durationUnit: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.text.muted,
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    durationUnitActive: {
        color: ACCENT,
    },

    tipsHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
    },
    tipsHeadText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },

    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: colors.bg.void,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
    },

    // Active state
    activeRoot: {
        flex: 1,
        backgroundColor: colors.bg.void,
    },
    activeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.base,
        gap: spacing.md,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeHeaderCenter: {
        flex: 1,
        alignItems: 'center',
    },
    activeTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.3,
        marginTop: 2,
    },
    distractionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        minWidth: 44,
        justifyContent: 'center',
    },
    distractionPillText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text.primary,
        fontVariant: ['tabular-nums'] as any,
    },

    activeBody: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    subCaption: {
        marginTop: spacing.xl,
        fontSize: 13,
        color: colors.text.tertiary,
        fontWeight: '500',
    },
    controlsRow: {
        flexDirection: 'row',
        gap: 32,
        marginTop: spacing.xl,
    },

    activeFooter: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
});
