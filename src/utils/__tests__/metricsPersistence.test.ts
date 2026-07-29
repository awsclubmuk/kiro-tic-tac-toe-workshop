/**
 * Unit Tests for Metrics Persistence to localStorage
 * Task 7.5: Implement metrics persistence to localStorage
 * Requirements: 12
 *
 * Verifies:
 * - recalculateAndSaveMetrics correctly computes and persists metrics
 * - recordGameResult automatically triggers metric persistence for both players
 * - loadPlayerMetrics returns fresh data after recalculation
 * - getAllPlayerMetrics reflects all players after a game is recorded
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    saveGameToHistory,
    savePlayerMetrics,
    loadPlayerMetrics,
    getAllPlayerMetrics,
    clearAllStorage,
} from '../storageAdapter';
import { recalculateAndSaveMetrics, recordGameResult } from '../gameResultRecorder';
import type { GameSession, PlayerMetrics } from '../../types/index';
import { GameResult, GameMode, Difficulty } from '../../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
    return {
        id: `session-${Math.random().toString(36).slice(2)}`,
        playerOne: { name: 'Alice', symbol: 'X', isAI: false },
        playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        result: GameResult.PlayerOneWins,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [],
        startTime: 1000,
        endTime: 5000,
        winner: 'Alice',
        winningLines: [],
        ...overrides,
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Task 7.5 – Metrics persistence to localStorage', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    // ── recalculateAndSaveMetrics ────────────────────────────────────────────

    describe('recalculateAndSaveMetrics()', () => {
        it('saves metrics that can be retrieved with loadPlayerMetrics', () => {
            const sessions = [makeSession()]; // Alice wins
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded).not.toBeNull();
            expect(loaded!.totalGames).toBe(1);
        });

        it('correctly reflects wins from the supplied history', () => {
            const sessions = [
                makeSession({ id: '1', result: GameResult.PlayerOneWins }),
                makeSession({ id: '2', result: GameResult.PlayerOneWins }),
                makeSession({ id: '3', result: GameResult.PlayerTwoWins }),
            ];
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.totalWins).toBe(2);
            expect(loaded!.totalLosses).toBe(1);
            expect(loaded!.winPercentage).toBeCloseTo(66.67, 1);
        });

        it('correctly reflects losses from the supplied history', () => {
            const sessions = [
                makeSession({ id: '1', result: GameResult.PlayerTwoWins }), // Alice loses
            ];
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.totalLosses).toBe(1);
            expect(loaded!.totalWins).toBe(0);
        });

        it('correctly reflects draws from the supplied history', () => {
            const sessions = [
                makeSession({ id: '1', result: GameResult.Draw }),
            ];
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.totalDraws).toBe(1);
            expect(loaded!.winPercentage).toBe(0);
        });

        it('filters supplied history to only sessions involving the player', () => {
            // Sessions where Alice is NOT involved — should be ignored
            const aliceSession = makeSession({ id: 'a1', result: GameResult.PlayerOneWins });
            const otherSession = makeSession({
                id: 'o1',
                playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
                playerTwo: { name: 'Dana', symbol: 'O', isAI: false },
                winner: 'Charlie',
            });

            recalculateAndSaveMetrics('Alice', [aliceSession, otherSession]);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.totalGames).toBe(1); // Only the Alice session counts
        });

        it('saves 0-game metrics for a player with no matching sessions', () => {
            recalculateAndSaveMetrics('Alice', []); // no sessions at all

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded).not.toBeNull();
            expect(loaded!.totalGames).toBe(0);
            expect(loaded!.winPercentage).toBe(0);
        });

        it('overwrites previously saved metrics on recalculation', () => {
            // Save initial metrics manually
            savePlayerMetrics('Alice', {
                totalGames: 100,
                totalWins: 99,
                totalLosses: 1,
                totalDraws: 0,
                winPercentage: 99,
                averageGameDuration: 0,
                difficultyStats: {
                    [Difficulty.Easy]: { games: 0, wins: 0, losses: 0, draws: 0 },
                    [Difficulty.Medium]: { games: 0, wins: 0, losses: 0, draws: 0 },
                    [Difficulty.Hard]: { games: 0, wins: 0, losses: 0, draws: 0 },
                },
            } as PlayerMetrics);

            // Now recalculate from real (small) history
            const sessions = [makeSession({ result: GameResult.PlayerTwoWins })]; // Alice loses
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            // Must reflect the real history, not the stale 100-game data
            expect(loaded!.totalGames).toBe(1);
            expect(loaded!.totalWins).toBe(0);
            expect(loaded!.totalLosses).toBe(1);
        });

        it('calculates average game duration and persists it', () => {
            const sessions = [
                makeSession({ id: '1', startTime: 0, endTime: 4000 }),
                makeSession({ id: '2', startTime: 0, endTime: 8000 }),
            ];
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.averageGameDuration).toBe(6000);
        });

        it('persists difficulty stats when sessions have a difficulty level', () => {
            const sessions = [
                makeSession({
                    id: '1',
                    gameMode: GameMode.SinglePlayer,
                    difficulty: Difficulty.Hard,
                    result: GameResult.PlayerOneWins,
                }),
            ];
            recalculateAndSaveMetrics('Alice', sessions);

            const loaded = loadPlayerMetrics('Alice');
            expect(loaded!.difficultyStats[Difficulty.Hard].games).toBe(1);
            expect(loaded!.difficultyStats[Difficulty.Hard].wins).toBe(1);
        });
    });

    // ── recordGameResult wires automatic recalculation ───────────────────────

    describe('recordGameResult() – automatic metric recalculation', () => {
        it('saves metrics for both players after recording a game', () => {
            const session = makeSession({ result: GameResult.PlayerOneWins });
            recordGameResult(session);

            expect(loadPlayerMetrics('Alice')).not.toBeNull();
            expect(loadPlayerMetrics('Bob')).not.toBeNull();
        });

        it('correctly counts a win for the winning player', () => {
            const session = makeSession({ result: GameResult.PlayerOneWins });
            recordGameResult(session);

            const aliceMetrics = loadPlayerMetrics('Alice');
            expect(aliceMetrics!.totalWins).toBe(1);
            expect(aliceMetrics!.totalLosses).toBe(0);
        });

        it('correctly counts a loss for the losing player', () => {
            const session = makeSession({ result: GameResult.PlayerOneWins });
            recordGameResult(session);

            const bobMetrics = loadPlayerMetrics('Bob');
            expect(bobMetrics!.totalLosses).toBe(1);
            expect(bobMetrics!.totalWins).toBe(0);
        });

        it('accumulates metrics across multiple recorded games', () => {
            recordGameResult(makeSession({ id: 'g1', result: GameResult.PlayerOneWins }));
            recordGameResult(makeSession({ id: 'g2', result: GameResult.PlayerOneWins }));
            recordGameResult(makeSession({ id: 'g3', result: GameResult.PlayerTwoWins }));

            const aliceMetrics = loadPlayerMetrics('Alice');
            expect(aliceMetrics!.totalGames).toBe(3);
            expect(aliceMetrics!.totalWins).toBe(2);
            expect(aliceMetrics!.totalLosses).toBe(1);
        });

        it('updates getAllPlayerMetrics for all players', () => {
            const session = makeSession({ result: GameResult.Draw });
            recordGameResult(session);

            const all = getAllPlayerMetrics();
            expect(Object.keys(all)).toContain('Alice');
            expect(Object.keys(all)).toContain('Bob');
        });

        it('handles a draw correctly for both players', () => {
            const session = makeSession({ result: GameResult.Draw });
            recordGameResult(session);

            const aliceMetrics = loadPlayerMetrics('Alice');
            const bobMetrics = loadPlayerMetrics('Bob');
            expect(aliceMetrics!.totalDraws).toBe(1);
            expect(aliceMetrics!.totalWins).toBe(0);
            expect(bobMetrics!.totalDraws).toBe(1);
            expect(bobMetrics!.totalWins).toBe(0);
        });
    });
});
