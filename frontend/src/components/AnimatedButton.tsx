/**
 * Animated Button Component
 * Uses press animation for micro-interaction feedback
 */

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Animated,
    StyleSheet,
    Text,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme/tokens';
import { createPressAnimation } from '../theme/animations';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    color?: string;
    icon?: string;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function AnimatedButton({
    title,
    onPress,
    variant = 'primary',
    color,
    icon,
    disabled = false,
    style,
    textStyle,
}: AnimatedButtonProps) {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const pressHandlers = createPressAnimation(scaleValue);

    const backgroundColor = disabled
        ? colors.background.tertiary
        : variant === 'primary'
            ? color || colors.modules.physical
            : variant === 'secondary'
                ? colors.background.tertiary
                : 'transparent';

    const textColor = disabled
        ? colors.text.muted
        : variant === 'outline'
            ? color || colors.text.primary
            : colors.text.primary;

    const borderColor = variant === 'outline' ? color || colors.border.medium : 'transparent';

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 2 : 0 },
                    style,
                ]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.8}
                {...pressHandlers}
            >
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={20}
                        color={textColor}
                        style={{ marginRight: spacing.sm }}
                    />
                )}
                <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    text: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
    },
});

export default AnimatedButton;
