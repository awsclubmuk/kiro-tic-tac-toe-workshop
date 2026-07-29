/**
 * Unit Tests for metricsCalculator utilities
 * Task 7.1: Create Player Metrics data model and calculations
 * Requirements: 11, 12
 */

import { describe, it, expect } from 'vitest';
import {
    calculatePlayerMetrics,
    getPlayerResult,
    buildLeaderboard,
    getPlayerRank,
} from '../metricsCalculator';
import type { GameSession } from '../../types/index';
import { GameResult, Difficulty, GameMode } from '../../types/index';

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

// ── calculatePlayerMetrics ────────────────────────────────────────────────────

describe('calculatePlayerMetrics()', () => {
    it('returns zeroed metrics for an empty game history', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.totalGames).toBe(0);
        expect(metrics.totalWins).toBe(0);
        expect(metrics.totalLosses).toBe(0);
        expect(metrics.totalDraws).toBe(0);
        expect(metrics.winPercentage).toBe(0);
        expect(metrics.averageGameDuration).toBe(0);
    });

    it('counts totalGames correctly', () => {
        const sessions = [
            makeSession({ id: '1' }),
            makeSession({ id: '2', result: GameResult.PlayerTwoWins }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.totalGames).toBe(2);
    });

    it('correctly counts wins when player is playerOne and wins', () => {
        const sessions = [makeSession({ result: GameResult.PlayerOneWins })];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.totalWins).toBe(1);
        expect(metrics.totalLosses).toBe(0);
        expect(metrics.totalDraws).toBe(0);
    });

    it('correctly counts losses when player is playerOne and opponent wins', () => {
        const sessions = [makeSession({ result: GameResult.PlayerTwoWins })];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.totalLosses).toBe(1);
        expect(metrics.totalWins).toBe(0);
    });

    it('correctly counts wins when player is playerTwo and wins', () => {
        const sessions = [
            makeSession({
                playerOne: { name: 'Alice', symbol: 'X', isAI: false },
                playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
                result: GameResult.PlayerTwoWins,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Bob');
        expect(metrics.totalWins).toBe(1);
        expect(metrics.totalLosses).toBe(0);
    });

    it('correctly counts draws', () => {
        const sessions = [makeSession({ result: GameResult.Draw })];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.totalDraws).toBe(1);
        expect(metrics.totalWins).toBe(0);
        expect(metrics.totalLosses).toBe(0);
    });

    it('calculates winPercentage correctly', () => {
        const sessions = [
            makeSession({ id: '1', result: GameResult.PlayerOneWins }),
            makeSession({ id: '2', result: GameResult.PlayerOneWins }),
            makeSession({ id: '3', result: GameResult.PlayerTwoWins }),
            makeSession({ id: '4', result: GameResult.Draw }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(50); // 2 wins out of 4
    });

    it('returns winPercentage of 0 when there are no games', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.winPercentage).toBe(0);
    });

    it('calculates averageGameDuration correctly', () => {
        const sessions = [
            makeSession({ id: '1', startTime: 0, endTime: 4000 }),  // 4000ms
            makeSession({ id: '2', startTime: 0, endTime: 8000 }),  // 8000ms
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.averageGameDuration).toBe(6000); // average of 4000 and 8000
    });

    it('excludes sessions without endTime from duration calculation', () => {
        const sessions = [
            makeSession({ id: '1', startTime: 0, endTime: 6000 }),
            makeSession({ id: '2', startTime: 0, endTime: null }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.averageGameDuration).toBe(6000);
    });

    it('returns averageGameDuration of 0 when no sessions have endTime', () => {
        const sessions = [makeSession({ startTime: 0, endTime: null })];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.averageGameDuration).toBe(0);
    });

    it('initialises difficultyStats for all three difficulties', () => {
        const metrics = calculatePlayerMetrics([], 'Alice');
        expect(metrics.difficultyStats[Difficulty.Easy]).toBeDefined();
        expect(metrics.difficultyStats[Difficulty.Medium]).toBeDefined();
        expect(metrics.difficultyStats[Difficulty.Hard]).toBeDefined();
    });

    it('tracks difficulty-specific stats correctly', () => {
        const sessions = [
            makeSession({
                id: '1',
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerOneWins,
            }),
            makeSession({
                id: '2',
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Easy,
                result: GameResult.PlayerTwoWins,
            }),
            makeSession({
                id: '3',
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Hard,
                result: GameResult.Draw,
            }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');

        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(2);
        expect(metrics.difficultyStats[Difficulty.Easy].wins).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Easy].losses).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Hard].draws).toBe(1);
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(0);
    });

    it('ignores sessions with null difficulty in difficultyStats', () => {
        const sessions = [makeSession({ difficulty: null })];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');

        expect(metrics.difficultyStats[Difficulty.Easy].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Medium].games).toBe(0);
        expect(metrics.difficultyStats[Difficulty.Hard].games).toBe(0);
    });

    it('handles 100% win rate correctly', () => {
        const sessions = [
            makeSession({ id: '1', result: GameResult.PlayerOneWins }),
            makeSession({ id: '2', result: GameResult.PlayerOneWins }),
        ];
        const metrics = calculatePlayerMetrics(sessions, 'Alice');
        expect(metrics.winPercentage).toBe(100);
    });
});

// ── getPlayerResult ───────────────────────────────────────────────────────────

describe('getPlayerResult()', () => {
    it('returns null when result is null (game in progress)', () => {
        const session = makeSession({ result: null });
        expect(getPlayerResult(session, 'Alice')).toBeNull();
    });

    it('returns draw for both players when result is Draw', () => {
        const session = makeSession({ result: GameResult.Draw });
        expect(getPlayerResult(session, 'Alice')).toBe('draw');
        expect(getPlayerResult(session, 'Bob')).toBe('draw');
    });

    it('returns win for playerOne when PlayerOneWins', () => {
        const session = makeSession({ result: GameResult.PlayerOneWins });
        expect(getPlayerResult(session, 'Alice')).toBe('win');
    });

    it('returns loss for playerTwo when PlayerOneWins', () => {
        const session = makeSession({ result: GameResult.PlayerOneWins });
        expect(getPlayerResult(session, 'Bob')).toBe('loss');
    });

    it('returns win for playerTwo when PlayerTwoWins', () => {
        const session = makeSession({ result: GameResult.PlayerTwoWins });
        expect(getPlayerResult(session, 'Bob')).toBe('win');
    });

    it('returns loss for playerOne when PlayerTwoWins', () => {
        const session = makeSession({ result: GameResult.PlayerTwoWins });
        expect(getPlayerResult(session, 'Alice')).toBe('loss');
    });
});

// ── buildLeaderboard ──────────────────────────────────────────────────────────

describe('buildLeaderboard()', () => {
    it('returns an empty array for empty history', () => {
        expect(buildLeaderboard([])).toEqual([]);
    });

    it('includes all unique players from the history', () => {
        const sessions = [makeSession()];
        const leaderboard = buildLeaderboard(sessions);
        const names = leaderboard.map((e) => e.name);
        expect(names).toContain('Alice');
        expect(names).toContain('Bob');
    });

    it('sorts players by win percentage descending', () => {
        const sessions = [
            makeSession({ id: '1', result: GameResult.PlayerOneWins }), // Alice wins
            makeSession({ id: '2', result: GameResult.PlayerOneWins }), // Alice wins
            makeSession({ id: '3', result: GameResult.PlayerTwoWins }), // Bob wins once
        ];
        const leaderboard = buildLeaderboard(sessions);
        // Alice has 2/3 wins (~66.7%); Bob has 1/3 wins (~33.3%)
        expect(leaderboard[0].name).toBe('Alice');
    });

    it('breaks ties by total games descending', () => {
        // Two players with 100% win rate but different game counts
        const p1Session = makeSession({
            id: '1',
            playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
            playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
            result: GameResult.PlayerOneWins,
        });
        const p2Session1 = makeSession({
            id: '2',
            playerOne: { name: 'Dana', symbol: 'X', isAI: false },
            playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
            result: GameResult.PlayerOneWins,
        });
        const p2Session2 = makeSession({
            id: '3',
            playerOne: { name: 'Dana', symbol: 'X', isAI: false },
            playerTwo: { name: 'CPU2', symbol: 'O', isAI: true },
            result: GameResult.PlayerOneWins,
        });

        const leaderboard = buildLeaderboard([p1Session, p2Session1, p2Session2]);
        const dana = leaderboard.find((e) => e.name === 'Dana');
        const charlie = leaderboard.find((e) => e.name === 'Charlie');
        const danaRank = leaderboard.indexOf(dana!);
        const charlieRank = leaderboard.indexOf(charlie!);
        // Dana has 2 games (100%), Charlie has 1 game (100%) — Dana ranked higher
        expect(danaRank).toBeLessThan(charlieRank);
    });
});

// ── getPlayerRank ─────────────────────────────────────────────────────────────

describe('getPlayerRank()', () => {
    it('returns null when player is not on the leaderboard', () => {
        const leaderboard = [{ name: 'Alice', metrics: calculatePlayerMetrics([], 'Alice') }];
        expect(getPlayerRank('Charlie', leaderboard)).toBeNull();
    });

    it('returns 1 for the top-ranked player', () => {
        const leaderboard = [
            { name: 'Alice', metrics: calculatePlayerMetrics([], 'Alice') },
            { name: 'Bob', metrics: calculatePlayerMetrics([], 'Bob') },
        ];
        expect(getPlayerRank('Alice', leaderboard)).toBe(1);
    });

    it('returns correct rank for non-top players', () => {
        const leaderboard = [
            { name: 'Alice', metrics: calculatePlayerMetrics([], 'Alice') },
            { name: 'Bob', metrics: calculatePlayerMetrics([], 'Bob') },
            { name: 'Charlie', metrics: calculatePlayerMetrics([], 'Charlie') },
        ];
        expect(getPlayerRank('Charlie', leaderboard)).toBe(3);
    });
});
