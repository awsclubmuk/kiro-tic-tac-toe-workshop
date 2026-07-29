/**
 * Unit Tests for gamePersistence utilities
 * Task 6.3: recoverGameSession and sessionToGameState
 * Requirements: 13
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    recoverGameSession,
    sessionToGameState,
    persistGameState,
    clearPersistedSession,
} from '../gamePersistence';
import {
    saveCurrentSession,
    clearAllStorage,
} from '../storageAdapter';
import type { GameSession, GameState } from '../../types/index';
import { GameMode, GameStatus, Difficulty } from '../../types/index';

// ── Helpers ───────────────────────────────────────────────────────────────────

function createInProgressSession(overrides?: Partial<GameSession>): GameSession {
    return {
        id: 'session-abc',
        playerOne: { name: 'Player 1', symbol: 'X', isAI: false },
        playerTwo: { name: 'Player 2', symbol: 'O', isAI: false },
        result: null,
        boardConfig: { size: 3, winLineLength: 3 },
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        moves: [],
        startTime: Date.now() - 10000,
        endTime: null,
        winner: null,
        winningLines: [],
        ...overrides,
    };
}

function createGameState(overrides?: Partial<GameState>): GameState {
    return {
        board: [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ],
        currentPlayer: { name: 'Player 1', symbol: 'X', isAI: false },
        gameStatus: GameStatus.Playing,
        boardConfig: { size: 3, winLineLength: 3 },
        players: {
            playerOne: { name: 'Player 1', symbol: 'X', isAI: false },
            playerTwo: { name: 'Player 2', symbol: 'O', isAI: false },
        },
        moveHistory: [],
        gameMode: GameMode.TwoPlayer,
        difficulty: null,
        startTime: Date.now(),
        ...overrides,
    };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('recoverGameSession()', () => {
    beforeEach(() => {
        clearAllStorage();
    });

    afterEach(() => {
        clearAllStorage();
    });

    it('should return null when nothing is stored', () => {
        expect(recoverGameSession()).toBeNull();
    });

    it('should return the session when a valid in-progress session is persisted', () => {
        const session = createInProgressSession();
        saveCurrentSession(session);

        const recovered = recoverGameSession();
        expect(recovered).not.toBeNull();
        expect(recovered?.id).toBe('session-abc');
    });

    it('should return null for a completed session (result is not null)', () => {
        const completed = createInProgressSession({
            result: 'player-one-wins' as GameSession['result'],
            endTime: Date.now(),
        });
        saveCurrentSession(completed);

        const recovered = recoverGameSession();
        expect(recovered).toBeNull();
    });

    it('should return null for a session with a non-null endTime', () => {
        const ended = createInProgressSession({ endTime: Date.now() });
        saveCurrentSession(ended);

        const recovered = recoverGameSession();
        expect(recovered).toBeNull();
    });

    it('should clear storage when a non-recoverable session is found', () => {
        const completed = createInProgressSession({
            result: 'player-one-wins' as GameSession['result'],
            endTime: Date.now(),
        });
        saveCurrentSession(completed);
        recoverGameSession(); // should clear it

        // A second call should also return null (storage was cleared)
        expect(recoverGameSession()).toBeNull();
    });

    it('should preserve player information in recovered session', () => {
        const session = createInProgressSession({
            playerOne: { name: 'Spider-Man', symbol: '🕷️', isAI: false },
            playerTwo: { name: 'Green Goblin', symbol: '🕸️', isAI: false },
        });
        saveCurrentSession(session);

        const recovered = recoverGameSession();
        expect(recovered?.playerOne.name).toBe('Spider-Man');
        expect(recovered?.playerTwo.name).toBe('Green Goblin');
    });

    it('should preserve board configuration', () => {
        const session = createInProgressSession({
            boardConfig: { size: 5, winLineLength: 5 },
        });
        saveCurrentSession(session);

        const recovered = recoverGameSession();
        expect(recovered?.boardConfig.size).toBe(5);
        expect(recovered?.boardConfig.winLineLength).toBe(5);
    });

    it('should preserve move history', () => {
        const session = createInProgressSession({
            moves: [
                { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1000 },
                { row: 1, col: 1, symbol: 'O', playerName: 'Player 2', timestamp: 2000 },
            ],
        });
        saveCurrentSession(session);

        const recovered = recoverGameSession();
        expect(recovered?.moves).toHaveLength(2);
        expect(recovered?.moves[0].row).toBe(0);
        expect(recovered?.moves[1].row).toBe(1);
    });

    it('should handle corrupted localStorage data gracefully', () => {
        localStorage.setItem('tic-tac-toe:current-session', '{ bad json!!');

        expect(() => recoverGameSession()).not.toThrow();
        expect(recoverGameSession()).toBeNull();
    });

    it('should return null when session has invalid boardConfig size (<3)', () => {
        const session = createInProgressSession({
            boardConfig: { size: 2, winLineLength: 2 },
        });
        saveCurrentSession(session);

        expect(recoverGameSession()).toBeNull();
    });

    it('should return null when session has invalid boardConfig size (>10)', () => {
        const session = createInProgressSession({
            boardConfig: { size: 11, winLineLength: 11 },
        });
        saveCurrentSession(session);

        expect(recoverGameSession()).toBeNull();
    });

    it('should recover single-player session with CPU and difficulty', () => {
        const session = createInProgressSession({
            gameMode: GameMode.SinglePlayer,
            difficulty: Difficulty.Hard,
            playerTwo: { name: 'CPU', symbol: 'O', isAI: true },
        });
        saveCurrentSession(session);

        const recovered = recoverGameSession();
        expect(recovered).not.toBeNull();
        expect(recovered?.gameMode).toBe(GameMode.SinglePlayer);
        expect(recovered?.difficulty).toBe(Difficulty.Hard);
    });

    it('should return null when playerOne is missing required fields', () => {
        const session = createInProgressSession();
        // Manually corrupt playerOne
        const raw = JSON.parse(JSON.stringify(session));
        raw.playerOne = { name: '', symbol: 'X', isAI: false }; // empty name
        localStorage.setItem('tic-tac-toe:current-session', JSON.stringify(raw));

        expect(recoverGameSession()).toBeNull();
    });

    it('should return null when playerTwo is missing', () => {
        const raw = {
            ...createInProgressSession(),
            playerTwo: null,
        };
        localStorage.setItem('tic-tac-toe:current-session', JSON.stringify(raw));

        expect(recoverGameSession()).toBeNull();
    });

    it('should return null when moves field is not an array', () => {
        const raw: Record<string, unknown> = {
            ...createInProgressSession(),
            moves: 'not-an-array',
        };
        localStorage.setItem('tic-tac-toe:current-session', JSON.stringify(raw));

        expect(recoverGameSession()).toBeNull();
    });
});

// ── sessionToGameState ────────────────────────────────────────────────────────

describe('sessionToGameState()', () => {
    it('should return a GameState with status playing', () => {
        const session = createInProgressSession();
        const state = sessionToGameState(session);
        expect(state.gameStatus).toBe(GameStatus.Playing);
    });

    it('should reconstruct an empty board when no moves exist', () => {
        const session = createInProgressSession({ moves: [] });
        const state = sessionToGameState(session);

        expect(state.board).toHaveLength(3);
        state.board.forEach((row) => {
            expect(row).toHaveLength(3);
            row.forEach((cell) => expect(cell).toBeNull());
        });
    });

    it('should reconstruct the board correctly from moves', () => {
        const session = createInProgressSession({
            moves: [
                { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1 },
                { row: 1, col: 1, symbol: 'O', playerName: 'Player 2', timestamp: 2 },
                { row: 0, col: 2, symbol: 'X', playerName: 'Player 1', timestamp: 3 },
            ],
        });

        const state = sessionToGameState(session);

        expect(state.board[0][0]).toBe('X');
        expect(state.board[1][1]).toBe('O');
        expect(state.board[0][2]).toBe('X');
        expect(state.board[0][1]).toBeNull();
    });

    it('should set currentPlayer to playerOne when move count is even', () => {
        // 0 moves → playerOne's turn
        const session = createInProgressSession({ moves: [] });
        const state = sessionToGameState(session);
        expect(state.currentPlayer.name).toBe('Player 1');
    });

    it('should set currentPlayer to playerTwo when move count is odd', () => {
        const session = createInProgressSession({
            moves: [
                { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1 },
            ],
        });
        const state = sessionToGameState(session);
        expect(state.currentPlayer.name).toBe('Player 2');
    });

    it('should preserve board configuration', () => {
        const session = createInProgressSession({
            boardConfig: { size: 5, winLineLength: 5 },
        });
        const state = sessionToGameState(session);
        expect(state.boardConfig.size).toBe(5);
        expect(state.boardConfig.winLineLength).toBe(5);
    });

    it('should create a board matching the configured size', () => {
        const session = createInProgressSession({
            boardConfig: { size: 5, winLineLength: 5 },
            moves: [],
        });
        const state = sessionToGameState(session);
        expect(state.board).toHaveLength(5);
        state.board.forEach((row) => expect(row).toHaveLength(5));
    });

    it('should preserve move history', () => {
        const moves = [
            { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 100 },
            { row: 2, col: 2, symbol: 'O', playerName: 'Player 2', timestamp: 200 },
        ];
        const session = createInProgressSession({ moves });
        const state = sessionToGameState(session);

        expect(state.moveHistory).toHaveLength(2);
        expect(state.moveHistory[0].timestamp).toBe(100);
    });

    it('should preserve players in the players object', () => {
        const session = createInProgressSession({
            playerOne: { name: 'Alice', symbol: '🕷️', isAI: false },
            playerTwo: { name: 'Bob', symbol: '🕸️', isAI: false },
        });
        const state = sessionToGameState(session);

        expect(state.players.playerOne.name).toBe('Alice');
        expect(state.players.playerTwo.name).toBe('Bob');
        expect(state.players.playerOne.symbol).toBe('🕷️');
    });

    it('should preserve game mode and difficulty', () => {
        const session = createInProgressSession({
            gameMode: GameMode.SinglePlayer,
            difficulty: Difficulty.Medium,
        });
        const state = sessionToGameState(session);
        expect(state.gameMode).toBe(GameMode.SinglePlayer);
        expect(state.difficulty).toBe(Difficulty.Medium);
    });

    it('should preserve startTime', () => {
        const now = Date.now();
        const session = createInProgressSession({ startTime: now });
        const state = sessionToGameState(session);
        expect(state.startTime).toBe(now);
    });
});

// ── clearPersistedSession ────────────────────────────────────────────────────

describe('clearPersistedSession()', () => {
    beforeEach(() => clearAllStorage());
    afterEach(() => clearAllStorage());

    it('should remove the persisted session so recovery returns null', () => {
        const session = createInProgressSession();
        saveCurrentSession(session);
        clearPersistedSession();

        expect(recoverGameSession()).toBeNull();
    });

    it('should not throw when called with nothing stored', () => {
        expect(() => clearPersistedSession()).not.toThrow();
    });

    it('should not throw when called twice', () => {
        const session = createInProgressSession();
        saveCurrentSession(session);

        expect(() => {
            clearPersistedSession();
            clearPersistedSession();
        }).not.toThrow();
    });
});

// ── Integration: persistGameState → recoverGameSession ────────────────────────

describe('persistGameState → recoverGameSession integration', () => {
    beforeEach(() => clearAllStorage());
    afterEach(() => clearAllStorage());

    it('should recover a session that was saved via persistGameState', () => {
        const sessionId = 'integration-session';
        const state = createGameState();
        persistGameState(state, sessionId);

        const recovered = recoverGameSession();
        expect(recovered).not.toBeNull();
        expect(recovered?.id).toBe(sessionId);
    });

    it('should allow full round-trip: persist → recover → restore state', () => {
        const sessionId = 'round-trip';
        const state = createGameState({
            board: [
                ['X', null, null],
                [null, 'O', null],
                [null, null, null],
            ],
            moveHistory: [
                { row: 0, col: 0, symbol: 'X', playerName: 'Player 1', timestamp: 1 },
                { row: 1, col: 1, symbol: 'O', playerName: 'Player 2', timestamp: 2 },
            ],
        });

        persistGameState(state, sessionId);

        const recovered = recoverGameSession();
        expect(recovered).not.toBeNull();

        const restored = sessionToGameState(recovered!);
        expect(restored.board[0][0]).toBe('X');
        expect(restored.board[1][1]).toBe('O');
        expect(restored.moveHistory).toHaveLength(2);
    });
});
