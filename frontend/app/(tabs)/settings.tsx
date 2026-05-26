import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { testApiKey } from '../../src/services/aiService';

export default function SettingsScreen() {
    const { customApiKey, setCustomApiKey } = useUserStore();
    const [apiKeyInput, setApiKeyInput] = useState(customApiKey || '');
    const [isValidating, setIsValidating] = useState(false);
    const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');
    const [validationMessage, setValidationMessage] = useState('');
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        setApiKeyInput(customApiKey || '');
        setValidationStatus(customApiKey ? 'valid' : 'none');
    }, [customApiKey]);

    const handleTestKey = async () => {
        if (!apiKeyInput.trim()) {
            setValidationStatus('invalid');
            setValidationMessage('Please enter an API key');
            return;
        }

        setIsValidating(true);
        setValidationStatus('none');
        setValidationMessage('');

        try {
            const result = await testApiKey(apiKeyInput.trim());
            setValidationStatus(result.valid ? 'valid' : 'invalid');
            setValidationMessage(result.message);
        } catch (error: any) {
            setValidationStatus('invalid');
            setValidationMessage(error.message || 'Failed to test key');
        } finally {
            setIsValidating(false);
        }
    };

    const handleSaveKey = async () => {
        if (!apiKeyInput.trim()) {
            Alert.alert('Error', 'Please enter an API key');
            return;
        }

        if (validationStatus !== 'valid') {
            Alert.alert(
                'Key Not Validated',
                'Your API key has not been validated. Do you want to save it anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Save Anyway',
                        onPress: async () => {
                            await setCustomApiKey(apiKeyInput.trim());
                            Alert.alert('Saved', 'API key saved successfully');
                        },
                    },
                ]
            );
            return;
        }

        await setCustomApiKey(apiKeyInput.trim());
        Alert.alert('Saved', 'API key saved successfully!');
    };

    const handleRemoveKey = () => {
        Alert.alert(
            'Remove API Key',
            'Are you sure you want to remove your custom API key? The app will fall back to the default key.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await setCustomApiKey(null);
                        setApiKeyInput('');
                        setValidationStatus('none');
                        setValidationMessage('');
                        Alert.alert('Removed', 'Custom API key removed');
                    },
                },
            ]
        );
    };

    const getStatusColor = () => {
        switch (validationStatus) {
            case 'valid':
                return '#22C55E';
            case 'invalid':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusIcon = () => {
        switch (validationStatus) {
            case 'valid':
                return 'checkmark-circle';
            case 'invalid':
                return 'close-circle';
            default:
                return 'help-circle-outline';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Settings</Text>
                        <Text style={styles.subtitle}>Configure your MAXIM experience</Text>
                    </View>

                    {/* API Key Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="key-outline" size={24} color="#3B82F6" />
                            <Text style={styles.sectionTitle}>Google API Key</Text>
                        </View>

                        <Text style={styles.description}>
                            Add your own Google AI API key to avoid rate limits. Get one free at{' '}
                            <Text style={styles.link}>aistudio.google.com</Text>
                        </Text>

                        {/* Current Status */}
                        <View style={styles.statusContainer}>
                            <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {customApiKey
                                    ? 'Using your custom API key'
                                    : 'Using default key (shared quota)'}
                            </Text>
                        </View>

                        {/* API Key Input */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your Google API key"
                                placeholderTextColor="#6B7280"
                                value={apiKeyInput}
                                onChangeText={(text) => {
                                    setApiKeyInput(text);
                                    setValidationStatus('none');
                                    setValidationMessage('');
                                }}
                                secureTextEntry={!showKey}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                style={styles.eyeButton}
                                onPress={() => setShowKey(!showKey)}
                            >
                                <Ionicons
                                    name={showKey ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#6B7280"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Validation Message */}
                        {validationMessage ? (
                            <View style={styles.messageContainer}>
                                <Ionicons
                                    name={validationStatus === 'valid' ? 'checkmark-circle' : 'alert-circle'}
                                    size={16}
                                    color={getStatusColor()}
                                />
                                <Text style={[styles.messageText, { color: getStatusColor() }]}>
                                    {validationMessage}
                                </Text>
                            </View>
                        ) : null}

                        {/* Action Buttons */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.testButton]}
                                onPress={handleTestKey}
                                disabled={isValidating || !apiKeyInput.trim()}
                            >
                                {isValidating ? (
                                    <ActivityIndicator size="small" color="#3B82F6" />
                                ) : (
                                    <>
                                        <Ionicons name="flask-outline" size={18} color="#3B82F6" />
                                        <Text style={styles.testButtonText}>Test Key</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.saveButton]}
                                onPress={handleSaveKey}
                                disabled={isValidating || !apiKeyInput.trim()}
                            >
                                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.saveButtonText}>Save Key</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Remove Key Button */}
                        {customApiKey && (
                            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveKey}>
                                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                <Text style={styles.removeButtonText}>Remove Custom Key</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Why use your own key?</Text>
                                <Text style={styles.infoText}>
                                    • Avoid shared rate limits{'\n'}
                                    • No quota exhaustion from other users{'\n'}
                                    • Full control over your API usage
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#22C55E" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Your key is secure</Text>
                                <Text style={styles.infoText}>
                                    Your API key is stored locally on your device only. It never leaves your
                                    phone and is not shared with any server.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    flex: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#9CA3AF',
    },
    section: {
        backgroundColor: '#1F2937',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    description: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
        marginBottom: 16,
    },
    link: {
        color: '#3B82F6',
        textDecorationLine: 'underline',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#111827',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111827',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#374151',
        marginBottom: 12,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#FFFFFF',
    },
    eyeButton: {
        padding: 12,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    messageText: {
        fontSize: 14,
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    testButton: {
        backgroundColor: '#1F2937',
        borderWidth: 1,
        borderColor: '#3B82F6',
    },
    testButtonText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    removeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EF4444',
    },
    removeButtonText: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '500',
    },
    infoSection: {
        gap: 12,
        marginBottom: 40,
    },
    infoCard: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 16,
    },
    infoContent: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#9CA3AF',
        lineHeight: 20,
    },
});
