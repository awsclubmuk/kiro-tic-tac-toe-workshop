<template>
  <div class="game-mode-selector">
    <!-- Header -->
    <div class="selector-header">
      <h2 class="selector-title">Select Game Mode</h2>
      <p class="selector-subtitle">Choose how you want to play</p>
    </div>

    <!-- Mode Selection Cards -->
    <div class="mode-cards-container">
      <!-- Two-Player Mode Card -->
      <div
        class="mode-card"
        :class="{ active: selectedMode === 'two-player' }"
        @click="selectMode('two-player')"
        role="button"
        tabindex="0"
        @keydown.enter="selectMode('two-player')"
        @keydown.space="selectMode('two-player')"
      >
        <div class="mode-icon">👥</div>
        <h3 class="mode-name">Two Player</h3>
        <p class="mode-description">Play against another player on the same device</p>
        <div class="mode-badge" v-if="selectedMode === 'two-player'">Selected</div>
      </div>

      <!-- Single-Player Mode Card -->
      <div
        class="mode-card"
        :class="{ active: selectedMode === 'single-player' }"
        @click="selectMode('single-player')"
        role="button"
        tabindex="0"
        @keydown.enter="selectMode('single-player')"
        @keydown.space="selectMode('single-player')"
      >
        <div class="mode-icon">🤖</div>
        <h3 class="mode-name">vs CPU</h3>
        <p class="mode-description">Play against a computer opponent</p>
        <div class="mode-badge" v-if="selectedMode === 'single-player'">Selected</div>
      </div>
    </div>

    <!-- Difficulty Selector (shows only for single-player) -->
    <div v-if="selectedMode === 'single-player'" class="difficulty-section">
      <label class="difficulty-label">Select CPU Difficulty:</label>
      <div class="difficulty-buttons">
        <button
          v-for="level in ['easy', 'medium', 'hard']"
          :key="level"
          class="difficulty-button"
          :class="{ active: selectedDifficulty === level }"
          @click="selectDifficulty(level as Difficulty)"
        >
          {{ capitalizeFirst(level) }}
        </button>
      </div>
    </div>

    <!-- First Player Selector (shows for single-player) -->
    <div v-if="selectedMode === 'single-player'" class="first-player-section">
      <label class="first-player-label">Who goes first?</label>
      <div class="first-player-buttons">
        <button
          class="first-player-button"
          :class="{ active: playerGoesFirst }"
          @click="setPlayerGoesFirst(true)"
        >
          You
        </button>
        <button
          class="first-player-button"
          :class="{ active: !playerGoesFirst }"
          @click="setPlayerGoesFirst(false)"
        >
          CPU
        </button>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="btn-confirm" @click="handleConfirm">
        Continue
      </button>
      <button class="btn-cancel" @click="handleCancel">
        Back
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GameMode, Difficulty } from '../types'

interface Props {
  /** Current game mode selection */
  modelValue?: GameMode
  /** Current difficulty selection */
  difficulty?: Difficulty | null
  /** Whether player goes first in single-player mode */
  playerFirst?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 'two-player',
  difficulty: null,
  playerFirst: true,
})

const emit = defineEmits<{
  'update:modelValue': [mode: GameMode]
  'update:difficulty': [difficulty: Difficulty | null]
  'update:playerFirst': [first: boolean]
  'confirm': []
  'cancel': []
}>()

// Local state
const selectedMode = ref<GameMode>(props.modelValue)
const selectedDifficulty = ref<Difficulty | null>(props.difficulty)
const playerGoesFirst = ref(props.playerFirst)

/**
 * Select game mode
 */
const selectMode = (mode: GameMode): void => {
  selectedMode.value = mode
  emit('update:modelValue', mode)

  // Reset difficulty if switching to two-player
  if (mode === 'two-player') {
    selectedDifficulty.value = null
    emit('update:difficulty', null)
  }
}

/**
 * Select CPU difficulty
 */
const selectDifficulty = (difficulty: Difficulty): void => {
  selectedDifficulty.value = difficulty
  emit('update:difficulty', difficulty)
}

/**
 * Set whether player goes first
 */
const setPlayerGoesFirst = (first: boolean): void => {
  playerGoesFirst.value = first
  emit('update:playerFirst', first)
}

/**
 * Capitalize first letter of string
 */
const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Handle confirmation
 */
const handleConfirm = (): void => {
  emit('confirm')
}

/**
 * Handle cancellation
 */
const handleCancel = (): void => {
  emit('cancel')
}
</script>

<style scoped>
.game-mode-selector {
  @apply w-full
    max-w-2xl
    mx-auto
    bg-gradient-to-b
    from-spiderman-dark
    to-spiderman-blue
    rounded-lg
    border-2
    border-spiderman-red
    p-8
    shadow-web-lg;
}

/* Header */
.selector-header {
  @apply text-center mb-8;
}

.selector-title {
  @apply text-3xl
    font-bold
    text-spiderman-red
    mb-2;

  text-shadow: 0 0 15px rgba(220, 20, 60, 0.8);
}

.selector-subtitle {
  @apply text-gray-300 text-base;
}

/* Mode Cards Container */
.mode-cards-container {
  @apply grid
    grid-cols-1
    md:grid-cols-2
    gap-6
    mb-8;
}

/* Mode Card */
.mode-card {
  @apply relative
    bg-spiderman-dark
    border-2
    border-spiderman-red/50
    rounded-lg
    p-6
    cursor-pointer
    transition-all
    duration-300
    hover:border-spiderman-red
    hover:shadow-web;

  &.active {
    @apply border-spiderman-red
      shadow-web-lg
      ring-2
      ring-spiderman-red
      ring-opacity-50;
  }
}

.mode-icon {
  @apply text-4xl mb-3;
}

.mode-name {
  @apply text-xl
    font-bold
    text-spiderman-web
    mb-2;
}

.mode-description {
  @apply text-sm
    text-gray-300
    mb-4;
}

.mode-badge {
  @apply inline-block
    px-3
    py-1
    bg-gradient-to-r
    from-spiderman-red
    to-red-700
    text-white
    text-xs
    font-bold
    rounded-full
    shadow-web;
}

/* Difficulty Section */
.difficulty-section {
  @apply bg-spiderman-dark/50
    border
    border-spiderman-red/30
    rounded-lg
    p-6
    mb-6;

  animation: slide-in 0.3s ease-out;
}

.difficulty-label {
  @apply block
    text-sm
    font-bold
    text-spiderman-web
    mb-4;
}

.difficulty-buttons {
  @apply flex
    gap-3
    justify-center;
}

.difficulty-button {
  @apply px-6
    py-2
    bg-spiderman-blue
    text-gray-300
    border-2
    border-spiderman-red/50
    rounded-lg
    font-semibold
    cursor-pointer
    transition-all
    duration-200
    hover:border-spiderman-red
    hover:text-spiderman-web;

  &.active {
    @apply bg-gradient-to-r
      from-spiderman-red
      to-red-700
      text-white
      border-spiderman-red
      shadow-web;
  }
}

/* First Player Section */
.first-player-section {
  @apply bg-spiderman-dark/50
    border
    border-spiderman-red/30
    rounded-lg
    p-6
    mb-6;

  animation: slide-in 0.3s ease-out;
}

.first-player-label {
  @apply block
    text-sm
    font-bold
    text-spiderman-web
    mb-4;
}

.first-player-buttons {
  @apply flex
    gap-3
    justify-center;
}

.first-player-button {
  @apply flex-1
    px-6
    py-3
    bg-spiderman-blue
    text-gray-300
    border-2
    border-spiderman-red/50
    rounded-lg
    font-semibold
    cursor-pointer
    transition-all
    duration-200
    hover:border-spiderman-red
    hover:text-spiderman-web;

  &.active {
    @apply bg-gradient-to-r
      from-spiderman-red
      to-red-700
      text-white
      border-spiderman-red
      shadow-web;
  }
}

/* Action Buttons */
.action-buttons {
  @apply flex
    gap-4
    justify-center
    pt-4
    border-t
    border-spiderman-red/30;
}

.btn-confirm {
  @apply flex-1
    bg-gradient-to-r
    from-spiderman-red
    to-red-700
    text-white
    px-6
    py-3
    rounded-lg
    font-bold
    cursor-pointer
    transition-all
    duration-300
    hover:shadow-web-lg
    hover:scale-105
    active:scale-95;
}

.btn-cancel {
  @apply flex-1
    bg-spiderman-blue
    text-spiderman-web
    border-2
    border-spiderman-red
    px-6
    py-3
    rounded-lg
    font-bold
    cursor-pointer
    transition-all
    duration-300
    hover:bg-spiderman-dark
    hover:shadow-web
    active:scale-95;
}

/* Animation */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .game-mode-selector {
    @apply p-4;
  }

  .selector-title {
    @apply text-2xl;
  }

  .mode-cards-container {
    @apply grid-cols-1;
  }

  .action-buttons {
    @apply flex-col;
  }
}
</style>
