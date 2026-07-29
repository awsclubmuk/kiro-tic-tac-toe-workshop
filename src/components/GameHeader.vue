<template>
  <header class="game-header">
    <!-- Title Section -->
    <div class="title-section">
      <h1 class="game-title">
        Spider-Man Tic-Tac-Toe
      </h1>
    </div>

    <!-- Header Content -->
    <div class="header-content">
      <!-- Board Size Display -->
      <div class="board-config">
        <span class="config-label">Board Size:</span>
        <span class="config-value">{{ boardSize }}×{{ boardSize }}</span>
      </div>

      <!-- Controls Section -->
      <div class="controls-section">
        <!-- Game Mode Toggle -->
        <div class="mode-toggle-group">
          <label class="mode-label">Game Mode:</label>
          <div class="toggle-buttons">
            <button
              class="mode-button"
              :class="{ active: gameMode === GameMode.TwoPlayer }"
              @click="handleGameModeChange(GameMode.TwoPlayer)"
            >
              2-Player
            </button>
            <button
              class="mode-button"
              :class="{ active: gameMode === GameMode.SinglePlayer }"
              @click="handleGameModeChange(GameMode.SinglePlayer)"
            >
              vs CPU
            </button>
          </div>
        </div>

        <!-- Difficulty Selector (shows only in CPU mode) -->
        <div v-if="gameMode === GameMode.SinglePlayer" class="difficulty-group">
          <label for="difficulty-select" class="difficulty-label">
            Difficulty:
          </label>
          <select
            id="difficulty-select"
            class="difficulty-select"
            :value="difficulty"
            @change="handleDifficultyChange"
          >
            <option :value="Difficulty.Easy">Easy</option>
            <option :value="Difficulty.Medium">Medium</option>
            <option :value="Difficulty.Hard">Hard</option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * GameHeader Component
 * Task 3.2: Create Game Header component with title and navigation
 * Validates: Requirements 1, 6, 7
 *
 * Displays the game title with Spider-Man styling, board size configuration,
 * game mode toggle (2-Player vs CPU), and difficulty level selector for CPU mode.
 * Emits events when game mode or difficulty changes.
 */

import { ref, watch } from 'vue'
import { GameMode, Difficulty } from '@/types'

interface Props {
  /** Current board size (3-10) */
  boardSize: number
  /** Current game mode (TwoPlayer or SinglePlayer) */
  modelGameMode?: GameMode
  /** Current difficulty level for CPU opponent */
  modelDifficulty?: Difficulty
}

const props = withDefaults(defineProps<Props>(), {
  boardSize: 3,
  modelGameMode: GameMode.TwoPlayer,
  modelDifficulty: Difficulty.Medium,
})

const emit = defineEmits<{
  /** Emitted when game mode changes */
  'update:gameMode': [mode: GameMode]
  /** Emitted when difficulty level changes */
  'update:difficulty': [level: Difficulty]
}>()

// Local state
const gameMode = ref<GameMode>(props.modelGameMode)
const difficulty = ref<Difficulty>(props.modelDifficulty)

// Watch for prop changes to update local state
watch(
  () => props.modelGameMode,
  (newMode) => {
    gameMode.value = newMode
  },
)

watch(
  () => props.modelDifficulty,
  (newDifficulty) => {
    difficulty.value = newDifficulty
  },
)

/**
 * Handle game mode change
 * Updates local state and emits event
 */
const handleGameModeChange = (newMode: GameMode) => {
  gameMode.value = newMode
  emit('update:gameMode', newMode)
}

/**
 * Handle difficulty level change
 * Updates local state and emits event
 */
const handleDifficultyChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newDifficulty = target.value as Difficulty
  difficulty.value = newDifficulty
  emit('update:difficulty', newDifficulty)
}
</script>

<style scoped>
.game-header {
  @apply w-full
    bg-spiderman-dark/40
    rounded-md
    border border-spiderman-red/40
    p-4 sm:p-5 md:p-6;
}

.title-section {
  @apply text-center mb-4;
}

.game-title {
  font-family: Bangers, cursive;

  @apply text-2xl sm:text-3xl md:text-4xl text-spiderman-red tracking-wider;
  text-shadow: 0 2px 16px rgba(220, 20, 60, 0.35);
}

/* Header Content Container */
.header-content {
  @apply flex
    flex-col
    gap-6
    md:flex-row
    md:items-center
    md:justify-between;
}

/* Board Config Display */
.board-config {
  @apply flex
    items-center
    gap-2
    justify-center
    md:justify-start
    text-sm
    md:text-base;
}

.config-label {
  @apply text-gray-300 font-semibold;
}

.config-value {
  @apply text-spiderman-web
    font-bold
    bg-spiderman-blue
    px-3
    py-1
    rounded
    border
    border-spiderman-red;
}

/* Controls Section */
.controls-section {
  @apply flex
    flex-col
    gap-4
    md:gap-6
    md:flex-row
    md:items-center
    justify-center
    md:justify-end;
}

/* Game Mode Toggle */
.mode-toggle-group {
  @apply flex
    flex-col
    gap-2
    sm:flex-row
    sm:items-center
    sm:gap-3;
}

.mode-label {
  @apply text-gray-300
    font-semibold
    text-sm
    md:text-base;
}

.toggle-buttons {
  @apply flex
    gap-2
    bg-spiderman-blue
    rounded-lg
    p-1
    border
    border-spiderman-red;
}

.mode-button {
  @apply px-3
    py-2
    md:px-4
    md:py-2
    rounded
    font-semibold
    text-xs
    md:text-sm
    transition-all
    duration-200
    cursor-pointer
    text-gray-300
    border
    border-transparent;

  &:hover {
    @apply text-spiderman-web;
  }

  &.active {
    @apply bg-gradient-to-r
      from-spiderman-red
      to-red-700
      text-white
      border-spiderman-red
      shadow-web;
  }
}

/* Difficulty Selector Group */
.difficulty-group {
  @apply flex
    flex-col
    gap-2
    sm:flex-row
    sm:items-center
    sm:gap-3;
}

.difficulty-label {
  @apply text-gray-300
    font-semibold
    text-sm
    md:text-base;
}

.difficulty-select {
  @apply px-3
    py-2
    md:px-4
    md:py-2
    bg-spiderman-blue
    text-white
    border-2
    border-spiderman-red
    rounded-lg
    font-semibold
    text-xs
    md:text-sm
    cursor-pointer
    transition-all
    duration-200
    focus:outline-none
    focus:shadow-web;

  &:hover {
    @apply shadow-web;
  }

  &:focus {
    @apply shadow-web-lg;
  }

  /* Styling for option elements */
  option {
    @apply bg-spiderman-dark text-white;
  }
}

/* Responsive mobile adjustments */
@media (max-width: 640px) {
  .game-header {
    @apply p-4;
  }

  .game-title {
    @apply text-2xl;

    text-shadow: 0 0 15px rgba(220, 20, 60, 0.8),
                 0 0 30px rgba(220, 20, 60, 0.4);
  }

  .header-content {
    @apply gap-4;
  }

  .controls-section {
    @apply flex-col;
  }

  .mode-toggle-group,
  .difficulty-group {
    @apply flex-col;
  }

  .toggle-buttons,
  .difficulty-select {
    @apply w-full;
  }

  .mode-button {
    @apply flex-1;
  }
}

/* Tablet and above */
@media (min-width: 768px) {
  .game-header {
    @apply p-8;
  }

  .title-section {
    @apply mb-8;
  }

  .controls-section {
    @apply flex-row;
  }
}
</style>
