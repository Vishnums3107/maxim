import { GoogleGenerativeAI } from '@google/generative-ai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPTS, ModuleType } from '../constants/prompts';
import { UserProfile } from '../types';

// Storage key for custom API key (must match userStore)
const CUSTOM_API_KEY_STORAGE = '@maxim_custom_api_key';

// Get the active API key (user's custom key takes priority)
const getActiveApiKey = async (): Promise<string | null> => {
    try {
        // First check for user's custom key
        const customKey = await AsyncStorage.getItem(CUSTOM_API_KEY_STORAGE);
        if (customKey && customKey.trim()) {
            return customKey.trim();
        }
        // Fall back to environment variable (built-in key)
        return process.env.EXPO_PUBLIC_GOOGLE_API_KEY || null;
    } catch {
        return process.env.EXPO_PUBLIC_GOOGLE_API_KEY || null;
    }
};

// Helper to get model with specific API key
const getModelWithKey = (apiKey: string, systemInstruction: string) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction,
    });
};

export const generateAiResponse = async (prompt: string, module: ModuleType): Promise<string> => {
    try {
        const apiKey = await getActiveApiKey();
        if (!apiKey) {
            throw new Error("No API key available. Please add your Google API key in Settings.");
        }

        const systemPrompt = SYSTEM_PROMPTS[module] || SYSTEM_PROMPTS.systems;
        const model = getModelWithKey(apiKey, systemPrompt);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("AI Generation Error:", error);
        if (error.message?.includes('429')) return "Quota exceeded (429). Please try again later or use your own API key.";
        if (error.message?.includes('404')) return "Model not found (404).";
        if (error.message?.includes('API_KEY_INVALID')) return "Invalid API key. Please check your key in Settings.";
        return `AI Error: ${error.message || 'Unknown error'}`;
    }
};

// Function to test if an API key is valid
export const testApiKey = async (apiKey: string): Promise<{ valid: boolean; message: string }> => {
    try {
        if (!apiKey || !apiKey.trim()) {
            return { valid: false, message: 'API key cannot be empty' };
        }

        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Simple test prompt
        const result = await model.generateContent("Say 'API key is valid' in exactly those words.");
        const response = await result.response;
        const text = response.text();

        if (text) {
            return { valid: true, message: 'API key is valid!' };
        }
        return { valid: false, message: 'Unexpected response from API' };
    } catch (error: any) {
        console.error("API Key Test Error:", error);
        if (error.message?.includes('API_KEY_INVALID')) {
            return { valid: false, message: 'Invalid API key format' };
        }
        if (error.message?.includes('429')) {
            return { valid: false, message: 'Rate limit exceeded. Key may be valid but quota is exhausted.' };
        }
        if (error.message?.includes('403')) {
            return { valid: false, message: 'API key is not authorized for this model' };
        }
        return { valid: false, message: error.message || 'Unknown error testing key' };
    }
};

export const generateProtocol = async (
    profile: UserProfile,
    module: ModuleType,
    context?: string,
    recentData?: any
) => {
    const prompt = `Generate a personalized ${module} protocol for this user:

Profile:
- Level: ${profile.level}
- Energy: ${profile.energyLevel}/10
- Sleep Quality: ${profile.sleepQuality}/10
- Attention: ${profile.attentionStability}/10
- Anxiety Tendency: ${profile.anxietyTendency}/10
- Activity Level: ${profile.physicalActivity}
- Daily Time Available: ${profile.dailyTimeAvailable} minutes
- Social Confidence: ${profile.socialConfidence}/10

${context ? `Additional Context: ${context}` : ''}
${recentData ? `Recent Data: ${JSON.stringify(recentData)}` : ''}

Provide:
1. Today's recommended protocol (specific actions)
2. Key focus area
3. Warning signs to watch for
4. Adjustment recommendations based on their current state

Keep response concise and actionable.`;

    const response = await generateAiResponse(prompt, module);

    return {
        module,
        protocol: response,
        generated_at: new Date().toISOString(),
        session_id: `local-${Date.now()}`
    };
};

export const chatWithCoach = async (
    message: string,
    profile: UserProfile,
    module: ModuleType,
    sessionId: string
) => {
    const prompt = `User Profile Context:
- Level: ${profile.level}
- Energy: ${profile.energyLevel}/10
- Current State: ${profile.physicalActivity} activity

User Message: ${message}

Respond as their ${module} coach. Be direct, helpful, and specific.`;

    const response = await generateAiResponse(prompt, module);

    return {
        response,
        module,
        timestamp: new Date().toISOString()
    };
};

export const generateDailyBriefing = async (profile: UserProfile) => {
    const prompt = `Generate a concise daily briefing for this user:

Profile:
- Level: ${profile.level}
- Energy: ${profile.energyLevel}/10
- Sleep: ${profile.sleepQuality}/10
- Attention: ${profile.attentionStability}/10
- Anxiety: ${profile.anxietyTendency}/10
- Time Available: ${profile.dailyTimeAvailable} minutes

Provide ONE action item for each domain:
1. PHYSICAL: One movement/exercise action
2. COGNITIVE: One focus/learning action
3. REGULATION: One mental/emotional action
4. SOCIAL: One optional social action
5. SYSTEM: One habit/routine check

Format as a clean checklist. Be specific and realistic for their time/energy.`;

    const response = await generateAiResponse(prompt, 'systems');

    return {
        briefing: response,
        date: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString()
    };
};

export const generateWeeklyReview = async (profile: UserProfile, weekData?: any) => {
    const prompt = `Generate a weekly system review for this user:

Profile:
- Level: ${profile.level}
- Average Energy: ${profile.energyLevel}/10
- Average Sleep: ${profile.sleepQuality}/10

Week Data: ${weekData ? JSON.stringify(weekData) : 'No data provided'}

Provide:
1. What's working well (keep doing)
2. What needs adjustment
3. What to remove/simplify
4. Focus for next week
5. System health score estimate (1-10)

Be analytical, not emotional. Focus on systems, not motivation.`;

    const response = await generateAiResponse(prompt, 'systems');

    return {
        review: response,
        week_ending: new Date().toISOString().split('T')[0],
        generated_at: new Date().toISOString()
    };
};

export const checkHealth = async () => {
    // Basic check to see if key is present
    return {
        status: "healthy",
        ai_enabled: !!process.env.EXPO_PUBLIC_GOOGLE_API_KEY,
        mode: "on-device"
    };
};
