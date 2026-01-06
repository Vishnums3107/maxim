import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Ionicons name="analytics" size={48} color="#3B82F6" />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>MAXIM</Text>
        <Text style={styles.subtitle}>Personal Performance Operating System</Text>

        {/* Features */}
        <View style={styles.features}>
          <FeatureItem
            icon="fitness-outline"
            text="Physical Capability"
            color="#EF4444"
          />
          <FeatureItem
            icon="bulb-outline"
            text="Cognitive Performance"
            color="#8B5CF6"
          />
          <FeatureItem
            icon="leaf-outline"
            text="Mental Regulation"
            color="#10B981"
          />
          <FeatureItem
            icon="people-outline"
            text="Social Intelligence"
            color="#F59E0B"
          />
          <FeatureItem
            icon="settings-outline"
            text="Systems & Consistency"
            color="#3B82F6"
          />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Build capability through systems, not motivation.
          Track progress. Adapt intelligently. Compound over time.
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push('/onboarding/basics')}
        >
          <Text style={styles.startButtonText}>Begin Setup</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          Your data stays on your device. Always.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const FeatureItem = ({
  icon,
  text,
  color,
}: {
  icon: string;
  text: string;
  color: string;
}) => (
  <View style={styles.featureItem}>
    <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={18} color={color} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    marginTop: 40,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#D1D5DB',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});
