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
import { format, subDays } from 'date-fns';

const QUALITY_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function SleepScreen() {
    const router = useRouter();
    const { profile, updateProfile, dailyEntries, addDailyEntry, updateDailyEntry } = useUserStore();

    const [hours, setHours] = useState('7');
    const [quality, setQuality] = useState(3);
    const [saved, setSaved] = useState(false);

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEntry = dailyEntries.find(e => e.date === today);

    // Get last 7 days of sleep data
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
        const entry = dailyEntries.find(e => e.date === date);
        return {
            date,
            day: format(subDays(new Date(), 6 - i), 'EEE'),
            hours: entry?.sleepHours,
            quality: entry?.sleepQuality,
        };
    });

    const avgHours = last7Days.filter(d => d.hours).length > 0
        ? (last7Days.reduce((acc, d) => acc + (d.hours || 0), 0) / last7Days.filter(d => d.hours).length).toFixed(1)
        : null;

    const handleSave = async () => {
        const sleepHours = parseFloat(hours) || 7;

        if (todayEntry) {
            await updateDailyEntry(today, {
                sleepHours,
                sleepQuality: quality,
            });
        } else {
            await addDailyEntry({
                id: Date.now().toString(),
                date: today,
                morningEnergy: 5,
                sleepHours,
                sleepQuality: quality,
            });
        }

        // Update profile baseline
        await updateProfile({
            sleepQuality: quality * 2, // Convert 1-5 to 2-10 scale
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
                </TouchableOpacity>
                <Text style={styles.title}>Sleep Tracking</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Hero */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="moon" size={40} color="#6366F1" />
                    </View>
                    <Text style={styles.heroTitle}>Sleep is Recovery</Text>
                    <Text style={styles.heroSubtitle}>
                        Quality sleep enhances all other performance systems
                    </Text>
                </View>

                {/* Log Today */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Log Last Night's Sleep</Text>

                    <View style={styles.inputCard}>
                        <View style={styles.hoursRow}>
                            <Text style={styles.inputLabel}>Hours Slept</Text>
                            <View style={styles.hoursInput}>
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => setHours(String(Math.max(0, parseFloat(hours) - 0.5)))}
                                >
                                    <Ionicons name="remove" size={20} color="#F9FAFB" />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.hoursText}
                                    value={hours}
                                    onChangeText={setHours}
                                    keyboardType="decimal-pad"
                                />
                                <TouchableOpacity
                                    style={styles.hourButton}
                                    onPress={() => setHours(String(Math.min(12, parseFloat(hours) + 0.5)))}
                                >
                                    <Ionicons name="add" size={20} color="#F9FAFB" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.qualityRow}>
                            <Text style={styles.inputLabel}>Sleep Quality</Text>
                            <View style={styles.qualityButtons}>
                                {QUALITY_LABELS.map((label, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.qualityButton,
                                            quality === index + 1 && styles.qualityButtonActive,
                                        ]}
                                        onPress={() => setQuality(index + 1)}
                                    >
                                        <Text
                                            style={[
                                                styles.qualityButtonText,
                                                quality === index + 1 && styles.qualityButtonTextActive,
                                            ]}
                                        >
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            {saved ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                                    <Text style={styles.saveButtonText}>Saved!</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="save" size={20} color="#FFF" />
                                    <Text style={styles.saveButtonText}>Save Sleep Log</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Weekly Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>This Week</Text>

                    <View style={styles.weekCard}>
                        {avgHours && (
                            <View style={styles.avgRow}>
                                <Text style={styles.avgLabel}>Average</Text>
                                <Text style={styles.avgValue}>{avgHours} hrs/night</Text>
                            </View>
                        )}

                        <View style={styles.daysRow}>
                            {last7Days.map((day, index) => (
                                <View key={index} style={styles.dayColumn}>
                                    <View
                                        style={[
                                            styles.dayBar,
                                            {
                                                height: day.hours ? Math.max(20, (day.hours / 10) * 80) : 20,
                                                backgroundColor: day.hours
                                                    ? day.quality && day.quality >= 3 ? '#10B981' : '#F59E0B'
                                                    : '#374151',
                                            },
                                        ]}
                                    >
                                        {day.hours && (
                                            <Text style={styles.dayHours}>{day.hours}</Text>
                                        )}
                                    </View>
                                    <Text style={styles.dayLabel}>{day.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Tips */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sleep Optimization</Text>
                    <View style={styles.tipsCard}>
                        <View style={styles.tipItem}>
                            <Ionicons name="time" size={20} color="#6366F1" />
                            <Text style={styles.tipText}>Consistent wake time beats consistent bedtime</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="phone-portrait" size={20} color="#6366F1" />
                            <Text style={styles.tipText}>No screens 1 hour before bed</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="thermometer" size={20} color="#6366F1" />
                            <Text style={styles.tipText}>Cool room (65-68°F / 18-20°C)</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <Ionicons name="sunny" size={20} color="#6366F1" />
                            <Text style={styles.tipText}>Morning sunlight within 30 minutes of waking</Text>
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
        paddingVertical: 24,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#6366F120',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#F9FAFB',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
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
    inputCard: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 20,
    },
    hoursRow: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#9CA3AF',
        marginBottom: 12,
    },
    hoursInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    hourButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hoursText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#F9FAFB',
        textAlign: 'center',
        minWidth: 80,
    },
    qualityRow: {
        marginBottom: 20,
    },
    qualityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    qualityButton: {
        flex: 1,
        backgroundColor: '#374151',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    qualityButtonActive: {
        backgroundColor: '#6366F1',
    },
    qualityButtonText: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    qualityButtonTextActive: {
        color: '#FFF',
    },
    saveButton: {
        flexDirection: 'row',
        backgroundColor: '#6366F1',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    weekCard: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 20,
    },
    avgRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    avgLabel: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    avgValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#F9FAFB',
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    dayColumn: {
        alignItems: 'center',
        flex: 1,
    },
    dayBar: {
        width: 28,
        borderRadius: 6,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 4,
    },
    dayHours: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFF',
    },
    dayLabel: {
        fontSize: 11,
        color: '#6B7280',
    },
    tipsCard: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
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
