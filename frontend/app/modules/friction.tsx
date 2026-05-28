import React, { useState, useMemo } from 'react';
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

const IDENTITY_PROMPTS = [
    { identity: 'I am someone who...', examples: ['shows up consistently', 'prioritizes recovery', 'learns every day'] },
    { identity: 'I don\'t...', examples: ['skip workouts', 'make excuses', 'negotiate with my commitments'] },
    { identity: 'When faced with resistance, I...', examples: ['do it anyway', 'start with 2 minutes', 'remember my why'] },
];
import { ScreenChrome } from '../../src/components/ScreenChrome';
import { ModuleHero } from '../../src/components/ModuleHero';
import { colors, moduleGradients } from '../../src/theme/tokens';

const SIMPLIFICATION_RULES = [
    { rule: 'Two-Minute Start', desc: 'If overwhelmed, commit to just 2 minutes' },
    { rule: 'Remove Decisions', desc: 'Pre-plan to eliminate daily choices' },
    { rule: 'Environment Design', desc: 'Make the right action the easy action' },
    { rule: 'Habit Stacking', desc: 'Link new habits to existing routines' },
    { rule: 'One Focus', desc: 'Build one habit before adding another' },
];

export default function FrictionScreen() {
    const router = useRouter();
    const { habits, frictionPoints, addFrictionPoint, identityStatements, addIdentityStatement } = useUserStore();
    const [showAdd, setShowAdd] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [friction, setFriction] = useState('');
    const [solution, setSolution] = useState('');
    const [newIdentity, setNewIdentity] = useState('');

    // Auto-detect potential friction based on habit completion
    const detectedFriction = useMemo(() => {
        const issues: { habit: string; issue: string }[] = [];

        habits.forEach(habit => {
            const completionRate = habit.completions.length;
            // Low completion might indicate friction
            if (completionRate < 3) {
                issues.push({ habit: habit.name, issue: 'Low completion may indicate hidden friction' });
            }
        });

        return issues;
    }, [habits]);

    // Removal recommendations based on habit age and completion
    const removalCandidates = useMemo(() => {
        return habits.filter(habit => {
            const daysSinceCreation = Math.floor(
                (Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
            );
            const completionRate = habit.completions.length / Math.max(daysSinceCreation, 1);
            return daysSinceCreation > 14 && completionRate < 0.3;
        });
    }, [habits]);

    const handleAddFriction = async () => {
        if (!selectedHabit || !friction) return;
        await addFrictionPoint({
            id: Date.now().toString(),
            habit: selectedHabit,
            friction: friction.trim(),
            solution: solution.trim(),
            resolved: false,
        });
        setSelectedHabit('');
        setFriction('');
        setSolution('');
        setShowAdd(false);
    };

    const handleAddIdentity = async () => {
        if (newIdentity.trim()) {
            await addIdentityStatement(newIdentity.trim());
            setNewIdentity('');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="System Optimization" />

            <ScrollView style={styles.content}>
                <View style={{ marginBottom: 20 }}>
                    <ModuleHero
                        icon="construct"
                        title="Find the friction"
                        subtitle="Make good behaviours easier. Bad behaviours harder. Engineer your environment."
                        gradient={moduleGradients.systems}
                        accent={colors.modules.systems}
                    />
                </View>
                {/* Auto-Detected Friction */}
                {detectedFriction.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔍 Detected Friction</Text>
                        {detectedFriction.map((item, i) => (
                            <View key={i} style={styles.detectedCard}>
                                <Ionicons name="warning" size={18} color="#FBBF24" />
                                <View style={styles.detectedContent}>
                                    <Text style={styles.detectedHabit}>{item.habit}</Text>
                                    <Text style={styles.detectedIssue}>{item.issue}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Removal Recommendations */}
                {removalCandidates.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🗑️ Consider Removing</Text>
                        <Text style={styles.sectionSubtitle}>Habits with &lt;30% completion after 2 weeks:</Text>
                        {removalCandidates.map((habit) => (
                            <View key={habit.id} style={styles.removalCard}>
                                <Text style={styles.removalName}>{habit.name}</Text>
                                <Text style={styles.removalReason}>Low engagement - simplify or remove</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Manual Friction Log */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Friction Points</Text>
                    {showAdd ? (
                        <View style={styles.addForm}>
                            <Text style={styles.formLabel}>Which habit?</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitPicker}>
                                {habits.map(h => (
                                    <TouchableOpacity
                                        key={h.id}
                                        style={[styles.habitChip, selectedHabit === h.name && styles.habitChipActive]}
                                        onPress={() => setSelectedHabit(h.name)}
                                    >
                                        <Text style={[styles.habitChipText, selectedHabit === h.name && styles.habitChipTextActive]}>
                                            {h.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <Text style={styles.formLabel}>What's the friction?</Text>
                            <TextInput
                                style={styles.input}
                                value={friction}
                                onChangeText={setFriction}
                                placeholder="e.g., Takes too long, not convenient..."
                                placeholderTextColor="#5E5E6A"
                            />
                            <Text style={styles.formLabel}>Possible solution?</Text>
                            <TextInput
                                style={styles.input}
                                value={solution}
                                onChangeText={setSolution}
                                placeholder="How could you reduce this friction?"
                                placeholderTextColor="#5E5E6A"
                            />
                            <View style={styles.formButtons}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={handleAddFriction}>
                                    <Text style={styles.saveText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(true)}>
                            <Ionicons name="add-circle" size={22} color="#6366F1" />
                            <Text style={styles.addButtonText}>Log Friction Point</Text>
                        </TouchableOpacity>
                    )}

                    {frictionPoints.map((point) => (
                        <View key={point.id} style={styles.frictionCard}>
                            <Text style={styles.frictionHabit}>{point.habit}</Text>
                            <Text style={styles.frictionText}>{point.friction}</Text>
                            {point.solution && (
                                <View style={styles.solutionRow}>
                                    <Ionicons name="bulb" size={14} color="#34D399" />
                                    <Text style={styles.solutionText}>{point.solution}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Simplification Rules */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Auto-Simplification</Text>
                    {SIMPLIFICATION_RULES.map((rule, i) => (
                        <View key={i} style={styles.ruleCard}>
                            <Text style={styles.ruleName}>{rule.rule}</Text>
                            <Text style={styles.ruleDesc}>{rule.desc}</Text>
                        </View>
                    ))}
                </View>

                {/* Identity-Based Habits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Identity Statements</Text>
                    <Text style={styles.sectionSubtitle}>Define who you are becoming:</Text>

                    {IDENTITY_PROMPTS.map((prompt, i) => (
                        <View key={i} style={styles.promptCard}>
                            <Text style={styles.promptText}>{prompt.identity}</Text>
                            <Text style={styles.promptExamples}>e.g., {prompt.examples.join(', ')}</Text>
                        </View>
                    ))}

                    <View style={styles.identityInput}>
                        <TextInput
                            style={styles.identityField}
                            value={newIdentity}
                            onChangeText={setNewIdentity}
                            placeholder="I am someone who..."
                            placeholderTextColor="#5E5E6A"
                        />
                        <TouchableOpacity style={styles.addIdentityBtn} onPress={handleAddIdentity}>
                            <Ionicons name="add" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {identityStatements.map((id, i) => (
                        <View key={i} style={styles.identityCard}>
                            <Ionicons name="person" size={16} color="#6366F1" />
                            <Text style={styles.identityText}>{id}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#06060B' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F5F5F7' },
    content: { flex: 1, paddingHorizontal: 20 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F5F5F7', marginBottom: 8 },
    sectionSubtitle: { fontSize: 13, color: '#9494A0', marginBottom: 12 },
    detectedCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FBBF2420', borderRadius: 10, padding: 14, marginBottom: 8, gap: 10 },
    detectedContent: { flex: 1 },
    detectedHabit: { fontSize: 14, fontWeight: '600', color: '#F5F5F7' },
    detectedIssue: { fontSize: 12, color: '#C4C4CC', marginTop: 2 },
    removalCard: { backgroundColor: '#F8717120', borderRadius: 10, padding: 14, marginBottom: 8 },
    removalName: { fontSize: 14, fontWeight: '600', color: '#F87171' },
    removalReason: { fontSize: 12, color: '#C4C4CC', marginTop: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#11111C', borderRadius: 10, padding: 14, gap: 10, marginBottom: 12, borderWidth: 2, borderColor: '#6366F140', borderStyle: 'dashed' },
    addButtonText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
    addForm: { backgroundColor: '#11111C', borderRadius: 12, padding: 16, marginBottom: 12 },
    formLabel: { fontSize: 13, color: '#9494A0', marginBottom: 8 },
    habitPicker: { marginBottom: 12 },
    habitChip: { backgroundColor: '#1F1F2C', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
    habitChipActive: { backgroundColor: '#6366F1' },
    habitChipText: { fontSize: 13, color: '#9494A0' },
    habitChipTextActive: { color: '#FFF' },
    input: { backgroundColor: '#1F1F2C', borderRadius: 8, padding: 12, fontSize: 14, color: '#F5F5F7', marginBottom: 12 },
    formButtons: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, backgroundColor: '#1F1F2C', borderRadius: 8, padding: 12, alignItems: 'center' },
    cancelText: { color: '#9494A0', fontWeight: '500' },
    saveBtn: { flex: 2, backgroundColor: '#6366F1', borderRadius: 8, padding: 12, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: '600' },
    frictionCard: { backgroundColor: '#11111C', borderRadius: 10, padding: 14, marginBottom: 8 },
    frictionHabit: { fontSize: 14, fontWeight: '600', color: '#6366F1', marginBottom: 4 },
    frictionText: { fontSize: 14, color: '#C4C4CC' },
    solutionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, backgroundColor: '#34D39910', padding: 10, borderRadius: 8 },
    solutionText: { flex: 1, fontSize: 13, color: '#34D399' },
    ruleCard: { backgroundColor: '#11111C', borderRadius: 10, padding: 14, marginBottom: 8 },
    ruleName: { fontSize: 14, fontWeight: '600', color: '#F5F5F7' },
    ruleDesc: { fontSize: 12, color: '#9494A0', marginTop: 4 },
    promptCard: { backgroundColor: '#11111C', borderRadius: 10, padding: 12, marginBottom: 8 },
    promptText: { fontSize: 14, fontWeight: '500', color: '#F5F5F7' },
    promptExamples: { fontSize: 12, color: '#5E5E6A', marginTop: 4, fontStyle: 'italic' },
    identityInput: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    identityField: { flex: 1, backgroundColor: '#1F1F2C', borderRadius: 8, padding: 12, fontSize: 14, color: '#F5F5F7' },
    addIdentityBtn: { width: 44, backgroundColor: '#6366F1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    identityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366F120', borderRadius: 8, padding: 12, marginBottom: 8, gap: 10 },
    identityText: { flex: 1, fontSize: 14, color: '#C4C4CC' },
});
