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

interface ExposureItem {
    id: string;
    title: string;
    description: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    category: string;
    completed: boolean;
}

const EXPOSURE_LADDER: ExposureItem[] = [
    // Level 1: Minimal
    { id: '1a', title: 'Make eye contact with stranger', description: 'Brief eye contact when passing someone', difficulty: 1, category: 'Basic', completed: false },
    { id: '1b', title: 'Smile at someone', description: 'Smile at a cashier or passerby', difficulty: 1, category: 'Basic', completed: false },
    { id: '1c', title: 'Say "thank you" audibly', description: 'To cashier, barista, or service worker', difficulty: 1, category: 'Basic', completed: false },
    // Level 2: Light
    { id: '2a', title: 'Ask for the time', description: 'Ask a stranger what time it is', difficulty: 2, category: 'Initiation', completed: false },
    { id: '2b', title: 'Give a compliment', description: 'Compliment something specific about someone', difficulty: 2, category: 'Initiation', completed: false },
    { id: '2c', title: 'Ask for directions', description: 'Even if you know the way', difficulty: 2, category: 'Initiation', completed: false },
    // Level 3: Moderate
    { id: '3a', title: 'Start small talk', description: '1-2 minute chat with stranger (waiting in line, etc.)', difficulty: 3, category: 'Conversation', completed: false },
    { id: '3b', title: 'Share your opinion', description: 'Express a preference or opinion in group', difficulty: 3, category: 'Conversation', completed: false },
    { id: '3c', title: 'Ask follow-up questions', description: 'Show genuine curiosity in someone\'s story', difficulty: 3, category: 'Conversation', completed: false },
    // Level 4: Challenging
    { id: '4a', title: 'Approach someone new', description: 'Introduce yourself at social event', difficulty: 4, category: 'Connection', completed: false },
    { id: '4b', title: 'Disagree respectfully', description: 'Share a differing view without being confrontational', difficulty: 4, category: 'Connection', completed: false },
    { id: '4c', title: 'Make a request', description: 'Ask for something you need (favor, help)', difficulty: 4, category: 'Connection', completed: false },
    // Level 5: Growth Zone
    { id: '5a', title: 'Public speaking', description: 'Speak up in meeting or present to group', difficulty: 5, category: 'Advanced', completed: false },
    { id: '5b', title: 'Set a boundary', description: 'Say no to something you don\'t want to do', difficulty: 5, category: 'Advanced', completed: false },
    { id: '5c', title: 'Initiate plans', description: 'Invite someone to hang out or do something', difficulty: 5, category: 'Advanced', completed: false },
];

const DIFFICULTY_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
const DIFFICULTY_LABELS = ['Minimal', 'Light', 'Moderate', 'Challenging', 'Growth Zone'];

export default function ExposureScreen() {
    const router = useRouter();
    const [completedItems, setCompletedItems] = useState<string[]>([]);
    const [expandedLevel, setExpandedLevel] = useState<number | null>(1);

    const toggleComplete = (id: string) => {
        setCompletedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const groupedItems = EXPOSURE_LADDER.reduce((acc, item) => {
        if (!acc[item.difficulty]) acc[item.difficulty] = [];
        acc[item.difficulty].push(item);
        return acc;
    }, {} as Record<number, ExposureItem[]>);

    const completedCount = completedItems.length;
    const totalItems = EXPOSURE_LADDER.length;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Social Exposure</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="trending-up" size={40} color="#EC4899" />
                    </View>
                    <Text style={styles.heroTitle}>Gradual Confidence Building</Text>
                    <Text style={styles.heroSubtitle}>
                        Exposure therapy for social situations. Start easy, gradually level up.
                    </Text>
                </View>

                {/* Progress */}
                <View style={styles.progressCard}>
                    <View style={styles.progressRow}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressValue}>{completedCount}/{totalItems}</Text>
                    </View>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(completedCount / totalItems) * 100}%` },
                            ]}
                        />
                    </View>
                </View>

                {/* Exposure Ladder */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exposure Ladder</Text>

                    {[1, 2, 3, 4, 5].map((level) => (
                        <View key={level} style={styles.levelCard}>
                            <TouchableOpacity
                                style={styles.levelHeader}
                                onPress={() => setExpandedLevel(expandedLevel === level ? null : level)}
                            >
                                <View style={[styles.levelBadge, { backgroundColor: DIFFICULTY_COLORS[level - 1] }]}>
                                    <Text style={styles.levelNumber}>{level}</Text>
                                </View>
                                <View style={styles.levelInfo}>
                                    <Text style={styles.levelTitle}>{DIFFICULTY_LABELS[level - 1]}</Text>
                                    <Text style={styles.levelProgress}>
                                        {groupedItems[level]?.filter((i) => completedItems.includes(i.id)).length || 0}/
                                        {groupedItems[level]?.length || 0} completed
                                    </Text>
                                </View>
                                <Ionicons
                                    name={expandedLevel === level ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>

                            {expandedLevel === level && (
                                <View style={styles.levelContent}>
                                    {groupedItems[level]?.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.exposureItem}
                                            onPress={() => toggleComplete(item.id)}
                                        >
                                            <View
                                                style={[
                                                    styles.checkbox,
                                                    completedItems.includes(item.id) && styles.checkboxChecked,
                                                ]}
                                            >
                                                {completedItems.includes(item.id) && (
                                                    <Ionicons name="checkmark" size={14} color="#FFF" />
                                                )}
                                            </View>
                                            <View style={styles.itemContent}>
                                                <Text
                                                    style={[
                                                        styles.itemTitle,
                                                        completedItems.includes(item.id) && styles.itemTitleDone,
                                                    ]}
                                                >
                                                    {item.title}
                                                </Text>
                                                <Text style={styles.itemDesc}>{item.description}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guidelines</Text>
                    <View style={styles.tipsCard}>
                        <View style={styles.tipItem}>
                            <Ionicons name="shield-checkmark" size={18} color="#EC4899" />
                            <Text style={styles.tipText}>Stay in your safety zone until ready</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="repeat" size={18} color="#EC4899" />
                            <Text style={styles.tipText}>Repeat items until they feel comfortable</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="trophy" size={18} color="#EC4899" />
                            <Text style={styles.tipText}>Discomfort = growth, but respect limits</Text>
                        </View>
                    </View>
                </View>

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
    heroSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EC489920',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#F9FAFB',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    progressCard: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    progressValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#374151',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#EC4899',
        borderRadius: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F9FAFB',
        marginBottom: 12,
    },
    levelCard: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    levelBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    levelNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    levelInfo: {
        flex: 1,
    },
    levelTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    levelProgress: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    levelContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: '#374151',
    },
    exposureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#4B5563',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#EC4899',
        borderColor: '#EC4899',
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#F9FAFB',
        marginBottom: 4,
    },
    itemTitleDone: {
        textDecorationLine: 'line-through',
        color: '#6B7280',
    },
    itemDesc: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    tipsCard: {
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#D1D5DB',
    },
});
