/**
 * Player Metrics Calculator
 * Task 7.1: Create Player Metrics data model and calculations
 * Requirements: 11, 12
 */

import { GameResult, Difficulty } from '../types/index';
import type { GameSession, PlayerMetrics } from '../types/index';

/**
 * Determines the result for a specific player in a game session.
 * The gameHistory passed to calculatePlayerMetrics is pre-filtered to a player,
 * but we still need to determine if they won, lost, or drew from their perspective.
 *
 * @param session - The game session
 * @param playerName - The name of the player we're calculating metrics for
 * @returns 'win' | 'loss' | 'draw' | null (null if result not yet determined)
 */
export function getPlayerResult(
    session: GameSession,
    playerName: string
): 'win' | 'loss' | 'draw' | null {
    if (session.result === null) {
        return null;
    }

    if (session.result === GameResult.Draw) {
        return 'draw';
    }

    // Determine if the player won based on their role and the game result
    const isPlayerOne = session.playerOne.name === playerName;
    const isPlayerTwo = session.playerTwo.name === playerName;

    if (session.result === GameResult.PlayerOneWins) {
        if (isPlayerOne) return 'win';
        if (isPlayerTwo) return 'loss';
    }

    if (session.result === GameResult.PlayerTwoWins) {
        if (isPlayerTwo) return 'win';
        if (isPlayerOne) return 'loss';
    }

    // Player not found in session — default to loss (shouldn't happen with filtered history)
    return 'loss';
}

/**
 * Calculates comprehensive player metrics from game history.
 * The gameHistory array should be pre-filtered to only include sessions
 * involving the specific player.
 *
 * @param gameHistory - Array of game sessions involving the player
 * @param playerName - The name of the player to calculate metrics for.
 *                     If omitted, defaults to counting all wins (legacy behavior).
 * @returns Calculated metrics for the player
 */
export function calculatePlayerMetrics(
    gameHistory: GameSession[],
    playerName?: string
): PlayerMetrics {
    const metrics: PlayerMetrics = {
        totalGames: gameHistory.length,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
        winPercentage: 0,
        averageGameDuration: 0,
        difficultyStats: {
            [Difficulty.Easy]: { games: 0, wins: 0, losses: 0, draws: 0 },
            [Difficulty.Medium]: { games: 0, wins: 0, losses: 0, draws: 0 },
            [Difficulty.Hard]: { games: 0, wins: 0, losses: 0, draws: 0 },
        },
    };

    // Early return for no games — division by zero handled
    if (gameHistory.length === 0) {
        return metrics;
    }

    let totalDuration = 0;
    let durationCount = 0;

    // Process each game session
    for (const session of gameHistory) {
        // Count result (win/loss/draw) — use playerName-aware resolution when available
        let outcome: 'win' | 'loss' | 'draw' | null;

        if (playerName) {
            outcome = getPlayerResult(session, playerName);
        } else {
            // Legacy: treat any non-draw result as win/loss based on result value alone
            if (session.result === GameResult.Draw) {
                outcome = 'draw';
            } else if (
                session.result === GameResult.PlayerOneWins ||
                session.result === GameResult.PlayerTwoWins
            ) {
                outcome = 'win';
            } else {
                outcome = null;
            }
        }

        if (outcome === 'win') {
            metrics.totalWins++;
        } else if (outcome === 'draw') {
            metrics.totalDraws++;
        } else if (outcome === 'loss') {
            metrics.totalLosses++;
        }

        // Calculate game duration — only for sessions with both timestamps
        if (session.endTime !== null && session.endTime !== undefined) {
            const duration = session.endTime - session.startTime;
            totalDuration += duration;
            durationCount++;
        }

        // Track difficulty-specific stats (single-player games have a difficulty)
        if (session.difficulty !== null && session.difficulty !== undefined) {
            const diffKey = session.difficulty as Difficulty;
            if (metrics.difficultyStats[diffKey]) {
                const diffStats = metrics.difficultyStats[diffKey];
                diffStats.games++;

                if (outcome === 'win') {
                    diffStats.wins++;
                } else if (outcome === 'draw') {
                    diffStats.draws++;
                } else if (outcome === 'loss') {
                    diffStats.losses++;
                }
            }
        }
    }

    // Calculate win percentage — guard division by zero
    metrics.winPercentage =
        metrics.totalGames > 0 ? (metrics.totalWins / metrics.totalGames) * 100 : 0;

    // Calculate average game duration — only from sessions that have endTime
    metrics.averageGameDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return metrics;
}

/**
 * Builds and returns a sorted leaderboard from all game history.
 * Sorted by win percentage (descending), then total games (descending).
 *
 * @param allGameHistory - Complete game history from all games
 * @returns Array of player entries sorted by metrics
 */
export function buildLeaderboard(
    allGameHistory: GameSession[]
): Array<{ name: string; metrics: PlayerMetrics }> {
    const playerSessionsMap = new Map<string, GameSession[]>();

    // Group games by player name
    for (const session of allGameHistory) {
        const p1Name = session.playerOne.name;
        if (!playerSessionsMap.has(p1Name)) {
            playerSessionsMap.set(p1Name, []);
        }
        playerSessionsMap.get(p1Name)!.push(session);

        const p2Name = session.playerTwo.name;
        if (!playerSessionsMap.has(p2Name)) {
            playerSessionsMap.set(p2Name, []);
        }
        playerSessionsMap.get(p2Name)!.push(session);
    }

    // Calculate metrics for each player using their name for accurate win/loss resolution
    const leaderboard = Array.from(playerSessionsMap.entries()).map(([name, history]) => ({
        name,
        metrics: calculatePlayerMetrics(history, name),
    }));

    // Sort by win percentage (descending), ties broken by total games (descending)
    leaderboard.sort((a, b) => {
        if (a.metrics.winPercentage !== b.metrics.winPercentage) {
            return b.metrics.winPercentage - a.metrics.winPercentage;
        }
        return b.metrics.totalGames - a.metrics.totalGames;
    });

    return leaderboard;
}

/**
 * Gets a player's rank on the leaderboard (1-indexed).
 *
 * @param playerName - Name of the player
 * @param leaderboard - Complete leaderboard
 * @returns Player's rank (1-indexed), or null if not on leaderboard
 */
export function getPlayerRank(
    playerName: string,
    leaderboard: Array<{ name: string; metrics: PlayerMetrics }>
): number | null {
    const rankIndex = leaderboard.findIndex((entry) => entry.name === playerName);
    return rankIndex >= 0 ? rankIndex + 1 : null;
}
