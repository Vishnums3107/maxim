import React, { useEffect, useRef, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Animated, Easing, Text, View, StyleSheet } from 'react-native';
import { useUserStore } from '../src/store/userStore';
import { AuroraBackground } from '../src/components/AuroraBackground';
import { colors, typography, shadows } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync();

// ─── Branded loading screen ──────────────────────────────────────────────────
function MaximLoader({ subtitle }: { subtitle?: string }) {
  const pulse = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.loader}>
      <AuroraBackground tint={colors.voltage.soft} intensity={0.55} />

      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: fade, transform: [{ scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] },
        ]}
      >
        {/* Voltage halo */}
        <Animated.View
          style={[
            styles.halo,
            {
              opacity: pulse,
              transform: [
                {
                  scale: pulse.interpolate({ inputRange: [0.6, 1], outputRange: [1, 1.25] }),
                },
              ],
            },
          ]}
        />
        {/* Logo monogram */}
        <View style={styles.monogram}>
          <Text style={styles.monogramText}>M</Text>
        </View>

        <Text style={styles.brand}>MAXIM</Text>
        <Text style={styles.tag}>{subtitle ?? 'Performance Operating System'}</Text>
      </Animated.View>
    </View>
  );
}

// ─── Root layout ─────────────────────────────────────────────────────────────
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { profile, isLoading, loadData } = useUserStore();
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then(() => setIsReady(true))
      .catch((e) => {
        console.error('Load data error:', e);
        setError(e?.message || 'Unknown error');
        setIsReady(true);
      })
      .finally(() => {
        SplashScreen.hideAsync();
      });
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;
    try {
      const inOnboarding = segments[0] === 'onboarding';
      const inTabs = segments[0] === '(tabs)';
      const inModules = segments[0] === 'modules';
      const needsOnboarding = !profile || !profile.onboardingComplete;

      if (needsOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      } else if (!needsOnboarding && !inTabs && !inModules) {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      console.error('Navigation error:', e);
      setError(e?.message || 'Navigation error');
    }
  }, [isReady, isLoading, profile, segments]);

  if (error) {
    return (
      <>
        <MaximLoader subtitle={`Error: ${error}`} />
        <StatusBar style="light" />
      </>
    );
  }

  if (!isReady || isLoading) {
    return (
      <>
        <MaximLoader />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.void },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modules" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.bg.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.voltage.glow,
    top: -64,
  },
  monogram: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: colors.voltage.core,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 8,
  },
  tag: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
  },
});
