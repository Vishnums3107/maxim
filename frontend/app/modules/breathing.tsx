import React, { useEffect, useId, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, {
    Circle,
    Defs,
    LinearGradient as SvgLinearGradient,
    RadialGradient,
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
import { VoltageButton } from '../../src/components/VoltageButton';
import { createPressAnimation } from '../../src/theme/animations';
import {
    borderRadius,
    colors,
    moduleGradients,
    shadows,
    spacing,
    typography,
} from '../../src/theme/tokens';
import { haptics } from '../../src/utils/haptics';

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

const ACCENT = colors.modules.regulation;
const ACCENT_DEEP = colors.modules.regulationDeep;

export default function BreathingScreen() {
    const router = useRouter();
    const { addBreathingSession } = useUserStore();

    const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [currentCycle, setCurrentCycle] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startSession = (pattern: BreathingPattern) => {
        setSelectedPattern(pattern);
        setIsActive(true);
        setCurrentPhase(0);
        setCurrentCycle(0);
        setCountdown(pattern.phases[0].duration);
        setSessionStartTime(Date.now());
        haptics.press();
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
        scaleAnim.setValue(0.85);
        glowAnim.setValue(0.4);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    };

    useEffect(() => {
        if (!isActive || !selectedPattern) return;

        const phase = selectedPattern.phases[currentPhase];
        const isInhale = phase.action.toLowerCase().includes('inhale');
        const isExhale = phase.action.toLowerCase().includes('exhale');

        // Animate the breath orb (scale + glow)
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: isInhale ? 1.18 : isExhale ? 0.78 : 1,
                duration: phase.duration * 1000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
                toValue: isInhale ? 1 : isExhale ? 0.3 : 0.65,
                duration: phase.duration * 1000,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: false,
            }),
        ]).start();

        intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    const nextPhase = currentPhase + 1;

                    if (nextPhase >= selectedPattern.phases.length) {
                        const nextCycle = currentCycle + 1;

                        if (nextCycle >= selectedPattern.totalCycles) {
                            haptics.success();
                            stopSession();
                            return 0;
                        }

                        setCurrentCycle(nextCycle);
                        setCurrentPhase(0);
                        haptics.tap();
                        return selectedPattern.phases[0].duration;
                    }

                    setCurrentPhase(nextPhase);
                    haptics.tap();
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

    // ────────────────────────────────────────────────────────────────────────
    // ACTIVE SESSION
    // ────────────────────────────────────────────────────────────────────────
    if (isActive && selectedPattern) {
        const phase = selectedPattern.phases[currentPhase];
        const totalCycles = selectedPattern.totalCycles;

        return (
            <View style={styles.activeRoot}>
                <AuroraBackground
                    tint={ACCENT}
                    tintSecondary={colors.voltage.soft}
                    intensity={0.55}
                />

                <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
                    <View style={styles.activeHeader}>
                        <Pressable
                            onPress={() => {
                                haptics.tap();
                                stopSession();
                            }}
                            hitSlop={10}
                            style={({ pressed }) => [
                                styles.closeBtn,
                                pressed && { opacity: 0.7 },
                            ]}
                        >
                            <Ionicons name="close" size={18} color={colors.text.primary} />
                        </Pressable>

                        <View style={styles.activeHeaderCenter}>
                            <Eyebrow color={ACCENT}>Session</Eyebrow>
                            <Text style={styles.patternName} numberOfLines={1}>
                                {selectedPattern.name}
                            </Text>
                        </View>

                        <View style={styles.cyclePill}>
                            <Text style={styles.cyclePillText}>
                                {currentCycle + 1}
                                <Text style={styles.cyclePillTextDim}>/{totalCycles}</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={styles.activeBody}>
                        <BreathOrb
                            scale={scaleAnim}
                            glow={glowAnim}
                            countdown={countdown}
                            accent={ACCENT}
                            accentDeep={ACCENT_DEEP}
                        />

                        <View style={styles.actionWrap}>
                            <Text style={styles.actionText}>{phase.action}</Text>
                            <Text style={styles.actionCaption}>
                                {phase.action.toLowerCase().includes('inhale')
                                    ? 'Through the nose'
                                    : phase.action.toLowerCase().includes('exhale')
                                        ? 'Through the mouth'
                                        : 'Hold steady'}
                            </Text>
                        </View>

                        <View style={styles.phaseDots}>
                            {selectedPattern.phases.map((p, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.phaseDot,
                                        i === currentPhase && [
                                            styles.phaseDotActive,
                                            { backgroundColor: ACCENT },
                                        ],
                                        i < currentPhase && styles.phaseDotDone,
                                    ]}
                                />
                            ))}
                        </View>

                        {/* Cycle progress strip */}
                        <View style={styles.cycleStrip}>
                            {Array.from({ length: totalCycles }).map((_, i) => {
                                const filled = i < currentCycle || (i === currentCycle && currentPhase > 0);
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.cycleSeg,
                                            filled && { backgroundColor: ACCENT },
                                            i === currentCycle && {
                                                backgroundColor: ACCENT,
                                                opacity: 0.6,
                                            },
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    </View>

                    <View style={styles.activeFooter}>
                        <VoltageButton
                            title="End Session"
                            onPress={() => {
                                haptics.tap();
                                stopSession();
                            }}
                            variant="ghost"
                            fullWidth
                        />
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // PATTERN PICKER
    // ────────────────────────────────────────────────────────────────────────
    return (
        <View style={styles.root}>
            <AuroraBackground tint={ACCENT} intensity={0.4} />

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <ScreenChrome title="Breathing" eyebrow="Regulation" />

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.heroWrap}>
                        <ModuleHero
                            icon="leaf"
                            title="Regulate the nervous system"
                            subtitle="Choose a protocol. Breath is the fastest lever you have."
                            gradient={moduleGradients.regulation}
                            accent={ACCENT}
                        />
                    </View>

                    <View style={styles.section}>
                        <Eyebrow style={{ marginBottom: spacing.md }}>Protocols</Eyebrow>

                        {BREATHING_PATTERNS.map((pattern, idx) => (
                            <PatternCard
                                key={pattern.id}
                                pattern={pattern}
                                onPress={() => startSession(pattern)}
                                delay={idx * 60}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

// ────────────────────────────────────────────────────────────────────────────
// BREATH ORB — concentric SVG circles with gradient + animated halo
// ────────────────────────────────────────────────────────────────────────────
function BreathOrb({
    scale,
    glow,
    countdown,
    accent,
    accentDeep,
}: {
    scale: Animated.Value;
    glow: Animated.Value;
    countdown: number;
    accent: string;
    accentDeep: string;
}) {
    const fillId = useId();
    const ringId = useId();

    return (
        <View style={orb.wrap}>
            {/* Outer expanding halo (glow) */}
            <Animated.View
                pointerEvents="none"
                style={[
                    orb.haloOuter,
                    {
                        opacity: glow.interpolate({
                            inputRange: [0.3, 1],
                            outputRange: [0.18, 0.55],
                        }),
                        transform: [
                            {
                                scale: scale.interpolate({
                                    inputRange: [0.78, 1.18],
                                    outputRange: [0.96, 1.18],
                                }),
                            },
                        ],
                        backgroundColor: accent,
                    },
                ]}
            />

            {/* Inner halo */}
            <Animated.View
                pointerEvents="none"
                style={[
                    orb.haloInner,
                    {
                        opacity: glow.interpolate({
                            inputRange: [0.3, 1],
                            outputRange: [0.25, 0.7],
                        }),
                        transform: [{ scale }],
                        backgroundColor: accent,
                    },
                ]}
            />

            {/* Core orb (animated scale) */}
            <Animated.View style={[orb.core, { transform: [{ scale }] }]}>
                <Svg width={220} height={220}>
                    <Defs>
                        <RadialGradient
                            id={fillId}
                            cx="50%"
                            cy="42%"
                            rx="65%"
                            ry="65%"
                        >
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                            <Stop offset="40%" stopColor={accent} stopOpacity="0.8" />
                            <Stop offset="100%" stopColor={accentDeep} stopOpacity="1" />
                        </RadialGradient>
                        <SvgLinearGradient id={ringId} x1="0" y1="0" x2="1" y2="1">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
                            <Stop offset="100%" stopColor={accent} stopOpacity="0.15" />
                        </SvgLinearGradient>
                    </Defs>
                    <Circle cx={110} cy={110} r={104} fill={`url(#${fillId})`} />
                    <Circle
                        cx={110}
                        cy={110}
                        r={104}
                        stroke={`url(#${ringId})`}
                        strokeWidth={1.5}
                        fill="none"
                    />
                </Svg>

                <View style={orb.label}>
                    <Text style={orb.countdownNum}>{countdown}</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const orb = StyleSheet.create({
    wrap: {
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    haloOuter: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
    },
    haloInner: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
    },
    core: {
        width: 220,
        height: 220,
        borderRadius: 110,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countdownNum: {
        fontSize: 76,
        fontWeight: '300',
        color: '#FFFFFF',
        letterSpacing: -3,
        fontVariant: ['tabular-nums'] as any,
    },
});

// ────────────────────────────────────────────────────────────────────────────
// PATTERN CARD — pickable card with gradient duration pill and phase chips
// ────────────────────────────────────────────────────────────────────────────
function PatternCard({
    pattern,
    onPress,
    delay = 0,
}: {
    pattern: BreathingPattern;
    onPress: () => void;
    delay?: number;
}) {
    const scale = useRef(new Animated.Value(1)).current;
    const fade = useRef(new Animated.Value(0)).current;
    const slide = useRef(new Animated.Value(10)).current;
    const press = createPressAnimation(scale);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 380,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slide, {
                toValue: 0,
                duration: 380,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const totalSeconds = pattern.phases.reduce((acc, p) => acc + p.duration, 0) * pattern.totalCycles;
    const minutes = Math.max(1, Math.round(totalSeconds / 60));

    return (
        <Animated.View
            style={[
                pc.wrap,
                {
                    opacity: fade,
                    transform: [{ translateY: slide }, { scale }],
                },
            ]}
        >
            <Pressable onPress={onPress} {...press} style={pc.card}>
                <View style={pc.head}>
                    <View style={{ flex: 1 }}>
                        <Text style={pc.title}>{pattern.name}</Text>
                        <Text style={pc.desc}>{pattern.desc}</Text>
                    </View>

                    <View style={pc.duration}>
                        <Ionicons name="time-outline" size={11} color={ACCENT} />
                        <Text style={pc.durationText}>~{minutes} min</Text>
                    </View>
                </View>

                <View style={pc.chips}>
                    {pattern.phases.map((phase, i) => (
                        <View key={i} style={pc.chip}>
                            <Text style={pc.chipAction}>{phase.action}</Text>
                            <Text style={pc.chipDur}>{phase.duration}s</Text>
                        </View>
                    ))}
                </View>

                <View style={pc.foot}>
                    <Text style={pc.cycles}>
                        {pattern.totalCycles} cycle{pattern.totalCycles === 1 ? '' : 's'}
                    </Text>
                    <View style={[pc.cta, { backgroundColor: ACCENT }]}>
                        <Ionicons name="play" size={11} color={colors.bg.void} />
                        <Text style={pc.ctaText}>Start</Text>
                    </View>
                </View>

                <View pointerEvents="none" style={pc.hair} />
            </Pressable>
        </Animated.View>
    );
}

const pc = StyleSheet.create({
    wrap: {
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        overflow: 'hidden',
    },
    head: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    title: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        letterSpacing: -0.4,
    },
    desc: {
        fontSize: 12,
        color: colors.text.tertiary,
        marginTop: 3,
        lineHeight: 17,
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: borderRadius.full,
        backgroundColor: 'rgba(52, 211, 153, 0.10)',
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.28)',
    },
    durationText: {
        fontSize: 11,
        color: ACCENT,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        marginTop: spacing.md,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: colors.surface.glass,
        borderRadius: borderRadius.sm,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        gap: 5,
    },
    chipAction: {
        fontSize: 11,
        color: colors.text.secondary,
        fontWeight: '600',
    },
    chipDur: {
        fontSize: 10,
        color: colors.text.muted,
        fontWeight: '700',
        fontVariant: ['tabular-nums'] as any,
    },
    foot: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
    },
    cycles: {
        fontSize: 10,
        color: colors.text.muted,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
    cta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: borderRadius.full,
    },
    ctaText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.bg.void,
        letterSpacing: 0.6,
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

// ────────────────────────────────────────────────────────────────────────────
// PAGE STYLES
// ────────────────────────────────────────────────────────────────────────────
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
    patternName: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.3,
        marginTop: 2,
    },
    cyclePill: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    cyclePillText: {
        color: colors.text.primary,
        fontSize: 13,
        fontWeight: '700',
        fontVariant: ['tabular-nums'] as any,
    },
    cyclePillTextDim: {
        color: colors.text.muted,
        fontWeight: '600',
    },
    activeBody: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    actionWrap: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -1,
    },
    actionCaption: {
        fontSize: 12,
        color: colors.text.tertiary,
        marginTop: 6,
        fontWeight: '500',
        letterSpacing: 0.6,
    },
    phaseDots: {
        flexDirection: 'row',
        gap: 8,
        marginTop: spacing.xl,
    },
    phaseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    phaseDotActive: {
        width: 24,
        ...shadows.glow(ACCENT),
    },
    phaseDotDone: {
        backgroundColor: 'rgba(52, 211, 153, 0.45)',
    },
    cycleStrip: {
        flexDirection: 'row',
        gap: 4,
        marginTop: spacing.lg,
        width: '70%',
        maxWidth: 280,
    },
    cycleSeg: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    activeFooter: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
});
