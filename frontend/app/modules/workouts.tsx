import React, { useState } from 'react';
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { Eyebrow } from '../../src/components/Eyebrow';
import { Gradient } from '../../src/components/Gradient';
import {
    borderRadius,
    colors,
    moduleGradients,
    spacing,
    typography,
} from '../../src/theme/tokens';
import { createPressAnimation } from '../../src/theme/animations';
import { haptics } from '../../src/utils/haptics';

type WorkoutLocation = 'home' | 'gym';
type WorkoutCategory = 'strength' | 'mobility' | 'cardio' | 'recovery';

interface Workout {
    id: string;
    name: string;
    description: string;
    duration: number;
    category: WorkoutCategory;
    location: WorkoutLocation[];
    level: 'beginner' | 'intermediate' | 'advanced';
    exercises: string[];
}

const WORKOUTS: Workout[] = [
    {
        id: 's1',
        name: 'Foundation Strength',
        description: 'Core compound movements for full-body strength',
        duration: 30,
        category: 'strength',
        location: ['gym'],
        level: 'beginner',
        exercises: ['Goblet Squat 3x10', 'DB Row 3x10', 'Push-ups 3x8-12', 'RDL 3x10'],
    },
    {
        id: 's2',
        name: 'Bodyweight Power',
        description: 'No equipment required strength building',
        duration: 25,
        category: 'strength',
        location: ['home'],
        level: 'beginner',
        exercises: ['Squats 3x15', 'Push-ups 3x10', 'Lunges 3x10 each', 'Plank 3x30s'],
    },
    {
        id: 's3',
        name: 'Upper/Lower Split',
        description: 'Focused muscle group training',
        duration: 45,
        category: 'strength',
        location: ['gym'],
        level: 'intermediate',
        exercises: ['Bench 4x8', 'Rows 4x8', 'OHP 3x10', 'Curls 3x12', 'Tricep Ext 3x12'],
    },
    {
        id: 'm1',
        name: 'Morning Mobility',
        description: 'Wake up your joints and muscles',
        duration: 15,
        category: 'mobility',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: [
            'Cat-Cow 10x',
            'Hip Circles 10x',
            'Shoulder Rolls 10x',
            "World's Greatest Stretch 5x",
        ],
    },
    {
        id: 'm2',
        name: 'Desk Worker Reset',
        description: 'Counter sitting with targeted stretches',
        duration: 10,
        category: 'mobility',
        location: ['home'],
        level: 'beginner',
        exercises: [
            'Hip Flexor Stretch 60s',
            'Chest Opener 60s',
            'Neck Rolls 30s',
            'Thoracic Extensions',
        ],
    },
    {
        id: 'c1',
        name: 'Zone 2 Walk',
        description: 'Low intensity for metabolic health',
        duration: 30,
        category: 'cardio',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: ['Walk at 60-70% max HR', 'Can hold conversation', 'Nasal breathing preferred'],
    },
    {
        id: 'c2',
        name: 'HIIT Sprint',
        description: 'Short, intense intervals',
        duration: 15,
        category: 'cardio',
        location: ['gym'],
        level: 'intermediate',
        exercises: ['Warm up 3min', '20s sprint / 40s rest x8', 'Cool down 2min'],
    },
    {
        id: 'r1',
        name: 'Active Recovery',
        description: 'Light movement for rest days',
        duration: 20,
        category: 'recovery',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: ['Easy walk 10min', 'Light stretching', 'Foam rolling 5min'],
    },
    {
        id: 'r2',
        name: 'Nervous System Reset',
        description: 'Parasympathetic activation',
        duration: 15,
        category: 'recovery',
        location: ['home'],
        level: 'beginner',
        exercises: ['Legs up wall 5min', 'Box breathing 5min', 'Body scan 5min'],
    },
];

interface CategoryConfig {
    label: string;
    accent: string;
    gradient: readonly [string, string];
    icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORY_CONFIG: Record<WorkoutCategory, CategoryConfig> = {
    strength: {
        label: 'Strength',
        accent: colors.modules.physical,
        gradient: moduleGradients.physical,
        icon: 'barbell',
    },
    mobility: {
        label: 'Mobility',
        accent: colors.modules.cognitive,
        gradient: moduleGradients.cognitive,
        icon: 'body',
    },
    cardio: {
        label: 'Cardio',
        accent: colors.modules.social,
        gradient: moduleGradients.social,
        icon: 'heart',
    },
    recovery: {
        label: 'Recovery',
        accent: colors.modules.regulation,
        gradient: moduleGradients.regulation,
        icon: 'leaf',
    },
};

export default function WorkoutsScreen() {
    const router = useRouter();
    const { profile } = useUserStore();
    const [location, setLocation] = useState<WorkoutLocation>('home');
    const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | null>(null);

    const filteredWorkouts = WORKOUTS.filter((w) => {
        const matchesLocation = w.location.includes(location);
        const matchesCategory = !selectedCategory || w.category === selectedCategory;
        const matchesLevel =
            !profile?.level ||
            w.level === profile.level ||
            profile.level === 'advanced' ||
            (profile.level === 'intermediate' && w.level !== 'advanced');
        return matchesLocation && matchesCategory && matchesLevel;
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Workouts" eyebrow="Physical" />

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: spacing['2xl'] }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.heroWrap}>
                    <ModuleHero
                        icon="barbell"
                        title="Train with intent"
                        subtitle="Curated protocols for strength, mobility, cardio and recovery."
                        gradient={moduleGradients.physical}
                        accent={colors.modules.physical}
                    />
                </View>

                {/* Location segmented control */}
                <View style={styles.section}>
                    <Eyebrow style={{ marginBottom: spacing.md }}>Where</Eyebrow>
                    <View style={styles.segmented}>
                        <SegmentButton
                            icon="home"
                            label="Home"
                            active={location === 'home'}
                            onPress={() => {
                                haptics.select();
                                setLocation('home');
                            }}
                        />
                        <SegmentButton
                            icon="fitness"
                            label="Gym"
                            active={location === 'gym'}
                            onPress={() => {
                                haptics.select();
                                setLocation('gym');
                            }}
                        />
                    </View>
                </View>

                {/* Category chips */}
                <View style={[styles.section, { paddingHorizontal: 0 }]}>
                    <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
                        <Eyebrow>Category</Eyebrow>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chipsRow}
                    >
                        <CategoryChip
                            label="All"
                            active={!selectedCategory}
                            onPress={() => {
                                haptics.select();
                                setSelectedCategory(null);
                            }}
                        />
                        {(Object.keys(CATEGORY_CONFIG) as WorkoutCategory[]).map((key) => {
                            const cfg = CATEGORY_CONFIG[key];
                            return (
                                <CategoryChip
                                    key={key}
                                    icon={cfg.icon}
                                    label={cfg.label}
                                    accent={cfg.accent}
                                    active={selectedCategory === key}
                                    onPress={() => {
                                        haptics.select();
                                        setSelectedCategory(key);
                                    }}
                                />
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Workouts list */}
                <View style={styles.section}>
                    <View style={styles.listHead}>
                        <Eyebrow>
                            {selectedCategory
                                ? CATEGORY_CONFIG[selectedCategory].label
                                : 'All Workouts'}
                        </Eyebrow>
                        <Text style={styles.countText}>
                            {filteredWorkouts.length} found
                        </Text>
                    </View>

                    {filteredWorkouts.map((workout, idx) => (
                        <WorkoutCard
                            key={workout.id}
                            workout={workout}
                            config={CATEGORY_CONFIG[workout.category]}
                            delay={idx * 50}
                        />
                    ))}

                    {filteredWorkouts.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Ionicons
                                    name="barbell-outline"
                                    size={20}
                                    color={colors.text.tertiary}
                                />
                            </View>
                            <Text style={styles.emptyTitle}>No workouts match</Text>
                            <Text style={styles.emptyText}>
                                Try a different location or category.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Segment button (Home/Gym) ──────────────────────────────────────────────
function SegmentButton({
    icon,
    label,
    active,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                seg.btn,
                active && seg.btnActive,
                pressed && { opacity: 0.85 },
            ]}
        >
            <Ionicons
                name={icon}
                size={15}
                color={active ? colors.bg.void : colors.text.tertiary}
            />
            <Text style={[seg.text, active && seg.textActive]}>{label}</Text>
        </Pressable>
    );
}

const seg = StyleSheet.create({
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 11,
        borderRadius: borderRadius.sm,
    },
    btnActive: {
        backgroundColor: colors.voltage.core,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.text.tertiary,
    },
    textActive: {
        color: colors.bg.void,
        fontWeight: '700',
    },
});

// ── Category chip ──────────────────────────────────────────────────────────
function CategoryChip({
    icon,
    label,
    accent,
    active,
    onPress,
}: {
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    accent?: string;
    active: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                chip.btn,
                active && {
                    backgroundColor: accent ? `${accent}1F` : 'rgba(224, 231, 255, 0.14)',
                    borderColor: accent ?? colors.voltage.core,
                },
                pressed && { opacity: 0.85 },
            ]}
        >
            {icon ? (
                <Ionicons
                    name={icon}
                    size={12}
                    color={active ? accent ?? colors.voltage.core : colors.text.tertiary}
                />
            ) : null}
            <Text
                style={[
                    chip.text,
                    active && {
                        color: accent ?? colors.voltage.core,
                        fontWeight: '700',
                    },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const chip = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: borderRadius.full,
        backgroundColor: colors.bg.raised,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.tertiary,
        letterSpacing: 0.2,
    },
});

// ── Workout card ───────────────────────────────────────────────────────────
function WorkoutCard({
    workout,
    config,
    delay = 0,
}: {
    workout: Workout;
    config: CategoryConfig;
    delay?: number;
}) {
    const fade = React.useRef(new Animated.Value(0)).current;
    const slide = React.useRef(new Animated.Value(10)).current;
    const scale = React.useRef(new Animated.Value(1)).current;
    const press = createPressAnimation(scale);

    React.useEffect(() => {
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

    return (
        <Animated.View
            style={[
                wc.wrap,
                { opacity: fade, transform: [{ translateY: slide }, { scale }] },
            ]}
        >
            <Pressable
                onPress={() => haptics.tap()}
                {...press}
                style={wc.card}
            >
                {/* Corner halo */}
                <View pointerEvents="none" style={wc.halo}>
                    <Gradient colors={config.gradient} borderRadius={130} />
                </View>
                <View pointerEvents="none" style={wc.haloFade} />

                <View style={wc.head}>
                    <View
                        style={[
                            wc.iconCell,
                            {
                                backgroundColor: 'rgba(255,255,255,0.04)',
                                borderColor: `${config.accent}55`,
                            },
                        ]}
                    >
                        <Ionicons name={config.icon} size={16} color={config.accent} />
                    </View>
                    <View style={wc.duration}>
                        <Ionicons
                            name="time-outline"
                            size={11}
                            color={colors.text.tertiary}
                        />
                        <Text style={wc.durationText}>{workout.duration} min</Text>
                    </View>
                </View>

                <Text style={wc.name}>{workout.name}</Text>
                <Text style={wc.desc}>{workout.description}</Text>

                <View style={wc.exercises}>
                    {workout.exercises.slice(0, 3).map((exercise, i) => (
                        <View key={i} style={wc.exerciseRow}>
                            <View style={[wc.exerciseDot, { backgroundColor: config.accent }]} />
                            <Text style={wc.exerciseText} numberOfLines={1}>
                                {exercise}
                            </Text>
                        </View>
                    ))}
                    {workout.exercises.length > 3 ? (
                        <Text style={wc.moreText}>
                            + {workout.exercises.length - 3} more
                        </Text>
                    ) : null}
                </View>

                <View pointerEvents="none" style={wc.hair} />
            </Pressable>
        </Animated.View>
    );
}

const wc = StyleSheet.create({
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
    halo: {
        position: 'absolute',
        top: -54,
        right: -54,
        width: 130,
        height: 130,
        borderRadius: 130,
        opacity: 0.18,
    },
    haloFade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(6,6,11,0.06)',
    },
    head: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm + 2,
    },
    iconCell: {
        width: 32,
        height: 32,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: borderRadius.full,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    durationText: {
        fontSize: 11,
        color: colors.text.secondary,
        fontWeight: '600',
        fontVariant: ['tabular-nums'] as any,
    },
    name: {
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
    exercises: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
    },
    exerciseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 3,
    },
    exerciseDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    exerciseText: {
        flex: 1,
        fontSize: 12.5,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    moreText: {
        marginTop: 4,
        marginLeft: 12,
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: '500',
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

// ── Page styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.void,
    },
    content: {
        flex: 1,
    },
    heroWrap: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    section: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xl,
    },
    segmented: {
        flexDirection: 'row',
        gap: 4,
        backgroundColor: colors.bg.raised,
        padding: 3,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 6,
        paddingHorizontal: spacing.lg,
    },
    listHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    countText: {
        fontSize: 11,
        color: colors.text.tertiary,
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
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
        marginTop: 4,
    },
});
