/**
 * MAXIM Animation Utilities
 * Reusable animation configurations for micro-interactions
 */

import { Animated, Easing } from 'react-native';

// Animation timing presets
export const timing = {
    fast: 150,
    base: 250,
    slow: 400,
    slower: 600,
};

// Easing presets
export const easings = {
    // Standard easing for most animations
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    // For elements entering the screen
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    // For elements leaving the screen
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    // Bouncy effect
    bounce: Easing.bezier(0.34, 1.56, 0.64, 1),
    // Smooth elastic
    elastic: Easing.elastic(1),
};

/**
 * Press animation - scales down slightly when pressed
 */
export const createPressAnimation = (animatedValue: Animated.Value) => ({
    onPressIn: () => {
        Animated.spring(animatedValue, {
            toValue: 0.96,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    },
    onPressOut: () => {
        Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            friction: 8,
            tension: 100,
        }).start();
    },
});

/**
 * Fade in animation
 */
export const fadeIn = (
    animatedValue: Animated.Value,
    duration: number = timing.base,
    delay: number = 0
) => {
    return Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        delay,
        easing: easings.decelerate,
        useNativeDriver: true,
    });
};

/**
 * Fade out animation
 */
export const fadeOut = (
    animatedValue: Animated.Value,
    duration: number = timing.base
) => {
    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        easing: easings.accelerate,
        useNativeDriver: true,
    });
};

/**
 * Slide up animation (for entering content)
 */
export const slideUp = (
    animatedValue: Animated.Value,
    duration: number = timing.slow,
    delay: number = 0
) => {
    return Animated.timing(animatedValue, {
        toValue: 0,
        duration,
        delay,
        easing: easings.decelerate,
        useNativeDriver: true,
    });
};

/**
 * Scale in animation (for appearing elements)
 */
export const scaleIn = (
    animatedValue: Animated.Value,
    duration: number = timing.base
) => {
    return Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 80,
    });
};

/**
 * Pulse animation (for attention-grabbing)
 */
export const createPulseAnimation = (animatedValue: Animated.Value) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1.05,
                duration: 1000,
                easing: easings.standard,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1000,
                easing: easings.standard,
                useNativeDriver: true,
            }),
        ])
    );
};

/**
 * Shake animation (for errors/attention)
 */
export const shake = (animatedValue: Animated.Value) => {
    return Animated.sequence([
        Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]);
};

/**
 * Staggered list animation
 */
export const staggeredFadeIn = (
    animations: Animated.Value[],
    staggerDelay: number = 50
) => {
    return Animated.stagger(
        staggerDelay,
        animations.map((anim) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: timing.base,
                easing: easings.decelerate,
                useNativeDriver: true,
            })
        )
    );
};

/**
 * Progress ring animation
 */
export const animateProgress = (
    animatedValue: Animated.Value,
    toValue: number,
    duration: number = timing.slower
) => {
    return Animated.timing(animatedValue, {
        toValue,
        duration,
        easing: easings.standard,
        useNativeDriver: false, // Need false for width/rotation
    });
};

/**
 * Breathing/pulsing circle animation (for meditation)
 */
export const breathingAnimation = (
    animatedValue: Animated.Value,
    inhaleMs: number,
    exhaleMs: number
) => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: inhaleMs,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 0.6,
                duration: exhaleMs,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

export default {
    timing,
    easings,
    createPressAnimation,
    fadeIn,
    fadeOut,
    slideUp,
    scaleIn,
    createPulseAnimation,
    shake,
    staggeredFadeIn,
    animateProgress,
    breathingAnimation,
};
