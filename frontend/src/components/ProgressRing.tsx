/**
 * Progress Ring Component
 * Animated circular progress indicator
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
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
}

export function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 6,
    color = colors.modules.physical,
    backgroundColor = colors.background.tertiary,
    showValue = true,
    label,
    animated = true,
}: ProgressRingProps) {
    const animatedProgress = useRef(new Animated.Value(0)).current;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        if (animated) {
            Animated.timing(animatedProgress, {
                toValue: progress,
                duration: 800,
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

    // For animated stroke, we need to use AnimatedCircle
    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                {/* Background circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Progress circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {showValue && (
                <View style={styles.valueContainer}>
                    <Text style={[styles.value, { color }]}>{Math.round(progress)}</Text>
                    {label && <Text style={styles.label}>{label}</Text>}
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
        fontSize: typography.size['2xl'],
        fontWeight: typography.weight.bold,
    },
    label: {
        fontSize: typography.size.xs,
        color: colors.text.muted,
    },
});

export default ProgressRing;
