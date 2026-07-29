<template>
  <div
    class="player-stats-panel bg-gradient-to-b from-spiderman-blue to-spiderman-dark border-2 border-spiderman-red rounded-lg p-4 sm:p-6 shadow-web-lg"
  >
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-spiderman-web mb-4 sm:mb-6">{{ playerName }} STATS</h2>

    <!-- No games played state -->
    <div v-if="!hasGamesPlayed" class="text-center text-gray-400 py-12">
      <p class="text-lg">No games played yet</p>
      <p class="text-sm mt-2">Play your first game to see statistics!</p>
    </div>

    <!-- Stats display when games have been played -->
    <div v-else class="space-y-6">
      <!-- Overall Statistics -->
      <div class="overall-stats grid grid-cols-2 gap-4">
        <div class="stat-box bg-spiderman-dark border-l-4 border-spiderman-red p-4 rounded">
          <div class="text-gray-400 text-sm">Total Games</div>
          <div class="text-3xl font-bold text-spiderman-web">{{ resolvedStats.totalGames }}</div>
        </div>

        <div class="stat-box bg-spiderman-dark border-l-4 border-green-500 p-4 rounded">
          <div class="text-gray-400 text-sm">Wins</div>
          <div class="text-3xl font-bold text-green-400">{{ resolvedStats.totalWins }}</div>
        </div>

        <div class="stat-box bg-spiderman-dark border-l-4 border-red-500 p-4 rounded">
          <div class="text-gray-400 text-sm">Losses</div>
          <div class="text-3xl font-bold text-red-400">{{ resolvedStats.totalLosses }}</div>
        </div>

        <div class="stat-box bg-spiderman-dark border-l-4 border-yellow-500 p-4 rounded">
          <div class="text-gray-400 text-sm">Draws</div>
          <div class="text-3xl font-bold text-yellow-400">{{ resolvedStats.totalDraws }}</div>
        </div>

        <div
          class="stat-box bg-spiderman-dark border-l-4 border-spiderman-web p-4 rounded col-span-2"
        >
          <div class="text-gray-400 text-sm">Win Percentage</div>
          <div class="text-3xl font-bold text-spiderman-web">
            {{ resolvedStats.winPercentage.toFixed(1) }}%
          </div>
        </div>

        <div
          class="stat-box bg-spiderman-dark border-l-4 border-spiderman-web p-4 rounded col-span-2"
        >
          <div class="text-gray-400 text-sm">Average Game Duration</div>
          <div class="text-2xl font-bold text-spiderman-web">
            {{ formatDuration(resolvedStats.averageGameDuration) }}
          </div>
        </div>
      </div>

      <!-- Difficulty Breakdown -->
      <div class="difficulty-section">
        <h3 class="text-lg font-bold text-spiderman-web mb-4">BY DIFFICULTY</h3>
        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="difficulty in difficultyLevels"
            :key="difficulty"
            class="difficulty-card bg-spiderman-dark border-l-4 border-spiderman-red p-3 rounded hover:bg-opacity-80 transition-all"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="text-gray-400 text-sm font-semibold uppercase">{{ difficulty }}</div>
                <div class="text-white text-xs">
                  {{ resolvedStats.difficultyStats[difficulty].games }} games
                </div>
              </div>
              <div class="text-right">
                <div class="text-spiderman-web font-bold">
                  {{ resolvedStats.difficultyStats[difficulty].wins }}W
                  {{ resolvedStats.difficultyStats[difficulty].losses }}L
                  {{ resolvedStats.difficultyStats[difficulty].draws }}D
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { PlayerMetrics } from '../types/index';
import { Difficulty } from '../types/index';
import { calculatePlayerMetrics } from '../utils/metricsCalculator';
import { getPlayerHistory } from '../utils/storageAdapter';

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Name of the player whose stats are displayed */
  playerName: string;
  /**
   * Optional pre-computed metrics. When provided the component renders these
   * directly and skips the internal localStorage fetch. Pass `null` to let
   * the component load stats itself from storage.
   */
  metrics?: PlayerMetrics | null;
}

const props = withDefaults(defineProps<Props>(), {
  metrics: null,
});

// ── Difficulty levels for the breakdown section ───────────────────────────────

const difficultyLevels = [Difficulty.Easy, Difficulty.Medium, Difficulty.Hard] as const;

// ── Internal state ────────────────────────────────────────────────────────────

/** Empty / zero-value metrics used as fallback. */
function emptyMetrics(): PlayerMetrics {
  return {
    totalGames: 0,
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
}

/** Stats loaded from localStorage (used when the `metrics` prop is not set). */
const internalStats = ref<PlayerMetrics>(emptyMetrics());

/**
 * The stats actually rendered by the template.
 * If the parent passes a `metrics` prop we use that directly;
 * otherwise we fall back to `internalStats` loaded from storage.
 */
const resolvedStats = computed<PlayerMetrics>(() => props.metrics ?? internalStats.value);

/** Whether any games have been played (drives v-if in template). */
const hasGamesPlayed = computed<boolean>(() => resolvedStats.value.totalGames > 0);

// ── Data loading ──────────────────────────────────────────────────────────────

/**
 * Loads player statistics from localStorage game history.
 * Only used when the parent does not supply the `metrics` prop.
 */
function loadPlayerStats(): void {
  // When metrics are supplied via prop, skip the fetch.
  if (props.metrics !== null && props.metrics !== undefined) return;

  try {
    const playerHistory = getPlayerHistory(props.playerName);
    internalStats.value = calculatePlayerMetrics(playerHistory, props.playerName);
  } catch (error) {
    console.error('Error loading player stats:', error);
    internalStats.value = emptyMetrics();
  }
}

/** Formats a duration in milliseconds to a MM:SS string. */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(() => {
  loadPlayerStats();
});

watch(
  () => props.playerName,
  () => {
    loadPlayerStats();
  },
);

// Re-load from storage when the metrics prop transitions from provided → null
watch(
  () => props.metrics,
  (newMetrics) => {
    if (newMetrics === null || newMetrics === undefined) {
      loadPlayerStats();
    }
  },
);

// ── Public API ────────────────────────────────────────────────────────────────

defineExpose({
  loadPlayerStats,
  refresh: loadPlayerStats,
});
</script>

<style scoped>
.player-stats-panel {
  /* On mobile (inside the tab view) allow full height scrolling;
     on desktop constrain to a comfortable sidebar height */
  max-height: 70vh;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .player-stats-panel {
    max-height: 520px;
  }
}

@media (min-width: 1024px) {
  .player-stats-panel {
    max-height: 600px;
  }
}

.stat-box {
  transition: all 300ms ease-in-out;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 15px rgba(220, 20, 60, 0.3);
}

.difficulty-card {
  transition: all 300ms ease-in-out;
}

.difficulty-card:hover {
  transform: translateX(4px);
  border-left-color: #ffd700;
  box-shadow: 0 0 15px rgba(220, 20, 60, 0.3);
}

/* Scrollbar styling */
.player-stats-panel::-webkit-scrollbar {
  width: 8px;
}

.player-stats-panel::-webkit-scrollbar-track {
  background: rgba(1, 31, 63, 0.5);
}

.player-stats-panel::-webkit-scrollbar-thumb {
  background: rgba(220, 20, 60, 0.6);
  border-radius: 4px;
}

.player-stats-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.8);
}
</style>
