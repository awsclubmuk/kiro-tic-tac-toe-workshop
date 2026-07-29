<template>
  <div
    class="leaderboard-panel bg-gradient-to-b from-spiderman-blue to-spiderman-dark border-2 border-spiderman-red rounded-lg p-4 sm:p-6 shadow-web-lg"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 sm:mb-6">
      <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-spiderman-web tracking-wide">
        🏆 LEADERBOARD
      </h2>
      <button
        class="text-xs text-spiderman-web border border-spiderman-red rounded px-2 py-1 hover:bg-spiderman-red hover:text-white transition-all duration-300"
        @click="loadLeaderboard"
        title="Refresh leaderboard"
      >
        ↻ Refresh
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="resolvedLeaderboard.length === 0" class="text-center py-10">
      <div class="text-4xl mb-3">🕷️</div>
      <p class="text-spiderman-web text-lg font-semibold">No players yet</p>
      <p class="text-gray-400 text-sm mt-2">Play your first game to appear on the leaderboard!</p>
    </div>

    <!-- Leaderboard table -->
    <div v-else class="overflow-x-auto">
      <!-- Table Header (hidden on xs, shown md+) -->
      <div
        class="hidden md:grid md:grid-cols-8 gap-2 mb-3 pb-2 border-b-2 border-spiderman-red font-bold text-spiderman-web text-xs uppercase tracking-widest"
      >
        <div class="text-center">Rank</div>
        <div class="col-span-2">Player</div>
        <div class="text-center">Games</div>
        <div class="text-center">Wins</div>
        <div class="text-center">Losses</div>
        <div class="text-center">Draws</div>
        <div class="text-center">Win %</div>
      </div>

      <!-- Leaderboard Entries -->
      <div class="space-y-2">
        <div
          v-for="(entry, index) in resolvedLeaderboard"
          :key="`${entry.name}-${index}`"
          class="leaderboard-entry bg-spiderman-dark border border-spiderman-red border-l-4 rounded p-3 cursor-pointer transition-all duration-300"
          :class="getRankHighlight(index)"
          @click="emit('select-player', entry.name)"
          role="button"
          :aria-label="`View stats for ${entry.name}, ranked #${index + 1}`"
          tabindex="0"
          @keydown.enter="emit('select-player', entry.name)"
          @keydown.space.prevent="emit('select-player', entry.name)"
        >
          <!-- Desktop layout: grid row -->
          <div class="hidden md:grid md:grid-cols-8 gap-2 items-center">
            <!-- Rank (gold/yellow) -->
            <div class="text-center font-bold text-spiderman-web text-lg leading-none">
              <span v-if="index === 0" title="1st Place">🥇</span>
              <span v-else-if="index === 1" title="2nd Place">🥈</span>
              <span v-else-if="index === 2" title="3rd Place">🥉</span>
              <span v-else class="text-base text-spiderman-web">#{{ index + 1 }}</span>
            </div>

            <!-- Player Name (white) -->
            <div class="col-span-2 text-white font-semibold truncate" :title="entry.name">
              {{ entry.name }}
            </div>

            <!-- Total Games (yellow) -->
            <div class="text-center text-spiderman-web font-medium">
              {{ entry.metrics.totalGames }}
            </div>

            <!-- Wins (yellow) -->
            <div class="text-center text-spiderman-web font-bold">
              {{ entry.metrics.totalWins }}
            </div>

            <!-- Losses (yellow) -->
            <div class="text-center text-spiderman-web font-medium">
              {{ entry.metrics.totalLosses }}
            </div>

            <!-- Draws (yellow) -->
            <div class="text-center text-spiderman-web font-medium">
              {{ entry.metrics.totalDraws }}
            </div>

            <!-- Win Percentage (yellow, bold) -->
            <div class="text-center text-spiderman-web font-bold">
              {{ entry.metrics.winPercentage.toFixed(1) }}%
            </div>
          </div>

          <!-- Mobile layout: stacked card -->
          <div class="md:hidden">
            <div class="flex items-center justify-between mb-2">
              <!-- Rank + Name -->
              <div class="flex items-center gap-2">
                <span class="text-spiderman-web font-bold text-base">
                  <span v-if="index === 0">🥇</span>
                  <span v-else-if="index === 1">🥈</span>
                  <span v-else-if="index === 2">🥉</span>
                  <span v-else class="text-sm">#{{ index + 1 }}</span>
                </span>
                <span class="text-white font-semibold text-sm truncate max-w-[120px]">
                  {{ entry.name }}
                </span>
              </div>
              <!-- Win % badge -->
              <span class="text-spiderman-web font-bold text-sm border border-spiderman-red rounded px-2 py-0.5">
                {{ entry.metrics.winPercentage.toFixed(1) }}%
              </span>
            </div>

            <!-- Stats row -->
            <div class="grid grid-cols-4 gap-1 text-center text-xs">
              <div>
                <div class="text-gray-400 uppercase tracking-wider">Games</div>
                <div class="text-spiderman-web font-medium">{{ entry.metrics.totalGames }}</div>
              </div>
              <div>
                <div class="text-gray-400 uppercase tracking-wider">Wins</div>
                <div class="text-spiderman-web font-bold">{{ entry.metrics.totalWins }}</div>
              </div>
              <div>
                <div class="text-gray-400 uppercase tracking-wider">Losses</div>
                <div class="text-spiderman-web font-medium">{{ entry.metrics.totalLosses }}</div>
              </div>
              <div>
                <div class="text-gray-400 uppercase tracking-wider">Draws</div>
                <div class="text-spiderman-web font-medium">{{ entry.metrics.totalDraws }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PlayerMetrics } from '../types/index';
import { buildLeaderboard } from '../utils/metricsCalculator';
import { getAllHistory } from '../utils/storageAdapter';

/** Shape of each leaderboard entry */
interface LeaderboardEntry {
  name: string;
  metrics: PlayerMetrics;
}

// ── Props ─────────────────────────────────────────────────────────────────────
const props = defineProps<{
  /** Optional external leaderboard data. When provided, skips internal fetch. */
  leaderboard?: LeaderboardEntry[];
}>();

// ── Emits ─────────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  /** Fired when the user clicks a row to view that player's stats */
  'select-player': [playerName: string];
}>();

// ── Internal state (used when no prop is supplied) ────────────────────────────
const internalLeaderboard = ref<LeaderboardEntry[]>([]);

/**
 * Resolved list: uses the `leaderboard` prop when provided,
 * otherwise falls back to the internally loaded list.
 */
const resolvedLeaderboard = computed<LeaderboardEntry[]>(
  () => props.leaderboard ?? internalLeaderboard.value,
);

// ── Rank highlight ─────────────────────────────────────────────────────────────
/**
 * Returns extra border/glow classes for top-3 ranks to make them stand out.
 */
function getRankHighlight(index: number): string {
  if (index === 0) return 'border-l-yellow-400 first-place';
  if (index === 1) return 'border-l-gray-300 second-place';
  if (index === 2) return 'border-l-orange-400 third-place';
  return 'border-l-spiderman-red';
}

// ── Data loading ──────────────────────────────────────────────────────────────

/** Load (or reload) the leaderboard from localStorage game history. */
function loadLeaderboard(): void {
  try {
    // Use getAllHistory which returns the full ordered history array
    const allGames = getAllHistory();
    internalLeaderboard.value = buildLeaderboard(allGames);
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    internalLeaderboard.value = [];
  }
}

onMounted(() => {
  // Only fetch internally when no external prop is supplied
  if (!props.leaderboard) {
    loadLeaderboard();
  }
});

// ── Exposed API ───────────────────────────────────────────────────────────────
defineExpose({
  /** Trigger a manual leaderboard refresh (useful when parent can't inject updated prop) */
  refresh: loadLeaderboard,
});
</script>

<style scoped>
.leaderboard-panel {
  /* On mobile (inside the tab view) allow full height scrolling;
     on desktop constrain to a comfortable sidebar height */
  max-height: 70vh;
  overflow-y: auto;
}

@media (min-width: 640px) {
  .leaderboard-panel {
    max-height: 520px;
  }
}

@media (min-width: 1024px) {
  .leaderboard-panel {
    max-height: 640px;
  }
}

/* Hover: slide right + red glow */
.leaderboard-entry:hover {
  transform: translateX(4px);
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.5);
}

.leaderboard-entry:focus-visible {
  outline: 2px solid #dc143c;
  outline-offset: 2px;
}

/* Top-3 glow accents */
.first-place {
  border-left-color: #ffd700 !important;
}

.first-place:hover {
  box-shadow: 0 0 24px rgba(255, 215, 0, 0.5);
}

.second-place {
  border-left-color: #c0c0c0 !important;
}

.second-place:hover {
  box-shadow: 0 0 20px rgba(192, 192, 192, 0.4);
}

.third-place {
  border-left-color: #cd7f32 !important;
}

.third-place:hover {
  box-shadow: 0 0 20px rgba(205, 127, 50, 0.4);
}

/* Custom scrollbar — Spider-Man red accent */
.leaderboard-panel::-webkit-scrollbar {
  width: 8px;
}

.leaderboard-panel::-webkit-scrollbar-track {
  background: rgba(0, 31, 63, 0.5);
}

.leaderboard-panel::-webkit-scrollbar-thumb {
  background: rgba(220, 20, 60, 0.6);
  border-radius: 4px;
}

.leaderboard-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.9);
}
</style>
