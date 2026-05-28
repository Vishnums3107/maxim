/**
 * AnimatedButton — pill button with press feedback.
 *
 * API preserved: { title, onPress, variant, color, icon, disabled, style, textStyle }.
 * Internally now styled with the new luxury tokens.
 */
import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    colors,
    borderRadius,
    spacing,
    typography,
    shadows,
} from '../theme/tokens';
import { createPressAnimation } from '../theme/animations';
import { haptics } from '../utils/haptics';

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

    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    const bg = disabled
        ? 'rgba(255,255,255,0.04)'
        : isPrimary
            ? color || colors.voltage.core
            : isSecondary
                ? colors.surface.glassStrong
                : 'transparent';

    const fg = disabled
        ? colors.text.muted
        : isPrimary
            ? colors.bg.void
            : isOutline
                ? color || colors.text.primary
                : colors.text.primary;

    const borderColor = isOutline
        ? color || colors.border.strong
        : isSecondary
            ? colors.border.medium
            : 'transparent';

    return (
        <Animated.View
            style={[
                {
                    transform: [{ scale: scaleValue }],
                },
                isPrimary && !disabled
                    ? color
                        ? shadows.glow(color)
                        : shadows.voltage
                    : null,
                style,
            ]}
        >
            <Pressable
                onPress={() => {
                    if (!disabled) haptics.press();
                    onPress();
                }}
                disabled={disabled}
                {...pressHandlers}
                style={[
                    styles.button,
                    {
                        backgroundColor: bg,
                        borderColor,
                        borderWidth: isOutline || isSecondary ? 1 : 0,
                    },
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon as any}
                        size={18}
                        color={fg}
                        style={{ marginRight: spacing.sm }}
                    />
                )}
                <Text style={[styles.text, { color: fg }, textStyle]}>{title}</Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.full,
    },
    text: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        letterSpacing: -0.2,
    },
});

export default AnimatedButton;
