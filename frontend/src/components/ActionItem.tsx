import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionItemProps {
  title: string;
  subtitle?: string;
  completed: boolean;
  onToggle: () => void;
  color?: string;
}

export const ActionItem: React.FC<ActionItemProps> = ({
  title,
  subtitle,
  completed,
  onToggle,
  color = '#3B82F6',
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, completed && styles.completedContainer]} 
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        completed && { backgroundColor: color, borderColor: color },
      ]}>
        {completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, completed && styles.completedTitle]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  completedContainer: {
    backgroundColor: '#1F2937',
    opacity: 0.7,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F9FAFB',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});
