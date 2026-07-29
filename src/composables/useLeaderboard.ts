/**
 * Leaderboard Manager Composable
 * Task 7.2: Create Leaderboard manager composable
 * Requirements: 11, 12
 *
 * Aggregates all game history, calculates metrics for all players,
 * and maintains a sorted leaderboard (by win% desc, then total games desc).
 * The leaderboard is refreshed on mount and after each game completion.
 */

import { ref, onMounted } from 'vue';
import type { PlayerMetrics } from '../types/index';
import { buildLeaderboard as buildLeaderboardFromHistory } from '../utils/metricsCalculator';
import { getAllHistory } from '../utils/storageAdapter';

/**
 * A single entry on the leaderboard, including its 1-indexed rank.
 */
export interface LeaderboardEntry {
    name: string;
    metrics: PlayerMetrics;
    rank: number;
}

/**
 * Composable that manages the player leaderboard.
 *
 * Usage:
 *   const { leaderboard, refreshLeaderboard } = useLeaderboard();
 *
 * The `leaderboard` ref is populated on mount and can be refreshed by calling
 * `refreshLeaderboard()` after each game completion.
 */
export function useLeaderboard() {
    // Internal reactive leaderboard state — entries include 1-indexed rank
    const leaderboard = ref<LeaderboardEntry[]>([]);

    /**
     * Reads all game history, builds a ranked leaderboard, and updates the
     * reactive `leaderboard` ref.
     * Sorted by win percentage descending, then total games descending.
     */
    function refreshLeaderboard(): void {
        const allHistory = getAllHistory();
        const entries = buildLeaderboardFromHistory(allHistory);
        // Attach 1-indexed rank to each entry (array is already sorted)
        leaderboard.value = entries.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
    }

    /**
     * Build and return the current leaderboard without updating the reactive ref.
     * Re-exported wrapper around metricsCalculator.buildLeaderboard — sorts by
     * winPercentage desc, then totalGames desc.
     *
     * @returns Ranked leaderboard entries
     */
    function buildLeaderboard(): LeaderboardEntry[] {
        const allHistory = getAllHistory();
        const entries = buildLeaderboardFromHistory(allHistory);
        const ranked = entries.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }));
        leaderboard.value = ranked;
        return ranked;
    }

    /**
     * Returns the 1-indexed rank of a player on the current leaderboard,
     * or null if the player has not yet completed any games.
     *
     * @param playerName - Player name to look up
     */
    function getPlayerRank(playerName: string): number | null {
        const entry = leaderboard.value.find((e) => e.name === playerName);
        return entry?.rank ?? null;
    }

    /**
     * Convenience getter — returns the current leaderboard snapshot.
     * The data is already sorted (win% desc → total games desc).
     */
    function getLeaderboard(): LeaderboardEntry[] {
        return leaderboard.value;
    }

    // Populate leaderboard immediately on mount so it isn't empty on first render
    onMounted(() => {
        refreshLeaderboard();
    });

    return {
        /** Reactive leaderboard sorted by win% desc then games desc, each entry has rank. */
        leaderboard,

        /** Rebuild leaderboard from full game history and update the reactive ref. */
        refreshLeaderboard,

        /** Build leaderboard, update reactive ref, and return entries. */
        buildLeaderboard,

        /** 1-indexed rank of playerName, or null if not on board. */
        getPlayerRank,

        /** Snapshot of the current leaderboard array. */
        getLeaderboard,
    };
}
