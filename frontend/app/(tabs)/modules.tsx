import React, { useRef } from 'react';
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
import { Gradient } from '../../src/components/Gradient';
import { Sparkline } from '../../src/components/Sparkline';
import { useUserStore } from '../../src/store/userStore';
import {
  borderRadius,
  colors,
  moduleGradients,
  shadows,
  spacing,
  typography,
} from '../../src/theme/tokens';
import { createPressAnimation } from '../../src/theme/animations';

const TAB_BAR_OFFSET = 110;

type ModuleId = 'physical' | 'cognitive' | 'regulation' | 'social' | 'systems';

interface ModuleDef {
  id: ModuleId;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly [string, string];
  accent: string;
  route: string;
  size: 'lg' | 'md';
}

const MODULES: ModuleDef[] = [
  {
    id: 'physical',
    title: 'Physical',
    subtitle: 'Strength · Stamina · Recovery',
    icon: 'flame',
    gradient: moduleGradients.physical,
    accent: colors.modules.physical,
    route: '/modules/physical',
    size: 'lg',
  },
  {
    id: 'cognitive',
    title: 'Cognitive',
    subtitle: 'Focus · Learning · Clarity',
    icon: 'aperture',
    gradient: moduleGradients.cognitive,
    accent: colors.modules.cognitive,
    route: '/modules/cognitive',
    size: 'md',
  },
  {
    id: 'regulation',
    title: 'Regulation',
    subtitle: 'Breath · Calm · Control',
    icon: 'leaf',
    gradient: moduleGradients.regulation,
    accent: colors.modules.regulation,
    route: '/modules/regulation',
    size: 'md',
  },
  {
    id: 'social',
    title: 'Social',
    subtitle: 'Communication · Confidence',
    icon: 'people',
    gradient: moduleGradients.social,
    accent: colors.modules.social,
    route: '/modules/social',
    size: 'md',
  },
  {
    id: 'systems',
    title: 'Systems',
    subtitle: 'Habits · Friction · Identity',
    icon: 'pulse',
    gradient: moduleGradients.systems,
    accent: colors.modules.systems,
    route: '/modules/systems',
    size: 'md',
  },
];

const QUICK_TOOLS: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  route: string;
}[] = [
  {
    title: 'Breathing',
    subtitle: 'Box · Sigh · 4-7-8 · Coherent',
    icon: 'water-outline',
    tint: colors.modules.regulation,
    route: '/modules/breathing',
  },
  {
    title: 'Focus Block',
    subtitle: 'Deep work session',
    icon: 'timer-outline',
    tint: colors.modules.cognitive,
    route: '/modules/focus',
  },
  {
    title: 'Workouts',
    subtitle: 'Library of training',
    icon: 'barbell-outline',
    tint: colors.modules.physical,
    route: '/modules/workouts',
  },
  {
    title: 'Insights',
    subtitle: 'Patterns & analysis',
    icon: 'analytics-outline',
    tint: colors.modules.systems,
    route: '/modules/insights',
  },
];

export default function ModulesScreen() {
  const router = useRouter();
  const { dailyEntries } = useUserStore();

  // ── Compute "activity level" sparkline for each module from dailyEntries ──
  const sparkData = (key: ModuleId) => {
    const last7 = dailyEntries.slice(-7);
    if (last7.length === 0) return [0, 1, 0, 2, 1, 2, 1];
    return last7.map((e) => {
      switch (key) {
        case 'physical':
          return e.physicalAction?.completed ? 1 : 0;
        case 'cognitive':
          return e.cognitiveAction?.completed ? 1 : 0;
        case 'regulation':
          return e.regulationAction?.completed ? 1 : 0;
        case 'social':
          return e.socialAction?.completed ? 1 : 0;
        case 'systems':
          return e.systemAction?.completed ? 1 : 0;
      }
    });
  };

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.modules.cognitive} tintSecondary={colors.modules.physical} intensity={0.45} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: TAB_BAR_OFFSET + spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Eyebrow>Performance Architecture</Eyebrow>
            <Text style={styles.title}>Modules</Text>
            <Text style={styles.subtitle}>
              Five domains of capability. Train each — compound across all.
            </Text>
          </View>

          {/* Featured (large) module card */}
          <View style={styles.featuredWrap}>
            <FeatureCard
              module={MODULES[0]}
              spark={sparkData(MODULES[0].id)}
              onPress={() => router.push(MODULES[0].route as any)}
            />
          </View>

          {/* Grid of remaining modules */}
          <View style={styles.gridWrap}>
            <View style={styles.grid}>
              {MODULES.slice(1).map((m, idx) => (
                <ModuleTile
                  key={m.id}
                  module={m}
                  spark={sparkData(m.id)}
                  delay={idx * 60}
                  onPress={() => router.push(m.route as any)}
                />
              ))}
            </View>
          </View>

          {/* Quick tools */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Eyebrow>Quick Launch</Eyebrow>
            </View>
            <View style={styles.quickGrid}>
              {QUICK_TOOLS.map((q) => (
                <QuickTool
                  key={q.title}
                  title={q.title}
                  subtitle={q.subtitle}
                  icon={q.icon}
                  tint={q.tint}
                  onPress={() => router.push(q.route as any)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ── Featured (large) gradient card ─────────────────────────────────────────
function FeatureCard({
  module,
  spark,
  onPress,
}: {
  module: ModuleDef;
  spark: number[];
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = createPressAnimation(scale);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, shadows.glow(module.accent)]}>
      <Pressable onPress={onPress} {...press}>
        <View style={[fs.card, { borderColor: 'rgba(255,255,255,0.08)' }]}>
          <Gradient colors={module.gradient} borderRadius={borderRadius['2xl']} />
          {/* darkening overlay so text contrasts */}
          <View style={fs.scrim} />

          <View style={fs.row}>
            <View style={fs.iconBig}>
              <Ionicons name={module.icon} size={28} color={colors.text.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Eyebrow color="rgba(255,255,255,0.78)">Featured</Eyebrow>
              <Text style={fs.title}>{module.title}</Text>
              <Text style={fs.subtitle}>{module.subtitle}</Text>
            </View>
          </View>

          <View style={fs.bottomRow}>
            <View style={fs.sparkWrap}>
              <Sparkline
                values={spark}
                color="rgba(255,255,255,0.95)"
                width={120}
                height={28}
                strokeWidth={2}
              />
            </View>
            <View style={fs.cta}>
              <Text style={fs.ctaText}>Open</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.bg.void} />
            </View>
          </View>

          {/* top hairline */}
          <View pointerEvents="none" style={fs.hair} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const fs = StyleSheet.create({
  card: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,11,0.18)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  iconBig: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
    marginTop: 2,
  },
  bottomRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sparkWrap: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: borderRadius.md,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.text.primary,
    borderRadius: borderRadius.full,
  },
  ctaText: {
    fontSize: 12,
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
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});

// ── Module tile (smaller grid card) ────────────────────────────────────────
function ModuleTile({
  module,
  spark,
  onPress,
  delay = 0,
}: {
  module: ModuleDef;
  spark: number[];
  onPress: () => void;
  delay?: number;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const press = createPressAnimation(scale);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        ts.tile,
        {
          opacity: fade,
          transform: [{ translateY: slide }, { scale }],
        },
      ]}
    >
      <Pressable onPress={onPress} {...press} style={ts.touch}>
        {/* gradient halo (corner) */}
        <View pointerEvents="none" style={ts.halo}>
          <Gradient
            colors={module.gradient}
            borderRadius={140}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>
        {/* darken halo to be subtle */}
        <View pointerEvents="none" style={ts.haloFade} />

        <View style={[ts.iconCell, { borderColor: 'rgba(255,255,255,0.10)' }]}>
          <Ionicons name={module.icon} size={20} color={module.accent} />
        </View>

        <Text style={ts.title}>{module.title}</Text>
        <Text style={ts.subtitle} numberOfLines={1}>
          {module.subtitle}
        </Text>

        <View style={ts.foot}>
          <Sparkline
            values={spark}
            color={module.accent}
            width={70}
            height={18}
            strokeWidth={1.4}
          />
          <Ionicons name="arrow-forward" size={14} color={colors.text.tertiary} />
        </View>

        <View pointerEvents="none" style={ts.hair} />
      </Pressable>
    </Animated.View>
  );
}

const ts = StyleSheet.create({
  tile: {
    width: '48.5%',
  },
  touch: {
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.xl,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    overflow: 'hidden',
    minHeight: 154,
    justifyContent: 'space-between',
  },
  halo: {
    position: 'absolute',
    top: -54,
    right: -54,
    width: 130,
    height: 130,
    borderRadius: 130,
    opacity: 0.28,
  },
  haloFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,6,11,0.10)',
  },
  iconCell: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.glassStrong,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    fontWeight: '500',
  },
  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
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

// ── Quick-launch row item ───────────────────────────────────────────────────
function QuickTool({
  title,
  subtitle,
  icon,
  tint,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = createPressAnimation(scale);
  return (
    <Animated.View style={[qt.wrap, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} {...press} style={qt.row}>
        <View style={[qt.icon, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <Ionicons name={icon} size={18} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={qt.title}>{title}</Text>
          <Text style={qt.sub}>{subtitle}</Text>
        </View>
        <Ionicons name="play-circle" size={28} color={tint} />
        <View pointerEvents="none" style={qt.hair} />
      </Pressable>
    </Animated.View>
  );
}

const qt = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    gap: spacing.md,
    overflow: 'hidden',
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
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

// ── Page styles ─────────────────────────────────────────────────────────────
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
  featuredWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.base,
  },
  gridWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHead: {
    marginBottom: spacing.md,
  },
  quickGrid: {
    // QuickTool rows already have their own marginBottom
  },
});
