/**
 * ScreenChrome — top header bar for sub-pages.
 *
 * Visual: back glass-pill, centered eyebrow + title, optional right action.
 * Replaces the inline `{back} {title} {spacer}` pattern repeated across
 * the 20 module sub-pages.
 */
import React from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from '../theme/tokens';

interface ScreenChromeProps {
    title: string;
    eyebrow?: string;
    /** Optional override for the back action; defaults to router.back() */
    onBack?: () => void;
    /** Optional right side element (icon button etc.) */
    right?: React.ReactNode;
    style?: ViewStyle;
}

export function ScreenChrome({
    title,
    eyebrow,
    onBack,
    right,
    style,
}: ScreenChromeProps) {
    const router = useRouter();
    const handleBack = onBack ?? (() => router.back());

    return (
        <View style={[styles.row, style]}>
            <Pressable
                onPress={handleBack}
                hitSlop={10}
                style={({ pressed }) => [
                    styles.iconBtn,
                    pressed && { opacity: 0.7 },
                ]}
            >
                <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
            </Pressable>

            <View style={styles.center}>
                {eyebrow ? (
                    <Text style={styles.eyebrow} numberOfLines={1}>
                        {eyebrow}
                    </Text>
                ) : null}
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>
            </View>

            <View style={styles.rightSlot}>{right ?? <View style={styles.iconBtnPlaceholder} />}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.base,
        gap: spacing.md,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface.glass,
        borderWidth: 1,
        borderColor: colors.border.hairline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBtnPlaceholder: {
        width: 36,
        height: 36,
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    eyebrow: {
        fontSize: 9,
        fontWeight: '700',
        color: colors.text.muted,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    title: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: -0.3,
    },
    rightSlot: {
        alignItems: 'flex-end',
    },
});

export default ScreenChrome;
