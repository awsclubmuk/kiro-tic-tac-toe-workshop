/**
 * Integration Tests — Complete Game Flow
 * Task 11.8: Write integration tests for complete game flow
 * Requirements: 4, 6, 10, 11, 15
 *
 * Covers:
 * - 2-player game from setup to completion
 * - Single-player (vs CPU) game flow
 * - Game state persistence across moves
 * - Leaderboard updates after game
 * - Game history recording
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { useGameState } from '../../src/composables/useGameState';
import { useLeaderboard } from '../../src/composables/useLeaderboard';
import {
    saveGameToHistory,
    getAllHistory,
    saveGameSession,
    getAllGameSessions,
    clearAllStorage,
    loadCurrentSession,
    persistGameState,
    loadPersistedGameState,
} from '../../src/utils/storageAdapter';
import { detectWin } from '../../src/utils/boardUtils';
import type { GameSession, Player } from '../../src/types/index';
import { GameResult, GameMode, Difficulty } from '../../src/types/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

const PLAYER_ONE: Player = { name: 'Alice', symbol: 'X', isAI: false };
const PLAYER_TWO: Player = { name: 'Bob', symbol: 'O', isAI: false };
const CPU_PLAYER: Player = { name: 'CPU', symbol: 'O', isAI: true };

/** Build a completed game session with the given overrides. */
function makeCompletedSession(overrides: Partial<GameSession> = {}): GameSession {
    return {
        id: `session-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        playerOne: PLAYER_ONE,
        playerTwo: PLAYER_TWO,
        result: GameResult.PlayerOneWins,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [],
        startTime: Date.now() - 5000,
        endTime: Date.now(),
        winner: 'Alice',
        winningLines: [[[0, 0], [0, 1], [0, 2]]],
        ...overrides,
    };
}

// ── Setup / Teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
    clearAllStorage();
    localStorage.clear();
});

afterEach(() => {
    clearAllStorage();
    localStorage.clear();
    vi.restoreAllMocks();
});

// ── 1. Two-player game from setup to completion ───────────────────────────────

describe('2-player game — setup to completion (Requirement 4)', () => {
    it('initialises game with correct player configuration', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        expect(gs.gameStatus.value).toBe('playing');
        expect(gs.boardConfig.size).toBe(3);
        expect(gs.players.playerOne.name).toBe('Alice');
        expect(gs.players.playerTwo.name).toBe('Bob');
        expect(gs.players.playerOne.isAI).toBe(false);
        expect(gs.players.playerTwo.isAI).toBe(false);
        expect(gs.moveHistory.value).toHaveLength(0);
    });

    it('alternates players across moves', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        expect(gs.getCurrentPlayer().name).toBe('Alice');
        gs.makeMove(0, 0);
        gs.switchTurn();
        expect(gs.getCurrentPlayer().name).toBe('Bob');
        gs.makeMove(1, 0);
        gs.switchTurn();
        expect(gs.getCurrentPlayer().name).toBe('Alice');
    });

    it('records all moves in history with correct player and symbol', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        gs.makeMove(0, 0); // Alice → X
        gs.switchTurn();
        gs.makeMove(1, 1); // Bob → O
        gs.switchTurn();
        gs.makeMove(0, 1); // Alice → X

        expect(gs.moveHistory.value).toHaveLength(3);
        expect(gs.moveHistory.value[0]).toMatchObject({ row: 0, col: 0, symbol: 'X', playerName: 'Alice' });
        expect(gs.moveHistory.value[1]).toMatchObject({ row: 1, col: 1, symbol: 'O', playerName: 'Bob' });
        expect(gs.moveHistory.value[2]).toMatchObject({ row: 0, col: 1, symbol: 'X', playerName: 'Alice' });
    });

    it('win is detected on top row', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        gs.makeMove(0, 0); gs.switchTurn();
        gs.makeMove(1, 0); gs.switchTurn();
        gs.makeMove(0, 1); gs.switchTurn();
        gs.makeMove(1, 1); gs.switchTurn();
        gs.makeMove(0, 2); // Alice completes top row

        const winResult = detectWin(gs.board.value, 3);
        expect(winResult.winner).toBe('X');
        expect(winResult.winningLines).toHaveLength(1);
        expect(winResult.winningLines[0]).toContainEqual([0, 0]);
        expect(winResult.winningLines[0]).toContainEqual([0, 1]);
        expect(winResult.winningLines[0]).toContainEqual([0, 2]);
    });

    it('completed game result is recorded in history', () => {
        const session = makeCompletedSession({ winner: 'Alice', result: GameResult.PlayerOneWins });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history).toHaveLength(1);
        expect(history[0].winner).toBe('Alice');
        expect(history[0].result).toBe(GameResult.PlayerOneWins);
        expect(history[0].playerOne.name).toBe('Alice');
        expect(history[0].playerTwo.name).toBe('Bob');
    });

    it('board state is correct after a full winning sequence', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        // Alice: (0,0),(0,1),(0,2)  Bob: (1,0),(1,1)
        gs.makeMove(0, 0); gs.switchTurn();
        gs.makeMove(1, 0); gs.switchTurn();
        gs.makeMove(0, 1); gs.switchTurn();
        gs.makeMove(1, 1); gs.switchTurn();
        gs.makeMove(0, 2);

        expect(gs.board.value[0]).toEqual(['X', 'X', 'X']);
        expect(gs.board.value[1][0]).toBe('O');
        expect(gs.board.value[1][1]).toBe('O');
    });

    it('game can end in a draw', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        // Classic draw (alternating turns produce this board):
        // X O X
        // X O O
        // O X X
        const moves: [number, number][] = [
            [0, 0], [0, 1], [0, 2],
            [1, 1], [1, 0], [1, 2],
            [2, 1], [2, 0], [2, 2],
        ];
        for (const [r, c] of moves) {
            gs.makeMove(r, c);
            gs.switchTurn();
        }

        const winResult = detectWin(gs.board.value, 3);
        expect(winResult.winner).toBeNull();
        expect(gs.isBoardFilledComputed.value).toBe(true);
    });
});

// ── 2. Single-player vs CPU game flow (Requirement 6) ────────────────────────

describe('single-player vs CPU game (Requirement 6)', () => {
    it('initialises single-player game with CPU as player two', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Easy);

        expect(gs.gameMode.value).toBe('single-player');
        expect(gs.difficulty.value).toBe(Difficulty.Easy);
        expect(gs.players.playerTwo.isAI).toBe(true);
        expect(gs.players.playerTwo.name).toBe('CPU');
    });

    it('CPU player is identified as AI', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Medium);

        // Human starts first
        expect(gs.getCurrentPlayer().isAI).toBe(false);
        gs.makeMove(0, 0);
        gs.switchTurn();
        // Now it is the CPU's turn
        expect(gs.getCurrentPlayer().isAI).toBe(true);
    });

    it('CPU move is placed on the board as a valid move', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Hard);

        // Human plays
        gs.makeMove(0, 0);
        gs.switchTurn();

        // Simulate CPU picking cell (1,1)
        const cpuResult = gs.makeMove(1, 1);
        expect(cpuResult).toBe(true);
        expect(gs.board.value[1][1]).toBe('O');
    });

    it('move history records both human and CPU moves', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Easy);

        gs.makeMove(0, 0); // human
        gs.switchTurn();
        gs.makeMove(1, 1); // cpu
        gs.switchTurn();
        gs.makeMove(0, 1); // human

        expect(gs.moveHistory.value).toHaveLength(3);
        expect(gs.moveHistory.value[0].playerName).toBe('Alice');
        expect(gs.moveHistory.value[1].playerName).toBe('CPU');
        expect(gs.moveHistory.value[2].playerName).toBe('Alice');
    });

    it('CPU winning is detected on the board', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Hard);

        // Place CPU wins on column 0: rows 0,1,2 with O
        gs.makeMove(0, 1); gs.switchTurn(); // Alice
        gs.makeMove(0, 0); gs.switchTurn(); // CPU
        gs.makeMove(1, 1); gs.switchTurn(); // Alice
        gs.makeMove(1, 0); gs.switchTurn(); // CPU
        gs.makeMove(2, 2); gs.switchTurn(); // Alice
        gs.makeMove(2, 0);                  // CPU wins column 0

        const winResult = detectWin(gs.board.value, 3);
        expect(winResult.winner).toBe('O');
    });

    it('single-player game session is saved to history with difficulty', () => {
        const session = makeCompletedSession({
            playerTwo: CPU_PLAYER,
            gameMode: GameMode.SinglePlayer,
            difficulty: Difficulty.Hard,
            result: GameResult.PlayerTwoWins,
            winner: 'CPU',
        });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history).toHaveLength(1);
        expect(history[0].gameMode).toBe('single-player');
        expect(history[0].difficulty).toBe(Difficulty.Hard);
        expect(history[0].winner).toBe('CPU');
    });
});

// ── 3. Game state persistence across moves (Requirements 10, 15) ──────────────

describe('game state persistence across moves (Requirements 10, 15)', () => {
    it('persistGameState saves board and move history to localStorage', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);
        gs.makeMove(0, 0);
        gs.switchTurn();
        gs.makeMove(1, 1);

        persistGameState(gs.getGameState(), 'test-session');

        const loaded = loadPersistedGameState();
        expect(loaded).not.toBeNull();
        expect(loaded!.board[0][0]).toBe('X');
        expect(loaded!.board[1][1]).toBe('O');
        expect(loaded!.moveHistory).toHaveLength(2);
    });

    it('restored game state has identical board to saved state', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);
        gs.makeMove(0, 0);
        gs.switchTurn();
        gs.makeMove(2, 2);

        const snapshot = gs.getGameState();
        persistGameState(snapshot, 'restore-test');

        const loaded = loadPersistedGameState()!;
        const gs2 = useGameState();
        gs2.restoreGameState(loaded);

        expect(gs2.board.value[0][0]).toBe('X');
        expect(gs2.board.value[2][2]).toBe('O');
        expect(gs2.players.playerOne.name).toBe('Alice');
        expect(gs2.players.playerTwo.name).toBe('Bob');
    });

    it('persisted game state includes a timestamp', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);
        gs.makeMove(0, 0);

        const before = Date.now();
        persistGameState(gs.getGameState(), 'ts-test');
        const after = Date.now();

        const loaded = loadPersistedGameState()!;
        expect(loaded.timestamp).toBeGreaterThanOrEqual(before);
        expect(loaded.timestamp).toBeLessThanOrEqual(after);
    });

    it('each move is reflected in the next persist call', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO);

        gs.makeMove(0, 0);
        persistGameState(gs.getGameState(), 'move-persist');
        const after1 = loadPersistedGameState()!;
        expect(after1.moveHistory).toHaveLength(1);

        gs.switchTurn();
        gs.makeMove(1, 1);
        persistGameState(gs.getGameState(), 'move-persist');
        const after2 = loadPersistedGameState()!;
        expect(after2.moveHistory).toHaveLength(2);
    });

    it('player configuration is preserved after save and load', () => {
        const gs = useGameState();
        gs.initializeGame(3, 'single-player', PLAYER_ONE, CPU_PLAYER, Difficulty.Medium);
        gs.makeMove(0, 0);
        persistGameState(gs.getGameState(), 'config-persist');

        const loaded = loadPersistedGameState()!;
        expect(loaded.players.playerOne.name).toBe('Alice');
        expect(loaded.players.playerTwo.isAI).toBe(true);
        expect(loaded.difficulty).toBe(Difficulty.Medium);
        expect(loaded.gameMode).toBe('single-player');
    });
});

// ── 4. Leaderboard updates after game (Requirement 11) ───────────────────────

describe('leaderboard updates after game end (Requirement 11)', () => {
    it('winner appears on leaderboard after game', () => {
        const session = makeCompletedSession({ winner: 'Alice', result: GameResult.PlayerOneWins });
        saveGameToHistory(session);

        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();

        const alice = board.find((e) => e.name === 'Alice');
        expect(alice).toBeDefined();
        expect(alice!.metrics.totalWins).toBe(1);
        expect(alice!.metrics.totalGames).toBe(1);
    });

    it('loser also appears on leaderboard with correct loss stats', () => {
        const session = makeCompletedSession({ winner: 'Alice', result: GameResult.PlayerOneWins });
        saveGameToHistory(session);

        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();

        const bob = board.find((e) => e.name === 'Bob');
        expect(bob).toBeDefined();
        expect(bob!.metrics.totalLosses).toBe(1);
        expect(bob!.metrics.totalWins).toBe(0);
    });

    it('winner is ranked higher than loser', () => {
        const session = makeCompletedSession({ winner: 'Alice', result: GameResult.PlayerOneWins });
        saveGameToHistory(session);

        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();

        const aliceRank = board.findIndex((e) => e.name === 'Alice');
        const bobRank = board.findIndex((e) => e.name === 'Bob');
        expect(aliceRank).toBeLessThan(bobRank);
    });

    it('win percentage is correct for player with multiple games', () => {
        saveGameToHistory(makeCompletedSession({ id: 's1', winner: 'Alice', result: GameResult.PlayerOneWins }));
        saveGameToHistory(makeCompletedSession({ id: 's2', winner: 'Bob', result: GameResult.PlayerTwoWins }));
        saveGameToHistory(makeCompletedSession({ id: 's3', winner: 'Alice', result: GameResult.PlayerOneWins }));

        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();

        const alice = board.find((e) => e.name === 'Alice')!;
        expect(alice.metrics.totalGames).toBe(3);
        expect(alice.metrics.totalWins).toBe(2);
        expect(alice.metrics.winPercentage).toBeCloseTo(66.67, 1);
    });

    it('refreshLeaderboard reflects new game added to history', () => {
        const { leaderboard, buildLeaderboard, refreshLeaderboard } = useLeaderboard();

        buildLeaderboard();
        expect(leaderboard.value).toHaveLength(0);

        saveGameToHistory(makeCompletedSession({ winner: 'Alice', result: GameResult.PlayerOneWins }));
        refreshLeaderboard();

        const names = leaderboard.value.map((e) => e.name);
        expect(names).toContain('Alice');
        expect(names).toContain('Bob');
    });

    it('draw game increments totalDraws for both players', () => {
        const drawSession = makeCompletedSession({
            result: GameResult.Draw,
            winner: null,
            winningLines: [],
        });
        saveGameToHistory(drawSession);

        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();

        const alice = board.find((e) => e.name === 'Alice')!;
        const bob = board.find((e) => e.name === 'Bob')!;
        expect(alice.metrics.totalDraws).toBe(1);
        expect(bob.metrics.totalDraws).toBe(1);
        expect(alice.metrics.totalWins).toBe(0);
        expect(bob.metrics.totalWins).toBe(0);
    });
});

// ── 5. Game history recording (Requirements 10, 15) ──────────────────────────

describe('game history recording (Requirements 10, 15)', () => {
    it('completed game session is stored with correct players', () => {
        const session = makeCompletedSession();
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history).toHaveLength(1);
        expect(history[0].playerOne.name).toBe('Alice');
        expect(history[0].playerTwo.name).toBe('Bob');
    });

    it('game session stores the result', () => {
        const session = makeCompletedSession({ result: GameResult.PlayerTwoWins, winner: 'Bob' });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history[0].result).toBe(GameResult.PlayerTwoWins);
        expect(history[0].winner).toBe('Bob');
    });

    it('game session contains move list', () => {
        const moves = [
            { row: 0, col: 0, symbol: 'X', playerName: 'Alice', timestamp: 1000 },
            { row: 1, col: 1, symbol: 'O', playerName: 'Bob', timestamp: 2000 },
        ];
        const session = makeCompletedSession({ moves });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history[0].moves).toHaveLength(2);
        expect(history[0].moves[0]).toMatchObject({ row: 0, col: 0, symbol: 'X', playerName: 'Alice' });
        expect(history[0].moves[1]).toMatchObject({ row: 1, col: 1, symbol: 'O', playerName: 'Bob' });
    });

    it('game session includes startTime and endTime timestamps', () => {
        const startTime = Date.now() - 10000;
        const endTime = Date.now();
        const session = makeCompletedSession({ startTime, endTime });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history[0].startTime).toBe(startTime);
        expect(history[0].endTime).toBe(endTime);
    });

    it('multiple game sessions accumulate in history', () => {
        saveGameToHistory(makeCompletedSession({ id: 'game-1' }));
        saveGameToHistory(makeCompletedSession({ id: 'game-2' }));
        saveGameToHistory(makeCompletedSession({ id: 'game-3' }));

        const history = getAllHistory();
        expect(history).toHaveLength(3);
    });

    it('sessions are also retrievable by saveGameSession / getAllGameSessions', () => {
        const s1 = makeCompletedSession({ id: 'keyed-1' });
        const s2 = makeCompletedSession({ id: 'keyed-2' });
        saveGameSession(s1);
        saveGameSession(s2);

        const sessions = getAllGameSessions();
        expect(sessions.map((s) => s.id)).toContain('keyed-1');
        expect(sessions.map((s) => s.id)).toContain('keyed-2');
    });

    it('single-player session records game mode and difficulty', () => {
        const session = makeCompletedSession({
            playerTwo: CPU_PLAYER,
            gameMode: GameMode.SinglePlayer,
            difficulty: Difficulty.Hard,
        });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history[0].gameMode).toBe(GameMode.SinglePlayer);
        expect(history[0].difficulty).toBe(Difficulty.Hard);
    });

    it('game session preserves board configuration', () => {
        const session = makeCompletedSession({
            boardConfig: { size: 5, winLineLength: 5 },
        });
        saveGameToHistory(session);

        const history = getAllHistory();
        expect(history[0].boardConfig.size).toBe(5);
        expect(history[0].boardConfig.winLineLength).toBe(5);
    });
});

// ── 6. End-to-end flow: play → persist → record → leaderboard ────────────────

describe('end-to-end: play, persist, record, leaderboard', () => {
    it('full 2-player game flow: moves → win detection → history → leaderboard', () => {
        // 1. Set up game
        const gs = useGameState();
        gs.initializeGame(3, 'two-player', PLAYER_ONE, PLAYER_TWO, undefined, 'e2e-session');

        // 2. Play moves — Alice wins on top row
        gs.makeMove(0, 0); gs.switchTurn();
        gs.makeMove(1, 0); gs.switchTurn();
        gs.makeMove(0, 1); gs.switchTurn();
        gs.makeMove(1, 1); gs.switchTurn();
        gs.makeMove(0, 2);

        // 3. Detect win
        const winResult = detectWin(gs.board.value, 3);
        expect(winResult.winner).toBe('X');

        // 4. Persist mid-game state
        persistGameState(gs.getGameState(), 'e2e-session');
        const persisted = loadPersistedGameState()!;
        expect(persisted.board[0]).toEqual(['X', 'X', 'X']);

        // 5. Build completed session and save to history
        gs.setGameStatus('game-over');
        const completedSession: GameSession = {
            id: 'e2e-session',
            playerOne: gs.players.playerOne,
            playerTwo: gs.players.playerTwo,
            result: GameResult.PlayerOneWins,
            boardConfig: { ...gs.boardConfig },
            gameMode: gs.gameMode.value,
            difficulty: gs.difficulty.value,
            moves: [...gs.moveHistory.value],
            startTime: gs.startTime.value,
            endTime: Date.now(),
            winner: 'Alice',
            winningLines: winResult.winningLines,
        };
        saveGameToHistory(completedSession);

        // 6. Verify history
        const history = getAllHistory();
        expect(history).toHaveLength(1);
        expect(history[0].winner).toBe('Alice');
        expect(history[0].moves).toHaveLength(5);

        // 7. Verify leaderboard
        const { buildLeaderboard } = useLeaderboard();
        const board = buildLeaderboard();
        const alice = board.find((e) => e.name === 'Alice')!;
        const bob = board.find((e) => e.name === 'Bob')!;
        expect(alice.metrics.totalWins).toBe(1);
        expect(bob.metrics.totalLosses).toBe(1);
        expect(board[0].name).toBe('Alice'); // Alice is ranked #1
    });
});
