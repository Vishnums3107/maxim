/**
 * GlassCard — luxury surface with a 1px hairline border, optional gradient
 * accent stripe, optional press animation, optional staggered entrance.
 */
import React, { useRef, useEffect } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '../theme/tokens';
import { createPressAnimation, fadeIn, timing } from '../theme/animations';
import { Gradient } from './Gradient';

interface GlassCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    /** stagger entrance delay in ms */
    delay?: number;
    /** show a 2-stop accent gradient as the surface */
    accent?: readonly [string, string] | readonly [string, string, string];
    /** subtle hairline highlight at the top edge */
    highlight?: boolean;
    /** padding override */
    padding?: number;
    radius?: number;
    style?: ViewStyle;
    /** if true, disables the entrance animation (used in onboarding etc.) */
    immediate?: boolean;
}

export function GlassCard({
    children,
    onPress,
    delay = 0,
    accent,
    highlight = true,
    padding = spacing.lg,
    radius = borderRadius.xl,
    style,
    immediate = false,
}: GlassCardProps) {
    const fadeAnim = useRef(new Animated.Value(immediate ? 1 : 0)).current;
    const slideAnim = useRef(new Animated.Value(immediate ? 0 : 16)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const pressHandlers = onPress ? createPressAnimation(scaleValue) : {};

    useEffect(() => {
        if (immediate) return;
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

    const surface = (
        <View
            style={[
                styles.surface,
                {
                    borderRadius: radius,
                    padding,
                    backgroundColor: accent ? 'transparent' : colors.bg.raised,
                },
                style,
            ]}
        >
            {/* gradient accent layer */}
            {accent && (
                <Gradient
                    colors={accent}
                    borderRadius={radius}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            )}

            {/* hairline highlight at top */}
            {highlight && (
                <View
                    pointerEvents="none"
                    style={[
                        styles.highlight,
                        { borderTopLeftRadius: radius, borderTopRightRadius: radius },
                    ]}
                />
            )}

            {/* content */}
            <View>{children}</View>
        </View>
    );

    const animatedStyle = {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleValue }],
    };

    if (onPress) {
        return (
            <Animated.View style={animatedStyle}>
                <Pressable
                    onPress={onPress}
                    {...pressHandlers}
                    style={({ pressed }) => [pressed && styles.pressed]}
                >
                    {surface}
                </Pressable>
            </Animated.View>
        );
    }

    return <Animated.View style={animatedStyle}>{surface}</Animated.View>;
}

const styles = StyleSheet.create({
    surface: {
        borderWidth: 1,
        borderColor: colors.border.hairline,
        overflow: 'hidden',
    },
    highlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    pressed: {
        opacity: 0.94,
    },
});

export default GlassCard;
