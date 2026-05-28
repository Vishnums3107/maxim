import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, borderRadius, shadows, spacing } from '../../src/theme/tokens';
import { haptics } from '../../src/utils/haptics';

// ─── Floating glass tab bar background ───────────────────────────────────────
function FloatingTabBarBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* outer fade so the tab bar looks suspended */}
      <View style={styles.bgFade} />
      <View style={styles.barWrap}>
        <BlurView
          tint="dark"
          intensity={Platform.OS === 'android' ? 60 : 40}
          style={styles.blur}
        />
        {/* glass tint */}
        <View style={styles.tint} />
        {/* hairline */}
        <View pointerEvents="none" style={styles.hairTop} />
      </View>
    </View>
  );
}

// ─── Animated tab icon (with pill background when focused) ───────────────────
function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.96)).current;
  const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1 : 0.96,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.iconCell, { transform: [{ scale }] }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activePill,
          {
            opacity,
          },
        ]}
      />
      <Ionicons name={name} size={20} color={color} />
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          haptics.select();
        },
      }}
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <FloatingTabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Platform.OS === 'ios' ? 24 : 16,
          height: 64,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: borderRadius['2xl'],
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
        },
        tabBarItemStyle: {
          height: 44,
        },
        tabBarActiveTintColor: colors.voltage.core,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="sparkles" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="modules"
        options={{
          title: 'Modules',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="trending-up" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings-sharp" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bgFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: -28,
    backgroundColor: 'transparent',
  },
  barWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.medium,
    ...shadows.lg,
  },
  blur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 18, 0.55)',
  },
  hairTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  iconCell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(224, 231, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(224, 231, 255, 0.22)',
  },
});
