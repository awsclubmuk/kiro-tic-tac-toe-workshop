<template>
  <div
    class="game-history-panel bg-gradient-to-b from-spiderman-blue to-spiderman-dark border-2 border-spiderman-red rounded-lg p-4 sm:p-6 shadow-web-lg"
  >
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-spiderman-web mb-3 sm:mb-4">GAME HISTORY</h2>

    <!-- Empty state -->
    <div v-if="resolvedHistory.length === 0" class="text-center text-gray-400 py-8">
      <p>No games yet</p>
    </div>

    <!-- Scrollable history list -->
    <div v-else class="history-list space-y-2 overflow-y-auto">
      <div
        v-for="game in resolvedHistory"
        :key="game.id"
        class="history-item bg-spiderman-dark border-l-4 border-spiderman-red p-3 rounded cursor-pointer hover:bg-opacity-80 transition-all"
        @click="$emit('select-game', game)"
      >
        <!-- Players: P1 vs P2 -->
        <div class="text-white font-semibold text-sm">
          {{ game.playerOne.name }} vs {{ game.playerTwo.name }}
        </div>

        <!-- Result with color coding -->
        <div class="text-xs font-bold mt-1" :class="getResultTextClass(game)">
          {{ getResultText(game) }}
        </div>

        <!-- Board size and date -->
        <div class="text-gray-400 text-xs mt-1">
          {{ game.boardConfig.size }}x{{ game.boardConfig.size }} board •
          {{ formatDate(game.startTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { GameSession } from '../types/index';
import { getAllHistory } from '../utils/storageAdapter';

// Props — optional: if not provided, history is loaded from storage on mount
const props = withDefaults(
  defineProps<{
    history?: GameSession[];
  }>(),
  { history: undefined },
);

// Emits
const emit = defineEmits<{
  'select-game': [game: GameSession];
}>();

// Internal history loaded from storage when no prop is supplied
const internalHistory = ref<GameSession[]>([]);

onMounted(() => {
  if (props.history === undefined) {
    internalHistory.value = getAllHistory();
  }
});

// Resolved list: prefer the prop when supplied, otherwise use internal storage data
const resolvedHistory = computed<GameSession[]>(() =>
  props.history !== undefined ? props.history : internalHistory.value,
);

/**
 * Returns the Tailwind text color class for the game result.
 * Wins → red, draws → yellow.
 */
function getResultTextClass(game: GameSession): string {
  if (game.result === 'draw') {
    return 'text-yellow-400';
  }
  if (game.result === 'player-one-wins' || game.result === 'player-two-wins') {
    return 'text-spiderman-red';
  }
  return 'text-gray-400';
}

/**
 * Returns a human-readable result string for the game.
 */
function getResultText(game: GameSession): string {
  if (game.result === 'player-one-wins') {
    return `🏆 ${game.playerOne.name} wins`;
  }
  if (game.result === 'player-two-wins') {
    return `🏆 ${game.playerTwo.name} wins`;
  }
  if (game.result === 'draw') {
    return '🤝 Draw';
  }
  return 'In Progress';
}

/**
 * Formats a Unix timestamp into a readable short date/time string.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.game-history-panel {
  /* On mobile (inside the tab view) allow full height scrolling;
     on desktop constrain to a comfortable sidebar height */
  max-height: 70vh;
}

@media (min-width: 640px) {
  .game-history-panel {
    max-height: 400px;
  }
}

@media (min-width: 1024px) {
  .game-history-panel {
    max-height: 600px;
  }
}

.history-list {
  max-height: calc(100% - 3rem);
  overflow-y: auto;
}

.history-item {
  transition: all 300ms ease-in-out;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.4);
}

/* Scrollbar styling */
.history-list::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track {
  background: rgba(1, 31, 63, 0.5);
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(220, 20, 60, 0.6);
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.8);
}
</style>
