/**
 * Eyebrow — small uppercase tracked label.
 * Used as a section header above editorial titles.
 */
import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { colors } from '../theme/tokens';

interface EyebrowProps {
    children: React.ReactNode;
    color?: string;
    style?: StyleProp<TextStyle>;
}

export function Eyebrow({ children, color = colors.text.tertiary, style }: EyebrowProps) {
    return (
        <Text
            style={[
                {
                    fontSize: 11,
                    fontWeight: '600',
                    color,
                    letterSpacing: 2.4,
                    textTransform: 'uppercase',
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}

export default Eyebrow;
