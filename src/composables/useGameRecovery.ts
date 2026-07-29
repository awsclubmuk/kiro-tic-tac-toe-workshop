/**
 * Game Recovery Composable
 * Task 6.3: Implement game session recovery on app startup
 * Requirements: 13
 *
 * Handles recovery of interrupted game sessions on app initialization.
 * Exposes: recoverableSession, hasRecoverableGame, recoverGame, dismissRecovery
 */

import { ref, computed } from 'vue';
import type { GameSession, GameState } from '../types/index';
import {
    recoverGameSession,
    sessionToGameState,
    clearPersistedSession,
} from '../utils/gamePersistence';

/**
 * Game recovery composable
 *
 * Manages detection and recovery of interrupted game sessions.
 * Call `recoverGame()` on app startup to check for a stored session;
 * the result is exposed reactively via `recoverableSession` / `hasRecoverableGame`.
 */
export function useGameRecovery() {
    // ── State ─────────────────────────────────────────────────────────────────

    /** The recovered in-progress GameSession, or null when nothing to recover. */
    const recoverableSession = ref<GameSession | null>(null);

    /** Computed boolean — true when there is a session that can be resumed. */
    const hasRecoverableGame = computed<boolean>(
        () => recoverableSession.value !== null,
    );

    // ── Methods ───────────────────────────────────────────────────────────────

    /**
     * Attempt to recover a game session from localStorage.
     *
     * Reads persisted storage and, if a valid in-progress session is found,
     * stores it in `recoverableSession`.  Safe to call repeatedly — if no
     * session is found (or the stored data fails validation) the ref is set
     * to null and no error is thrown.
     *
     * @returns The recovered GameSession if one exists, otherwise null.
     */
    function recoverGame(): GameSession | null {
        try {
            const session = recoverGameSession();
            recoverableSession.value = session;
            return session;
        } catch (error) {
            console.error('[useGameRecovery] recoverGame failed:', error);
            recoverableSession.value = null;
            return null;
        }
    }

    /**
     * Dismiss the recovery prompt and clear the stored session.
     *
     * Call this when the user chooses to start a fresh game instead of
     * resuming.  The persisted session is removed from localStorage and
     * `recoverableSession` is set to null.
     */
    function dismissRecovery(): void {
        try {
            clearPersistedSession();
        } catch (error) {
            console.error('[useGameRecovery] dismissRecovery failed:', error);
        } finally {
            recoverableSession.value = null;
        }
    }

    /**
     * Convert the recovered session into a full GameState for resumption.
     *
     * Useful when the caller has accepted the recovery and needs to hand
     * the restored state to `useGameState.restoreGameState()`.
     *
     * @returns GameState if a session is available, otherwise null.
     */
    function getRestoredGameState(): GameState | null {
        if (!recoverableSession.value) return null;
        return sessionToGameState(recoverableSession.value);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    return {
        // Reactive state
        recoverableSession,
        hasRecoverableGame,

        // Methods
        recoverGame,
        dismissRecovery,
        getRestoredGameState,
    };
}
