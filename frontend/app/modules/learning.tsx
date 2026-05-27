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

const FEYNMAN_STEPS = [
    { step: 1, title: 'Choose a concept', desc: 'Pick something you want to understand deeply' },
    { step: 2, title: 'Teach it simply', desc: 'Explain it like you\'re teaching a child' },
    { step: 3, title: 'Identify gaps', desc: 'Notice where your explanation breaks down' },
    { step: 4, title: 'Review & simplify', desc: 'Go back to source, fill gaps, simplify further' },
];

const SYNTHESIS_PROMPTS = [
    'What was the most important thing I learned this week?',
    'How does this connect to what I already know?',
    'What surprised me or challenged my assumptions?',
    'How can I apply this in the next 7 days?',
    'What questions do I still have?',
];

export default function LearningScreen() {
    const router = useRouter();
    const { learningGoals, addLearningGoal, updateLearningGoals } = useUserStore();
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newSubgoals, setNewSubgoals] = useState('');
    const [activeTab, setActiveTab] = useState<'decompose' | 'feynman' | 'synthesis'>('decompose');

    const handleAddGoal = async () => {
        if (!newGoalTitle.trim()) return;

        const subgoalList = newSubgoals
            .split('\n')
            .filter(s => s.trim())
            .map((title, i) => ({
                id: `${Date.now()}-${i}`,
                title: title.trim(),
                completed: false,
            }));

        await addLearningGoal({
            id: Date.now().toString(),
            title: newGoalTitle.trim(),
            subgoals: subgoalList,
            createdAt: new Date().toISOString(),
        });
        setNewGoalTitle('');
        setNewSubgoals('');
        setShowAddGoal(false);
    };

    const toggleSubgoal = (goalId: string, subgoalId: string) => {
        const updated = learningGoals.map(goal => {
            if (goal.id === goalId) {
                return {
                    ...goal,
                    subgoals: goal.subgoals.map(sg =>
                        sg.id === subgoalId ? { ...sg, completed: !sg.completed } : sg
                    ),
                };
            }
            return goal;
        });
        updateLearningGoals(updated);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Learning Tools</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'decompose' && styles.tabActive]}
                    onPress={() => setActiveTab('decompose')}
                >
                    <Text style={[styles.tabText, activeTab === 'decompose' && styles.tabTextActive]}>
                        Decompose
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'feynman' && styles.tabActive]}
                    onPress={() => setActiveTab('feynman')}
                >
                    <Text style={[styles.tabText, activeTab === 'feynman' && styles.tabTextActive]}>
                        Feynman
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'synthesis' && styles.tabActive]}
                    onPress={() => setActiveTab('synthesis')}
                >
                    <Text style={[styles.tabText, activeTab === 'synthesis' && styles.tabTextActive]}>
                        Synthesis
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'decompose' && (
                    <>
                        {/* Add Goal Form */}
                        {showAddGoal ? (
                            <View style={styles.addForm}>
                                <Text style={styles.formLabel}>Learning Goal</Text>
                                <TextInput
                                    style={styles.input}
                                    value={newGoalTitle}
                                    onChangeText={setNewGoalTitle}
                                    placeholder="e.g., Master React Native"
                                    placeholderTextColor="#6B7280"
                                />

                                <Text style={styles.formLabel}>Break it down (one per line)</Text>
                                <TextInput
                                    style={[styles.input, styles.multilineInput]}
                                    value={newSubgoals}
                                    onChangeText={setNewSubgoals}
                                    placeholder="e.g.,&#10;Learn navigation&#10;State management&#10;API integration"
                                    placeholderTextColor="#6B7280"
                                    multiline
                                    numberOfLines={5}
                                />

                                <View style={styles.formButtons}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setShowAddGoal(false)}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleAddGoal}>
                                        <Text style={styles.saveText}>Save Goal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowAddGoal(true)}
                            >
                                <Ionicons name="add-circle" size={24} color="#8B5CF6" />
                                <Text style={styles.addButtonText}>Decompose a Learning Goal</Text>
                            </TouchableOpacity>
                        )}

                        {/* Goals List */}
                        {learningGoals.map((goal) => {
                            const completed = goal.subgoals.filter(s => s.completed).length;
                            const total = goal.subgoals.length;
                            return (
                                <View key={goal.id} style={styles.goalCard}>
                                    <View style={styles.goalHeader}>
                                        <Text style={styles.goalTitle}>{goal.title}</Text>
                                        <Text style={styles.goalProgress}>{completed}/{total}</Text>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: `${total > 0 ? (completed / total) * 100 : 0}%` }]} />
                                    </View>
                                    {goal.subgoals.map((sg) => (
                                        <TouchableOpacity
                                            key={sg.id}
                                            style={styles.subgoalItem}
                                            onPress={() => toggleSubgoal(goal.id, sg.id)}
                                        >
                                            <View style={[styles.checkbox, sg.completed && styles.checkboxDone]}>
                                                {sg.completed && <Ionicons name="checkmark" size={12} color="#FFF" />}
                                            </View>
                                            <Text style={[styles.subgoalText, sg.completed && styles.subgoalDone]}>
                                                {sg.title}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            );
                        })}
                    </>
                )}

                {activeTab === 'feynman' && (
                    <View style={styles.feynmanSection}>
                        <Text style={styles.feynmanIntro}>
                            The Feynman Technique: Learn anything by teaching it simply.
                        </Text>
                        {FEYNMAN_STEPS.map((item) => (
                            <View key={item.step} style={styles.feynmanStep}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{item.step}</Text>
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={styles.stepTitle}>{item.title}</Text>
                                    <Text style={styles.stepDesc}>{item.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'synthesis' && (
                    <View style={styles.synthesisSection}>
                        <Text style={styles.synthesisIntro}>
                            Weekly reflection prompts to consolidate learning:
                        </Text>
                        {SYNTHESIS_PROMPTS.map((prompt, i) => (
                            <View key={i} style={styles.promptCard}>
                                <Ionicons name="help-circle" size={20} color="#8B5CF6" />
                                <Text style={styles.promptText}>{prompt}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F9FAFB' },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
    tab: { flex: 1, backgroundColor: '#1F2937', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#8B5CF6' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
    tabTextActive: { color: '#FFF' },
    content: { flex: 1, paddingHorizontal: 20 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', borderRadius: 12, padding: 20, gap: 12, marginBottom: 20, borderWidth: 2, borderColor: '#8B5CF640', borderStyle: 'dashed' },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#8B5CF6' },
    addForm: { backgroundColor: '#1F2937', borderRadius: 12, padding: 20, marginBottom: 20 },
    formLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
    input: { backgroundColor: '#374151', borderRadius: 8, padding: 14, fontSize: 15, color: '#F9FAFB', marginBottom: 16 },
    multilineInput: { minHeight: 100, textAlignVertical: 'top' },
    formButtons: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 14, alignItems: 'center' },
    cancelText: { color: '#9CA3AF', fontWeight: '500' },
    saveBtn: { flex: 2, backgroundColor: '#8B5CF6', borderRadius: 8, padding: 14, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: '600' },
    goalCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 12 },
    goalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    goalTitle: { fontSize: 16, fontWeight: '600', color: '#F9FAFB' },
    goalProgress: { fontSize: 14, color: '#8B5CF6', fontWeight: '600' },
    progressBar: { height: 4, backgroundColor: '#374151', borderRadius: 2, marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: '#8B5CF6', borderRadius: 2 },
    subgoalItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    checkbox: { width: 20, height: 20, borderRadius: 5, borderWidth: 2, borderColor: '#4B5563', alignItems: 'center', justifyContent: 'center' },
    checkboxDone: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
    subgoalText: { flex: 1, fontSize: 14, color: '#D1D5DB' },
    subgoalDone: { textDecorationLine: 'line-through', color: '#6B7280' },
    feynmanSection: {},
    feynmanIntro: { fontSize: 15, color: '#D1D5DB', marginBottom: 20, lineHeight: 22 },
    feynmanStep: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#1F2937', borderRadius: 12, padding: 16 },
    stepNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#8B5CF6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    stepNumberText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
    stepContent: { flex: 1 },
    stepTitle: { fontSize: 16, fontWeight: '600', color: '#F9FAFB' },
    stepDesc: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
    synthesisSection: {},
    synthesisIntro: { fontSize: 15, color: '#D1D5DB', marginBottom: 16 },
    promptCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#1F2937', borderRadius: 10, padding: 14, marginBottom: 8, gap: 12 },
    promptText: { flex: 1, fontSize: 14, color: '#D1D5DB', lineHeight: 20 },
});
