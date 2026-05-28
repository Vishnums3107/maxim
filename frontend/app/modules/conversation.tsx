import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';

const PROMPTS = {
    context: 'What was the situation?',
    wentWell: 'What went well in this interaction?',
    improve: "What could you do differently next time?",
};
import { ScreenChrome } from '../../src/components/ScreenChrome';

export default function ConversationScreen() {
    const router = useRouter();
    const { conversationReflections, addConversationReflection } = useUserStore();
    const [context, setContext] = useState('');
    const [wentWell, setWentWell] = useState('');
    const [improve, setImprove] = useState('');
    const [rating, setRating] = useState(3);
    const [showForm, setShowForm] = useState(false);

    const handleSave = async () => {
        if (!context.trim()) return;

        await addConversationReflection({
            id: Date.now().toString(),
            context: context.trim(),
            wentWell: wentWell.trim(),
            improve: improve.trim(),
            rating,
            createdAt: new Date().toISOString(),
        });
        setContext('');
        setWentWell('');
        setImprove('');
        setRating(3);
        setShowForm(false);
    };

    const avgRating = conversationReflections.length > 0
        ? (conversationReflections.reduce((acc, r) => acc + r.rating, 0) / conversationReflections.length).toFixed(1)
        : null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Conversation Reflection" />

            <ScrollView style={styles.content}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="chatbubbles" size={40} color="#EC4899" />
                    </View>
                    <Text style={styles.heroTitle}>Learn From Every Interaction</Text>
                    <Text style={styles.heroSubtitle}>
                        Reflect without judgment. Extract lessons. Improve over time.
                    </Text>
                </View>

                {/* Stats */}
                {conversationReflections.length > 0 && (
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{conversationReflections.length}</Text>
                            <Text style={styles.statLabel}>Reflections</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{avgRating}</Text>
                            <Text style={styles.statLabel}>Avg Rating</Text>
                        </View>
                    </View>
                )}

                {/* New Reflection Form */}
                {showForm ? (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>New Reflection</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{PROMPTS.context}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={context}
                                onChangeText={setContext}
                                placeholder="e.g., Team meeting, coffee chat with colleague..."
                                placeholderTextColor="#5E5E6A"
                                multiline
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{PROMPTS.wentWell}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={wentWell}
                                onChangeText={setWentWell}
                                placeholder="What positive moments stood out?"
                                placeholderTextColor="#5E5E6A"
                                multiline
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>{PROMPTS.improve}</Text>
                            <TextInput
                                style={styles.textInput}
                                value={improve}
                                onChangeText={setImprove}
                                placeholder="Anything you'd adjust?"
                                placeholderTextColor="#5E5E6A"
                                multiline
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Overall Rating</Text>
                            <View style={styles.ratingRow}>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <TouchableOpacity
                                        key={value}
                                        style={[
                                            styles.ratingButton,
                                            rating === value && styles.ratingButtonActive,
                                        ]}
                                        onPress={() => setRating(value)}
                                    >
                                        <Text
                                            style={[
                                                styles.ratingText,
                                                rating === value && styles.ratingTextActive,
                                            ]}
                                        >
                                            {value}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowForm(false)}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveButton, !context.trim() && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                disabled={!context.trim()}
                            >
                                <Ionicons name="checkmark" size={20} color="#FFF" />
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.newButton}
                        onPress={() => setShowForm(true)}
                    >
                        <Ionicons name="add-circle" size={24} color="#EC4899" />
                        <Text style={styles.newButtonText}>Add Reflection</Text>
                    </TouchableOpacity>
                )}

                {/* Previous Reflections */}
                {conversationReflections.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Reflections</Text>
                        {conversationReflections.map((reflection) => (
                            <View key={reflection.id} style={styles.reflectionCard}>
                                <View style={styles.reflectionHeader}>
                                    <View style={styles.ratingBadge}>
                                        <Text style={styles.ratingBadgeText}>{reflection.rating}/5</Text>
                                    </View>
                                </View>
                                <Text style={styles.reflectionContext}>{reflection.context}</Text>
                                {reflection.wentWell && (
                                    <View style={styles.reflectionRow}>
                                        <Ionicons name="checkmark-circle" size={14} color="#34D399" />
                                        <Text style={styles.reflectionDetail}>{reflection.wentWell}</Text>
                                    </View>
                                )}
                                {reflection.improve && (
                                    <View style={styles.reflectionRow}>
                                        <Ionicons name="arrow-up-circle" size={14} color="#FBBF24" />
                                        <Text style={styles.reflectionDetail}>{reflection.improve}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Guidelines */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reflection Framework</Text>
                    <View style={styles.guidelinesCard}>
                        <View style={styles.guidelineItem}>
                            <Ionicons name="eye-off" size={18} color="#EC4899" />
                            <Text style={styles.guidelineText}>No judgment, only observation</Text>
                        </View>
                        <View style={styles.guidelineItem}>
                            <Ionicons name="bulb" size={18} color="#EC4899" />
                            <Text style={styles.guidelineText}>Focus on one specific improvement</Text>
                        </View>
                        <View style={styles.guidelineItem}>
                            <Ionicons name="trending-up" size={18} color="#EC4899" />
                            <Text style={styles.guidelineText}>Track progress over weeks, not days</Text>
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
        backgroundColor: '#06060B',
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
        color: '#F5F5F7',
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
        color: '#F5F5F7',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9494A0',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F5F5F7',
    },
    statLabel: {
        fontSize: 12,
        color: '#9494A0',
        marginTop: 4,
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 20,
        gap: 12,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#EC489940',
        borderStyle: 'dashed',
    },
    newButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EC4899',
    },
    formCard: {
        backgroundColor: '#11111C',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F5F5F7',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#9494A0',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#1F1F2C',
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: '#F5F5F7',
        minHeight: 60,
    },
    ratingRow: {
        flexDirection: 'row',
        gap: 8,
    },
    ratingButton: {
        flex: 1,
        backgroundColor: '#1F1F2C',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    ratingButtonActive: {
        backgroundColor: '#EC4899',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9494A0',
    },
    ratingTextActive: {
        color: '#FFF',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#1F1F2C',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#9494A0',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: '#EC4899',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#1F1F2C',
    },
    saveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F5F5F7',
        marginBottom: 12,
    },
    reflectionCard: {
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    reflectionHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 8,
    },
    ratingBadge: {
        backgroundColor: '#EC489930',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EC4899',
    },
    reflectionContext: {
        fontSize: 15,
        color: '#F5F5F7',
        marginBottom: 12,
    },
    reflectionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
    },
    reflectionDetail: {
        flex: 1,
        fontSize: 13,
        color: '#9494A0',
    },
    guidelinesCard: {
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
    },
    guidelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    guidelineText: {
        flex: 1,
        fontSize: 14,
        color: '#C4C4CC',
    },
});
