/**
 * MAXIM Design System
 * Consistent design tokens for the entire app
 */

// Color Palette
export const colors = {
    // Base
    background: {
        primary: '#0F172A',
        secondary: '#1F2937',
        tertiary: '#374151',
    },

    // Text
    text: {
        primary: '#F9FAFB',
        secondary: '#D1D5DB',
        tertiary: '#9CA3AF',
        muted: '#6B7280',
    },

    // Module Accent Colors
    modules: {
        physical: '#EF4444',
        cognitive: '#8B5CF6',
        regulation: '#10B981',
        social: '#F59E0B',
        systems: '#6366F1',
    },

    // States
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Borders
    border: {
        subtle: '#374151',
        medium: '#4B5563',
    },
};

// Typography
export const typography = {
    // Font sizes
    size: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 15,
        lg: 16,
        xl: 18,
        '2xl': 20,
        '3xl': 24,
        '4xl': 28,
        '5xl': 36,
    },

    // Font weights
    weight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        base: 1.5,
        relaxed: 1.75,
    },
};

// Spacing
export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
};

// Border Radius
export const borderRadius = {
    sm: 6,
    base: 8,
    md: 10,
    lg: 12,
    xl: 16,
    full: 9999,
};

// Shadows (for elevated components)
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};

// Animation durations
export const animation = {
    fast: 150,
    base: 250,
    slow: 400,
    slower: 600,
};

// Common component styles
export const components = {
    card: {
        backgroundColor: colors.background.secondary,
        borderRadius: borderRadius.lg,
        padding: spacing.base,
    },

    button: {
        primary: {
            backgroundColor: colors.modules.physical,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
        },
        secondary: {
            backgroundColor: colors.background.tertiary,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
        },
    },

    input: {
        backgroundColor: colors.background.tertiary,
        borderRadius: borderRadius.base,
        padding: spacing.md,
        color: colors.text.primary,
        fontSize: typography.size.md,
    },

    section: {
        marginBottom: spacing.xl,
    },

    sectionTitle: {
        fontSize: typography.size.lg,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.md,
    },
};

// Preset styles for common patterns
export const presets = {
    // Hero sections
    hero: {
        container: {
            alignItems: 'center' as const,
            paddingVertical: spacing.xl,
        },
        icon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginBottom: spacing.base,
        },
        title: {
            fontSize: typography.size['2xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm,
        },
        subtitle: {
            fontSize: typography.size.base,
            color: colors.text.tertiary,
            textAlign: 'center' as const,
        },
    },

    // Score rings
    scoreRing: {
        container: {
            borderWidth: 4,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
        },
        value: {
            fontSize: typography.size['4xl'],
            fontWeight: typography.weight.bold,
        },
    },

    // Tool cards
    toolCard: {
        container: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.background.secondary,
            borderRadius: borderRadius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
        },
        icon: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.lg,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: spacing.md,
        },
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    components,
    presets,
};
