/**
 * Gradient — a tiny SVG-based linear gradient fill that absolutely fills its parent.
 * Used as a backdrop layer inside cards / buttons to avoid pulling in expo-linear-gradient.
 */
import React, { useId } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Rect, Stop } from 'react-native-svg';

interface GradientProps {
    colors: readonly [string, string] | readonly [string, string, string];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: readonly number[];
    style?: ViewStyle;
    borderRadius?: number;
}

export function Gradient({
    colors,
    start = { x: 0, y: 0 },
    end = { x: 1, y: 1 },
    locations,
    style,
    borderRadius,
}: GradientProps) {
    const gradId = useId();

    return (
        <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { borderRadius, overflow: 'hidden' }, style]}
        >
            <Svg width="100%" height="100%" preserveAspectRatio="none">
                <Defs>
                    <SvgLinearGradient
                        id={gradId}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                    >
                        {colors.map((c, i) => (
                            <Stop
                                key={i}
                                offset={
                                    locations?.[i] !== undefined
                                        ? `${locations[i] * 100}%`
                                        : `${(i / (colors.length - 1)) * 100}%`
                                }
                                stopColor={c}
                                stopOpacity={1}
                            />
                        ))}
                    </SvgLinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill={`url(#${gradId})`} />
            </Svg>
        </View>
    );
}

export default Gradient;
