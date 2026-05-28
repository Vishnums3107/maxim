/**
 * AuroraBackground — a subtle, cinematic radial wash for screen backdrops.
 *
 * Drops behind content; tinted by an accent color. Pure SVG (no native deps).
 */
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface AuroraBackgroundProps {
    /** primary tint at the top */
    tint?: string;
    /** secondary tint, lower & opposite side */
    tintSecondary?: string;
    /** intensity 0–1 (default 0.55) */
    intensity?: number;
    style?: ViewStyle;
}

export function AuroraBackground({
    tint = colors.voltage.soft,
    tintSecondary,
    intensity = 0.55,
    style,
}: AuroraBackgroundProps) {
    return (
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, style]}>
            {/* Solid base */}
            <View
                style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.bg.void }]}
            />
            <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                    <RadialGradient id="aurora-top" cx="20%" cy="0%" rx="80%" ry="60%">
                        <Stop offset="0%" stopColor={tint} stopOpacity={intensity * 0.7} />
                        <Stop offset="60%" stopColor={tint} stopOpacity={0} />
                    </RadialGradient>
                    <RadialGradient id="aurora-side" cx="100%" cy="20%" rx="70%" ry="60%">
                        <Stop
                            offset="0%"
                            stopColor={tintSecondary ?? tint}
                            stopOpacity={intensity * 0.45}
                        />
                        <Stop
                            offset="60%"
                            stopColor={tintSecondary ?? tint}
                            stopOpacity={0}
                        />
                    </RadialGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#aurora-top)" />
                <Rect width="100%" height="100%" fill="url(#aurora-side)" />
            </Svg>
        </View>
    );
}

export default AuroraBackground;
