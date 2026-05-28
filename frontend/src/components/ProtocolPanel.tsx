/**
 * ProtocolPanel — the AI-protocol generator card.
 *
 * Three states: empty (CTA), loading (spinner + caption), result (text + regen).
 * Replaces the same pattern duplicated across 5+ module pages.
 */
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from '../theme/tokens';
import { GlassCard } from './GlassCard';
import { VoltageButton } from './VoltageButton';
import { Eyebrow } from './Eyebrow';

interface ProtocolPanelProps {
    /** label shown in the eyebrow above the title (e.g. "AI Coach") */
    label?: string;
    /** explanatory copy when no protocol is generated yet */
    emptyDescription?: string;
    /** the current protocol text, if any */
    protocol?: string | null;
    loading?: boolean;
    accent?: string;
    /** label of the generate CTA (e.g. "Generate today's protocol") */
    generateLabel?: string;
    onGenerate: () => void;
    onRegenerate?: () => void;
}

export function ProtocolPanel({
    label = 'AI Coach',
    emptyDescription = 'Generate a personalised protocol tuned to your current state and goals.',
    protocol,
    loading = false,
    accent = colors.voltage.core,
    generateLabel = "Generate protocol",
    onGenerate,
    onRegenerate,
}: ProtocolPanelProps) {
    if (loading && !protocol) {
        return (
            <GlassCard immediate padding={spacing.xl}>
                <View style={styles.loadingBlock}>
                    <ActivityIndicator color={accent} />
                    <Text style={styles.loadingText}>
                        Synthesising your protocol…
                    </Text>
                </View>
            </GlassCard>
        );
    }

    if (protocol) {
        return (
            <GlassCard immediate padding={spacing.xl}>
                <View style={styles.head}>
                    <Ionicons name="sparkles" size={13} color={accent} />
                    <Text style={[styles.headText, { color: accent }]}>{label}</Text>
                </View>
                <Text style={styles.protocolText}>{protocol}</Text>

                {onRegenerate ? (
                    <Pressable
                        onPress={onRegenerate}
                        hitSlop={6}
                        style={({ pressed }) => [
                            styles.regen,
                            pressed && { opacity: 0.85 },
                        ]}
                    >
                        <Ionicons name="refresh" size={13} color={colors.text.tertiary} />
                        <Text style={styles.regenText}>
                            {loading ? 'thinking…' : 'regenerate'}
                        </Text>
                    </Pressable>
                ) : null}
            </GlassCard>
        );
    }

    return (
        <GlassCard immediate padding={spacing.xl}>
            <Eyebrow color={accent} style={{ marginBottom: 6 }}>
                {label}
            </Eyebrow>
            <Text style={styles.emptyText}>{emptyDescription}</Text>
            <View style={{ height: spacing.base }} />
            <VoltageButton
                title={generateLabel}
                icon="sparkles"
                iconPosition="left"
                onPress={onGenerate}
                loading={loading}
                fullWidth
                variant={accent === colors.voltage.core ? 'voltage' : 'accent'}
                accent={[accent, accent] as const}
            />
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    head: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.md,
    },
    headText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
    },
    protocolText: {
        color: colors.text.secondary,
        fontSize: 14,
        lineHeight: 22,
    },
    loadingBlock: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        color: colors.text.tertiary,
        fontSize: 13,
    },
    emptyText: {
        color: colors.text.tertiary,
        fontSize: 14,
        lineHeight: 21,
    },
    regen: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.hairline,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    regenText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text.tertiary,
        letterSpacing: 0.6,
        textTransform: 'lowercase',
    },
});

export default ProtocolPanel;
