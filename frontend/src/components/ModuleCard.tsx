/**
 * ModuleCard — luxury module entry tile.
 *
 * Visual: glass surface, hairline border, accent halo + gradient corner glyph,
 * refined typography. API preserved: { title, subtitle, icon, color, onPress, completed }.
 */
import React, { useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../theme/tokens';
import { createPressAnimation } from '../theme/animations';

interface ModuleCardProps {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress: () => void;
    completed?: boolean;
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

export const ModuleCard: React.FC<ModuleCardProps> = ({
    title,
    subtitle,
    icon,
    color,
    onPress,
    completed,
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const pressHandlers = createPressAnimation(scale);

    return (
        <Animated.View style={{ transform: [{ scale }], marginBottom: spacing.md }}>
            <Pressable onPress={onPress} {...pressHandlers}>
                <View
                    style={[
                        styles.card,
                        completed && {
                            borderColor: withAlpha(colors.success, 0.45),
                        },
                    ]}
                >
                    {/* Color halo behind icon */}
                    <View
                        style={[
                            styles.halo,
                            {
                                backgroundColor: withAlpha(color, 0.18),
                            },
                        ]}
                    />

                    {/* Icon tile */}
                    <View
                        style={[
                            styles.icon,
                            {
                                backgroundColor: withAlpha(color, 0.14),
                                borderColor: withAlpha(color, 0.22),
                            },
                        ]}
                    >
                        <Ionicons name={icon} size={22} color={color} />
                    </View>

                    {/* Text */}
                    <View style={styles.content}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle} numberOfLines={2}>
                            {subtitle}
                        </Text>
                    </View>

                    {/* Trailing */}
                    {completed ? (
                        <View
                            style={[
                                styles.completedDot,
                                { backgroundColor: withAlpha(colors.success, 0.15), borderColor: colors.success },
                            ]}
                        >
                            <Ionicons name="checkmark" size={14} color={colors.success} />
                        </View>
                    ) : (
                        <View style={styles.chevron}>
                            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
                        </View>
                    )}

                    {/* Top hairline */}
                    <View pointerEvents="none" style={styles.topHair} />
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.base + 2,
        paddingHorizontal: spacing.base + 2,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        overflow: 'hidden',
        ...shadows.sm,
    },
    halo: {
        position: 'absolute',
        top: -36,
        left: -36,
        width: 140,
        height: 140,
        borderRadius: 140,
        opacity: 0.7,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.base,
        borderWidth: 1,
    },
    content: {
        flex: 1,
        paddingRight: spacing.sm,
    },
    title: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: typography.size.sm,
        color: colors.text.tertiary,
        marginTop: 3,
        lineHeight: typography.size.sm * 1.4,
    },
    chevron: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surface.glass,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completedDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    topHair: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
});

export default ModuleCard;
