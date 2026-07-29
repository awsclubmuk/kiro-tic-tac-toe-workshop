/**
 * Unit Tests for useLeaderboard composable
 * Task 7.2: Create Leaderboard manager composable
 * Requirements: 11, 12
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useLeaderboard } from '../useLeaderboard';
import * as storageAdapter from '../../utils/storageAdapter';
import type { GameSession } from '../../types/index';
import { GameResult, GameMode } from '../../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
    return {
        id: 'session-1',
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

describe('useLeaderboard', () => {
    let getAllHistorySpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        getAllHistorySpy = vi.spyOn(storageAdapter, 'getAllHistory');
    });

    afterEach(() => {
        getAllHistorySpy.mockRestore();
    });

    describe('initial state', () => {
        it('leaderboard ref starts as empty array', () => {
            getAllHistorySpy.mockReturnValue([]);
            const { leaderboard } = useLeaderboard();
            expect(leaderboard.value).toEqual([]);
        });
    });

    describe('buildLeaderboard()', () => {
        it('returns empty array when there is no game history', () => {
            getAllHistorySpy.mockReturnValue([]);
            const { buildLeaderboard, leaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            expect(result).toEqual([]);
            expect(leaderboard.value).toEqual([]);
        });

        it('updates the leaderboard reactive ref', () => {
            getAllHistorySpy.mockReturnValue([makeSession()]);
            const { buildLeaderboard, leaderboard } = useLeaderboard();
            buildLeaderboard();
            expect(leaderboard.value.length).toBeGreaterThan(0);
        });

        it('includes all unique players from game history', () => {
            getAllHistorySpy.mockReturnValue([makeSession()]);
            const { buildLeaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            const names = result.map((e) => e.name);
            expect(names).toContain('Alice');
            expect(names).toContain('Bob');
        });

        it('returns entries with name and metrics fields', () => {
            getAllHistorySpy.mockReturnValue([makeSession()]);
            const { buildLeaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            for (const entry of result) {
                expect(entry).toHaveProperty('name');
                expect(entry).toHaveProperty('metrics');
                expect(entry.metrics).toHaveProperty('totalGames');
                expect(entry.metrics).toHaveProperty('winPercentage');
            }
        });

        it('sorts by win percentage descending', () => {
            const sessions = [
                makeSession({ id: '1', result: GameResult.PlayerOneWins }),
                makeSession({ id: '2', result: GameResult.PlayerOneWins }),
                makeSession({ id: '3', result: GameResult.PlayerTwoWins }),
            ];
            getAllHistorySpy.mockReturnValue(sessions);
            const { buildLeaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            // Alice wins 2/3; Bob wins 1/3 — Alice should be first
            expect(result[0].name).toBe('Alice');
        });

        it('breaks ties by total games descending', () => {
            const sessions = [
                makeSession({
                    id: '1',
                    playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
                    playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
                    result: GameResult.PlayerOneWins,
                }),
                makeSession({
                    id: '2',
                    playerOne: { name: 'Dana', symbol: 'X', isAI: false },
                    playerTwo: { name: 'CPU2', symbol: 'O', isAI: true },
                    result: GameResult.PlayerOneWins,
                }),
                makeSession({
                    id: '3',
                    playerOne: { name: 'Dana', symbol: 'X', isAI: false },
                    playerTwo: { name: 'CPU3', symbol: 'O', isAI: true },
                    result: GameResult.PlayerOneWins,
                }),
            ];
            getAllHistorySpy.mockReturnValue(sessions);
            const { buildLeaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            // Dana: 2 games, 100%; Charlie: 1 game, 100% — Dana ranked higher
            const danaIdx = result.findIndex((e) => e.name === 'Dana');
            const charlieIdx = result.findIndex((e) => e.name === 'Charlie');
            expect(danaIdx).toBeLessThan(charlieIdx);
        });

        it('calculates metrics correctly per player', () => {
            const sessions = [
                makeSession({ id: '1', result: GameResult.PlayerOneWins }),
                makeSession({ id: '2', result: GameResult.PlayerTwoWins }),
                makeSession({ id: '3', result: GameResult.Draw }),
            ];
            getAllHistorySpy.mockReturnValue(sessions);
            const { buildLeaderboard } = useLeaderboard();
            const result = buildLeaderboard();
            const alice = result.find((e) => e.name === 'Alice')!;
            expect(alice.metrics.totalGames).toBe(3);
            expect(alice.metrics.totalWins).toBe(1);
            expect(alice.metrics.totalLosses).toBe(1);
            expect(alice.metrics.totalDraws).toBe(1);
        });
    });

    describe('refreshLeaderboard()', () => {
        it('re-fetches history and updates leaderboard', () => {
            getAllHistorySpy.mockReturnValueOnce([]).mockReturnValueOnce([makeSession()]);
            const { leaderboard, buildLeaderboard, refreshLeaderboard } = useLeaderboard();

            buildLeaderboard(); // first call: empty
            expect(leaderboard.value).toEqual([]);

            refreshLeaderboard(); // second call: with a session
            expect(leaderboard.value.length).toBeGreaterThan(0);
        });

        it('calls getAllHistory each time it is invoked', () => {
            getAllHistorySpy.mockReturnValue([makeSession()]);
            const { refreshLeaderboard } = useLeaderboard();

            refreshLeaderboard();
            refreshLeaderboard();
            refreshLeaderboard();

            expect(getAllHistorySpy).toHaveBeenCalledTimes(3);
        });

        it('updates leaderboard reactively after game added', () => {
            const firstSession = makeSession({ id: '1' });
            const secondSession = makeSession({
                id: '2',
                playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
                playerTwo: { name: 'Dana', symbol: 'O', isAI: false },
                result: GameResult.PlayerOneWins,
                winner: 'Charlie',
            });

            getAllHistorySpy
                .mockReturnValueOnce([firstSession])
                .mockReturnValueOnce([firstSession, secondSession]);

            const { leaderboard, buildLeaderboard, refreshLeaderboard } = useLeaderboard();

            buildLeaderboard();
            const namesBefore = leaderboard.value.map((e) => e.name);

            refreshLeaderboard();
            const namesAfter = leaderboard.value.map((e) => e.name);

            expect(namesAfter).toContain('Charlie');
            expect(namesAfter).toContain('Dana');
            // Both Alice and Bob should still be present
            expect(namesBefore).toContain('Alice');
        });
    });
});
