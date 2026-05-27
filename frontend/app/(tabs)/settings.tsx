import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { AuroraBackground } from '../../src/components/AuroraBackground';
import { Eyebrow } from '../../src/components/Eyebrow';
import { GlassCard } from '../../src/components/GlassCard';
import { VoltageButton } from '../../src/components/VoltageButton';
import { useUserStore } from '../../src/store/userStore';
import { testApiKey } from '../../src/services/aiService';
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from '../../src/theme/tokens';

const TAB_BAR_OFFSET = 110;

export default function SettingsScreen() {
  const { customApiKey, setCustomApiKey } = useUserStore();
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<
    'none' | 'valid' | 'invalid'
  >('none');
  const [validationMessage, setValidationMessage] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKeyInput(customApiKey || '');
    setValidationStatus(customApiKey ? 'valid' : 'none');
  }, [customApiKey]);

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setValidationStatus('invalid');
      setValidationMessage('Please enter an API key');
      return;
    }
    setIsValidating(true);
    setValidationStatus('none');
    setValidationMessage('');
    try {
      const result = await testApiKey(apiKeyInput.trim());
      setValidationStatus(result.valid ? 'valid' : 'invalid');
      setValidationMessage(result.message);
    } catch (error: any) {
      setValidationStatus('invalid');
      setValidationMessage(error.message || 'Failed to test key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }
    if (validationStatus !== 'valid') {
      Alert.alert(
        'Key not validated',
        'Your API key has not been validated. Save it anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save anyway',
            onPress: async () => {
              await setCustomApiKey(apiKeyInput.trim());
              Alert.alert('Saved', 'API key saved successfully');
            },
          },
        ]
      );
      return;
    }
    await setCustomApiKey(apiKeyInput.trim());
    Alert.alert('Saved', 'API key saved successfully.');
  };

  const handleRemoveKey = () => {
    Alert.alert(
      'Remove API key',
      'Remove your custom API key? The app will fall back to the default key.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await setCustomApiKey(null);
            setApiKeyInput('');
            setValidationStatus('none');
            setValidationMessage('');
          },
        },
      ]
    );
  };

  const statusTint =
    validationStatus === 'valid'
      ? colors.success
      : validationStatus === 'invalid'
        ? colors.error
        : colors.text.muted;

  const statusIcon =
    validationStatus === 'valid'
      ? 'checkmark-circle'
      : validationStatus === 'invalid'
        ? 'close-circle'
        : 'help-circle-outline';

  return (
    <View style={styles.root}>
      <AuroraBackground tint={colors.voltage.soft} intensity={0.35} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: TAB_BAR_OFFSET + spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Eyebrow>Configuration</Eyebrow>
              <Text style={styles.title}>Settings</Text>
              <Text style={styles.subtitle}>
                Tune your MAXIM experience and bring your own AI capacity.
              </Text>
            </View>

            {/* ── API key panel ─────────────────────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Eyebrow>AI Engine</Eyebrow>
              </View>

              <GlassCard immediate padding={spacing.xl}>
                <View style={styles.panelHeader}>
                  <View style={styles.keyIconCell}>
                    <Ionicons
                      name="key"
                      size={16}
                      color={colors.voltage.core}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.panelTitle}>Google AI API key</Text>
                    <Text style={styles.panelDesc}>
                      Add your own key to skip shared rate limits.
                    </Text>
                  </View>
                </View>

                {/* Current status */}
                <View style={[styles.statusRow, { borderColor: 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={statusIcon as any} size={16} color={statusTint} />
                  <Text style={[styles.statusText, { color: statusTint }]}>
                    {customApiKey
                      ? 'Using your custom API key'
                      : 'Using default key (shared quota)'}
                  </Text>
                </View>

                {/* Input */}
                <View style={styles.inputWrap}>
                  <Ionicons
                    name="lock-closed"
                    size={14}
                    color={colors.text.muted}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Paste your API key"
                    placeholderTextColor={colors.text.muted}
                    value={apiKeyInput}
                    onChangeText={(text) => {
                      setApiKeyInput(text);
                      setValidationStatus('none');
                      setValidationMessage('');
                    }}
                    secureTextEntry={!showKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    hitSlop={6}
                    onPress={() => setShowKey((v) => !v)}
                  >
                    <Ionicons
                      name={showKey ? 'eye-off' : 'eye'}
                      size={16}
                      color={colors.text.tertiary}
                    />
                  </Pressable>
                </View>

                {/* Validation message */}
                {validationMessage ? (
                  <View style={styles.validationRow}>
                    <Ionicons
                      name={
                        validationStatus === 'valid'
                          ? 'checkmark-circle'
                          : 'alert-circle'
                      }
                      size={13}
                      color={statusTint}
                    />
                    <Text style={[styles.validationText, { color: statusTint }]}>
                      {validationMessage}
                    </Text>
                  </View>
                ) : null}

                {/* Buttons */}
                <View style={styles.btnRow}>
                  <View style={{ flex: 1 }}>
                    <VoltageButton
                      title={isValidating ? 'Testing…' : 'Test'}
                      onPress={handleTestKey}
                      variant="ghost"
                      icon="flask"
                      iconPosition="left"
                      disabled={isValidating || !apiKeyInput.trim()}
                      fullWidth
                      size="md"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <VoltageButton
                      title="Save key"
                      onPress={handleSaveKey}
                      icon="checkmark"
                      iconPosition="left"
                      disabled={isValidating || !apiKeyInput.trim()}
                      fullWidth
                      size="md"
                    />
                  </View>
                </View>

                {customApiKey && (
                  <Pressable
                    onPress={handleRemoveKey}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="trash" size={14} color={colors.error} />
                    <Text style={styles.removeText}>Remove custom key</Text>
                  </Pressable>
                )}

                {/* Get key link */}
                <Pressable
                  onPress={() =>
                    WebBrowser.openBrowserAsync('https://aistudio.google.com/')
                  }
                  style={({ pressed }) => [
                    styles.linkBtn,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={styles.linkText}>
                    Get a free API key →{' '}
                    <Text style={styles.linkAccent}>aistudio.google.com</Text>
                  </Text>
                </Pressable>
              </GlassCard>
            </View>

            {/* ── Why use your own key + Privacy ─────────────────────── */}
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Eyebrow>About</Eyebrow>
              </View>

              <InfoTile
                icon="rocket"
                tint={colors.voltage.core}
                title="Why use your own key?"
                bullets={[
                  'Avoid shared rate limits',
                  'No quota exhaustion from other users',
                  'Full control over your AI usage',
                ]}
              />

              <InfoTile
                icon="shield-checkmark"
                tint={colors.success}
                title="Your key is local"
                bullets={[
                  'Stored only on this device',
                  'Never sent to any third-party server',
                  'You can remove it at any time',
                ]}
              />
            </View>

            {/* ── App credits ─────────────────────────────────────── */}
            <View style={styles.credits}>
              <Text style={styles.creditsTitle}>MAXIM</Text>
              <Text style={styles.creditsLine}>
                Performance Operating System · v1.0
              </Text>
              <Text style={styles.creditsLine}>
                Built for sustainable, compounding capability.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Info tile (used in About) ────────────────────────────────────────────────
function InfoTile({
  icon,
  tint,
  title,
  bullets,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  title: string;
  bullets: string[];
}) {
  return (
    <View style={info.card}>
      <View style={info.head}>
        <View
          style={[
            info.icon,
            { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' },
          ]}
        >
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text style={info.title}>{title}</Text>
      </View>
      <View style={{ paddingLeft: 44, gap: 6 }}>
        {bullets.map((b) => (
          <View key={b} style={info.row}>
            <View style={[info.dot, { backgroundColor: tint }]} />
            <Text style={info.text}>{b}</Text>
          </View>
        ))}
      </View>
      <View pointerEvents="none" style={info.hair} />
    </View>
  );
}

const info = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.raised,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.hairline,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 9,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  text: {
    fontSize: 13,
    color: colors.text.secondary,
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

// ── Page styles ────────────────────────────────────────────────────────────
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHead: {
    marginBottom: spacing.md,
  },

  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  keyIconCell: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(224, 231, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(224, 231, 255, 0.24)',
  },
  panelTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  panelDesc: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.glass,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.sunken,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border.hairline,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: typography.size.md,
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  validationText: {
    fontSize: 12,
    flex: 1,
  },

  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.30)',
    backgroundColor: 'rgba(248, 113, 113, 0.06)',
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
    letterSpacing: 0.4,
  },

  linkBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
  linkAccent: {
    color: colors.voltage.core,
    fontWeight: '700',
  },

  credits: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  creditsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: 6,
  },
  creditsLine: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
});
