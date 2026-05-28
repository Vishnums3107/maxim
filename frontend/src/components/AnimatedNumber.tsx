/**
 * AnimatedNumber — count-up animation for numeric stat values.
 *
 * Smooth interpolation from 0 → target on mount and on value changes.
 * Supports decimal precision and optional prefix/suffix.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TextStyle } from 'react-native';
import { typography } from '../theme/tokens';

interface AnimatedNumberProps {
    value: number;
    /** decimal places to show (0 by default) */
    precision?: number;
    /** ms duration (default 700) */
    duration?: number;
    /** optional delay in ms */
    delay?: number;
    style?: TextStyle | TextStyle[];
    /** prefix string (e.g. '+') */
    prefix?: string;
    /** suffix string (e.g. '%') */
    suffix?: string;
}

export function AnimatedNumber({
    value,
    precision = 0,
    duration = 700,
    delay = 0,
    style,
    prefix = '',
    suffix = '',
}: AnimatedNumberProps) {
    const animated = useRef(new Animated.Value(0)).current;
    const [display, setDisplay] = useState('0');

    useEffect(() => {
        const id = animated.addListener(({ value: v }) => {
            setDisplay(v.toFixed(precision));
        });
        Animated.timing(animated, {
            toValue: value,
            duration,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
        return () => animated.removeListener(id);
    }, [value]);

    return (
        <Text
            style={[
                {
                    // tabular numerals look more "instrument"-like
                    // Only honored on iOS / web — harmless elsewhere
                    fontVariant: ['tabular-nums'] as any,
                },
                style,
            ]}
        >
            {prefix}
            {display}
            {suffix}
        </Text>
    );
}

export default AnimatedNumber;
