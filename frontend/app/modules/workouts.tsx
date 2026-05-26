import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';

type WorkoutLocation = 'home' | 'gym';
type WorkoutCategory = 'strength' | 'mobility' | 'cardio' | 'recovery';

interface Workout {
    id: string;
    name: string;
    description: string;
    duration: number;
    category: WorkoutCategory;
    location: WorkoutLocation[];
    level: 'beginner' | 'intermediate' | 'advanced';
    exercises: string[];
}

const WORKOUTS: Workout[] = [
    // Strength
    {
        id: 's1',
        name: 'Foundation Strength',
        description: 'Core compound movements for full-body strength',
        duration: 30,
        category: 'strength',
        location: ['gym'],
        level: 'beginner',
        exercises: ['Goblet Squat 3x10', 'DB Row 3x10', 'Push-ups 3x8-12', 'RDL 3x10'],
    },
    {
        id: 's2',
        name: 'Bodyweight Power',
        description: 'No equipment required strength building',
        duration: 25,
        category: 'strength',
        location: ['home'],
        level: 'beginner',
        exercises: ['Squats 3x15', 'Push-ups 3x10', 'Lunges 3x10 each', 'Plank 3x30s'],
    },
    {
        id: 's3',
        name: 'Upper/Lower Split',
        description: 'Focused muscle group training',
        duration: 45,
        category: 'strength',
        location: ['gym'],
        level: 'intermediate',
        exercises: ['Bench 4x8', 'Rows 4x8', 'OHP 3x10', 'Curls 3x12', 'Tricep Ext 3x12'],
    },
    // Mobility
    {
        id: 'm1',
        name: 'Morning Mobility',
        description: 'Wake up your joints and muscles',
        duration: 15,
        category: 'mobility',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: ['Cat-Cow 10x', 'Hip Circles 10x', 'Shoulder Rolls 10x', 'World\'s Greatest Stretch 5x'],
    },
    {
        id: 'm2',
        name: 'Desk Worker Reset',
        description: 'Counter sitting with targeted stretches',
        duration: 10,
        category: 'mobility',
        location: ['home'],
        level: 'beginner',
        exercises: ['Hip Flexor Stretch 60s', 'Chest Opener 60s', 'Neck Rolls 30s', 'Thoracic Extensions'],
    },
    // Cardio
    {
        id: 'c1',
        name: 'Zone 2 Walk',
        description: 'Low intensity for metabolic health',
        duration: 30,
        category: 'cardio',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: ['Walk at 60-70% max HR', 'Can hold conversation', 'Nasal breathing preferred'],
    },
    {
        id: 'c2',
        name: 'HIIT Sprint',
        description: 'Short, intense intervals',
        duration: 15,
        category: 'cardio',
        location: ['gym'],
        level: 'intermediate',
        exercises: ['Warm up 3min', '20s sprint / 40s rest x8', 'Cool down 2min'],
    },
    // Recovery
    {
        id: 'r1',
        name: 'Active Recovery',
        description: 'Light movement for rest days',
        duration: 20,
        category: 'recovery',
        location: ['home', 'gym'],
        level: 'beginner',
        exercises: ['Easy walk 10min', 'Light stretching', 'Foam rolling 5min'],
    },
    {
        id: 'r2',
        name: 'Nervous System Reset',
        description: 'Parasympathetic activation',
        duration: 15,
        category: 'recovery',
        location: ['home'],
        level: 'beginner',
        exercises: ['Legs up wall 5min', 'Box breathing 5min', 'Body scan 5min'],
    },
];

const CATEGORY_CONFIG: Record<WorkoutCategory, { label: string; color: string; icon: string }> = {
    strength: { label: 'Strength', color: '#EF4444', icon: 'barbell' },
    mobility: { label: 'Mobility', color: '#8B5CF6', icon: 'body' },
    cardio: { label: 'Cardio', color: '#F59E0B', icon: 'heart' },
    recovery: { label: 'Recovery', color: '#10B981', icon: 'leaf' },
};

export default function WorkoutsScreen() {
    const router = useRouter();
    const { profile } = useUserStore();
    const [location, setLocation] = useState<WorkoutLocation>('home');
    const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | null>(null);

    const filteredWorkouts = WORKOUTS.filter((w) => {
        const matchesLocation = w.location.includes(location);
        const matchesCategory = !selectedCategory || w.category === selectedCategory;
        const matchesLevel = !profile?.level ||
            w.level === profile.level ||
            (profile.level === 'advanced') ||
            (profile.level === 'intermediate' && w.level !== 'advanced');
        return matchesLocation && matchesCategory && matchesLevel;
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Workouts</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Location Toggle */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, location === 'home' && styles.toggleActive]}
                        onPress={() => setLocation('home')}
                    >
                        <Ionicons name="home" size={18} color={location === 'home' ? '#FFF' : '#9CA3AF'} />
                        <Text style={[styles.toggleText, location === 'home' && styles.toggleTextActive]}>
                            Home
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.toggleButton, location === 'gym' && styles.toggleActive]}
                        onPress={() => setLocation('gym')}
                    >
                        <Ionicons name="fitness" size={18} color={location === 'gym' ? '#FFF' : '#9CA3AF'} />
                        <Text style={[styles.toggleText, location === 'gym' && styles.toggleTextActive]}>
                            Gym
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryContent}
                >
                    <TouchableOpacity
                        style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.categoryChip,
                                selectedCategory === key && { backgroundColor: config.color },
                            ]}
                            onPress={() => setSelectedCategory(key as WorkoutCategory)}
                        >
                            <Ionicons
                                name={config.icon as any}
                                size={14}
                                color={selectedCategory === key ? '#FFF' : config.color}
                            />
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    selectedCategory === key && styles.categoryChipTextActive,
                                ]}
                            >
                                {config.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Workouts List */}
                <View style={styles.workoutsGrid}>
                    {filteredWorkouts.map((workout) => {
                        const config = CATEGORY_CONFIG[workout.category];
                        return (
                            <View key={workout.id} style={styles.workoutCard}>
                                <View style={styles.workoutHeader}>
                                    <View style={[styles.categoryBadge, { backgroundColor: config.color + '20' }]}>
                                        <Ionicons name={config.icon as any} size={16} color={config.color} />
                                    </View>
                                    <Text style={styles.durationBadge}>{workout.duration} min</Text>
                                </View>
                                <Text style={styles.workoutName}>{workout.name}</Text>
                                <Text style={styles.workoutDesc}>{workout.description}</Text>
                                <View style={styles.exerciseList}>
                                    {workout.exercises.slice(0, 3).map((exercise, i) => (
                                        <View key={i} style={styles.exerciseItem}>
                                            <View style={styles.exerciseDot} />
                                            <Text style={styles.exerciseText} numberOfLines={1}>{exercise}</Text>
                                        </View>
                                    ))}
                                    {workout.exercises.length > 3 && (
                                        <Text style={styles.moreExercises}>
                                            +{workout.exercises.length - 3} more
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {filteredWorkouts.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="barbell-outline" size={48} color="#4B5563" />
                        <Text style={styles.emptyText}>No workouts match your filters</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
        borderRadius: 10,
    },
    toggleActive: {
        backgroundColor: '#EF4444',
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    toggleTextActive: {
        color: '#FFF',
    },
    categoryScroll: {
        marginBottom: 20,
    },
    categoryContent: {
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    categoryChipActive: {
        backgroundColor: '#3B82F6',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    categoryChipTextActive: {
        color: '#FFF',
    },
    workoutsGrid: {
        gap: 12,
    },
    workoutCard: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 16,
    },
    workoutHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoryBadge: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationBadge: {
        fontSize: 12,
        color: '#9CA3AF',
        backgroundColor: '#374151',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    workoutName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#F9FAFB',
        marginBottom: 4,
    },
    workoutDesc: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    exerciseList: {
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 12,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    exerciseDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#6B7280',
    },
    exerciseText: {
        flex: 1,
        fontSize: 13,
        color: '#D1D5DB',
    },
    moreExercises: {
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
        marginTop: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 12,
    },
});
