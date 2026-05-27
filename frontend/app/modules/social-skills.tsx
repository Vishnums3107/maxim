import React, { useState, useMemo } from 'react';
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

const SPEAKING_DRILLS = [
    { id: 'pace', name: 'Slow Down', desc: 'Speak 20% slower than feels natural', icon: 'speedometer-outline', duration: '2 min' },
    { id: 'pause', name: 'Power Pause', desc: 'Insert 2-sec pauses before key points', icon: 'pause-outline', duration: '3 min' },
    { id: 'breath', name: 'Breath Support', desc: 'Speak only on exhale, full breaths', icon: 'cloud-outline', duration: '2 min' },
    { id: 'clarity', name: 'Articulation', desc: 'Over-pronounce consonants', icon: 'text-outline', duration: '2 min' },
    { id: 'volume', name: 'Projection', desc: 'Practice speaking to fill the room', icon: 'volume-high-outline', duration: '2 min' },
];
import { ScreenChrome } from '../../src/components/ScreenChrome';

const RESPONSE_DELAYS = [
    { level: 1, delay: '1 second', desc: 'Brief acknowledgment pause' },
    { level: 2, delay: '2 seconds', desc: 'Thoughtful consideration' },
    { level: 3, delay: '3 seconds', desc: 'Deliberate response' },
    { level: 4, delay: '5 seconds', desc: 'Deep reflection before speaking' },
];

const BOUNDARY_SCRIPTS = [
    { situation: 'Declining an invitation', response: '"Thanks for thinking of me, but I can\'t commit to that right now."' },
    { situation: 'Ending a conversation', response: '"I need to get going, but it was great talking with you."' },
    { situation: 'Requests that overload you', response: '"I appreciate you asking, but I\'m at capacity right now."' },
    { situation: 'Protecting your time', response: '"I have a hard stop at [time]. Let\'s prioritize what\'s most important."' },
    { situation: 'Saying no without explaining', response: '"That doesn\'t work for me." (No justification needed)' },
];

export default function SocialSkillsScreen() {
    const router = useRouter();
    const { profile, socialPracticeLog, addSocialPractice, socialResponseDelay, setSocialResponseDelay } = useUserStore();
    const [activeTab, setActiveTab] = useState<'speaking' | 'response' | 'boundaries'>('speaking');

    const confidenceTrend = useMemo(() => {
        const baseline = profile?.socialConfidence || 5;
        const practiced = socialPracticeLog.length;
        const improvement = Math.min(practiced * 0.2, 2);
        return {
            current: Math.min(10, baseline + improvement).toFixed(1),
            baseline,
            delta: improvement > 0 ? `+${improvement.toFixed(1)}` : '0',
            sessions: practiced,
        };
    }, [profile, socialPracticeLog]);

    const logPractice = (drillId: string) => {
        addSocialPractice(drillId);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenChrome title="Social Skills" />

            {/* Confidence Trend */}
            <View style={styles.trendCard}>
                <View style={styles.trendRing}>
                    <Text style={styles.trendValue}>{confidenceTrend.current}</Text>
                </View>
                <View style={styles.trendInfo}>
                    <Text style={styles.trendLabel}>Confidence Level</Text>
                    <Text style={styles.trendDelta}>
                        {confidenceTrend.delta} from baseline ({confidenceTrend.baseline})
                    </Text>
                    <Text style={styles.trendMeta}>{confidenceTrend.sessions} practice sessions</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'speaking' && styles.tabActive]}
                    onPress={() => setActiveTab('speaking')}
                >
                    <Text style={[styles.tabText, activeTab === 'speaking' && styles.tabTextActive]}>Speaking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'response' && styles.tabActive]}
                    onPress={() => setActiveTab('response')}
                >
                    <Text style={[styles.tabText, activeTab === 'response' && styles.tabTextActive]}>Response</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'boundaries' && styles.tabActive]}
                    onPress={() => setActiveTab('boundaries')}
                >
                    <Text style={[styles.tabText, activeTab === 'boundaries' && styles.tabTextActive]}>Boundaries</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {activeTab === 'speaking' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Speaking Clarity Drills</Text>
                        {SPEAKING_DRILLS.map((drill) => (
                            <TouchableOpacity
                                key={drill.id}
                                style={styles.drillCard}
                                onPress={() => logPractice(drill.id)}
                            >
                                <View style={styles.drillIcon}>
                                    <Ionicons name={drill.icon as any} size={22} color="#EC4899" />
                                </View>
                                <View style={styles.drillContent}>
                                    <Text style={styles.drillName}>{drill.name}</Text>
                                    <Text style={styles.drillDesc}>{drill.desc}</Text>
                                </View>
                                <Text style={styles.drillDuration}>{drill.duration}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {activeTab === 'response' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Response Delay Training</Text>
                        <Text style={styles.sectionSubtitle}>
                            Train yourself to pause before responding. Select your current practice level:
                        </Text>
                        {RESPONSE_DELAYS.map((item) => (
                            <TouchableOpacity
                                key={item.level}
                                style={[styles.delayCard, socialResponseDelay === item.level && styles.delayCardActive]}
                                onPress={() => setSocialResponseDelay(item.level)}
                            >
                                <View style={[styles.delayLevel, socialResponseDelay === item.level && styles.delayLevelActive]}>
                                    <Text style={[styles.delayNum, socialResponseDelay === item.level && styles.delayNumActive]}>
                                        {item.level}
                                    </Text>
                                </View>
                                <View style={styles.delayContent}>
                                    <Text style={styles.delayTime}>{item.delay}</Text>
                                    <Text style={styles.delayDesc}>{item.desc}</Text>
                                </View>
                                {socialResponseDelay === item.level && (
                                    <Ionicons name="checkmark-circle" size={22} color="#EC4899" />
                                )}
                            </TouchableOpacity>
                        ))}
                        <View style={styles.tipCard}>
                            <Ionicons name="bulb" size={18} color="#FBBF24" />
                            <Text style={styles.tipText}>
                                Practice: In your next conversation, count to {socialResponseDelay} before responding.
                            </Text>
                        </View>
                    </View>
                )}

                {activeTab === 'boundaries' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Boundary Scripts</Text>
                        <Text style={styles.sectionSubtitle}>
                            Pre-made responses for common situations:
                        </Text>
                        {BOUNDARY_SCRIPTS.map((script, i) => (
                            <View key={i} style={styles.scriptCard}>
                                <Text style={styles.scriptSituation}>{script.situation}</Text>
                                <View style={styles.scriptResponse}>
                                    <Ionicons name="chatbubble-outline" size={16} color="#34D399" />
                                    <Text style={styles.scriptText}>{script.response}</Text>
                                </View>
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
    container: { flex: 1, backgroundColor: '#06060B' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
    title: { fontSize: 18, fontWeight: '600', color: '#F5F5F7' },
    trendCard: { flexDirection: 'row', backgroundColor: '#11111C', marginHorizontal: 20, borderRadius: 14, padding: 16, marginBottom: 16, alignItems: 'center' },
    trendRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#EC4899', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    trendValue: { fontSize: 22, fontWeight: '700', color: '#EC4899' },
    trendInfo: { flex: 1 },
    trendLabel: { fontSize: 15, fontWeight: '600', color: '#F5F5F7' },
    trendDelta: { fontSize: 13, color: '#34D399', marginTop: 2 },
    trendMeta: { fontSize: 11, color: '#9494A0', marginTop: 2 },
    tabs: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 8 },
    tab: { flex: 1, backgroundColor: '#11111C', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    tabActive: { backgroundColor: '#EC4899' },
    tabText: { fontSize: 13, fontWeight: '600', color: '#9494A0' },
    tabTextActive: { color: '#FFF' },
    content: { flex: 1, paddingHorizontal: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#F5F5F7', marginBottom: 8 },
    sectionSubtitle: { fontSize: 13, color: '#9494A0', marginBottom: 16 },
    drillCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11111C', borderRadius: 12, padding: 14, marginBottom: 8 },
    drillIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EC489920', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    drillContent: { flex: 1 },
    drillName: { fontSize: 15, fontWeight: '600', color: '#F5F5F7' },
    drillDesc: { fontSize: 12, color: '#9494A0', marginTop: 2 },
    drillDuration: { fontSize: 12, color: '#5E5E6A' },
    delayCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#11111C', borderRadius: 12, padding: 14, marginBottom: 8 },
    delayCardActive: { borderWidth: 2, borderColor: '#EC4899' },
    delayLevel: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F1F2C', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    delayLevelActive: { backgroundColor: '#EC4899' },
    delayNum: { fontSize: 16, fontWeight: '700', color: '#9494A0' },
    delayNumActive: { color: '#FFF' },
    delayContent: { flex: 1 },
    delayTime: { fontSize: 15, fontWeight: '600', color: '#F5F5F7' },
    delayDesc: { fontSize: 12, color: '#9494A0', marginTop: 2 },
    tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FBBF2420', borderRadius: 10, padding: 14, marginTop: 8, gap: 10 },
    tipText: { flex: 1, fontSize: 14, color: '#C4C4CC' },
    scriptCard: { backgroundColor: '#11111C', borderRadius: 12, padding: 14, marginBottom: 10 },
    scriptSituation: { fontSize: 14, fontWeight: '600', color: '#F5F5F7', marginBottom: 10 },
    scriptResponse: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#34D39910', borderRadius: 8, padding: 12 },
    scriptText: { flex: 1, fontSize: 13, color: '#C4C4CC', fontStyle: 'italic', lineHeight: 20 },
});
