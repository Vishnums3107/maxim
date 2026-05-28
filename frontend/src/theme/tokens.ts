/**
 * MAXIM Luxe — Design System
 *
 * A luxury performance aesthetic inspired by Tesla, Apple Fitness+,
 * Whoop, Linear and Equinox. Deep void canvas, layered glass surfaces,
 * "voltage" accents, editorial typography.
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLOR SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {
    // Canvas — layered darks
    bg: {
        void: '#06060B',          // deepest, body background
        canvas: '#0A0A12',         // primary canvas
        raised: '#11111C',         // card body
        elevated: '#161624',       // popovers / hovered surfaces
        sunken: '#040408',         // inset wells
    },

    // Backwards-compat aliases (existing components use these names)
    background: {
        primary: '#06060B',
        secondary: '#11111C',
        tertiary: '#161624',
    },

    // Surfaces & lines
    surface: {
        glass: 'rgba(255,255,255,0.035)',
        glassStrong: 'rgba(255,255,255,0.06)',
        glassHover: 'rgba(255,255,255,0.085)',
        scrim: 'rgba(6,6,11,0.72)',
    },

    border: {
        hairline: 'rgba(255,255,255,0.06)',
        subtle: 'rgba(255,255,255,0.06)',     // alias
        medium: 'rgba(255,255,255,0.10)',
        strong: 'rgba(255,255,255,0.16)',
        glow: 'rgba(224, 231, 255, 0.32)',
    },

    // Text — Apple-inspired neutral whites
    text: {
        primary: '#F5F5F7',
        secondary: '#C4C4CC',
        tertiary: '#9494A0',
        muted: '#5E5E6A',
        inverse: '#06060B',
    },

    // Voltage — the signature electric accent
    voltage: {
        core: '#E0E7FF',           // crisp electric white-blue
        bright: '#C7D2FE',
        soft: '#A5B4FC',
        glow: 'rgba(165, 180, 252, 0.45)',
        wash: 'rgba(165, 180, 252, 0.10)',
    },

    // Module accents — refined, gradient-friendly
    modules: {
        physical: '#F87171',         // ember
        physicalDeep: '#DC2626',
        physicalGlow: 'rgba(248, 113, 113, 0.30)',

        cognitive: '#A78BFA',        // royal violet
        cognitiveDeep: '#7C3AED',
        cognitiveGlow: 'rgba(167, 139, 250, 0.30)',

        regulation: '#34D399',       // emerald
        regulationDeep: '#059669',
        regulationGlow: 'rgba(52, 211, 153, 0.30)',

        social: '#FBBF24',           // gold
        socialDeep: '#D97706',
        socialGlow: 'rgba(251, 191, 36, 0.30)',

        systems: '#60A5FA',          // electric blue
        systemsDeep: '#2563EB',
        systemsGlow: 'rgba(96, 165, 250, 0.30)',
    },

    // States
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
} as const;

// Module gradient definitions — used by GlassCard, ModuleCard, etc.
export const moduleGradients = {
    physical: ['#F87171', '#DC2626'] as const,
    cognitive: ['#A78BFA', '#7C3AED'] as const,
    regulation: ['#34D399', '#059669'] as const,
    social: ['#FBBF24', '#D97706'] as const,
    systems: ['#60A5FA', '#2563EB'] as const,
    voltage: ['#E0E7FF', '#A5B4FC'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY — editorial + technical
// ─────────────────────────────────────────────────────────────────────────────

export const typography = {
    size: {
        xs: 11,
        sm: 12,
        base: 14,
        md: 15,
        lg: 16,
        xl: 18,
        '2xl': 20,
        '3xl': 24,
        '4xl': 28,
        '5xl': 36,
        '6xl': 44,
        '7xl': 56,
    },

    weight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        heavy: '800' as const,
        black: '900' as const,
    },

    lineHeight: {
        tight: 1.05,
        snug: 1.2,
        base: 1.5,
        relaxed: 1.7,
    },

    tracking: {
        tightest: -1.5,
        tight: -0.6,
        normal: 0,
        wide: 0.4,
        wider: 1.2,
        widest: 2.4,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// SPACING — refined, slightly more generous
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 56,
    '5xl': 72,
    '6xl': 96,
};

// ─────────────────────────────────────────────────────────────────────────────
// RADII — softer, more luxurious
// ─────────────────────────────────────────────────────────────────────────────

export const borderRadius = {
    xs: 6,
    sm: 8,
    base: 10,
    md: 14,
    lg: 18,
    xl: 22,
    '2xl': 28,
    '3xl': 36,
    full: 9999,
};

// ─────────────────────────────────────────────────────────────────────────────
// SHADOWS — voltage glows + depth
// ─────────────────────────────────────────────────────────────────────────────

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 14,
        elevation: 6,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.40,
        shadowRadius: 28,
        elevation: 14,
    },
    voltage: {
        shadowColor: '#A5B4FC',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
        elevation: 10,
    },
    glow: (hex: string) => ({
        shadowColor: hex,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.55,
        shadowRadius: 22,
        elevation: 10,
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// MOTION — refined timing
// ─────────────────────────────────────────────────────────────────────────────

export const animation = {
    instant: 80,
    fast: 160,
    base: 240,
    slow: 420,
    slower: 640,
    cinematic: 900,
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT PRESETS (back-compat)
// ─────────────────────────────────────────────────────────────────────────────

export const components = {
    card: {
        backgroundColor: colors.bg.raised,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },

    button: {
        primary: {
            backgroundColor: colors.voltage.core,
            borderRadius: borderRadius.full,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
        },
        secondary: {
            backgroundColor: colors.surface.glass,
            borderRadius: borderRadius.full,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            borderWidth: 1,
            borderColor: colors.border.medium,
        },
    },

    input: {
        backgroundColor: colors.surface.glass,
        borderRadius: borderRadius.md,
        padding: spacing.base,
        color: colors.text.primary,
        fontSize: typography.size.md,
        borderWidth: 1,
        borderColor: colors.border.hairline,
    },

    section: {
        marginBottom: spacing['2xl'],
    },

    sectionTitle: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        marginBottom: spacing.base,
        letterSpacing: typography.tracking.tight,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS — common patterns
// ─────────────────────────────────────────────────────────────────────────────

export const presets = {
    eyebrow: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: colors.text.tertiary,
        letterSpacing: 2.4,
        textTransform: 'uppercase' as const,
    },

    display: {
        fontSize: typography.size['6xl'],
        fontWeight: typography.weight.heavy,
        color: colors.text.primary,
        letterSpacing: typography.tracking.tightest,
        lineHeight: typography.size['6xl'] * 1.04,
    },

    headline: {
        fontSize: typography.size['4xl'],
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        letterSpacing: typography.tracking.tight,
    },

    title: {
        fontSize: typography.size.xl,
        fontWeight: typography.weight.semibold,
        color: colors.text.primary,
        letterSpacing: typography.tracking.tight,
    },

    body: {
        fontSize: typography.size.md,
        color: colors.text.secondary,
        lineHeight: typography.size.md * typography.lineHeight.base,
    },

    caption: {
        fontSize: typography.size.sm,
        color: colors.text.tertiary,
        lineHeight: typography.size.sm * typography.lineHeight.base,
    },

    numeral: {
        fontSize: typography.size['5xl'],
        fontWeight: typography.weight.bold,
        color: colors.text.primary,
        letterSpacing: typography.tracking.tightest,
        // Tabular numerals — looks more "instrument-like"
        // (only honored on iOS/web; harmless elsewhere)
        fontVariant: ['tabular-nums'] as any,
    },

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
            fontSize: typography.size['3xl'],
            fontWeight: typography.weight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm,
            letterSpacing: typography.tracking.tight,
        },
        subtitle: {
            fontSize: typography.size.md,
            color: colors.text.tertiary,
            textAlign: 'center' as const,
            lineHeight: typography.size.md * typography.lineHeight.base,
        },
    },

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

    toolCard: {
        container: {
            flexDirection: 'row' as const,
            alignItems: 'center' as const,
            backgroundColor: colors.bg.raised,
            borderRadius: borderRadius.lg,
            padding: spacing.base,
            marginBottom: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border.hairline,
        },
        icon: {
            width: 48,
            height: 48,
            borderRadius: borderRadius.md,
            alignItems: 'center' as const,
            justifyContent: 'center' as const,
            marginRight: spacing.md,
        },
    },
};

export default {
    colors,
    moduleGradients,
    typography,
    spacing,
    borderRadius,
    shadows,
    animation,
    components,
    presets,
};
