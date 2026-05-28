import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';

const THOUGHT_PROMPTS = [
    "What's occupying your mind right now?",
    "What worry keeps returning?",
    "What decision are you avoiding?",
    "What's draining your energy?",
];
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { colors, moduleGradients } from '../../src/theme/tokens';

export default function ThoughtsScreen() {
    const router = useRouter();
    const { thoughtEntries, addThoughtEntry } = useUserStore();
    const [thought, setThought] = useState('');
    const [action, setAction] = useState('');
    const [showEntry, setShowEntry] = useState(false);
    const [currentPrompt] = useState(
        THOUGHT_PROMPTS[Math.floor(Math.random() * THOUGHT_PROMPTS.length)]
    );

    const handleSave = async () => {
        if (!thought.trim()) return;

        await addThoughtEntry({
            id: Date.now().toString(),
            thought: thought.trim(),
            action: action.trim(),
            createdAt: new Date().toISOString(),
        });
        setThought('');
        setAction('');
        setShowEntry(false);
    };

    const convertToAction = () => {
        if (!thought.trim()) return;
        setAction(`Deal with: ${thought.split(' ').slice(0, 5).join(' ')}...`);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Thought Externalization" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.content}>
                    {/* Hero */}
                    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <ModuleHero
                            icon="cloud-outline"
                            title="Get it out of your head"
                            subtitle="Externalise thoughts. Convert to actions. Clear mental RAM."
                            gradient={moduleGradients.regulation}
                            accent={colors.modules.regulation}
                        />
                    </View>

                    {/* Entry Form */}
                    {showEntry ? (
                        <View style={styles.entryCard}>
                            <Text style={styles.promptText}>{currentPrompt}</Text>

                            <TextInput
                                style={styles.thoughtInput}
                                value={thought}
                                onChangeText={setThought}
                                placeholder="Write freely... no one will see this but you"
                                placeholderTextColor="#5E5E6A"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <TouchableOpacity style={styles.convertButton} onPress={convertToAction}>
                                <Ionicons name="arrow-forward-circle" size={20} color="#34D399" />
                                <Text style={styles.convertText}>Convert to action</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={styles.actionInput}
                                value={action}
                                onChangeText={setAction}
                                placeholder="What's one action you can take?"
                                placeholderTextColor="#5E5E6A"
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowEntry(false);
                                        setThought('');
                                        setAction('');
                                    }}
                                >
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.saveButton, !thought.trim() && styles.saveButtonDisabled]}
                                    onPress={handleSave}
                                    disabled={!thought.trim()}
                                >
                                    <Ionicons name="checkmark" size={20} color="#FFF" />
                                    <Text style={styles.saveText}>Save & Clear</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.newEntryButton}
                            onPress={() => setShowEntry(true)}
                        >
                            <Ionicons name="add-circle" size={24} color="#34D399" />
                            <Text style={styles.newEntryText}>Externalize a Thought</Text>
                        </TouchableOpacity>
                    )}

                    {/* Technique Guide */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>The Process</Text>
                        <View style={styles.processCard}>
                            <View style={styles.processStep}>
                                <View style={[styles.stepNumber, { backgroundColor: '#60A5FA' }]}>
                                    <Text style={styles.stepNumberText}>1</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Dump</Text>
                                    <Text style={styles.stepDesc}>Write what's on your mind without filtering</Text>
                                </View>
                            </View>
                            <View style={styles.processStep}>
                                <View style={[styles.stepNumber, { backgroundColor: '#FBBF24' }]}>
                                    <Text style={styles.stepNumberText}>2</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Convert</Text>
                                    <Text style={styles.stepDesc}>Turn the worry into a concrete next action</Text>
                                </View>
                            </View>
                            <View style={styles.processStep}>
                                <View style={[styles.stepNumber, { backgroundColor: '#34D399' }]}>
                                    <Text style={styles.stepNumberText}>3</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>Release</Text>
                                    <Text style={styles.stepDesc}>Let go – it's on paper, not in your head</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Previous Entries */}
                    {thoughtEntries.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Recent Entries</Text>
                            {thoughtEntries.slice(0, 10).map((entry) => (
                                <View key={entry.id} style={styles.entryItem}>
                                    <Text style={styles.entryThought} numberOfLines={2}>
                                        {entry.thought}
                                    </Text>
                                    {entry.action && (
                                        <View style={styles.entryActionRow}>
                                            <Ionicons name="arrow-forward" size={14} color="#34D399" />
                                            <Text style={styles.entryAction}>{entry.action}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingVertical: 24,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#34D39920',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F5F5F7',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9494A0',
        textAlign: 'center',
    },
    newEntryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#11111C',
        borderRadius: 16,
        padding: 20,
        gap: 12,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#34D39940',
        borderStyle: 'dashed',
    },
    newEntryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#34D399',
    },
    entryCard: {
        backgroundColor: '#11111C',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    promptText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#C4C4CC',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    thoughtInput: {
        backgroundColor: '#1F1F2C',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#F5F5F7',
        minHeight: 120,
        marginBottom: 12,
    },
    convertButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    convertText: {
        fontSize: 14,
        color: '#34D399',
        fontWeight: '500',
    },
    actionInput: {
        backgroundColor: '#1F1F2C',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#F5F5F7',
        marginBottom: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#1F1F2C',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#9494A0',
    },
    saveButton: {
        flex: 2,
        flexDirection: 'row',
        backgroundColor: '#34D399',
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonDisabled: {
        backgroundColor: '#1F1F2C',
    },
    saveText: {
        fontSize: 16,
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
    processCard: {
        backgroundColor: '#11111C',
        borderRadius: 16,
        padding: 16,
    },
    processStep: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F5F5F7',
    },
    stepDesc: {
        fontSize: 13,
        color: '#9494A0',
        marginTop: 2,
    },
    entryItem: {
        backgroundColor: '#11111C',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
    },
    entryThought: {
        fontSize: 14,
        color: '#C4C4CC',
        marginBottom: 8,
    },
    entryActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    entryAction: {
        fontSize: 13,
        color: '#34D399',
        fontWeight: '500',
    },
});
