/**
 * Storage Adapter for LocalStorage Operations
 * Tasks 6.1, 6.2, 6.4, 7.5 — Requirements: 10, 12, 13
 *
 * All functions share a single consistent set of storage keys.
 * The test suite imports: saveGameSession, loadGameSession, getAllGameSessions,
 * deleteGameSession, saveGameToHistory, getAllHistory, getPlayerHistory,
 * savePlayerMetrics, loadPlayerMetrics, getAllPlayerMetrics,
 * saveCurrentSession, loadCurrentSession, clearCurrentSession, clearAllStorage,
 * persistGameState, loadPersistedGameState, clearPersistedGameState.
 */

import type { GameSession, GameState, PlayerMetrics } from '../types/index';
import { calculatePlayerMetrics } from './metricsCalculator';

// ── Storage keys ──────────────────────────────────────────────────────────────
const KEYS = {
    SESSIONS: 'tic-tac-toe:game-sessions',   // keyed map { [id]: GameSession }
    HISTORY: 'tic-tac-toe:game-history',    // ordered array GameSession[]
    METRICS: 'tic-tac-toe:player-metrics',  // { [playerName]: PlayerMetrics }
    CURRENT: 'tic-tac-toe:current-session', // single GameSession
    FILTERS: 'tic-tac-toe:filter-prefs',    // filter preferences
    GAME_STATE: 'ttt_current_game',         // active in-progress GameState (Task 6.2)
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function safeGet<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function safeSet(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error(`localStorage.setItem(${key}) failed:`, err);
        throw err;
    }
}

// ── Game Sessions (keyed map) ─────────────────────────────────────────────────

/** Save or overwrite a game session by id. */
export function saveGameSession(session: GameSession): void {
    const map = safeGet<Record<string, GameSession>>(KEYS.SESSIONS) ?? {};
    map[session.id] = session;
    safeSet(KEYS.SESSIONS, map);
}

/** Load a single session by id. Returns null if not found or data is corrupted. */
export function loadGameSession(id: string): GameSession | null {
    const map = safeGet<Record<string, GameSession>>(KEYS.SESSIONS);
    if (!map) return null;
    return map[id] ?? null;
}

/** Return all stored sessions as an array, filtering out any nullish entries. */
export function getAllGameSessions(): GameSession[] {
    const map = safeGet<Record<string, GameSession>>(KEYS.SESSIONS);
    if (!map) return [];
    return Object.values(map).filter((s): s is GameSession => !!s && typeof s === 'object');
}

/** Delete a session by id. No-op if id not found. */
export function deleteGameSession(id: string): void {
    const map = safeGet<Record<string, GameSession>>(KEYS.SESSIONS) ?? {};
    delete map[id];
    try {
        safeSet(KEYS.SESSIONS, map);
    } catch {
        // ignore
    }
}

// ── Game History (ordered array) ─────────────────────────────────────────────

/** Append a completed game to the ordered history array. */
export function saveGameToHistory(session: GameSession): void {
    const history = safeGet<GameSession[]>(KEYS.HISTORY) ?? [];
    history.push(session);
    safeSet(KEYS.HISTORY, history);
}

/** Return the full ordered game history array. */
export function getAllHistory(): GameSession[] {
    const history = safeGet<GameSession[]>(KEYS.HISTORY);
    if (!Array.isArray(history)) return [];
    return history.filter((s): s is GameSession => !!s && typeof s === 'object');
}

/** Return history entries involving a specific player. */
export function getPlayerHistory(playerName: string): GameSession[] {
    return getAllHistory().filter(
        (s) => s.playerOne?.name === playerName || s.playerTwo?.name === playerName,
    );
}

/** Filter history by result string. */
export function getGamesByResult(result: string): GameSession[] {
    return getAllHistory().filter((s) => s.result === result);
}

/** Filter history by date range (timestamps). */
export function getGamesByDateRange(start: number, end: number): GameSession[] {
    return getAllHistory().filter((s) => s.startTime >= start && s.startTime <= end);
}

// ── Player Metrics ────────────────────────────────────────────────────────────

/** Save metrics for one player. */
export function savePlayerMetrics(playerName: string, metrics: PlayerMetrics): void {
    const all = safeGet<Record<string, PlayerMetrics>>(KEYS.METRICS) ?? {};
    all[playerName] = metrics;
    safeSet(KEYS.METRICS, all);
}

/** Load metrics for one player. Returns null if none stored. */
export function loadPlayerMetrics(playerName: string): PlayerMetrics | null {
    const all = safeGet<Record<string, PlayerMetrics>>(KEYS.METRICS);
    return all?.[playerName] ?? null;
}

/** Return all stored player metrics as a map. */
export function getAllPlayerMetrics(): Record<string, PlayerMetrics> {
    return safeGet<Record<string, PlayerMetrics>>(KEYS.METRICS) ?? {};
}

/**
 * Recalculate metrics for a player from their game history and persist them.
 * Retrieves the player's history via getPlayerHistory, calculates metrics via
 * calculatePlayerMetrics, then saves the result via savePlayerMetrics.
 *
 * @param playerName - The player whose metrics to recalculate and save
 */
export function recalculateAndSaveMetrics(playerName: string): void {
    const history = getPlayerHistory(playerName);
    const metrics = calculatePlayerMetrics(history, playerName);
    savePlayerMetrics(playerName, metrics);
}

// ── Current (in-progress) Session ────────────────────────────────────────────

/** Persist the current in-progress session for crash recovery. */
export function saveCurrentSession(session: GameSession): void {
    safeSet(KEYS.CURRENT, session);
}

/** Load the persisted in-progress session. Returns null if none or corrupted. */
export function loadCurrentSession(): GameSession | null {
    return safeGet<GameSession>(KEYS.CURRENT);
}

/** Remove the in-progress session (call after game ends). */
export function clearCurrentSession(): void {
    try { localStorage.removeItem(KEYS.CURRENT); } catch { /* ignore */ }
}

// ── Filter Preferences ────────────────────────────────────────────────────────

export function saveFilterPreferences(filters: Record<string, unknown>): void {
    safeSet(KEYS.FILTERS, filters);
}

export function loadFilterPreferences(): Record<string, unknown> {
    return safeGet<Record<string, unknown>>(KEYS.FILTERS) ?? {};
}

// ── Active Game State (GameState, Task 6.2) ───────────────────────────────────

/**
 * Persist the full active game state after each move.
 * Saves board, currentPlayer, moveHistory, boardConfig, players, and a
 * timestamp so the game can be recovered after an interruption.
 * Key: 'ttt_current_game'
 */
export function persistGameState(gameState: GameState): void {
    const payload = {
        board: gameState.board,
        currentPlayer: gameState.currentPlayer,
        moveHistory: gameState.moveHistory,
        boardConfig: gameState.boardConfig,
        players: gameState.players,
        gameMode: gameState.gameMode,
        difficulty: gameState.difficulty,
        gameStatus: gameState.gameStatus,
        startTime: gameState.startTime,
        timestamp: Date.now(),
    };
    safeSet(KEYS.GAME_STATE, payload);
}

/**
 * Load the last persisted game state.
 * Returns null if none is stored or the data is corrupted.
 */
export function loadPersistedGameState(): (GameState & { timestamp: number }) | null {
    return safeGet<GameState & { timestamp: number }>(KEYS.GAME_STATE);
}

/**
 * Remove the persisted game state (call when a game ends or is abandoned).
 */
export function clearPersistedGameState(): void {
    try { localStorage.removeItem(KEYS.GAME_STATE); } catch { /* ignore */ }
}

// ── Active Game (raw string, for legacy compatibility) ────────────────────────

export function saveActiveGame(gameState: string): void {
    try { localStorage.setItem('tic-tac-toe-active-game', gameState); } catch { /* ignore */ }
}

export function loadActiveGame(): string | null {
    try { return localStorage.getItem('tic-tac-toe-active-game'); } catch { return null; }
}

export function clearActiveGame(): void {
    try { localStorage.removeItem('tic-tac-toe-active-game'); } catch { /* ignore */ }
}

// ── Clear All ─────────────────────────────────────────────────────────────────

/** Clear every storage key used by this adapter. */
export function clearAllStorage(): void {
    try {
        Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
        localStorage.removeItem('tic-tac-toe-active-game');
        // legacy keys
        localStorage.removeItem('tic-tac-toe-game-sessions');
        localStorage.removeItem('tic-tac-toe-player-metrics');
        localStorage.removeItem('tic-tac-toe-filter-preferences');
    } catch { /* ignore */ }
}

/** Alias kept for backwards compatibility. */
export const clearAllData = clearAllStorage;

/** Alias: loadAllPlayerMetrics */
export const loadAllPlayerMetrics = getAllPlayerMetrics;
