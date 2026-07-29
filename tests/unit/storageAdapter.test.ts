/**
 * Unit Tests for Storage Adapter
 * Task 11.7 — Requirements: 10, 12, 13
 *
 * Covers:
 *  - Game session save/load (including non-existent IDs)
 *  - getAllGameSessions / deleteGameSession
 *  - saveGameToHistory / getAllHistory roundtrip
 *  - getPlayerHistory filtering by player name
 *  - savePlayerMetrics / loadPlayerMetrics roundtrip
 *  - loadPlayerMetrics for non-existent player returns null
 *  - Corrupted JSON in localStorage returns null / empty collections
 *  - Empty localStorage returns empty arrays / null
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
    clearAllStorage,
} from '../../src/utils/storageAdapter';
import type { GameSession, PlayerMetrics } from '../../src/types/index';
import { GameResult, GameMode, Difficulty } from '../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeSession(overrides?: Partial<GameSession>): GameSession {
    const base: GameSession = {
        id: `session-${Date.now()}-${Math.random()}`,
        playerOne: { name: 'Alice', symbol: 'X', isAI: false },
        playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        result: GameResult.PlayerOneWins,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [
            { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
        ],
        startTime: Date.now() - 30_000,
        endTime: Date.now(),
        winner: 'Alice',
        winningLines: [[[0, 0], [0, 1], [0, 2]]],
    };
    return { ...base, ...overrides };
}

function makeMetrics(overrides?: Partial<PlayerMetrics>): PlayerMetrics {
    const base: PlayerMetrics = {
        totalGames: 5,
        totalWins: 3,
        totalLosses: 1,
        totalDraws: 1,
        winPercentage: 60,
        averageGameDuration: 8000,
        difficultyStats: {
            [Difficulty.Easy]: { games: 2, wins: 2, losses: 0, draws: 0 },
            [Difficulty.Medium]: { games: 2, wins: 1, losses: 1, draws: 0 },
            [Difficulty.Hard]: { games: 1, wins: 0, losses: 0, draws: 1 },
        },
    };
    return { ...base, ...overrides };
}

// ── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => clearAllStorage());
afterEach(() => clearAllStorage());

// ── 1. Game Session save and load ────────────────────────────────────────────

describe('saveGameSession / loadGameSession', () => {
    it('saves a session and loads it back by ID', () => {
        const session = makeSession({ id: 'abc-1' });
        saveGameSession(session);

        const loaded = loadGameSession('abc-1');
        expect(loaded).toEqual(session);
    });

    it('returns null for a non-existent session ID', () => {
        expect(loadGameSession('does-not-exist')).toBeNull();
    });

    it('returns null when localStorage is empty', () => {
        expect(loadGameSession('anything')).toBeNull();
    });

    it('overwrites an existing session that shares the same ID', () => {
        saveGameSession(makeSession({ id: 'dup', winner: 'Alice' }));
        saveGameSession(makeSession({ id: 'dup', winner: 'Bob' }));

        expect(loadGameSession('dup')?.winner).toBe('Bob');
    });

    it('saves and loads multiple sessions independently', () => {
        const s1 = makeSession({ id: 's1' });
        const s2 = makeSession({ id: 's2' });
        saveGameSession(s1);
        saveGameSession(s2);

        expect(loadGameSession('s1')).toEqual(s1);
        expect(loadGameSession('s2')).toEqual(s2);
    });
});

// ── 2. getAllGameSessions ─────────────────────────────────────────────────────

describe('getAllGameSessions', () => {
    it('returns an empty array when localStorage is empty', () => {
        expect(getAllGameSessions()).toEqual([]);
    });

    it('returns all saved sessions', () => {
        const s1 = makeSession({ id: 'g1' });
        const s2 = makeSession({ id: 'g2' });
        saveGameSession(s1);
        saveGameSession(s2);

        const all = getAllGameSessions();
        expect(all).toHaveLength(2);
        expect(all.map((s) => s.id)).toEqual(expect.arrayContaining(['g1', 'g2']));
    });

    it('returns an empty array when session store contains corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-sessions', '{ bad json');
        expect(getAllGameSessions()).toEqual([]);
    });

    it('filters out null / corrupted entries inside the sessions map', () => {
        const valid = makeSession({ id: 'valid-1' });
        saveGameSession(valid);

        // Inject a null entry directly into the stored map
        const raw = JSON.parse(localStorage.getItem('tic-tac-toe:game-sessions')!);
        raw['corrupted'] = null;
        localStorage.setItem('tic-tac-toe:game-sessions', JSON.stringify(raw));

        const all = getAllGameSessions();
        expect(all).toHaveLength(1);
        expect(all[0].id).toBe('valid-1');
    });
});

// ── 3. deleteGameSession ─────────────────────────────────────────────────────

describe('deleteGameSession', () => {
    it('removes a session that was previously saved', () => {
        saveGameSession(makeSession({ id: 'del-me' }));
        expect(loadGameSession('del-me')).not.toBeNull();

        deleteGameSession('del-me');
        expect(loadGameSession('del-me')).toBeNull();
    });

    it('does not throw when deleting a session that does not exist', () => {
        expect(() => deleteGameSession('ghost-id')).not.toThrow();
    });

    it('leaves other sessions intact after deletion', () => {
        saveGameSession(makeSession({ id: 'keep-1' }));
        saveGameSession(makeSession({ id: 'keep-2' }));
        saveGameSession(makeSession({ id: 'remove' }));

        deleteGameSession('remove');

        const remaining = getAllGameSessions();
        expect(remaining).toHaveLength(2);
        expect(remaining.map((s) => s.id)).toEqual(expect.arrayContaining(['keep-1', 'keep-2']));
    });
});

// ── 4. saveGameToHistory / getAllHistory roundtrip ───────────────────────────

describe('saveGameToHistory / getAllHistory', () => {
    it('returns an empty array when no history is stored', () => {
        expect(getAllHistory()).toEqual([]);
    });

    it('saves a session to history and retrieves it', () => {
        const session = makeSession({ id: 'hist-1' });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history).toHaveLength(1);
        expect(history[0]).toEqual(session);
    });

    it('appends sessions in insertion order', () => {
        const s1 = makeSession({ id: 'h1' });
        const s2 = makeSession({ id: 'h2' });
        saveGameToHistory(s1);
        saveGameToHistory(s2);

        const history = getAllHistory();
        expect(history[0].id).toBe('h1');
        expect(history[1].id).toBe('h2');
    });

    it('returns an empty array when history store contains corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-history', '[ invalid');
        expect(getAllHistory()).toEqual([]);
    });
});

// ── 5. getPlayerHistory – filtering by player name ───────────────────────────

describe('getPlayerHistory', () => {
    it('returns an empty array when no history exists', () => {
        expect(getPlayerHistory('Alice')).toEqual([]);
    });

    it('filters games where the player is playerOne', () => {
        const aliceGame = makeSession({
            id: 'ag-1',
            playerOne: { name: 'Alice', symbol: 'X', isAI: false },
            playerTwo: { name: 'Charlie', symbol: 'O', isAI: false },
        });
        const unrelated = makeSession({
            id: 'ur-1',
            playerOne: { name: 'Dave', symbol: 'X', isAI: false },
            playerTwo: { name: 'Eve', symbol: 'O', isAI: false },
        });
        saveGameToHistory(aliceGame);
        saveGameToHistory(unrelated);

        const result = getPlayerHistory('Alice');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('ag-1');
    });

    it('filters games where the player is playerTwo', () => {
        const bobGame = makeSession({
            id: 'bg-1',
            playerOne: { name: 'Alice', symbol: 'X', isAI: false },
            playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        });
        saveGameToHistory(bobGame);

        const result = getPlayerHistory('Bob');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('bg-1');
    });

    it('returns games in both playerOne and playerTwo roles', () => {
        const g1 = makeSession({
            id: 'multi-1',
            playerOne: { name: 'Alice', symbol: 'X', isAI: false },
            playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        });
        const g2 = makeSession({
            id: 'multi-2',
            playerOne: { name: 'Carol', symbol: 'X', isAI: false },
            playerTwo: { name: 'Alice', symbol: 'O', isAI: false },
        });
        saveGameToHistory(g1);
        saveGameToHistory(g2);

        expect(getPlayerHistory('Alice')).toHaveLength(2);
    });

    it('returns an empty array for a player with no history', () => {
        saveGameToHistory(makeSession({
            playerOne: { name: 'Alice', symbol: 'X', isAI: false },
            playerTwo: { name: 'Bob', symbol: 'O', isAI: false },
        }));
        expect(getPlayerHistory('Zara')).toEqual([]);
    });

    it('returns an empty array when history store contains corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-history', '{ bad');
        expect(getPlayerHistory('Alice')).toEqual([]);
    });
});

// ── 6. savePlayerMetrics / loadPlayerMetrics roundtrip ───────────────────────

describe('savePlayerMetrics / loadPlayerMetrics', () => {
    it('saves and loads metrics for a player', () => {
        const metrics = makeMetrics();
        savePlayerMetrics('Alice', metrics);

        expect(loadPlayerMetrics('Alice')).toEqual(metrics);
    });

    it('returns null for a player that has no saved metrics', () => {
        expect(loadPlayerMetrics('NonExistent')).toBeNull();
    });

    it('returns null when localStorage is empty', () => {
        expect(loadPlayerMetrics('AnyPlayer')).toBeNull();
    });

    it('returns null when the metrics store contains corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:player-metrics', '{ corrupt');
        expect(loadPlayerMetrics('Alice')).toBeNull();
    });

    it('updates metrics for a player when saved again', () => {
        savePlayerMetrics('Alice', makeMetrics({ totalGames: 5 }));
        savePlayerMetrics('Alice', makeMetrics({ totalGames: 10 }));

        expect(loadPlayerMetrics('Alice')?.totalGames).toBe(10);
    });

    it('stores metrics for multiple players independently', () => {
        savePlayerMetrics('Alice', makeMetrics({ totalGames: 8 }));
        savePlayerMetrics('Bob', makeMetrics({ totalGames: 3 }));

        expect(loadPlayerMetrics('Alice')?.totalGames).toBe(8);
        expect(loadPlayerMetrics('Bob')?.totalGames).toBe(3);
    });

    it('preserves difficulty stats through a save/load cycle', () => {
        const metrics = makeMetrics();
        savePlayerMetrics('Alice', metrics);

        const loaded = loadPlayerMetrics('Alice');
        expect(loaded?.difficultyStats[Difficulty.Hard].wins).toBe(0);
        expect(loaded?.difficultyStats[Difficulty.Easy].wins).toBe(2);
    });
});

// ── 7. Data recovery after simulated storage loss ───────────────────────────

describe('data recovery after simulated storage loss', () => {
    it('returns null for game sessions after storage is cleared externally', () => {
        const session = makeSession({ id: 'volatile' });
        saveGameSession(session);

        // Simulate external storage loss (e.g., browser clear)
        localStorage.removeItem('tic-tac-toe:game-sessions');

        expect(loadGameSession('volatile')).toBeNull();
        expect(getAllGameSessions()).toEqual([]);
    });

    it('returns empty history after storage is cleared externally', () => {
        saveGameToHistory(makeSession({ id: 'hist-volatile' }));
        localStorage.removeItem('tic-tac-toe:game-history');

        expect(getAllHistory()).toEqual([]);
        expect(getPlayerHistory('Alice')).toEqual([]);
    });

    it('returns null metrics after storage is cleared externally', () => {
        savePlayerMetrics('Alice', makeMetrics());
        localStorage.removeItem('tic-tac-toe:player-metrics');

        expect(loadPlayerMetrics('Alice')).toBeNull();
    });

    it('allows fresh writes after simulated storage loss', () => {
        saveGameSession(makeSession({ id: 'before-loss' }));
        localStorage.clear();

        const newSession = makeSession({ id: 'after-loss' });
        saveGameSession(newSession);

        expect(loadGameSession('after-loss')).toEqual(newSession);
        expect(loadGameSession('before-loss')).toBeNull();
    });
});

// ── 8. Error handling for corrupted data ─────────────────────────────────────

describe('error handling for corrupted data', () => {
    it('loadGameSession returns null without throwing on corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-sessions', '{ not json');
        expect(() => loadGameSession('any')).not.toThrow();
        expect(loadGameSession('any')).toBeNull();
    });

    it('getAllGameSessions returns [] without throwing on corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-sessions', '>>> broken <<<');
        expect(() => getAllGameSessions()).not.toThrow();
        expect(getAllGameSessions()).toEqual([]);
    });

    it('deleteGameSession does not throw on corrupted storage', () => {
        localStorage.setItem('tic-tac-toe:game-sessions', '{ broken');
        expect(() => deleteGameSession('any')).not.toThrow();
    });

    it('getAllHistory returns [] without throwing on corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-history', '[{ nope');
        expect(() => getAllHistory()).not.toThrow();
        expect(getAllHistory()).toEqual([]);
    });

    it('getPlayerHistory returns [] without throwing on corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:game-history', '{ broken');
        expect(() => getPlayerHistory('Alice')).not.toThrow();
        expect(getPlayerHistory('Alice')).toEqual([]);
    });

    it('loadPlayerMetrics returns null without throwing on corrupted JSON', () => {
        localStorage.setItem('tic-tac-toe:player-metrics', 'BROKEN');
        expect(() => loadPlayerMetrics('Alice')).not.toThrow();
        expect(loadPlayerMetrics('Alice')).toBeNull();
    });
});

// ── 9. Empty localStorage returns empty arrays ────────────────────────────────

describe('empty localStorage returns appropriate empty values', () => {
    it('getAllGameSessions returns [] on empty storage', () => {
        expect(getAllGameSessions()).toEqual([]);
    });

    it('getAllHistory returns [] on empty storage', () => {
        expect(getAllHistory()).toEqual([]);
    });

    it('getPlayerHistory returns [] on empty storage', () => {
        expect(getPlayerHistory('Alice')).toEqual([]);
    });

    it('loadPlayerMetrics returns null on empty storage', () => {
        expect(loadPlayerMetrics('NoOne')).toBeNull();
    });

    it('loadGameSession returns null on empty storage', () => {
        expect(loadGameSession('missing')).toBeNull();
    });
});
