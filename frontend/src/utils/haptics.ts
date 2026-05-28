/**
 * Haptics — light wrapper around expo-haptics.
 *
 * - Centralizes intent → physical feedback mapping
 * - Silently no-ops on web (so calls are safe everywhere)
 * - Distinguishes UI events ("tap", "select") from semantic ones
 *   ("toggle on", "complete", "warn") so we can re-tune later
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

function safe<T>(fn: () => Promise<T> | T): void {
    if (!isSupported) return;
    try {
        Promise.resolve(fn()).catch(() => {});
    } catch {
        // ignore
    }
}

export const haptics = {
    /** light tick — for tab switches, segment selections, slider steps */
    select: () => safe(() => Haptics.selectionAsync()),

    /** medium press — primary CTAs, starts of sessions */
    press: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),

    /** very light tap — incidental UI feedback */
    tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),

    /** strong thump — high-importance state changes */
    heavy: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),

    /** semantic — task / session completed */
    success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),

    /** semantic — caution / friction */
    warn: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),

    /** semantic — error / cancel */
    error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};

export default haptics;
