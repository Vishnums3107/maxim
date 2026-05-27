import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/tokens';

export default function ModulesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.void },
        animation: 'slide_from_right',
      }}
    />
  );
}
