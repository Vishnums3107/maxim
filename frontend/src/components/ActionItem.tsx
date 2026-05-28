/**
 * ActionItem — refined check row.
 *
 * API preserved: { title, subtitle, completed, onToggle, color }.
 * Adds an animated check-mark + accent glow when completed.
 */
import React, { useRef, useEffect } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography } from '../theme/tokens';
import { createPressAnimation } from '../theme/animations';
import { haptics } from '../utils/haptics';

interface ActionItemProps {
    title: string;
    subtitle?: string;
    completed: boolean;
    onToggle: () => void;
    color?: string;
}

function withAlpha(hex: string, alpha: number): string {
    if (hex.startsWith('rgba')) return hex;
    const a = Math.max(0, Math.min(1, alpha));
    const h = hex.replace('#', '');
    const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
    const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
    const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const ActionItem: React.FC<ActionItemProps> = ({
    title,
    subtitle,
    completed,
    onToggle,
    color = colors.voltage.soft,
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const checkScale = useRef(new Animated.Value(completed ? 1 : 0)).current;
    const pressHandlers = createPressAnimation(scale);

    useEffect(() => {
        Animated.spring(checkScale, {
            toValue: completed ? 1 : 0,
            useNativeDriver: true,
            friction: 6,
            tension: 140,
        }).start();
    }, [completed]);

    return (
        <Animated.View style={{ transform: [{ scale }], marginBottom: spacing.sm }}>
            <Pressable
                onPress={() => {
                    // semantic: success on complete, light tap on uncomplete
                    if (completed) haptics.tap();
                    else haptics.success();
                    onToggle();
                }}
                {...pressHandlers}
            >
                <View
                    style={[
                        styles.row,
                        completed && {
                            borderColor: withAlpha(color, 0.35),
                            backgroundColor: withAlpha(color, 0.04),
                        },
                    ]}
                >
                    {/* Color tab */}
                    <View
                        style={[styles.tab, { backgroundColor: withAlpha(color, completed ? 0.9 : 0.35) }]}
                    />

                    {/* Checkbox */}
                    <View
                        style={[
                            styles.box,
                            {
                                borderColor: completed ? color : colors.border.medium,
                                backgroundColor: completed ? color : 'transparent',
                            },
                        ]}
                    >
                        <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                            <Ionicons name="checkmark" size={14} color={colors.bg.void} />
                        </Animated.View>
                    </View>

                    {/* Text */}
                    <View style={styles.text}>
                        <Text
                            style={[
                                styles.title,
                                completed && { color: colors.text.tertiary, textDecorationLine: 'line-through' as const },
                            ]}
                        >
                            {title}
                        </Text>
                        {subtitle ? (
                            <Text style={styles.subtitle} numberOfLines={2}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>

                    {/* Top hairline */}
                    <View pointerEvents="none" style={styles.topHair} />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        overflow: 'hidden',
        gap: spacing.md,
    },
    tab: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        borderTopLeftRadius: borderRadius.lg,
        borderBottomLeftRadius: borderRadius.lg,
    },
    box: {
        width: 22,
        height: 22,
        borderRadius: 7,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        flex: 1,
    },
    title: {
        fontSize: typography.size.md,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.2,
    },
    subtitle: {
        fontSize: typography.size.sm,
        color: colors.text.tertiary,
        marginTop: 2,
        lineHeight: typography.size.sm * 1.4,
    },
    topHair: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default ActionItem;
