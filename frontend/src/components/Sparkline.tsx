/**
 * Sparkline — a minimal area chart for stat cards.
 *
 * Pure SVG. Smooth curve via cubic Bézier. Accepts a values array (any range);
 * normalizes internally. Optional gradient fill + glow stroke.
 */
import React, { useId, useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface SparklineProps {
    values: number[];
    color?: string;
    fillFrom?: string; // override gradient top
    width?: number;
    height?: number;
    strokeWidth?: number;
    style?: ViewStyle;
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
    if (points.length === 0) return '';
    if (points.length === 1) {
        const p = points[0];
        return `M ${p.x} ${p.y}`;
    }
    const tension = 0.35;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] ?? points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] ?? p2;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
}

export function Sparkline({
    values,
    color = colors.voltage.soft,
    fillFrom,
    width = 120,
    height = 36,
    strokeWidth = 2,
    style,
}: SparklineProps) {
    const gradId = useId();

    const { strokePath, fillPath } = useMemo(() => {
        if (!values || values.length === 0) {
            return { strokePath: '', fillPath: '' };
        }
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;
        const padX = strokeWidth + 1;
        const padY = strokeWidth + 1;
        const innerW = width - padX * 2;
        const innerH = height - padY * 2;

        const points = values.map((v, i) => {
            const x =
                values.length === 1
                    ? width / 2
                    : padX + (i / (values.length - 1)) * innerW;
            const y = padY + innerH - ((v - min) / range) * innerH;
            return { x, y };
        });

        const stroke = buildSmoothPath(points);
        const fill = `${stroke} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
        return { strokePath: stroke, fillPath: fill };
    }, [values, width, height, strokeWidth]);

    if (!values || values.length === 0) {
        return <View style={[{ width, height }, style]} />;
    }

    return (
        <View style={[{ width, height }, style]}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={fillFrom ?? color} stopOpacity={0.45} />
                        <Stop offset="100%" stopColor={fillFrom ?? color} stopOpacity={0} />
                    </LinearGradient>
                </Defs>
                <Path d={fillPath} fill={`url(#${gradId})`} />
                <Path
                    d={strokePath}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </Svg>
        </View>
    );
}

export default Sparkline;
