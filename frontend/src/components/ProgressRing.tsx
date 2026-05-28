/**
 * ProgressRing — animated circular progress indicator.
 *
 * API preserved: { progress, size?, strokeWidth?, color?, backgroundColor?,
 * showValue?, label?, animated? }.
 *
 * New: gradient stroke with linear gradient, rounded caps, slight inner halo.
 */
import React, { useId, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography } from '../theme/tokens';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showValue?: boolean;
    label?: string;
    animated?: boolean;
    /** Optional override for the gradient end color */
    colorStop?: string;
}

export function ProgressRing({
    progress,
    size = 88,
    strokeWidth = 8,
    color = colors.voltage.core,
    backgroundColor = 'rgba(255,255,255,0.06)',
    showValue = true,
    label,
    animated = true,
    colorStop,
}: ProgressRingProps) {
    const animatedProgress = useRef(new Animated.Value(0)).current;
    const gradId = useId();

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        if (animated) {
            Animated.timing(animatedProgress, {
                toValue: Math.max(0, Math.min(100, progress)),
                duration: 900,
                useNativeDriver: false,
            }).start();
        } else {
            animatedProgress.setValue(progress);
        }
    }, [progress]);

    const strokeDashoffset = animatedProgress.interpolate({
        inputRange: [0, 100],
        outputRange: [circumference, 0],
    });

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Defs>
                    <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                        <Stop offset="0%" stopColor={color} stopOpacity={1} />
                        <Stop offset="100%" stopColor={colorStop ?? color} stopOpacity={0.7} />
                    </LinearGradient>
                </Defs>

                {/* Track */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${gradId})`}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>

            {showValue && (
                <View style={styles.valueContainer}>
                    <Text
                        style={[
                            styles.value,
                            {
                                color: colors.text.primary,
                                fontSize: size * 0.32,
                            },
                        ]}
                    >
                        {Math.round(progress)}
                    </Text>
                    {label ? (
                        <Text style={[styles.label, { fontSize: Math.max(10, size * 0.11) }]}>
                            {label}
                        </Text>
                    ) : null}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    valueContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    value: {
        fontWeight: typography.weight.bold,
        letterSpacing: -1,
    },
    label: {
        color: colors.text.muted,
        marginTop: 2,
        fontWeight: typography.weight.semibold,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
});

export default ProgressRing;
