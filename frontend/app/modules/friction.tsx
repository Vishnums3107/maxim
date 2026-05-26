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

interface FrictionPoint {
    id: string;
    habit: string;
    friction: string;
    solution: string;
    resolved: boolean;
}

const IDENTITY_PROMPTS = [
    { identity: 'I am someone who...', examples: ['shows up consistently', 'prioritizes recovery', 'learns every day'] },
    { identity: 'I don\'t...', examples: ['skip workouts', 'make excuses', 'negotiate with my commitments'] },
    { identity: 'When faced with resistance, I...', examples: ['do it anyway', 'start with 2 minutes', 'remember my why'] },
];

const SIMPLIFICATION_RULES = [
    { rule: 'Two-Minute Start', desc: 'If overwhelmed, commit to just 2 minutes' },
    { rule: 'Remove Decisions', desc: 'Pre-plan to eliminate daily choices' },
    { rule: 'Environment Design', desc: 'Make the right action the easy action' },
    { rule: 'Habit Stacking', desc: 'Link new habits to existing routines' },
    { rule: 'One Focus', desc: 'Build one habit before adding another' },
];

export default function FrictionScreen() {
    const router = useRouter();
    const { habits } = useUserStore();
    const [frictionPoints, setFrictionPoints] = useState<FrictionPoint[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [friction, setFriction] = useState('');
    const [solution, setSolution] = useState('');
    const [identities, setIdentities] = useState<string[]>([]);
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

    const handleAddFriction = () => {
        if (!selectedHabit || !friction) return;
        const point: FrictionPoint = {
            id: Date.now().toString(),
            habit: selectedHabit,
            friction: friction.trim(),
            solution: solution.trim(),
            resolved: false,
        };
        setFrictionPoints([point, ...frictionPoints]);
        setSelectedHabit('');
        setFriction('');
        setSolution('');
        setShowAdd(false);
    };

    const addIdentity = () => {
        if (newIdentity.trim()) {
            setIdentities([...identities, newIdentity.trim()]);
            setNewIdentity('');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>System Optimization</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Auto-Detected Friction */}
                {detectedFriction.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔍 Detected Friction</Text>
                        {detectedFriction.map((item, i) => (
                            <View key={i} style={styles.detectedCard}>
                                <Ionicons name="warning" size={18} color="#F59E0B" />
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
                                placeholderTextColor="#6B7280"
                            />
                            <Text style={styles.formLabel}>Possible solution?</Text>
                            <TextInput
                                style={styles.input}
                                value={solution}
                                onChangeText={setSolution}
                                placeholder="How could you reduce this friction?"
                                placeholderTextColor="#6B7280"
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
                                    <Ionicons name="bulb" size={14} color="#10B981" />
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
                            placeholderTextColor="#6B7280"
                        />
                        <TouchableOpacity style={styles.addIdentityBtn} onPress={addIdentity}>
                            <Ionicons name="add" size={22} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {identities.map((id, i) => (
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
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F9FAFB' },
    content: { flex: 1, paddingHorizontal: 20 },
    section: { marginBottom: 28 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F9FAFB', marginBottom: 8 },
    sectionSubtitle: { fontSize: 13, color: '#9CA3AF', marginBottom: 12 },
    detectedCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#F59E0B20', borderRadius: 10, padding: 14, marginBottom: 8, gap: 10 },
    detectedContent: { flex: 1 },
    detectedHabit: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
    detectedIssue: { fontSize: 12, color: '#D1D5DB', marginTop: 2 },
    removalCard: { backgroundColor: '#EF444420', borderRadius: 10, padding: 14, marginBottom: 8 },
    removalName: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    removalReason: { fontSize: 12, color: '#D1D5DB', marginTop: 4 },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', borderRadius: 10, padding: 14, gap: 10, marginBottom: 12, borderWidth: 2, borderColor: '#6366F140', borderStyle: 'dashed' },
    addButtonText: { fontSize: 14, fontWeight: '600', color: '#6366F1' },
    addForm: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 12 },
    formLabel: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
    habitPicker: { marginBottom: 12 },
    habitChip: { backgroundColor: '#374151', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
    habitChipActive: { backgroundColor: '#6366F1' },
    habitChipText: { fontSize: 13, color: '#9CA3AF' },
    habitChipTextActive: { color: '#FFF' },
    input: { backgroundColor: '#374151', borderRadius: 8, padding: 12, fontSize: 14, color: '#F9FAFB', marginBottom: 12 },
    formButtons: { flexDirection: 'row', gap: 10 },
    cancelBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 12, alignItems: 'center' },
    cancelText: { color: '#9CA3AF', fontWeight: '500' },
    saveBtn: { flex: 2, backgroundColor: '#6366F1', borderRadius: 8, padding: 12, alignItems: 'center' },
    saveText: { color: '#FFF', fontWeight: '600' },
    frictionCard: { backgroundColor: '#1F2937', borderRadius: 10, padding: 14, marginBottom: 8 },
    frictionHabit: { fontSize: 14, fontWeight: '600', color: '#6366F1', marginBottom: 4 },
    frictionText: { fontSize: 14, color: '#D1D5DB' },
    solutionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, backgroundColor: '#10B98110', padding: 10, borderRadius: 8 },
    solutionText: { flex: 1, fontSize: 13, color: '#10B981' },
    ruleCard: { backgroundColor: '#1F2937', borderRadius: 10, padding: 14, marginBottom: 8 },
    ruleName: { fontSize: 14, fontWeight: '600', color: '#F9FAFB' },
    ruleDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    promptCard: { backgroundColor: '#1F2937', borderRadius: 10, padding: 12, marginBottom: 8 },
    promptText: { fontSize: 14, fontWeight: '500', color: '#F9FAFB' },
    promptExamples: { fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
    identityInput: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    identityField: { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 12, fontSize: 14, color: '#F9FAFB' },
    addIdentityBtn: { width: 44, backgroundColor: '#6366F1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    identityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366F120', borderRadius: 8, padding: 12, marginBottom: 8, gap: 10 },
    identityText: { flex: 1, fontSize: 14, color: '#D1D5DB' },
});
