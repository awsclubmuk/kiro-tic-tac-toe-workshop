/**
 * Unit Tests for Metrics Calculation
 * Task 11.6: Write unit tests for metrics calculation
 * Requirements: 11, 12
 *
 * Covers:
 *  - Win percentage calculation with various game counts
 *  - Division by zero handling (no games)
 *  - Difficulty-specific metric breakdowns
 *  - Leaderboard sorting (win %, then games played)
 */

import { describe, it, expect } from 'vitest';
import { calculatePlayerMetrics, buildLeaderboard } from '@/utils/metricsCalculator';
import type { GameSession } from '@/types/index';
import { GameResult, Difficulty, GameMode } from '@/types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

let sessionCounter = 0;

function makeSession(overrides: Partial<GameSession> = {}): GameSession {
    sessionCounter++;
    return {
        id: `session-${sessionCounter}`,
        playerOne: { name: 'Alice', symbol: 'X', isAI: false },
        playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        result: GameResult.PlayerOneWins,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [],
        startTime: 0,
        endTime: 5000,
        winner: 'Alice',
        winningLines: [],
        ...overrides,
    };
}

/** Build a list of N win sessions and M loss sessions for a player named 'Alice'. */
function buildHistory(wins: number, losses: number, draws: number = 0): GameSession[] {
    const sessions: GameSession[] = [];
    for (let i = 0; i < wins; i++) {
        sessions.push(makeSession({ result: GameResult.PlayerOneWins }));
    }
    for (let i = 0; i < losses; i++) {
        sessions.push(makeSession({ result: GameResult.PlayerTwoWins }));
    }
    for (let i = 0; i < draws; i++) {
        sessions.push(makeSession({ result: GameResult.Draw }));
    }
    return sessions;
}

// ── Win Percentage Calculation ────────────────────────────────────────────────

describe('Win percentage calculation', () => {
    it('5 wins / 10 games = 50%', () => {
        const sessions = buildHistory(5, 5);
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(50);
    });

    it('3 wins / 4 games = 75%', () => {
        const sessions = buildHistory(3, 1);
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(75);
    });

    it('0 wins / 5 games = 0%', () => {
        const sessions = buildHistory(0, 5);
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(0);
    });

    it('10 wins / 10 games = 100%', () => {
        const sessions = buildHistory(10, 0);
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(100);
    });

    it('1 win / 3 games ≈ 33.33%', () => {
        const sessions = buildHistory(1, 2);
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBeCloseTo(33.33, 1);
    });
});

// ── Division by Zero (0 Games) ────────────────────────────────────────────────

describe('Division by zero handling (0 games)', () => {
    it('winPercentage is 0 (not NaN or Infinity) when player has no games', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.winPercentage).toBe(0);
        expect(Number.isNaN(metrics.winPercentage)).toBe(false);
        expect(Number.isFinite(metrics.winPercentage)).toBe(true);
    });

    it('averageGameDuration is 0 when player has no games', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.averageGameDuration).toBe(0);
        expect(Number.isNaN(metrics.averageGameDuration)).toBe(false);
        expect(Number.isFinite(metrics.averageGameDuration)).toBe(true);
    });

    it('totalGames is 0 for empty history', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.totalGames).toBe(0);
    });

    it('all counters are 0 for empty history', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.totalWins).toBe(0);
        expect(metrics.totalLosses).toBe(0);
        expect(metrics.totalDraws).toBe(0);
    });
});

// ── Difficulty-Specific Metric Breakdowns ─────────────────────────────────────

describe('Difficulty-specific metric breakdowns', () => {
    it('easy games count only in Easy stats, not Medium or Hard', () => {
        const sessions = [
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerOneWins,
            }),
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerOneWins,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(2);
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(0);
    });

    it('medium games count only in Medium stats, not Easy or Hard', () => {
        const sessions = [
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Medium,
                result: GameResult.PlayerOneWins,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(0);
    });

    it('hard games count only in Hard stats, not Easy or Medium', () => {
        const sessions = [
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Hard,
                result: GameResult.PlayerOneWins,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(0);
    });

    it('stats for a difficulty with 0 games returns 0 counts', () => {
        const sessions = [
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerOneWins,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        const mediumStats = metrics.difficultyStats[Difficulty.Medium];
        expect(mediumStats.games).toBe(0);
        expect(mediumStats.wins).toBe(0);
        expect(mediumStats.losses).toBe(0);
        expect(mediumStats.draws).toBe(0);
    });

    it('wins and losses are tracked correctly within each difficulty', () => {
        const sessions = [
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerOneWins,
            }),
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerTwoWins,
            }),
            makeSession({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Hard,
                result: GameResult.Draw,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');

        expect(metrics.difficultyStats[Difficulty.Easy].wins).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Easy].losses).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Easy].draws).toBe(0);

        expect(metrics.difficultyStats[Difficulty.Hard].wins).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Hard].draws).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Hard].losses).toBe(0);
    });

    it('two-player games (null difficulty) do not appear in any difficulty bucket', () => {
        const sessions = [
            makeSession({ gameMode: GameMode.TwoPlayer, difficulty: null }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(0);
    });
});

// ── Leaderboard Sorting ───────────────────────────────────────────────────────

describe('Leaderboard sorting', () => {
    it('player with higher win rate ranks above player with lower win rate', () => {
        // Player A (Alice): 4/5 = 80%  Player B (Bob): 1/2 = 50%
        const sessions = [
            // Alice wins 4
            makeSession({ id: 'a1', result: GameResult.PlayerOneWins }),
            makeSession({ id: 'a2', result: GameResult.PlayerOneWins }),
            makeSession({ id: 'a3', result: GameResult.PlayerOneWins }),
            makeSession({ id: 'a4', result: GameResult.PlayerOneWins }),
            // Alice loses 1
            makeSession({ id: 'a5', result: GameResult.PlayerTwoWins }),
        ];
        const leaderboard = buildLeaderboard(sessions);
        const aliceIdx = leaderboard.findIndex((e) => e.name === 'Alice');
        const bobIdx = leaderboard.findIndex((e) => e.name === 'Bob');
        // Alice: 4/5 = 80%, Bob: 1/5 = 20% — Alice ranks higher
        expect(aliceIdx).toBeLessThan(bobIdx);
    });

    it('two players with equal win rate: more total games ranks first', () => {
        // Both Dana and Charlie have 100% win rate, but Dana has 2 games vs Charlie's 1
        const sessions = [
            makeSession({
                id: 'c1',
                playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
                playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
                result: GameResult.PlayerOneWins,
                winner: 'Charlie',
            }),
            makeSession({
                id: 'd1',
                playerOne: { name: 'Dana', symbol: 'X', isAI: false },
                playerTwo: { name: 'CPU2', symbol: 'O', isAI: true },
                result: GameResult.PlayerOneWins,
                winner: 'Dana',
            }),
            makeSession({
                id: 'd2',
                playerOne: { name: 'Dana', symbol: 'X', isAI: false },
                playerTwo: { name: 'CPU3', symbol: 'O', isAI: true },
                result: GameResult.PlayerOneWins,
                winner: 'Dana',
            }),
        ];
        const leaderboard = buildLeaderboard(sessions);
        const danaIdx = leaderboard.findIndex((e) => e.name === 'Dana');
        const charlieIdx = leaderboard.findIndex((e) => e.name === 'Charlie');
        // Dana: 100%, 2 games; Charlie: 100%, 1 game — Dana ranked higher
        expect(danaIdx).toBeLessThan(charlieIdx);
    });

    it('player with 0 games ranks last (0% win rate)', () => {
        // Create a session with only one player who has games; the other (Bob) has 0 wins
        // Use separate CPU sessions so we can isolate a player with no wins at all
        const sessions = [
            makeSession({
                id: 'e1',
                playerOne: { name: 'Eve', symbol: 'X', isAI: false },
                playerTwo: { name: 'Zara', symbol: 'O', isAI: false },
                result: GameResult.PlayerOneWins,
                winner: 'Eve',
            }),
        ];
        const leaderboard = buildLeaderboard(sessions);
        const eveIdx = leaderboard.findIndex((e) => e.name === 'Eve');
        const zaraIdx = leaderboard.findIndex((e) => e.name === 'Zara');
        // Eve: 1/1 = 100%, Zara: 0/1 = 0% — Eve ranks higher, Zara last
        expect(eveIdx).toBeLessThan(zaraIdx);
        expect(leaderboard[leaderboard.length - 1].name).toBe('Zara');
    });

    it('leaderboard is sorted descending by win percentage', () => {
        const sessions = [
            // Alice wins 2, loses 1 → ~66.7%
            makeSession({ id: 'f1', result: GameResult.PlayerOneWins }),
            makeSession({ id: 'f2', result: GameResult.PlayerOneWins }),
            makeSession({ id: 'f3', result: GameResult.PlayerTwoWins }),
        ];
        const leaderboard = buildLeaderboard(sessions);
        // Verify win percentages are non-increasing
        for (let i = 1; i < leaderboard.length; i++) {
            expect(leaderboard[i - 1].metrics.winPercentage).toBeGreaterThanOrEqual(
                leaderboard[i].metrics.winPercentage
            );
        }
    });
});
