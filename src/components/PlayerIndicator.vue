<template>
  <div class="player-indicator-container">
    <!-- Turn-transition: fade out/in when active player changes (Task 10.4) -->
    <Transition name="player-turn" mode="out-in">
      <!-- The key forces Vue to re-run the transition whenever the player changes -->
      <div
        :key="currentPlayer.symbol"
        class="player-card"
        :class="[playerColorClass, { 'animate-web-pulse': isActive }]"
      >
        <!-- Player Symbol -->
        <div class="player-symbol" :class="symbolColorClass">
          {{ currentPlayer.symbol }}
        </div>

        <!-- Player Info Section -->
        <div class="player-info">
          <div class="player-label">
            {{ currentPlayer.isAI ? 'CPU' : `Player ${playerNumber}` }} Turn
          </div>
          <div class="player-name">{{ currentPlayer.name }}</div>
        </div>

        <!-- CPU Thinking Indicator -->
        <div v-if="isCPUThinking" class="cpu-thinking">
          <div class="thinking-spinner" />
          <span>CPU Thinking...</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
/**
 * PlayerIndicator Component
 * Task 3.3: Create Player Indicator component showing current player's turn
 * Validates: Requirements 4, 15 - Two-Player Game Mode & Turn-Based Game Flow Control
 *
 * Displays the current player's information with:
 * - Player name and symbol
 * - Color-coded styling (red for Player 1, yellow for Player 2, blue for CPU)
 * - Pulse animation during active turn
 * - "CPU Thinking..." message when CPU is making a move
 *
 * This component provides clear visual feedback for turn progression and CPU activity.
 */

import { computed } from 'vue'
import type { Player } from '../types'

interface Props {
  /** Current player whose turn it is */
  currentPlayer: Player
  /** Flag indicating if the CPU is thinking (during CPU turn) */
  isCPUThinking?: boolean
  /** Flag indicating if this is the active turn to show pulse animation */
  isActive?: boolean
  /** Identifier to distinguish player 1 from player 2 (for styling purposes) */
  playerNumber?: 1 | 2
}

const props = withDefaults(defineProps<Props>(), {
  isCPUThinking: false,
  isActive: true,
  playerNumber: 1,
})

/**
 * Determine the background color class based on player type and player number
 * - Player 1 (non-AI): Red gradient background
 * - Player 2 (non-AI): Yellow/Gold background  
 * - CPU (AI): Blue background
 */
const playerColorClass = computed(() => {
  if (props.currentPlayer.isAI) {
    return 'bg-spiderman-blue text-spiderman-web border-spiderman-web'
  }
  // Distinguish between Player 1 and Player 2 for styling
  if (props.playerNumber === 2) {
    return 'bg-spiderman-web text-spiderman-blue border-spiderman-web'
  }
  // Default to Player 1 (red)
  return 'bg-gradient-to-r from-red-700 to-spiderman-red text-white border-spiderman-red'
})

/**
 * Determine the symbol text color class based on player type
 * - Player 1 symbol: Red with red glow
 * - Player 2 symbol: Yellow/Gold with yellow glow
 * - CPU symbol: Red text on blue background with red glow
 */
const symbolColorClass = computed(() => {
  if (props.currentPlayer.isAI) {
    return 'text-spiderman-red'
  }
  // Distinguish between players
  if (props.playerNumber === 2) {
    return 'text-spiderman-web'
  }
  return 'text-spiderman-red'
})
</script>

<style scoped>
/**
 * PlayerIndicator Styling
 * Spider-Man themed styling with player-specific color coding
 */

.player-indicator-container {
  @apply w-full flex justify-center items-center py-2;
}

.player-card {
  @apply flex
    items-center
    gap-3
    px-4
    py-3
    rounded-md
    border
    max-w-md
    w-full
    shadow-web-soft;

  &.bg-gradient-to-r {
    @apply text-white border-spiderman-red/50;
  }

  &.bg-spiderman-web {
    @apply shadow-none border-spiderman-web/60;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.25);
  }

  &.bg-spiderman-blue {
    @apply shadow-none border-spiderman-web/30;
  }

  &.animate-web-pulse {
    animation: web-pulse 1.8s ease-in-out infinite;
  }
}

/**
 * Player Symbol Display
 * Shows the player's mark/symbol with appropriate glow effect
 */
.player-symbol {
  @apply flex-shrink-0
    w-16
    h-16
    flex
    items-center
    justify-center
    text-4xl
    font-bold
    bg-spiderman-dark
    rounded-lg
    border
    border-spiderman-red;

  /* Apply glow filter to symbol */
  filter: drop-shadow(0 0 8px rgba(220, 20, 60, 0.7));

  /* For Player 2 symbol (yellow variant) */
  &.text-spiderman-web {
    filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.7));
  }
}

/**
 * Player Information Section
 * Displays player name and turn label
 */
.player-info {
  @apply flex flex-col gap-1 flex-grow;
}

.player-label {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply text-xs font-semibold uppercase tracking-wider opacity-80;
}

.player-name {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply text-lg font-bold;
}

/**
 * CPU Thinking Indicator
 * Shows when the CPU is computing its next move
 */
.cpu-thinking {
  @apply flex
    items-center
    gap-2
    ml-2
    px-3
    py-2
    rounded
    bg-spiderman-dark
    bg-opacity-50
    text-sm
    font-semibold;

  animation: fade-in 0.3s ease-in;
}

/**
 * Animated spinner for CPU thinking state
 */
.thinking-spinner {
  @apply w-4 h-4 border-2 border-spiderman-web border-t-spiderman-red rounded-full;

  animation: spin 1s linear infinite;
}

/**
 * Keyframe animations
 */
@keyframes web-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.6);
  }
  50% {
    box-shadow: 0 0 40px rgba(220, 20, 60, 1);
  }
}

/* Player 2 pulse animation (yellow) */
.player-card.bg-spiderman-web.animate-web-pulse {
  animation: web-pulse-yellow 1.5s ease-in-out infinite;
}

@keyframes web-pulse-yellow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 1);
  }
}

/* CPU pulse animation (blue) */
.player-card.bg-spiderman-blue.animate-web-pulse {
  animation: web-pulse-blue 1.5s ease-in-out infinite;
}

@keyframes web-pulse-blue {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 31, 63, 0.8);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 31, 63, 1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/**
 * Responsive adjustments
 */
@media (max-width: 640px) {
  .player-card {
    @apply px-4 py-3 gap-3 flex-col items-start;
  }

  .player-symbol {
    @apply w-12 h-12 text-2xl;
  }

  .player-label {
    @apply text-xs;
  }

  .player-name {
    @apply text-lg;
  }

  .cpu-thinking {
    @apply w-full justify-center;
  }
}

/**
 * ── Task 10.4: Turn-transition animation ─────────────────────────────────
 * When the active player changes the card fades out then back in.
 * Vue <Transition name="player-turn" mode="out-in"> drives this.
 */
.player-turn-enter-active,
.player-turn-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.player-turn-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.player-turn-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
