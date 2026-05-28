import React, { useRef, useState } from 'react';
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
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { StepDots } from '../../src/components/StepDots';
import { VoltageButton } from '../../src/components/VoltageButton';
import { Gradient } from '../../src/components/Gradient';
import { useUserStore } from '../../src/store/userStore';
import { createPressAnimation } from '../../src/theme/animations';
import {
  borderRadius,
  colors,
  moduleGradients,
  spacing,
  typography,
} from '../../src/theme/tokens';

interface Goal {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  gradient: readonly [string, string];
}

const GOALS: Goal[] = [
  {
    id: 'fitness',
    label: 'Physical Strength',
    icon: 'flame',
    accent: colors.modules.physical,
    gradient: moduleGradients.physical,
  },
  {
    id: 'energy',
    label: 'Daily Energy',
    icon: 'flash',
    accent: colors.modules.social,
    gradient: moduleGradients.social,
  },
  {
    id: 'focus',
    label: 'Focus & Attention',
    icon: 'aperture',
    accent: colors.modules.cognitive,
    gradient: moduleGradients.cognitive,
  },
  {
    id: 'learning',
    label: 'Learn Faster',
    icon: 'book',
    accent: colors.modules.systems,
    gradient: moduleGradients.systems,
  },
  {
    id: 'anxiety',
    label: 'Reduce Anxiety',
    icon: 'leaf',
    accent: colors.modules.regulation,
    gradient: moduleGradients.regulation,
  },
  {
    id: 'sleep',
    label: 'Better Sleep',
    icon: 'moon',
    accent: '#A78BFA',
    gradient: ['#A78BFA', '#7C3AED'] as const,
  },
  {
    id: 'confidence',
    label: 'Social Confidence',
    icon: 'people',
    accent: '#F472B6',
    gradient: ['#F472B6', '#DB2777'] as const,
  },
  {
    id: 'habits',
    label: 'Better Habits',
    icon: 'repeat',
    accent: '#34D399',
    gradient: ['#34D399', '#059669'] as const,
  },
];

export default function OnboardingGoals() {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((p) => (p.includes(id) ? p.filter((g) => g !== id) : [...p, id]));
  };

  const handleComplete = async () => {
    await updateProfile({
      learningGoals: selected,
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.root}>
      <AuroraBackground
        tint={colors.modules.cognitive}
        tintSecondary={colors.modules.social}
        intensity={0.4}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScreenChrome
          title="Step 3 of 3"
          eyebrow="Onboarding"
          right={<StepDots total={3} current={2} />}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.intro}>
            <Eyebrow>What matters most</Eyebrow>
            <Text style={styles.title}>Choose your priorities.</Text>
            <Text style={styles.lede}>
              Pick anything that resonates. MAXIM weighs your protocols accordingly.
              You can change these later.
            </Text>
          </View>

          <View style={styles.grid}>
            {GOALS.map((goal, idx) => (
              <GoalTile
                key={goal.id}
                goal={goal}
                selected={selected.includes(goal.id)}
                onPress={() => toggle(goal.id)}
                delay={idx * 50}
              />
            ))}
          </View>

          <View style={styles.helper}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={selected.length > 0 ? colors.success : colors.text.muted}
            />
            <Text
              style={[
                styles.helperText,
                selected.length > 0 && { color: colors.text.secondary },
              ]}
            >
              {selected.length === 0
                ? 'Select at least one goal'
                : `${selected.length} goal${selected.length === 1 ? '' : 's'} selected`}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <VoltageButton
            title="Begin"
            onPress={handleComplete}
            icon="rocket"
            iconPosition="left"
            fullWidth
            size="lg"
            disabled={selected.length === 0}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Tile ───────────────────────────────────────────────────────────────────
function GoalTile({
  goal,
  selected,
  onPress,
  delay = 0,
}: {
  goal: Goal;
  selected: boolean;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;
  const press = createPressAnimation(scale);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
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
        gt.tile,
        {
          opacity: fade,
          transform: [{ translateY: translate }, { scale }],
        },
      ]}
    >
      <Pressable onPress={onPress} {...press} style={gt.touch}>
        {/* corner halo when selected */}
        {selected ? (
          <>
            <View pointerEvents="none" style={gt.halo}>
              <Gradient colors={goal.gradient} borderRadius={120} />
            </View>
            <View pointerEvents="none" style={gt.haloFade} />
          </>
        ) : null}

        <View
          style={[
            gt.iconCell,
            {
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderColor: selected
                ? `${goal.accent}55`
                : 'rgba(255,255,255,0.08)',
            },
          ]}
        >
          <Ionicons name={goal.icon} size={20} color={goal.accent} />
        </View>

        <Text style={gt.label}>{goal.label}</Text>

        {selected ? (
          <View
            style={[
              gt.check,
              { backgroundColor: goal.accent },
            ]}
          >
            <Ionicons name="checkmark" size={11} color={colors.bg.void} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const gt = StyleSheet.create({
  tile: {
    width: '48.5%',
  },
  touch: {
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
    minHeight: 110,
  },
  halo: {
    position: 'absolute',
    bottom: -54,
    right: -54,
    width: 130,
    height: 130,
    borderRadius: 130,
    opacity: 0.32,
  },
  haloFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,11,0.10)',
  },
  iconCell: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm + 2,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  check: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.void,
  },
  intro: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: 6,
  },
  lede: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    lineHeight: 21,
    maxWidth: 340,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  helper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg.void,
    borderTopWidth: 1,
    borderTopColor: colors.border.hairline,
  },
});
