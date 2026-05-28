/**
 * MetricSlider — premium step selector.
 *
 * API preserved: { label, value, onChange, min?, max?, lowLabel?, highLabel? }.
 * Visual: glass track with a voltage-tinted fill that grows to the selected step,
 * pill thumbs with subtle glow on the active step.
 */
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/tokens';

interface MetricSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    lowLabel?: string;
    highLabel?: string;
}

export const MetricSlider: React.FC<MetricSliderProps> = ({
    label,
    value,
    onChange,
    min = 1,
    max = 10,
    lowLabel = 'Low',
    highLabel = 'High',
}) => {
    const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valuePill}>
                    <Text style={styles.valueText}>{value}</Text>
                    <Text style={styles.valueOf}>/{max}</Text>
                </View>
            </View>

            <View style={styles.track}>
                {steps.map((step) => {
                    const filled = value >= step;
                    const isActive = value === step;
                    return (
                        <Pressable
                            key={step}
                            style={[
                                styles.step,
                                filled && styles.stepFilled,
                                isActive && styles.stepActive,
                            ]}
                            onPress={() => onChange(step)}
                        >
                            <Text
                                style={[
                                    styles.stepText,
                                    filled && styles.stepTextFilled,
                                    isActive && styles.stepTextActive,
                                ]}
                            >
                                {step}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.captions}>
                <Text style={styles.caption}>{lowLabel}</Text>
                <Text style={styles.caption}>{highLabel}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.2,
    },
    valuePill: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: colors.surface.glassStrong,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border.medium,
    },
    valueText: {
        color: colors.voltage.core,
        fontSize: typography.size.base,
        fontWeight: typography.weight.bold,
    },
    valueOf: {
        color: colors.text.muted,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
        marginLeft: 1,
    },
    track: {
        flexDirection: 'row',
        gap: 4,
    },
    step: {
        flex: 1,
        height: 40,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },
    stepFilled: {
        backgroundColor: 'rgba(165, 180, 252, 0.18)',
        borderColor: 'rgba(165, 180, 252, 0.42)',
    },
    stepActive: {
        backgroundColor: colors.voltage.core,
        borderColor: colors.voltage.core,
        ...shadows.voltage,
    },
    stepText: {
        fontSize: typography.size.sm,
        fontWeight: typography.weight.semibold,
        color: colors.text.muted,
    },
    stepTextFilled: {
        color: colors.voltage.bright,
    },
    stepTextActive: {
        color: colors.bg.void,
        fontWeight: typography.weight.bold,
    },
    captions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    caption: {
        fontSize: 11,
        color: colors.text.muted,
        fontWeight: typography.weight.medium,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
});

export default MetricSlider;
