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
import { format, subDays } from 'date-fns';

interface DistractionEntry {
    id: string;
    type: string;
    trigger: string;
    time: string;
    severity: 1 | 2 | 3;
}

const DISTRACTION_TYPES = [
    { id: 'phone', label: 'Phone', icon: 'phone-portrait' },
    { id: 'social', label: 'Social Media', icon: 'logo-instagram' },
    { id: 'people', label: 'People', icon: 'people' },
    { id: 'thoughts', label: 'Thoughts', icon: 'cloud' },
    { id: 'environment', label: 'Environment', icon: 'volume-high' },
    { id: 'fatigue', label: 'Fatigue', icon: 'battery-dead' },
];

export default function DistractionScreen() {
    const router = useRouter();
    const { focusBlocks } = useUserStore();
    const [entries, setEntries] = useState<DistractionEntry[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [trigger, setTrigger] = useState('');
    const [severity, setSeverity] = useState<1 | 2 | 3>(2);

    // Analyze focus blocks for distraction patterns
    const analytics = useMemo(() => {
        const totalDistractions = focusBlocks.reduce((acc, fb) => acc + fb.distractions, 0);
        const totalSessions = focusBlocks.length;
        const avgDistractions = totalSessions > 0 ? (totalDistractions / totalSessions).toFixed(1) : '0';

        // Count by type
        const typeCounts = entries.reduce((acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topDistraction = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0];

        return {
            totalDistractions,
            avgPerSession: avgDistractions,
            topType: topDistraction?.[0] || null,
            topCount: topDistraction?.[1] || 0,
        };
    }, [focusBlocks, entries]);

    const handleAddEntry = () => {
        if (!selectedType) return;

        const newEntry: DistractionEntry = {
            id: Date.now().toString(),
            type: selectedType,
            trigger: trigger.trim(),
            time: new Date().toISOString(),
            severity,
        };

        setEntries([newEntry, ...entries]);
        setSelectedType('');
        setTrigger('');
        setSeverity(2);
        setShowAdd(false);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Distraction Diagnostics</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{analytics.avgPerSession}</Text>
                        <Text style={styles.statLabel}>Avg/Session</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{analytics.totalDistractions}</Text>
                        <Text style={styles.statLabel}>Total Logged</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{entries.length}</Text>
                        <Text style={styles.statLabel}>Analyzed</Text>
                    </View>
                </View>

                {/* Top Pattern */}
                {analytics.topType && (
                    <View style={styles.patternCard}>
                        <Ionicons name="analytics" size={20} color="#F59E0B" />
                        <Text style={styles.patternText}>
                            Top distraction: <Text style={styles.patternHighlight}>{analytics.topType}</Text> ({analytics.topCount} times)
                        </Text>
                    </View>
                )}

                {/* Log Entry */}
                {showAdd ? (
                    <View style={styles.addForm}>
                        <Text style={styles.formLabel}>What distracted you?</Text>
                        <View style={styles.typeGrid}>
                            {DISTRACTION_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[styles.typeBtn, selectedType === type.id && styles.typeBtnActive]}
                                    onPress={() => setSelectedType(type.id)}
                                >
                                    <Ionicons
                                        name={type.icon as any}
                                        size={20}
                                        color={selectedType === type.id ? '#FFF' : '#9CA3AF'}
                                    />
                                    <Text style={[styles.typeLabel, selectedType === type.id && styles.typeLabelActive]}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.formLabel}>What triggered it? (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={trigger}
                            onChangeText={setTrigger}
                            placeholder="e.g., notification, boredom, habit..."
                            placeholderTextColor="#6B7280"
                        />

                        <Text style={styles.formLabel}>Severity</Text>
                        <View style={styles.severityRow}>
                            {[1, 2, 3].map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.severityBtn, severity === s && styles.severityBtnActive]}
                                    onPress={() => setSeverity(s as 1 | 2 | 3)}
                                >
                                    <Text style={[styles.severityText, severity === s && styles.severityTextActive]}>
                                        {s === 1 ? 'Minor' : s === 2 ? 'Moderate' : 'Major'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.formButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.saveBtn, !selectedType && styles.saveBtnDisabled]}
                                onPress={handleAddEntry}
                                disabled={!selectedType}
                            >
                                <Text style={styles.saveText}>Log Distraction</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.addButton} onPress={() => setShowAdd(true)}>
                        <Ionicons name="add-circle" size={24} color="#F59E0B" />
                        <Text style={styles.addButtonText}>Log a Distraction</Text>
                    </TouchableOpacity>
                )}

                {/* Recent Entries */}
                {entries.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Entries</Text>
                        {entries.slice(0, 10).map((entry) => {
                            const typeInfo = DISTRACTION_TYPES.find(t => t.id === entry.type);
                            return (
                                <View key={entry.id} style={styles.entryCard}>
                                    <View style={styles.entryIcon}>
                                        <Ionicons name={typeInfo?.icon as any || 'alert'} size={18} color="#F59E0B" />
                                    </View>
                                    <View style={styles.entryContent}>
                                        <Text style={styles.entryType}>{typeInfo?.label || entry.type}</Text>
                                        {entry.trigger && (
                                            <Text style={styles.entryTrigger}>{entry.trigger}</Text>
                                        )}
                                    </View>
                                    <View style={[styles.severityBadge, {
                                        backgroundColor: entry.severity === 3 ? '#EF444420' : entry.severity === 2 ? '#F59E0B20' : '#10B98120'
                                    }]}>
                                        <Text style={[styles.severityBadgeText, {
                                            color: entry.severity === 3 ? '#EF4444' : entry.severity === 2 ? '#F59E0B' : '#10B981'
                                        }]}>
                                            {entry.severity === 3 ? 'Major' : entry.severity === 2 ? 'Mod' : 'Minor'}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Strategies */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reduction Strategies</Text>
                    <View style={styles.strategyCard}>
                        <View style={styles.strategyItem}>
                            <Ionicons name="phone-portrait-outline" size={18} color="#8B5CF6" />
                            <Text style={styles.strategyText}>Phone in another room during focus blocks</Text>
                        </View>
                        <View style={styles.strategyItem}>
                            <Ionicons name="notifications-off" size={18} color="#8B5CF6" />
                            <Text style={styles.strategyText}>Disable notifications during deep work</Text>
                        </View>
                        <View style={styles.strategyItem}>
                            <Ionicons name="time" size={18} color="#8B5CF6" />
                            <Text style={styles.strategyText}>Use the 2-minute rule: note it, continue</Text>
                        </View>
                        <View style={styles.strategyItem}>
                            <Ionicons name="cafe" size={18} color="#8B5CF6" />
                            <Text style={styles.strategyText}>Scheduled breaks prevent fatigue-based distractions</Text>
                        </View>
                    </View>
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
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: '#1F2937', borderRadius: 12, padding: 16, alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '700', color: '#F9FAFB' },
    statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    patternCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B20', borderRadius: 10, padding: 14, gap: 12, marginBottom: 20 },
    patternText: { flex: 1, fontSize: 14, color: '#D1D5DB' },
    patternHighlight: { color: '#F59E0B', fontWeight: '600' },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', borderRadius: 12, padding: 18, gap: 12, marginBottom: 20, borderWidth: 2, borderColor: '#F59E0B40', borderStyle: 'dashed' },
    addButtonText: { fontSize: 16, fontWeight: '600', color: '#F59E0B' },
    addForm: { backgroundColor: '#1F2937', borderRadius: 12, padding: 18, marginBottom: 20 },
    formLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 10 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    typeBtn: { width: '31%', backgroundColor: '#374151', borderRadius: 10, padding: 12, alignItems: 'center', gap: 6 },
    typeBtnActive: { backgroundColor: '#F59E0B' },
    typeLabel: { fontSize: 11, color: '#9CA3AF' },
    typeLabelActive: { color: '#FFF' },
    input: { backgroundColor: '#374151', borderRadius: 8, padding: 14, fontSize: 15, color: '#F9FAFB', marginBottom: 16 },
    severityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    severityBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 12, alignItems: 'center' },
    severityBtnActive: { backgroundColor: '#F59E0B' },
    severityText: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
    severityTextActive: { color: '#FFF' },
    formButtons: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: '#374151', borderRadius: 8, padding: 14, alignItems: 'center' },
    cancelText: { color: '#9CA3AF', fontWeight: '500' },
    saveBtn: { flex: 2, backgroundColor: '#F59E0B', borderRadius: 8, padding: 14, alignItems: 'center' },
    saveBtnDisabled: { backgroundColor: '#374151' },
    saveText: { color: '#FFF', fontWeight: '600' },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F9FAFB', marginBottom: 12 },
    entryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 10, padding: 14, marginBottom: 8 },
    entryIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F59E0B20', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    entryContent: { flex: 1 },
    entryType: { fontSize: 15, fontWeight: '500', color: '#F9FAFB' },
    entryTrigger: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
    severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    severityBadgeText: { fontSize: 11, fontWeight: '600' },
    strategyCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16 },
    strategyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    strategyText: { flex: 1, fontSize: 14, color: '#D1D5DB' },
});
