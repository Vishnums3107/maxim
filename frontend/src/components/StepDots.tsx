/**
 * StepDots — onboarding step indicator.
 *
 * 3 dots: done (success), active (voltage pill), pending (muted).
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

interface StepDotsProps {
    /** total number of steps */
    total: number;
    /** active step index (0-based) */
    current: number;
}

export function StepDots({ total, current }: StepDotsProps) {
    return (
        <View style={styles.row}>
            {Array.from({ length: total }).map((_, i) => {
                const isDone = i < current;
                const isActive = i === current;
                return (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            isDone && styles.done,
                            isActive && styles.active,
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.10)',
    },
    done: {
        backgroundColor: 'rgba(165, 180, 252, 0.5)',
    },
    active: {
        width: 22,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.voltage.core,
        shadowColor: colors.voltage.soft,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 4,
    },
});

export default StepDots;
