/**
 * Game State Persistence Utilities
 * Task 6.2: Implement game state persistence to localStorage
 * Task 6.5: Implement auto-save after each move
 * Requirements: 13
 *
 * Provides utilities for persisting game state and implementing auto-save functionality
 */

import type { GameState, GameSession } from '../types/index';
import {
    saveCurrentSession,
    loadCurrentSession,
    clearCurrentSession,
} from './storageAdapter';

// Auto-save debounce delay in milliseconds
const AUTO_SAVE_DELAY = 500;

// Track pending auto-save timer
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Convert GameState to GameSession for storage
 * @param gameState - Current game state
 * @param sessionId - Unique session identifier
 * @returns GameSession ready for storage
 */
export function gameStateToSession(gameState: GameState, sessionId: string): GameSession {
    return {
        id: sessionId,
        playerOne: gameState.players.playerOne,
        playerTwo: gameState.players.playerTwo,
        result: null, // In-progress game
        boardConfig: gameState.boardConfig,
        gameMode: gameState.gameMode,
        difficulty: gameState.difficulty,
        moves: gameState.moveHistory,
        startTime: gameState.startTime,
        endTime: null, // In-progress game
        winner: null, // In-progress game
        winningLines: [], // In-progress game
    };
}

/**
 * Persist game state to localStorage
 * Saves board state, current player, move history, and configuration
 *
 * @param gameState - Current game state to persist
 * @param sessionId - Unique identifier for this game session
 */
export function persistGameState(
    gameState: GameState,
    sessionId: string
): void {
    try {
        const session = gameStateToSession(gameState, sessionId);
        saveCurrentSession(session);
    } catch (error) {
        console.error('Failed to persist game state:', error);
    }
}

/**
 * Persist game state with debouncing for auto-save
 * Prevents excessive storage writes by debouncing rapid moves
 *
 * @param gameState - Current game state to persist
 * @param sessionId - Unique identifier for this game session
 * @param delay - Optional delay in milliseconds (defaults to 500ms)
 */
export function persistGameStateDebounced(
    gameState: GameState,
    sessionId: string,
    delay: number = AUTO_SAVE_DELAY
): void {
    // Clear any pending auto-save
    if (autoSaveTimer !== null) {
        clearTimeout(autoSaveTimer);
    }

    // Schedule new auto-save
    autoSaveTimer = setTimeout(() => {
        persistGameState(gameState, sessionId);
        autoSaveTimer = null;
    }, delay);
}

/**
 * Validate a game session has all required fields for recovery
 * @param session - Session to validate
 * @returns true if session is valid and recoverable
 */
function isValidRecoverableSession(session: unknown): session is GameSession {
    if (!session || typeof session !== 'object') return false;

    const s = session as Record<string, unknown>;

    // Must be in-progress: result and endTime must be null
    if (s.result !== null) return false;
    if (s.endTime !== null) return false;

    // Required string fields
    if (typeof s.id !== 'string' || !s.id) return false;
    if (typeof s.gameMode !== 'string' || !s.gameMode) return false;
    if (typeof s.startTime !== 'number') return false;

    // Board config
    if (!s.boardConfig || typeof s.boardConfig !== 'object') return false;
    const bc = s.boardConfig as Record<string, unknown>;
    if (typeof bc.size !== 'number' || bc.size < 3 || bc.size > 10) return false;
    if (typeof bc.winLineLength !== 'number') return false;

    // Players
    if (!isValidPlayer(s.playerOne)) return false;
    if (!isValidPlayer(s.playerTwo)) return false;

    // Moves must be an array
    if (!Array.isArray(s.moves)) return false;

    // Winning lines must be an array
    if (!Array.isArray(s.winningLines)) return false;

    return true;
}

/**
 * Validate a player object has required fields
 * @param player - Player to validate
 * @returns true if player is valid
 */
function isValidPlayer(player: unknown): boolean {
    if (!player || typeof player !== 'object') return false;
    const p = player as Record<string, unknown>;
    return (
        typeof p.name === 'string' &&
        p.name.length > 0 &&
        typeof p.symbol === 'string' &&
        p.symbol.length > 0 &&
        typeof p.isAI === 'boolean'
    );
}

/**
 * Recover game session on app startup
 * Attempts to restore an in-progress game from storage.
 * Only returns a session if it is genuinely in-progress (result and endTime are null)
 * and passes integrity validation.
 *
 * @returns Recovered GameSession or null if no session to recover or session is invalid
 */
export function recoverGameSession(): GameSession | null {
    try {
        const session = loadCurrentSession();
        if (!session) return null;

        if (!isValidRecoverableSession(session)) {
            // Session exists but is not recoverable (completed or corrupted) — clear it
            clearCurrentSession();
            return null;
        }

        return session;
    } catch (error) {
        console.error('Failed to recover game session:', error);
        return null;
    }
}

/**
 * Convert recovered GameSession back to GameState
 * Used after recovering a session to restore game play
 *
 * @param session - GameSession recovered from storage
 * @returns GameState ready for game resumption
 */
export function sessionToGameState(session: GameSession): GameState {
    return {
        board: session.moves.reduce((board, move) => {
            // Reconstruct board from moves
            const newBoard = board.map((row) => [...row]);
            newBoard[move.row][move.col] = move.symbol;
            return newBoard;
        }, Array(session.boardConfig.size).fill(null).map(() => Array(session.boardConfig.size).fill(null))),
        currentPlayer:
            session.moves.length % 2 === 0
                ? session.playerOne
                : session.playerTwo,
        gameStatus: 'playing',
        boardConfig: session.boardConfig,
        players: {
            playerOne: session.playerOne,
            playerTwo: session.playerTwo,
        },
        moveHistory: session.moves,
        gameMode: session.gameMode,
        difficulty: session.difficulty,
        startTime: session.startTime,
    };
}

/**
 * Clear auto-save timer (call on game end or app shutdown)
 */
export function cancelAutoSave(): void {
    if (autoSaveTimer !== null) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
    }
}

/**
 * Clear persisted session from storage (call after game completion)
 */
export function clearPersistedSession(): void {
    try {
        clearCurrentSession();
    } catch (error) {
        console.error('Failed to clear persisted session:', error);
    }
}
