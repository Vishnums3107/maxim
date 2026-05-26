import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '../src/store/userStore';

SplashScreen.preventAutoHideAsync();

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
      <View style={styles.loading}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!isReady || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading MAXIM...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
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
  loading: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
