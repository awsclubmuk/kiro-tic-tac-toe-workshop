/**
 * Unit Tests for Storage Adapter
 * Task 6.1: Tests for localStorage operations with edge case handling
 * Requirements: 10, 13
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    saveGameSession,
    loadGameSession,
    getAllGameSessions,
    deleteGameSession,
    saveGameToHistory,
    getAllHistory,
    getPlayerHistory,
    savePlayerMetrics,
    loadPlayerMetrics,
    getAllPlayerMetrics,
    saveCurrentSession,
    loadCurrentSession,
    clearCurrentSession,
    clearAllStorage,
    persistGameState,
    loadPersistedGameState,
    clearPersistedGameState,
} from '../storageAdapter';
import type {
    GameSession,
    GameState,
    PlayerMetrics,
    Move,
    Player,
    BoardConfig,
} from '../../types/index';
import { GameResult, GameMode, GameStatus, Difficulty } from '../../types/index';

// Helper function to create mock game sessions
function createMockGameSession(overrides?: Partial<GameSession>): GameSession {
    const defaultSession: GameSession = {
        id: 'session-' + Date.now(),
        playerOne: {
            name: 'Player 1',
            symbol: 'X',
            isAI: false,
        },
        playerTwo: {
            name: 'Player 2',
            symbol: 'O',
            isAI: false,
        },
        result: GameResult.PlayerOneWins,
        boardConfig: {
            size: 3,
            winLineLength: 3,
        },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [
            {
                row: 0,
                col: 0,
                symbol: 'X',
                playerName: 'Player 1',
                timestamp: Date.now(),
            },
        ],
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        winner: 'Player 1',
        winningLines: [[[0, 0], [0, 1], [0, 2]]],
    };

    return { ...defaultSession, ...overrides };
}

// Helper function to create mock player metrics
function createMockPlayerMetrics(overrides?: Partial<PlayerMetrics>): PlayerMetrics {
    const defaultMetrics: PlayerMetrics = {
        totalGames: 10,
        totalWins: 6,
        totalLosses: 3,
        totalDraws: 1,
        winPercentage: 60,
        averageGameDuration: 5000,
        difficultyStats: {
            [Difficulty.Easy]: {
                games: 3,
                wins: 3,
                losses: 0,
                draws: 0,
            },
            [Difficulty.Medium]: {
                games: 4,
                wins: 2,
                losses: 2,
                draws: 0,
            },
            [Difficulty.Hard]: {
                games: 3,
                wins: 1,
                losses: 1,
                draws: 1,
            },
        },
    };

    return { ...defaultMetrics, ...overrides };
}

describe('Storage Adapter - Game Sessions', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('saveGameSession', () => {
        it('should save a game session to localStorage', () => {
            const session = createMockGameSession();
            saveGameSession(session);

            const retrieved = loadGameSession(session.id);
            expect(retrieved).toEqual(session);
        });

        it('should overwrite existing session with same ID', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            const session2 = createMockGameSession({
                id: 'session-1',
                winner: 'Player 2',
            });

            saveGameSession(session1);
            saveGameSession(session2);

            const retrieved = loadGameSession('session-1');
            expect(retrieved?.winner).toBe('Player 2');
        });

        it('should save multiple sessions independently', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            const session2 = createMockGameSession({
                id: 'session-2',
                winner: 'Player 2',
            });

            saveGameSession(session1);
            saveGameSession(session2);

            const all = getAllGameSessions();
            expect(all.length).toBe(2);
            expect(all.some((s) => s.id === 'session-1')).toBe(true);
            expect(all.some((s) => s.id === 'session-2')).toBe(true);
        });

        it('should preserve complex nested structures', () => {
            const session = createMockGameSession({
                moves: [
                    {
                        row: 0,
                        col: 0,
                        symbol: 'X',
                        playerName: 'Player 1',
                        timestamp: 1234567890,
                    },
                    {
                        row: 1,
                        col: 1,
                        symbol: 'O',
                        playerName: 'Player 2',
                        timestamp: 1234567891,
                    },
                ],
                winningLines: [[[0, 0], [0, 1], [0, 2]]],
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.moves).toHaveLength(2);
            expect(retrieved?.moves[0].timestamp).toBe(1234567890);
            expect(retrieved?.winningLines).toHaveLength(1);
        });

        it('should handle sessions with emoji symbols', () => {
            const session = createMockGameSession({
                playerOne: {
                    name: 'Player 1',
                    symbol: '🕷️',
                    isAI: false,
                },
                playerTwo: {
                    name: 'Player 2',
                    symbol: '🕸️',
                    isAI: false,
                },
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.playerOne.symbol).toBe('🕷️');
            expect(retrieved?.playerTwo.symbol).toBe('🕸️');
        });
    });

    describe('loadGameSession', () => {
        it('should return null for non-existent session', () => {
            const retrieved = loadGameSession('non-existent-id');
            expect(retrieved).toBeNull();
        });

        it('should return null when no sessions exist', () => {
            const retrieved = loadGameSession('any-id');
            expect(retrieved).toBeNull();
        });

        it('should correctly load saved session', () => {
            const session = createMockGameSession({ id: 'test-session' });
            saveGameSession(session);

            const retrieved = loadGameSession('test-session');
            expect(retrieved).toEqual(session);
        });

        it('should handle corrupted session data gracefully', () => {
            // Manually corrupt the data
            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                '{ invalid json'
            );

            const retrieved = loadGameSession('any-id');
            expect(retrieved).toBeNull();
        });
    });

    describe('getAllGameSessions', () => {
        it('should return empty array when no sessions exist', () => {
            const sessions = getAllGameSessions();
            expect(sessions).toEqual([]);
        });

        it('should return all saved sessions', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            const session2 = createMockGameSession({ id: 'session-2' });
            const session3 = createMockGameSession({ id: 'session-3' });

            saveGameSession(session1);
            saveGameSession(session2);
            saveGameSession(session3);

            const all = getAllGameSessions();
            expect(all).toHaveLength(3);
            expect(all.map((s) => s.id)).toEqual([
                'session-1',
                'session-2',
                'session-3',
            ]);
        });

        it('should filter out corrupted entries', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            saveGameSession(session1);

            // Manually add corrupted data
            const current = JSON.parse(
                localStorage.getItem('tic-tac-toe:game-sessions') || '{}'
            );
            current['corrupted'] = null;
            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                JSON.stringify(current)
            );

            const all = getAllGameSessions();
            expect(all).toHaveLength(1);
            expect(all[0].id).toBe('session-1');
        });

        it('should handle corrupted storage gracefully', () => {
            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                '{ invalid json'
            );

            const all = getAllGameSessions();
            expect(all).toEqual([]);
        });
    });

    describe('deleteGameSession', () => {
        it('should delete an existing session', () => {
            const session = createMockGameSession({ id: 'session-to-delete' });
            saveGameSession(session);

            expect(loadGameSession('session-to-delete')).not.toBeNull();

            deleteGameSession('session-to-delete');

            expect(loadGameSession('session-to-delete')).toBeNull();
        });

        it('should not fail when deleting non-existent session', () => {
            expect(() => {
                deleteGameSession('non-existent');
            }).not.toThrow();
        });

        it('should preserve other sessions when deleting one', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            const session2 = createMockGameSession({ id: 'session-2' });

            saveGameSession(session1);
            saveGameSession(session2);

            deleteGameSession('session-1');

            const remaining = getAllGameSessions();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].id).toBe('session-2');
        });

        it('should handle corrupted data during deletion', () => {
            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                '{ invalid json'
            );

            expect(() => {
                deleteGameSession('any-id');
            }).not.toThrow();
        });
    });
});

describe('Storage Adapter - Game History', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('saveGameToHistory', () => {
        it('should save a game session to history', () => {
            const session = createMockGameSession();
            saveGameToHistory(session);

            const history = getAllHistory();
            expect(history).toContainEqual(session);
        });

        it('should append to existing history', () => {
            const session1 = createMockGameSession({ id: 'game-1' });
            const session2 = createMockGameSession({ id: 'game-2' });

            saveGameToHistory(session1);
            saveGameToHistory(session2);

            const history = getAllHistory();
            expect(history).toHaveLength(2);
        });

        it('should maintain insertion order', () => {
            const session1 = createMockGameSession({ id: 'game-1' });
            const session2 = createMockGameSession({ id: 'game-2' });

            saveGameToHistory(session1);
            saveGameToHistory(session2);

            const history = getAllHistory();
            expect(history[0].id).toBe('game-1');
            expect(history[1].id).toBe('game-2');
        });
    });

    describe('getAllHistory', () => {
        it('should return empty array when no history exists', () => {
            const history = getAllHistory();
            expect(history).toEqual([]);
        });

        it('should return all saved games in order', () => {
            const sessions = [
                createMockGameSession({ id: 'game-1' }),
                createMockGameSession({ id: 'game-2' }),
                createMockGameSession({ id: 'game-3' }),
            ];

            sessions.forEach((s) => saveGameToHistory(s));

            const history = getAllHistory();
            expect(history).toHaveLength(3);
            expect(history.map((h) => h.id)).toEqual([
                'game-1',
                'game-2',
                'game-3',
            ]);
        });

        it('should handle corrupted history data', () => {
            localStorage.setItem('tic-tac-toe:game-history', '{ invalid json');

            const history = getAllHistory();
            expect(history).toEqual([]);
        });
    });

    describe('getPlayerHistory', () => {
        it('should filter games by player name', () => {
            const session1 = createMockGameSession({
                id: 'game-1',
                playerOne: { name: 'Alice', symbol: 'X', isAI: false },
                playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
            });
            const session2 = createMockGameSession({
                id: 'game-2',
                playerOne: { name: 'Charlie', symbol: 'X', isAI: false },
                playerTwo: { name: 'David', symbol: 'O', isAI: false },
            });

            saveGameToHistory(session1);
            saveGameToHistory(session2);

            const aliceHistory = getPlayerHistory('Alice');
            expect(aliceHistory).toHaveLength(1);
            expect(aliceHistory[0].id).toBe('game-1');
        });

        it('should find player as either player one or player two', () => {
            const session1 = createMockGameSession({
                id: 'game-1',
                playerOne: { name: 'Alice', symbol: 'X', isAI: false },
                playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
            });
            const session2 = createMockGameSession({
                id: 'game-2',
                playerOne: { name: 'Bob', symbol: 'X', isAI: false },
                playerTwo: { name: 'Charlie', symbol: 'O', isAI: false },
            });

            saveGameToHistory(session1);
            saveGameToHistory(session2);

            const bobHistory = getPlayerHistory('Bob');
            expect(bobHistory).toHaveLength(2);
        });

        it('should return empty array for player with no history', () => {
            const session = createMockGameSession({
                playerOne: { name: 'Alice', symbol: 'X', isAI: false },
                playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
            });

            saveGameToHistory(session);

            const unknownHistory = getPlayerHistory('Unknown');
            expect(unknownHistory).toEqual([]);
        });

        it('should return empty array when no history exists', () => {
            const history = getPlayerHistory('Alice');
            expect(history).toEqual([]);
        });

        it('should handle corrupted history gracefully', () => {
            localStorage.setItem('tic-tac-toe:game-history', '{ invalid json');

            const history = getPlayerHistory('Alice');
            expect(history).toEqual([]);
        });
    });
});

describe('Storage Adapter - Player Metrics', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('savePlayerMetrics', () => {
        it('should save player metrics to localStorage', () => {
            const metrics = createMockPlayerMetrics();
            savePlayerMetrics('Alice', metrics);

            const retrieved = loadPlayerMetrics('Alice');
            expect(retrieved).toEqual(metrics);
        });

        it('should update existing metrics for same player', () => {
            const metrics1 = createMockPlayerMetrics({ totalGames: 10 });
            const metrics2 = createMockPlayerMetrics({ totalGames: 15 });

            savePlayerMetrics('Alice', metrics1);
            savePlayerMetrics('Alice', metrics2);

            const retrieved = loadPlayerMetrics('Alice');
            expect(retrieved?.totalGames).toBe(15);
        });

        it('should save metrics for multiple players independently', () => {
            const metricsAlice = createMockPlayerMetrics({ totalGames: 10 });
            const metricsBob = createMockPlayerMetrics({ totalGames: 5 });

            savePlayerMetrics('Alice', metricsAlice);
            savePlayerMetrics('Bob', metricsBob);

            expect(loadPlayerMetrics('Alice')?.totalGames).toBe(10);
            expect(loadPlayerMetrics('Bob')?.totalGames).toBe(5);
        });

        it('should preserve difficulty stats', () => {
            const metrics = createMockPlayerMetrics();
            savePlayerMetrics('Alice', metrics);

            const retrieved = loadPlayerMetrics('Alice');
            expect(retrieved?.difficultyStats).toEqual(
                metrics.difficultyStats
            );
            expect(
                retrieved?.difficultyStats[Difficulty.Hard].wins
            ).toBe(1);
        });
    });

    describe('loadPlayerMetrics', () => {
        it('should return null for non-existent player', () => {
            const retrieved = loadPlayerMetrics('NonExistent');
            expect(retrieved).toBeNull();
        });

        it('should return null when no metrics exist', () => {
            const retrieved = loadPlayerMetrics('AnyPlayer');
            expect(retrieved).toBeNull();
        });

        it('should handle corrupted metrics data', () => {
            localStorage.setItem(
                'tic-tac-toe:player-metrics',
                '{ invalid json'
            );

            const retrieved = loadPlayerMetrics('AnyPlayer');
            expect(retrieved).toBeNull();
        });
    });

    describe('getAllPlayerMetrics', () => {
        it('should return empty object when no metrics exist', () => {
            const all = getAllPlayerMetrics();
            expect(all).toEqual({});
        });

        it('should return all saved metrics', () => {
            const metricsAlice = createMockPlayerMetrics({ totalGames: 10 });
            const metricsBob = createMockPlayerMetrics({ totalGames: 5 });

            savePlayerMetrics('Alice', metricsAlice);
            savePlayerMetrics('Bob', metricsBob);

            const all = getAllPlayerMetrics();
            expect(Object.keys(all)).toHaveLength(2);
            expect(all['Alice']).toEqual(metricsAlice);
            expect(all['Bob']).toEqual(metricsBob);
        });

        it('should handle corrupted metrics data', () => {
            localStorage.setItem(
                'tic-tac-toe:player-metrics',
                '{ invalid json'
            );

            const all = getAllPlayerMetrics();
            expect(all).toEqual({});
        });
    });
});

describe('Storage Adapter - Current Session Recovery', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('saveCurrentSession', () => {
        it('should save current session for recovery', () => {
            const session = createMockGameSession();
            saveCurrentSession(session);

            const retrieved = loadCurrentSession();
            expect(retrieved).toEqual(session);
        });

        it('should overwrite previous current session', () => {
            const session1 = createMockGameSession({ id: 'session-1' });
            const session2 = createMockGameSession({ id: 'session-2' });

            saveCurrentSession(session1);
            saveCurrentSession(session2);

            const retrieved = loadCurrentSession();
            expect(retrieved?.id).toBe('session-2');
        });
    });

    describe('loadCurrentSession', () => {
        it('should return null when no current session exists', () => {
            const retrieved = loadCurrentSession();
            expect(retrieved).toBeNull();
        });

        it('should return saved current session', () => {
            const session = createMockGameSession();
            saveCurrentSession(session);

            const retrieved = loadCurrentSession();
            expect(retrieved).toEqual(session);
        });

        it('should handle corrupted current session data', () => {
            localStorage.setItem('tic-tac-toe:current-session', '{ invalid');

            const retrieved = loadCurrentSession();
            expect(retrieved).toBeNull();
        });
    });

    describe('clearCurrentSession', () => {
        it('should remove current session from storage', () => {
            const session = createMockGameSession();
            saveCurrentSession(session);

            expect(loadCurrentSession()).not.toBeNull();

            clearCurrentSession();

            expect(loadCurrentSession()).toBeNull();
        });

        it('should not fail when clearing non-existent session', () => {
            expect(() => {
                clearCurrentSession();
            }).not.toThrow();
        });
    });
});

describe('Storage Adapter - Edge Cases and Error Handling', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('Corrupted Data Handling', () => {
        it('should handle corrupted JSON in game sessions', () => {
            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                '{ not valid json'
            );

            expect(() => {
                getAllGameSessions();
            }).not.toThrow();
            expect(getAllGameSessions()).toEqual([]);
        });

        it('should handle corrupted JSON in game history', () => {
            localStorage.setItem('tic-tac-toe:game-history', '[ bad data');

            expect(() => {
                getAllHistory();
            }).not.toThrow();
            expect(getAllHistory()).toEqual([]);
        });

        it('should handle corrupted JSON in player metrics', () => {
            localStorage.setItem(
                'tic-tac-toe:player-metrics',
                '{ corrupted'
            );

            expect(() => {
                getAllPlayerMetrics();
            }).not.toThrow();
            expect(getAllPlayerMetrics()).toEqual({});
        });

        it('should handle partially corrupted data structures', () => {
            const validSession = createMockGameSession({ id: 'valid' });
            const sessions: Record<string, unknown> = {
                valid: validSession,
                corrupted: undefined,
            };

            localStorage.setItem(
                'tic-tac-toe:game-sessions',
                JSON.stringify(sessions)
            );

            const all = getAllGameSessions();
            expect(all.length).toBeLessThanOrEqual(1);
        });
    });

    describe('Large Data Handling', () => {
        it('should handle large number of game sessions', () => {
            const sessions = [];
            for (let i = 0; i < 100; i++) {
                const session = createMockGameSession({
                    id: `session-${i}`,
                });
                saveGameSession(session);
                sessions.push(session);
            }

            const all = getAllGameSessions();
            expect(all).toHaveLength(100);
        });

        it('should handle large move history', () => {
            const moves: Move[] = [];
            for (let i = 0; i < 50; i++) {
                moves.push({
                    row: i % 3,
                    col: Math.floor(i / 3) % 3,
                    symbol: i % 2 === 0 ? 'X' : 'O',
                    playerName: i % 2 === 0 ? 'Player 1' : 'Player 2',
                    timestamp: Date.now() + i * 1000,
                });
            }

            const session = createMockGameSession({ moves });
            saveGameSession(session);

            const retrieved = loadGameSession(session.id);
            expect(retrieved?.moves).toHaveLength(50);
        });
    });

    describe('clearAllStorage', () => {
        it('should clear all storage keys', () => {
            const session = createMockGameSession();
            const metrics = createMockPlayerMetrics();

            saveGameSession(session);
            savePlayerMetrics('TestPlayer', metrics);
            saveCurrentSession(session);
            saveGameToHistory(session);

            clearAllStorage();

            expect(getAllGameSessions()).toEqual([]);
            expect(getAllHistory()).toEqual([]);
            expect(getAllPlayerMetrics()).toEqual({});
            expect(loadCurrentSession()).toBeNull();
        });

        it('should not fail on empty storage', () => {
            expect(() => {
                clearAllStorage();
            }).not.toThrow();
        });
    });

    describe('Special Characters and Unicode', () => {
        it('should handle emoji symbols in player names and symbols', () => {
            const session = createMockGameSession({
                playerOne: {
                    name: '🎮 Player 1 🎮',
                    symbol: '🕷️',
                    isAI: false,
                },
                playerTwo: {
                    name: '🎯 Player 2 🎯',
                    symbol: '🕸️',
                    isAI: false,
                },
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.playerOne.name).toBe('🎮 Player 1 🎮');
            expect(retrieved?.playerOne.symbol).toBe('🕷️');
        });

        it('should handle UTF-8 characters correctly', () => {
            const metrics = createMockPlayerMetrics();
            savePlayerMetrics('François', metrics);

            const retrieved = loadPlayerMetrics('François');
            expect(retrieved).toEqual(metrics);
        });
    });

    describe('Timestamp Preservation', () => {
        it('should preserve timestamps accurately', () => {
            const now = Date.now();
            const session = createMockGameSession({
                startTime: now,
                endTime: now + 60000,
                moves: [
                    {
                        row: 0,
                        col: 0,
                        symbol: 'X',
                        playerName: 'Player 1',
                        timestamp: now + 1000,
                    },
                ],
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.startTime).toBe(now);
            expect(retrieved?.endTime).toBe(now + 60000);
            expect(retrieved?.moves[0].timestamp).toBe(now + 1000);
        });
    });

    describe('Null and Undefined Handling', () => {
        it('should handle null result in game session', () => {
            const session = createMockGameSession({
                result: null,
                endTime: null,
                winner: null,
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.result).toBeNull();
            expect(retrieved?.endTime).toBeNull();
            expect(retrieved?.winner).toBeNull();
        });

        it('should handle null difficulty in session', () => {
            const session = createMockGameSession({
                difficulty: null,
            });

            saveGameSession(session);
            const retrieved = loadGameSession(session.id);

            expect(retrieved?.difficulty).toBeNull();
        });
    });
});

// ── Helper: build a minimal valid GameState ───────────────────────────────────
function createMockGameState(overrides?: Partial<GameState>): GameState {
    const board = [
        [null, null, null],
        [null, null, null],
        [null, null, null],
    ];
    const playerOne: Player = { name: 'Player 1', symbol: 'X', isAI: false };
    const playerTwo: Player = { name: 'Player 2', symbol: 'O', isAI: false };

    const defaultState: GameState = {
        board,
        currentPlayer: playerOne,
        gameStatus: GameStatus.Playing,
        boardConfig: { size: 3, winLineLength: 3 },
        players: { playerOne, playerTwo },
        moveHistory: [],
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        startTime: Date.now(),
    };

    return { ...defaultState, ...overrides };
}

// ── Task 6.2: persistGameState / loadPersistedGameState / clearPersistedGameState ──
describe('Storage Adapter - Game State Persistence (Task 6.2)', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    describe('persistGameState', () => {
        it('should save a game state and allow it to be retrieved', () => {
            const state = createMockGameState();
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded).not.toBeNull();
        });

        it('should persist board state accurately', () => {
            const board = [
                ['X', null, null],
                [null, 'O', null],
                [null, null, null],
            ];
            const state = createMockGameState({ board });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.board).toEqual(board);
        });

        it('should persist currentPlayer correctly', () => {
            const playerTwo: Player = { name: 'Player 2', symbol: 'O', isAI: false };
            const state = createMockGameState({ currentPlayer: playerTwo });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.currentPlayer.name).toBe('Player 2');
            expect(loaded?.currentPlayer.symbol).toBe('O');
        });

        it('should persist moveHistory', () => {
            const moveHistory: Move[] = [
                { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1000 },
                { row: 1, col: 1, symbol: 'O', playerName: 'Player 2', timestamp: 2000 },
            ];
            const state = createMockGameState({ moveHistory });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.moveHistory).toHaveLength(2);
            expect(loaded?.moveHistory[0]).toEqual(moveHistory[0]);
            expect(loaded?.moveHistory[1]).toEqual(moveHistory[1]);
        });

        it('should persist boardConfig (size and winLineLength)', () => {
            const boardConfig: BoardConfig = { size: 5, winLineLength: 5 };
            const board = Array(5).fill(null).map(() => Array(5).fill(null));
            const state = createMockGameState({ boardConfig, board });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.boardConfig.size).toBe(5);
            expect(loaded?.boardConfig.winLineLength).toBe(5);
        });

        it('should persist players (playerOne and playerTwo)', () => {
            const playerOne: Player = { name: 'Alice', symbol: '🕷️', isAI: false };
            const playerTwo: Player = { name: 'CPU', symbol: '🕸️', isAI: true };
            const state = createMockGameState({
                players: { playerOne, playerTwo },
                currentPlayer: playerOne,
            });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.players.playerOne.name).toBe('Alice');
            expect(loaded?.players.playerOne.symbol).toBe('🕷️');
            expect(loaded?.players.playerTwo.name).toBe('CPU');
            expect(loaded?.players.playerTwo.isAI).toBe(true);
        });

        it('should persist gameMode', () => {
            const state = createMockGameState({ gameMode: GameMode.SinglePlayer });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.gameMode).toBe(GameMode.SinglePlayer);
        });

        it('should persist difficulty', () => {
            const state = createMockGameState({
                gameMode: GameMode.SinglePlayer,
                difficulty: Difficulty.Hard,
            });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.difficulty).toBe(Difficulty.Hard);
        });

        it('should persist null difficulty for two-player mode', () => {
            const state = createMockGameState({ difficulty: null });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.difficulty).toBeNull();
        });

        it('should persist gameStatus', () => {
            const state = createMockGameState({ gameStatus: GameStatus.Playing });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.gameStatus).toBe(GameStatus.Playing);
        });

        it('should persist startTime', () => {
            const startTime = 1700000000000;
            const state = createMockGameState({ startTime });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.startTime).toBe(startTime);
        });

        it('should include a timestamp field for recovery tracking', () => {
            const beforeSave = Date.now();
            const state = createMockGameState();
            persistGameState(state);
            const afterSave = Date.now();

            const loaded = loadPersistedGameState();
            expect(loaded?.timestamp).toBeGreaterThanOrEqual(beforeSave);
            expect(loaded?.timestamp).toBeLessThanOrEqual(afterSave);
        });

        it('should overwrite previous persisted state', () => {
            const state1 = createMockGameState({
                board: [['X', null, null], [null, null, null], [null, null, null]],
                moveHistory: [{ row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1000 }],
            });
            persistGameState(state1);

            const state2 = createMockGameState({
                board: [['X', 'O', null], [null, null, null], [null, null, null]],
                moveHistory: [
                    { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1000 },
                    { row: 0, col: 1, symbol: 'O', playerName: 'Player 2', timestamp: 2000 },
                ],
            });
            persistGameState(state2);

            const loaded = loadPersistedGameState();
            expect(loaded?.moveHistory).toHaveLength(2);
            expect(loaded?.board[0][1]).toBe('O');
        });

        it('should handle large board sizes (up to 10x10)', () => {
            const size = 10;
            const board = Array(size).fill(null).map(() => Array(size).fill(null));
            board[0][0] = 'X';
            board[9][9] = 'O';
            const state = createMockGameState({
                boardConfig: { size, winLineLength: size },
                board,
            });
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded?.boardConfig.size).toBe(10);
            expect(loaded?.board[0][0]).toBe('X');
            expect(loaded?.board[9][9]).toBe('O');
        });
    });

    describe('loadPersistedGameState', () => {
        it('should return null when nothing is persisted', () => {
            const loaded = loadPersistedGameState();
            expect(loaded).toBeNull();
        });

        it('should return null for corrupted data', () => {
            localStorage.setItem('ttt_current_game', '{ invalid json');
            const loaded = loadPersistedGameState();
            expect(loaded).toBeNull();
        });

        it('should return the last persisted state', () => {
            const state = createMockGameState();
            persistGameState(state);

            const loaded = loadPersistedGameState();
            expect(loaded).not.toBeNull();
            expect(loaded?.board).toEqual(state.board);
        });
    });

    describe('clearPersistedGameState', () => {
        it('should remove persisted state', () => {
            const state = createMockGameState();
            persistGameState(state);

            expect(loadPersistedGameState()).not.toBeNull();

            clearPersistedGameState();

            expect(loadPersistedGameState()).toBeNull();
        });

        it('should not throw when nothing is persisted', () => {
            expect(() => {
                clearPersistedGameState();
            }).not.toThrow();
        });

        it('should allow re-persisting after clearing', () => {
            const state = createMockGameState();
            persistGameState(state);
            clearPersistedGameState();

            const state2 = createMockGameState({
                moveHistory: [{ row: 2, col: 2, symbol: 'X', playerName: 'Player 1', timestamp: 9999 }],
            });
            persistGameState(state2);

            const loaded = loadPersistedGameState();
            expect(loaded?.moveHistory).toHaveLength(1);
        });
    });
});
