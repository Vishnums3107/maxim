import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '../src/store/userStore';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { profile, isLoading, loadData } = useUserStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadData().then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (!isReady || isLoading) return;

    const inOnboarding = segments[0] === 'onboarding';
    const needsOnboarding = !profile || !profile.onboardingComplete;

    if (needsOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!needsOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isReady, isLoading, profile, segments]);

  if (!isReady || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
});
