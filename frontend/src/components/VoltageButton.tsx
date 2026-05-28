/**
 * VoltageButton — premium primary CTA. Pill-shaped, voltage-tinted glow,
 * spring scale on press. Variants: voltage (default), light, ghost, accent.
 */
import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/tokens';
import { createPressAnimation } from '../theme/animations';
import { Gradient } from './Gradient';
import { haptics } from '../utils/haptics';

type Variant = 'voltage' | 'light' | 'ghost' | 'accent';

interface VoltageButtonProps {
    title: string;
    onPress: () => void;
    variant?: Variant;
    /** Used in 'accent' variant: two-stop gradient pair */
    accent?: readonly [string, string];
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    size?: 'sm' | 'md' | 'lg';
}

export function VoltageButton({
    title,
    onPress,
    variant = 'voltage',
    accent,
    icon,
    iconPosition = 'right',
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    textStyle,
    size = 'md',
}: VoltageButtonProps) {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const pressHandlers = createPressAnimation(scaleValue);

    const sizing = {
        sm: { vPad: spacing.sm + 2, hPad: spacing.lg, font: typography.size.base },
        md: { vPad: spacing.md + 2, hPad: spacing.xl, font: typography.size.md },
        lg: { vPad: spacing.base + 2, hPad: spacing['2xl'], font: typography.size.lg },
    }[size];

    const isVoltage = variant === 'voltage' && !disabled;
    const isLight = variant === 'light';
    const isGhost = variant === 'ghost';
    const isAccent = variant === 'accent' && accent;

    const fg =
        disabled
            ? colors.text.muted
            : isVoltage
                ? colors.bg.void
                : isLight
                    ? colors.text.primary
                    : isGhost
                        ? colors.text.primary
                        : colors.bg.void; // accent → dark text on bright gradient

    const containerStyle: ViewStyle = {
        paddingVertical: sizing.vPad,
        paddingHorizontal: sizing.hPad,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: disabled
            ? 'rgba(255,255,255,0.04)'
            : isVoltage
                ? colors.voltage.core
                : isLight
                    ? colors.surface.glassStrong
                    : isGhost
                        ? 'transparent'
                        : 'transparent',
        borderWidth: isLight || isGhost ? 1 : 0,
        borderColor: isLight
            ? colors.border.medium
            : isGhost
                ? colors.border.strong
                : 'transparent',
        ...(fullWidth ? { alignSelf: 'stretch' as const } : {}),
    };

    const animated = {
        transform: [{ scale: scaleValue }],
        ...(isVoltage ? shadows.voltage : {}),
        ...(isAccent && accent ? shadows.glow(accent[0]) : {}),
    };

    return (
        <Animated.View style={[animated, style]}>
            <Pressable
                onPress={() => {
                    if (!disabled && !loading) haptics.press();
                    onPress();
                }}
                disabled={disabled || loading}
                {...pressHandlers}
                style={containerStyle}
            >
                {isAccent && accent && (
                    <Gradient colors={accent} borderRadius={borderRadius.full} />
                )}

                {icon && iconPosition === 'left' && (
                    <Ionicons
                        name={icon}
                        size={sizing.font + 4}
                        color={fg}
                        style={{ marginRight: spacing.sm }}
                    />
                )}

                <Text
                    style={[
                        {
                            color: fg,
                            fontSize: sizing.font,
                            fontWeight: typography.weight.semibold,
                            letterSpacing: typography.tracking.tight,
                        },
                        textStyle,
                    ]}
                >
                    {loading ? '…' : title}
                </Text>

                {icon && iconPosition === 'right' && (
                    <Ionicons
                        name={icon}
                        size={sizing.font + 4}
                        color={fg}
                        style={{ marginLeft: spacing.sm }}
                    />
                )}
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({});

export default VoltageButton;
