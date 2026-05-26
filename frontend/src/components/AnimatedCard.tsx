/**
 * Animated Card Component
 * With smooth entrance animation and press feedback
 */

import React, { useRef, useEffect } from 'react';
import {
    Animated,
    StyleSheet,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../theme/tokens';
import { fadeIn, createPressAnimation, timing } from '../theme/animations';

interface AnimatedCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    delay?: number;
    style?: ViewStyle;
    elevated?: boolean;
}

export function AnimatedCard({
    children,
    onPress,
    delay = 0,
    style,
    elevated = false,
}: AnimatedCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;

    const pressHandlers = onPress ? createPressAnimation(scaleValue) : {};

    useEffect(() => {
        Animated.parallel([
            fadeIn(fadeAnim, timing.slow, delay),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: timing.slow,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const cardStyle = [
        styles.card,
        elevated && shadows.md,
        style,
    ];

    const animatedStyle = {
        opacity: fadeAnim,
        transform: [
            { translateY: slideAnim },
            { scale: scaleValue },
        ],
    };

    if (onPress) {
        return (
            <Animated.View style={animatedStyle}>
                <TouchableOpacity
                    style={cardStyle}
                    onPress={onPress}
                    activeOpacity={0.9}
                    {...pressHandlers}
                >
                    {children}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[cardStyle, animatedStyle]}>
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
        marginBottom: spacing.sm,
    },
});

export default AnimatedCard;
