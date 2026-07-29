/**
 * Game Result Recorder
 * Task 9.5: Implement game result recording and analytics
 * Requirements: 10, 11, 12
 *
 * Records game results, updates history, metrics, and leaderboard
 */

import type { GameSession, GameResult, PlayerMetrics } from '../types/index';
import {
    saveGameToHistory,
    savePlayerMetrics,
    loadPlayerMetrics,
    getAllHistory,
    getAllGameSessions,
} from './storageAdapter';
import {
    calculatePlayerMetrics,
} from './metricsCalculator';

/**
 * Record a completed game result
 * - Save to game history
 * - Update player metrics
 * - Update leaderboard
 *
 * @param gameSession - Completed game session
 */
export function recordGameResult(gameSession: GameSession): void {
    try {
        // 1. Save to game history
        saveGameToHistory(gameSession);

        // 2. Update player one metrics
        updatePlayerMetrics(gameSession.playerOne.name);

        // 3. Update player two metrics
        updatePlayerMetrics(gameSession.playerTwo.name);

        // 4. Leaderboard is automatically updated via calculateLeaderboard()
        // No explicit action needed - it's computed from game history
    } catch (error) {
        console.error('Error recording game result:', error);
    }
}

/**
 * Recalculate and save metrics for a player from a supplied history slice.
 * This is the canonical helper for Task 7.5 — call it after every game end
 * to keep persisted metrics in sync with game history.
 *
 * @param playerName  - The player whose metrics to update
 * @param allHistory  - All game sessions involving that player (pre-filtered or full)
 */
export function recalculateAndSaveMetrics(playerName: string, allHistory: GameSession[]): void {
    const playerGames = allHistory.filter(
        (session) =>
            session.playerOne.name === playerName || session.playerTwo.name === playerName,
    );
    const metrics = calculatePlayerMetrics(playerGames, playerName);
    savePlayerMetrics(playerName, metrics);
}

/**
 * Update metrics for a specific player based on their entire game history.
 * Reads from the ordered history array (where completed games are stored).
 *
 * @param playerName - Player name
 */
function updatePlayerMetrics(playerName: string): void {
    recalculateAndSaveMetrics(playerName, getAllHistory());
}

/**
 * Build the leaderboard from all game history
 * Sorts by win percentage (descending), then by total games (descending)
 *
 * @returns Array of players sorted by leaderboard ranking
 */
export function calculateLeaderboard(): Array<{
    rank: number;
    playerName: string;
    metrics: PlayerMetrics;
}> {
    const allSessions = getAllGameSessions();

    // Collect unique player names
    const playerNames = new Set<string>();
    allSessions.forEach((session) => {
        playerNames.add(session.playerOne.name);
        playerNames.add(session.playerTwo.name);
    });

    // Build leaderboard entries
    const leaderboardEntries = Array.from(playerNames)
        .map((playerName) => {
            const playerGames = allSessions.filter(
                (session) =>
                    session.playerOne.name === playerName ||
                    session.playerTwo.name === playerName
            );

            const metrics = calculatePlayerMetrics(playerGames);

            return {
                playerName,
                metrics,
            };
        })
        .sort((a, b) => {
            // Primary sort: win percentage (descending)
            if (a.metrics.winPercentage !== b.metrics.winPercentage) {
                return b.metrics.winPercentage - a.metrics.winPercentage;
            }

            // Secondary sort: total games (descending)
            return b.metrics.totalGames - a.metrics.totalGames;
        });

    // Add rankings
    return leaderboardEntries.map((entry, index) => ({
        rank: index + 1,
        playerName: entry.playerName,
        metrics: entry.metrics,
    }));
}

/**
 * Get a player's rank on the leaderboard
 * @param playerName - Player name
 * @returns Rank (1-indexed) or 0 if player not found
 */
export function getPlayerRank(playerName: string): number {
    const leaderboard = calculateLeaderboard();
    const entry = leaderboard.find((e) => e.playerName === playerName);
    return entry ? entry.rank : 0;
}

/**
 * Get a player's metrics for display
 * @param playerName - Player name
 * @returns Player metrics or null if not found
 */
export function getPlayerMetrics(playerName: string): PlayerMetrics | null {
    return loadPlayerMetrics(playerName);
}

/**
 * Get all recorded game results
 * @returns Array of all game sessions
 */
export function getAllGameResults(): GameSession[] {
    return getAllGameSessions();
}

/**
 * Get total games in the system
 * @returns Total number of completed games
 */
export function getTotalGamesCount(): number {
    return getAllGameSessions().length;
}

/**
 * Get total unique players in the system
 * @returns Total number of players
 */
export function getTotalPlayersCount(): number {
    const allSessions = getAllGameSessions();
    const players = new Set<string>();

    allSessions.forEach((session) => {
        players.add(session.playerOne.name);
        players.add(session.playerTwo.name);
    });

    return players.size;
}

/**
 * Get statistics for a specific difficulty level
 * @param playerName - Player name
 * @param difficulty - Difficulty level
 * @returns Statistics for that difficulty or null
 */
export function getDifficultyStatistics(playerName: string, difficulty: string) {
    const metrics = getPlayerMetrics(playerName);
    if (!metrics || !metrics.difficultyStats[difficulty as keyof typeof metrics.difficultyStats]) {
        return null;
    }
    return metrics.difficultyStats[difficulty as keyof typeof metrics.difficultyStats];
}

/**
 * Get recent games (last N games)
 * @param limit - Number of recent games to return (default 10)
 * @returns Array of recent game sessions
 */
export function getRecentGames(limit: number = 10): GameSession[] {
    const allSessions = getAllGameSessions();
    return allSessions.slice(Math.max(0, allSessions.length - limit)).reverse();
}

/**
 * Get win rate between two specific players
 * @param player1Name - First player name
 * @param player2Name - Second player name
 * @returns Object with head-to-head statistics
 */
export function getHeadToHeadStats(player1Name: string, player2Name: string) {
    const allSessions = getAllGameSessions();

    const headToHeadGames = allSessions.filter(
        (session) =>
            (session.playerOne.name === player1Name && session.playerTwo.name === player2Name) ||
            (session.playerOne.name === player2Name && session.playerTwo.name === player1Name)
    );

    const player1Wins = headToHeadGames.filter((session) => {
        if (session.playerOne.name === player1Name) {
            return session.result === 'player-one-wins';
        } else {
            return session.result === 'player-two-wins';
        }
    }).length;

    const player2Wins = headToHeadGames.filter((session) => {
        if (session.playerOne.name === player2Name) {
            return session.result === 'player-one-wins';
        } else {
            return session.result === 'player-two-wins';
        }
    }).length;

    const draws = headToHeadGames.filter((session) => session.result === 'draw').length;

    return {
        totalGames: headToHeadGames.length,
        [`${player1Name}Wins`]: player1Wins,
        [`${player2Name}Wins`]: player2Wins,
        draws,
        [`${player1Name}WinRate`]: headToHeadGames.length > 0
            ? (player1Wins / headToHeadGames.length * 100).toFixed(1)
            : '0',
    };
}

/**
 * Export game statistics for a player
 * @param playerName - Player name
 * @returns Formatted player statistics object
 */
export function exportPlayerStatistics(playerName: string) {
    const metrics = getPlayerMetrics(playerName);
    const rank = getPlayerRank(playerName);

    if (!metrics) {
        return null;
    }

    return {
        playerName,
        rank,
        metrics: {
            totalGames: metrics.totalGames,
            totalWins: metrics.totalWins,
            totalLosses: metrics.totalLosses,
            totalDraws: metrics.totalDraws,
            winPercentage: metrics.winPercentage.toFixed(1),
            averageGameDuration: Math.round(metrics.averageGameDuration),
        },
        difficultyBreakdown: metrics.difficultyStats,
    };
}
