import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MetricSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  lowLabel?: string;
  highLabel?: string;
}

export const MetricSlider: React.FC<MetricSliderProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 10,
  lowLabel = 'Low',
  highLabel = 'High',
}) => {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        {steps.map((step) => (
          <TouchableOpacity
            key={step}
            style={[
              styles.step,
              value === step && styles.activeStep,
              value >= step && styles.filledStep,
            ]}
            onPress={() => onChange(step)}
          >
            <Text style={[
              styles.stepText,
              value >= step && styles.activeStepText,
            ]}>
              {step}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.labels}>
        <Text style={styles.rangeLabel}>{lowLabel}</Text>
        <Text style={styles.rangeLabel}>{highLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F9FAFB',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  step: {
    flex: 1,
    height: 44,
    backgroundColor: '#374151',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#3B82F6',
  },
  filledStep: {
    backgroundColor: '#3B82F6',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeStepText: {
    color: '#FFFFFF',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
