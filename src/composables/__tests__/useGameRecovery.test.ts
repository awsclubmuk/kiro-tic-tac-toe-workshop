/**
 * Unit Tests for useGameRecovery composable
 * Task 6.3: Game session recovery on app startup
 * Requirements: 13
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useGameRecovery } from '../useGameRecovery';
import {
    saveCurrentSession,
    clearCurrentSession,
    clearAllStorage,
} from '../../utils/storageAdapter';
import type { GameSession } from '../../types/index';
import { GameMode, Difficulty } from '../../types/index';

// ── Test helpers ─────────────────────────────────────────────────────────────

function createInProgressSession(overrides?: Partial<GameSession>): GameSession {
    return {
        id: 'test-session-001',
        playerOne: { name: 'Alice', symbol: 'X', isAI: false },
        playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        result: null,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [
            { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: Date.now() },
        ],
        startTime: Date.now() - 30000,
        endTime: null,
        winner: null,
        winningLines: [],
        ...overrides,
    };
}

function createCompletedSession(): GameSession {
    return {
        id: 'completed-session',
        playerOne: { name: 'Alice', symbol: 'X', isAI: false },
        playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        result: 'player-one-wins' as GameSession['result'],
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [],
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        winner: 'Alice',
        winningLines: [],
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useGameRecovery', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    // ── Initial state ────────────────────────────────────────────────────────

    describe('initial state', () => {
        it('should start with recoverableSession as null', () => {
            const { recoverableSession } = useGameRecovery();
            expect(recoverableSession.value).toBeNull();
        });

        it('should start with hasRecoverableGame as false', () => {
            const { hasRecoverableGame } = useGameRecovery();
            expect(hasRecoverableGame.value).toBe(false);
        });
    });

    // ── recoverGame ─────────────────────────────────────────────────────────

    describe('recoverGame()', () => {
        it('should return null when no session is persisted', () => {
            const { recoverGame } = useGameRecovery();
            const result = recoverGame();
            expect(result).toBeNull();
        });

        it('should leave recoverableSession null when nothing is persisted', () => {
            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();
            expect(recoverableSession.value).toBeNull();
        });

        it('should return the session when a valid in-progress session exists', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame } = useGameRecovery();
            const result = recoverGame();

            expect(result).not.toBeNull();
            expect(result?.id).toBe('test-session-001');
        });

        it('should populate recoverableSession with recovered session', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();

            expect(recoverableSession.value).not.toBeNull();
            expect(recoverableSession.value?.id).toBe('test-session-001');
        });

        it('should set hasRecoverableGame to true after successful recovery', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, hasRecoverableGame } = useGameRecovery();
            recoverGame();

            expect(hasRecoverableGame.value).toBe(true);
        });

        it('should return null for a completed (non-recoverable) session', () => {
            const completed = createCompletedSession();
            saveCurrentSession(completed);

            const { recoverGame } = useGameRecovery();
            const result = recoverGame();

            expect(result).toBeNull();
        });

        it('should keep hasRecoverableGame false for a completed session', () => {
            const completed = createCompletedSession();
            saveCurrentSession(completed);

            const { recoverGame, hasRecoverableGame } = useGameRecovery();
            recoverGame();

            expect(hasRecoverableGame.value).toBe(false);
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('tic-tac-toe:current-session', '{ bad json');

            const { recoverGame, recoverableSession } = useGameRecovery();

            expect(() => recoverGame()).not.toThrow();
            expect(recoverableSession.value).toBeNull();
        });

        it('should restore player names correctly', () => {
            const session = createInProgressSession({
                playerOne: { name: 'Spider-Man', symbol: '🕷️', isAI: false },
                playerTwo: { name: 'Green Goblin', symbol: '🕸️', isAI: false },
            });
            saveCurrentSession(session);

            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();

            expect(recoverableSession.value?.playerOne.name).toBe('Spider-Man');
            expect(recoverableSession.value?.playerTwo.name).toBe('Green Goblin');
        });

        it('should restore board configuration', () => {
            const session = createInProgressSession({
                boardConfig: { size: 5, winLineLength: 5 },
            });
            saveCurrentSession(session);

            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();

            expect(recoverableSession.value?.boardConfig.size).toBe(5);
        });

        it('should restore move history', () => {
            const session = createInProgressSession({
                moves: [
                    { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
                    { row: 1, col: 1, symbol: 'O', playerName: 'Bob', timestamp: 2000 },
                ],
            });
            saveCurrentSession(session);

            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();

            expect(recoverableSession.value?.moves).toHaveLength(2);
        });

        it('should recover single-player session with difficulty', () => {
            const session = createInProgressSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Hard,
                playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
            });
            saveCurrentSession(session);

            const { recoverGame, recoverableSession } = useGameRecovery();
            recoverGame();

            expect(recoverableSession.value?.gameMode).toBe(GameMode.SinglePlayer);
            expect(recoverableSession.value?.difficulty).toBe(Difficulty.Hard);
        });
    });

    // ── dismissRecovery ─────────────────────────────────────────────────────

    describe('dismissRecovery()', () => {
        it('should clear recoverableSession', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, dismissRecovery, recoverableSession } = useGameRecovery();
            recoverGame();
            expect(recoverableSession.value).not.toBeNull();

            dismissRecovery();
            expect(recoverableSession.value).toBeNull();
        });

        it('should set hasRecoverableGame to false after dismissal', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, dismissRecovery, hasRecoverableGame } = useGameRecovery();
            recoverGame();
            expect(hasRecoverableGame.value).toBe(true);

            dismissRecovery();
            expect(hasRecoverableGame.value).toBe(false);
        });

        it('should remove the persisted session from storage', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, dismissRecovery } = useGameRecovery();
            recoverGame();
            dismissRecovery();

            // A subsequent recovery attempt should find nothing
            const { recoverGame: recoverAgain, recoverableSession } = useGameRecovery();
            recoverAgain();
            expect(recoverableSession.value).toBeNull();
        });

        it('should not throw when called without a prior recovery', () => {
            const { dismissRecovery } = useGameRecovery();
            expect(() => dismissRecovery()).not.toThrow();
        });

        it('should not throw when called multiple times', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, dismissRecovery } = useGameRecovery();
            recoverGame();

            expect(() => {
                dismissRecovery();
                dismissRecovery();
            }).not.toThrow();
        });
    });

    // ── hasRecoverableGame (computed) ────────────────────────────────────────

    describe('hasRecoverableGame (computed)', () => {
        it('should be false initially', () => {
            const { hasRecoverableGame } = useGameRecovery();
            expect(hasRecoverableGame.value).toBe(false);
        });

        it('should become true after recovering a valid session', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, hasRecoverableGame } = useGameRecovery();
            recoverGame();

            expect(hasRecoverableGame.value).toBe(true);
        });

        it('should return false when recoverableSession is null', () => {
            const { recoverableSession, hasRecoverableGame } = useGameRecovery();
            recoverableSession.value = null;
            expect(hasRecoverableGame.value).toBe(false);
        });
    });

    // ── getRestoredGameState ─────────────────────────────────────────────────

    describe('getRestoredGameState()', () => {
        it('should return null when no session was recovered', () => {
            const { getRestoredGameState } = useGameRecovery();
            expect(getRestoredGameState()).toBeNull();
        });

        it('should return a GameState after successful recovery', () => {
            const session = createInProgressSession({
                moves: [
                    { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
                ],
            });
            saveCurrentSession(session);

            const { recoverGame, getRestoredGameState } = useGameRecovery();
            recoverGame();

            const state = getRestoredGameState();
            expect(state).not.toBeNull();
        });

        it('should reconstruct the board from move history', () => {
            const session = createInProgressSession({
                moves: [
                    { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
                    { row: 1, col: 1, symbol: 'O', playerName: 'Bob', timestamp: 2000 },
                ],
            });
            saveCurrentSession(session);

            const { recoverGame, getRestoredGameState } = useGameRecovery();
            recoverGame();

            const state = getRestoredGameState();
            expect(state?.board[0][0]).toBe('X');
            expect(state?.board[1][1]).toBe('O');
        });

        it('should set game status to playing', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const { recoverGame, getRestoredGameState } = useGameRecovery();
            recoverGame();

            const state = getRestoredGameState();
            expect(state?.gameStatus).toBe('playing');
        });

        it('should correctly identify current player from move parity', () => {
            // After 1 move (odd), it should be playerTwo's turn
            const session = createInProgressSession({
                moves: [
                    { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
                ],
            });
            saveCurrentSession(session);

            const { recoverGame, getRestoredGameState } = useGameRecovery();
            recoverGame();

            const state = getRestoredGameState();
            expect(state?.currentPlayer.name).toBe('Bob');
        });

        it('should return playerOne as current player after 0 moves', () => {
            const session = createInProgressSession({ moves: [] });
            saveCurrentSession(session);

            const { recoverGame, getRestoredGameState } = useGameRecovery();
            recoverGame();

            const state = getRestoredGameState();
            expect(state?.currentPlayer.name).toBe('Alice');
        });
    });

    // ── Integration: full recovery workflow ─────────────────────────────────

    describe('full recovery workflow', () => {
        it('should complete recover → use state → dismiss cycle without errors', () => {
            const session = createInProgressSession({
                moves: [
                    { row: 2, col: 2, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
                ],
            });
            saveCurrentSession(session);

            const {
                recoverGame,
                hasRecoverableGame,
                recoverableSession,
                getRestoredGameState,
                dismissRecovery,
            } = useGameRecovery();

            // Step 1: detect recoverable game
            recoverGame();
            expect(hasRecoverableGame.value).toBe(true);
            expect(recoverableSession.value?.id).toBe('test-session-001');

            // Step 2: restore state
            const state = getRestoredGameState();
            expect(state?.board[2][2]).toBe('X');

            // Step 3: dismiss (user starts fresh)
            dismissRecovery();
            expect(hasRecoverableGame.value).toBe(false);
            expect(recoverableSession.value).toBeNull();
        });

        it('should allow independent recovery instances without cross-contamination', () => {
            const session = createInProgressSession();
            saveCurrentSession(session);

            const instance1 = useGameRecovery();
            const instance2 = useGameRecovery();

            instance1.recoverGame();
            // instance2 hasn't called recoverGame yet
            expect(instance1.hasRecoverableGame.value).toBe(true);
            expect(instance2.hasRecoverableGame.value).toBe(false);
        });
    });
});
