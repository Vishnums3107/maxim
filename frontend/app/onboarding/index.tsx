import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { VoltageButton } from '../../src/components/VoltageButton';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../../src/theme/tokens';

const PILLARS: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  desc: string;
  tint: string;
}[] = [
  {
    icon: 'flame',
    label: 'Physical',
    desc: 'Strength, stamina, recovery',
    tint: colors.modules.physical,
  },
  {
    icon: 'aperture',
    label: 'Cognitive',
    desc: 'Focus, learning, clarity',
    tint: colors.modules.cognitive,
  },
  {
    icon: 'leaf',
    label: 'Regulation',
    desc: 'Breath, calm, control',
    tint: colors.modules.regulation,
  },
  {
    icon: 'people',
    label: 'Social',
    desc: 'Communication, confidence',
    tint: colors.modules.social,
  },
  {
    icon: 'pulse',
    label: 'Systems',
    desc: 'Habits, friction, identity',
    tint: colors.modules.systems,
  },
];

export default function OnboardingWelcome() {
  const router = useRouter();
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(20)).current;
  const haloPulse = useRef(new Animated.Value(0.65)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 720,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(haloPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(haloPulse, {
          toValue: 0.65,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.voltage.soft} intensity={0.6} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          {/* ── Hero monogram ─────────────────────────────────────── */}
          <View style={styles.heroBlock}>
            <Animated.View
              style={[
                styles.halo,
                {
                  opacity: haloPulse,
                  transform: [
                    {
                      scale: haloPulse.interpolate({
                        inputRange: [0.65, 1],
                        outputRange: [1, 1.18],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.monogram}>
              <Text style={styles.monogramText}>M</Text>
            </View>
          </View>

          <Eyebrow>Personal Performance OS</Eyebrow>
          <Text style={styles.brand}>MAXIM</Text>
          <Text style={styles.headline}>
            Train every dimension of capability.
          </Text>
          <Text style={styles.lede}>
            Five domains. Calibrated protocols. AI guidance tuned to your state.
          </Text>

          {/* ── Pillars ────────────────────────────────────────────── */}
          <View style={styles.pillars}>
            {PILLARS.map((p, i) => (
              <PillarRow key={p.label} pillar={p} index={i} />
            ))}
          </View>

          <Text style={styles.privacy}>
            <Ionicons name="lock-closed" size={11} color={colors.text.muted} />{' '}
            Your data stays on this device. Always.
          </Text>
        </Animated.View>

        {/* ── Footer CTA ─────────────────────────────────────────── */}
        <View style={styles.footer}>
          <VoltageButton
            title="Begin setup"
            onPress={() => router.push('/onboarding/basics')}
            icon="arrow-forward"
            iconPosition="right"
            fullWidth
            size="lg"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function PillarRow({
  pillar,
  index,
}: {
  pillar: (typeof PILLARS)[number];
  index: number;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        delay: 320 + index * 70,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration: 380,
        delay: 320 + index * 70,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        pst.row,
        {
          opacity: fade,
          transform: [{ translateY: translate }],
        },
      ]}
    >
      <View
        style={[
          pst.icon,
          {
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.10)',
          },
        ]}
      >
        <Ionicons name={pillar.icon} size={15} color={pillar.tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={pst.label}>{pillar.label}</Text>
        <Text style={pst.desc}>{pillar.desc}</Text>
      </View>
      <View style={[pst.dot, { backgroundColor: pillar.tint }]} />
    </Animated.View>
  );
}

const pst = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  desc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.void,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },

  heroBlock: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  halo: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(165, 180, 252, 0.40)',
  },
  monogram: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: colors.voltage.core,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.voltage,
  },
  monogramText: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.bg.void,
    letterSpacing: -2,
    marginTop: -4,
  },

  brand: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 8,
    marginTop: 6,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
  },
  lede: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.base,
    maxWidth: 320,
  },

  pillars: {
    width: '100%',
    marginTop: spacing.xl,
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },

  privacy: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: spacing.xl,
    fontWeight: '500',
    letterSpacing: 0.4,
  },

  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.base,
  },
});
