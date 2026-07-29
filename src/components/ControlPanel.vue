<template>
  <div class="control-panel-container flex">
    <!-- Primary Action Button (Start Game) -->
    <button
      class="btn btn-primary"
      :class="{ 'opacity-50 cursor-not-allowed': isDisabled('start') }"
      :disabled="isDisabled('start')"
      @click="handleStartGame"
    >
      Start Game
    </button>

    <!-- Secondary Action Button (Reset Game) -->
    <button
      class="btn btn-secondary"
      :class="{ 'opacity-50 cursor-not-allowed': isDisabled('reset') }"
      :disabled="isDisabled('reset')"
      @click="handleResetGame"
    >
      Reset Game
    </button>

    <!-- Replay Button (Shows only after game ends) -->
    <button
      v-if="showReplayButton"
      class="btn btn-replay"
      :class="{ 'opacity-50 cursor-not-allowed': isDisabled('replay') }"
      :disabled="isDisabled('replay')"
      @click="handleReplay"
    >
      Replay
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * ControlPanel Component
 * Task 3.6: Create Control Panel component with game actions
 * Validates: Requirement 9 - Replay Capability
 *
 * Provides game control buttons with context-aware visibility:
 * - "Start Game": Initiates a new game
 * - "Reset Game": Resets the current game to initial state
 * - "Replay": Appears only after game ends, allows playing again
 *
 * All buttons have Spider-Man themed styling with hover animations.
 */

import { computed, onMounted, onUnmounted } from 'vue'
import type { GameStatus } from '../types'

interface Props {
  /** Current game status (setup, playing, game-over) */
  gameStatus: GameStatus
  /** Whether the control buttons should be disabled */
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDisabled: false,
})

const emit = defineEmits<{
  start: []
  reset: []
  replay: []
}>()

/**
 * Determine if the Replay button should be visible
 * Shows only when the game is over
 */
const showReplayButton = computed(() => {
  return props.gameStatus === 'game-over'
})

/**
 * Determine if a specific button should be disabled
 * @param action - The button action (start, reset, replay)
 * @returns True if the button should be disabled
 */
const isDisabled = (action: 'start' | 'reset' | 'replay'): boolean => {
  if (props.isDisabled) return true

  switch (action) {
    case 'start':
      // Start button is disabled during playing or game-over
      return props.gameStatus === 'playing' || props.gameStatus === 'game-over'
    case 'reset':
      // Reset button is disabled only during setup or if globally disabled
      return props.gameStatus === 'setup'
    case 'replay':
      // Replay button is disabled only if globally disabled
      return false
    default:
      return false
  }
}

/**
 * Handle Start Game button click
 */
const handleStartGame = (): void => {
  emit('start')
}

/**
 * Handle Reset Game button click
 */
const handleResetGame = (): void => {
  emit('reset')
}

/**
 * Handle Replay button click
 */
const handleReplay = (): void => {
  emit('replay')
}

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

/**
 * Global keydown listener for keyboard shortcuts.
 * Ignores key events fired while the user is typing in an input / textarea.
 */
const handleGlobalKeydown = (event: KeyboardEvent): void => {
  const target = event.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
    return
  }

  switch (event.key.toLowerCase()) {
    case 'r':
      // 'r' → Reset game (only when reset is not disabled)
      if (!isDisabled('reset')) {
        event.preventDefault()
        handleResetGame()
      }
      break
    case 'p':
      // 'p' → Replay (only when replay button is visible and not disabled)
      if (showReplayButton.value && !isDisabled('replay')) {
        event.preventDefault()
        handleReplay()
      }
      break
    default:
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/**
 * ControlPanel Styling
 * Spider-Man themed buttons with gradient, hover, and animation effects
 */

.control-panel-container {
  /* Mobile: stack buttons full-width in a column */
  @apply flex
    flex-col
    items-stretch
    gap-3
    py-4
    px-3
    w-full;

  /* sm+: row layout, wrap, centered, normal button width */
  @apply sm:flex-row
    sm:flex-wrap
    sm:justify-center
    sm:items-center
    sm:gap-4
    sm:py-6
    sm:px-4;
}

/**
 * Base Button Styles
 * Common styling applied to all control panel buttons
 */
.btn {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply px-5 py-2.5 rounded-md font-bold text-sm
    uppercase tracking-wide
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spiderman-dark focus:ring-spiderman-red
    active:scale-[0.98];
  border: none;
  cursor: pointer;
}

.btn-primary {
  @apply bg-gradient-to-r from-spiderman-red to-spiderman-red-soft text-white shadow-web-soft
    hover:shadow-web hover:brightness-110;

  &:disabled {
    @apply opacity-50 cursor-not-allowed hover:shadow-web-soft hover:brightness-100;
  }
}

.btn-secondary {
  @apply bg-spiderman-navy-mid/80 text-spiderman-web border border-spiderman-red/70
    hover:bg-spiderman-blue hover:border-spiderman-red;

  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

.btn-replay {
  @apply bg-transparent text-spiderman-web border border-spiderman-web/70
    hover:bg-spiderman-web/10 hover:border-spiderman-web;

  &:disabled {
    @apply opacity-50 cursor-not-allowed;
  }
}

/**
 * Replay pulse animation for emphasis
 */
@keyframes replay-pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 1);
  }
}

/**
 * Responsive adjustments for smaller screens
 */
@media (max-width: 768px) {
  .control-panel-container {
    @apply gap-3 py-4 px-3;
  }

  .btn {
    @apply px-4 py-2 text-sm;
  }

  /* Adjust hover scale on mobile to prevent layout shift */
  .btn-primary:hover {
    @apply hover:scale-105;
  }

  .btn-replay:hover {
    @apply hover:scale-105;
  }
}

/**
 * Very small screens (mobile phones)
 */
@media (max-width: 480px) {
  .control-panel-container {
    @apply flex-col gap-2 w-full;
  }

  .btn {
    @apply w-full py-3;
  }
}
</style>
