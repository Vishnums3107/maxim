/**
 * ModuleHero — large hero block for module landing pages.
 *
 * Visual: large rounded card with corner gradient halo, big icon disc,
 * editorial title + subtitle. Replaces the `heroCard` pattern repeated
 * across ~15 module pages.
 */
import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from '../theme/tokens';
import { Gradient } from './Gradient';
import { Eyebrow } from './Eyebrow';

interface ModuleHeroProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    eyebrow?: string;
    /** Two-stop gradient. Uses module gradients from tokens.moduleGradients. */
    gradient: readonly [string, string];
    accent: string;
    style?: ViewStyle;
}

export function ModuleHero({
    icon,
    title,
    subtitle,
    eyebrow,
    gradient,
    accent,
    style,
}: ModuleHeroProps) {
    return (
        <View style={[styles.card, style]}>
            {/* gradient corner halo */}
            <View pointerEvents="none" style={styles.halo}>
                <Gradient
                    colors={gradient}
                    borderRadius={220}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </View>
            {/* halo darken */}
            <View pointerEvents="none" style={styles.haloFade} />

            {/* icon disc */}
            <View
                style={[
                    styles.iconDisc,
                    {
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(255,255,255,0.08)',
                    },
                ]}
            >
                <Ionicons name={icon} size={26} color={accent} />
            </View>

            {/* copy */}
            {eyebrow ? (
                <Eyebrow color={accent} style={{ marginBottom: 6 }}>
                    {eyebrow}
                </Eyebrow>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

            {/* top hairline */}
            <View pointerEvents="none" style={styles.hair} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius['2xl'],
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        overflow: 'hidden',
    },
    halo: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 220,
        height: 220,
        borderRadius: 220,
        opacity: 0.22,
    },
    haloFade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(6,6,11,0.10)',
    },
    iconDisc: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.base,
        borderWidth: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.text.primary,
        letterSpacing: -0.8,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: 14,
        color: colors.text.tertiary,
        lineHeight: 21,
        marginTop: 6,
        maxWidth: 480,
    },
    hair: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
});

export default ModuleHero;
