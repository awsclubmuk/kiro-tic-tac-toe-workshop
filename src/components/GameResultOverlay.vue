<template>
  <transition
    name="fade"
    @enter="onEnter"
    @leave="onLeave"
  >
    <div v-if="isVisible" class="overlay-container">
      <!-- Result Card -->
      <div class="result-card" :class="resultCardClass">
        <!-- Result Message -->
        <div class="result-message-wrapper">
          <h2 class="result-message" :class="resultMessageClass">
            {{ resultMessage }}
          </h2>
        </div>

        <!-- Winning Cells Highlight (only for wins) -->
        <div v-if="showWinningCells && winningLinesDisplay.length > 0" class="winning-cells-display">
          <div class="winning-line" v-for="(line, lineIndex) in winningLinesDisplay" :key="lineIndex">
            <span v-for="(cell, cellIndex) in line" :key="`${lineIndex}-${cellIndex}`" class="winning-cell winner-animate">
              {{ getSymbolForCell(cell) }}
            </span>
          </div>
        </div>

        <!-- Game Stats -->
        <div class="stats-section">
          <div class="stat-row">
            <span class="stat-label">Winner:</span>
            <span class="stat-value">{{ winnerName }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Board Size:</span>
            <span class="stat-value">{{ boardSize }}×{{ boardSize }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Moves:</span>
            <span class="stat-value">{{ totalMoves }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Game Duration:</span>
            <span class="stat-value">{{ gameDuration }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-replay" @click="handleReplay">
            Replay
          </button>
          <button class="btn btn-main-menu" @click="handleMainMenu">
            Main Menu
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
/**
 * GameResultOverlay Component
 * Task 3.7: Create Game Result Overlay component for end-game display
 * Validates: Requirements 5, 9, 14
 *
 * Displays game results with themed styling, winning cells highlight,
 * game statistics, and action buttons for replay or returning to main menu.
 */

import { computed, ref } from 'vue'
import type { GameResult, Move } from '@/types'

interface Props {
  /** Game result outcome (player-one-wins, player-two-wins, or draw) */
  gameResult: GameResult
  /** Winner's player name (empty for draws) */
  winner?: string
  /** Array of winning lines with cell coordinates */
  winningLines?: Array<Array<[number, number]>>
  /** First player info */
  playerOne: {
    name: string
    symbol: string
  }
  /** Second player info */
  playerTwo: {
    name: string
    symbol: string
  }
  /** Current board state for display */
  board?: (string | null)[][]
  /** Board size (3-10) */
  boardSize?: number
  /** List of moves made in the game */
  moves?: Move[]
  /** Game start time (timestamp in milliseconds) */
  startTime?: number
  /** Game end time (timestamp in milliseconds) */
  endTime?: number
  /** Whether to show the overlay */
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  boardSize: 3,
  moves: () => [],
  startTime: 0,
  endTime: 0,
  isVisible: true,
})

const emit = defineEmits<{
  /** Emitted when replay button is clicked */
  replay: []
  /** Emitted when main menu button is clicked */
  'main-menu': []
}>()

// Computed properties
const resultMessage = computed(() => {
  if (props.gameResult === 'draw') {
    return "IT'S A DRAW!"
  } else if (props.gameResult === 'player-one-wins') {
    return 'PLAYER 1 WINS!'
  } else {
    return 'PLAYER 2 WINS!'
  }
})

const resultCardClass = computed(() => {
  if (props.gameResult === 'draw') {
    return 'result-card-draw'
  } else if (props.gameResult === 'player-one-wins') {
    return 'result-card-player-one'
  } else {
    return 'result-card-player-two'
  }
})

const resultMessageClass = computed(() => {
  if (props.gameResult === 'draw') {
    return 'result-message-draw'
  } else {
    return 'result-message-win'
  }
})

const winnerName = computed(() => {
  if (props.gameResult === 'draw') {
    return 'Draw'
  } else if (props.gameResult === 'player-one-wins') {
    return props.playerOne?.name || 'Player 1'
  } else {
    return props.playerTwo?.name || 'Player 2'
  }
})

const showWinningCells = computed(() => {
  return props.gameResult !== 'draw' && props.winningLines && props.winningLines.length > 0
})

const totalMoves = computed(() => {
  return props.moves?.length || 0
})

const gameDuration = computed(() => {
  if (!props.startTime || !props.endTime) return 'N/A'
  const durationMs = props.endTime - props.startTime
  const seconds = Math.floor(durationMs / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds % 60}s`
})

const winningLinesDisplay = computed(() => {
  return props.winningLines || []
})

/**
 * Get symbol for a winning cell
 */
const getSymbolForCell = (cellCoords: [number, number]) => {
  const [row, col] = cellCoords
  if (!props.board || !props.board[row] || props.board[row][col] === null) {
    return ''
  }
  return props.board[row][col]
}

/**
 * Handle replay button click
 */
const handleReplay = () => {
  emit('replay')
}

/**
 * Handle main menu button click
 */
const handleMainMenu = () => {
  emit('main-menu')
}

/**
 * Animation lifecycle hooks
 */
const onEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.opacity = '0'
  element.style.transform = 'scale(0.9)'
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'scale(1)'
  }, 10)
}

const onLeave = (el: Element) => {
  const element = el as HTMLElement
  element.style.opacity = '0'
  element.style.transform = 'scale(0.9)'
}
</script>

<style scoped>
/**
 * GameResultOverlay Styles
 * Spider-Man themed result display with animations
 */

/* Overlay Container */
.overlay-container {
  @apply fixed
    inset-0
    flex
    items-center
    justify-center
    z-50
    bg-black
    bg-opacity-75
    backdrop-blur-sm
    transition-all
    duration-300;
}

/* Result Card Base */
.result-card {
  @apply relative
    w-full
    max-w-md
    mx-4
    rounded-md
    border
    p-8
    shadow-web-soft
    flex
    flex-col
    gap-5;

  animation: result-card-enter 0.5s ease-out;
}

/* Result Card Variants */
.result-card-player-one {
  @apply bg-spiderman-dark/95 border-spiderman-red/80;
  box-shadow: 0 0 28px rgba(220, 20, 60, 0.35);
}

.result-card-player-two {
  @apply bg-spiderman-dark/95 border-spiderman-web/70;
  box-shadow: 0 0 28px rgba(255, 215, 0, 0.25);
}

.result-card-draw {
  @apply bg-spiderman-dark/95 border-spiderman-web/50;
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.2), 0 0 16px rgba(255, 215, 0, 0.15);
}

/* Result Message Wrapper */
.result-message-wrapper {
  @apply text-center py-2;
}

.result-message {
  font-family: Bangers, cursive;

  @apply text-3xl md:text-5xl tracking-wider;

  letter-spacing: 0.06em;
}

.result-message-win {
  @apply text-spiderman-red;
  text-shadow: 0 2px 18px rgba(220, 20, 60, 0.45);
}

.result-message-draw {
  @apply text-spiderman-web;
  text-shadow: 0 2px 14px rgba(255, 215, 0, 0.35);
}

/* Winning Cells Display */
.winning-cells-display {
  @apply flex
    flex-col
    gap-3
    p-4
    bg-spiderman-blue
    bg-opacity-50
    rounded-lg
    border
    border-spiderman-red
    border-opacity-50;
}

.winning-line {
  @apply flex
    gap-2
    justify-center;
}

.winning-cell {
  @apply inline-flex
    items-center
    justify-center
    w-12
    h-12
    bg-gradient-to-br
    from-spiderman-red
    to-red-700
    rounded-lg
    text-2xl
    font-bold
    text-white
    border-2
    border-spiderman-web
    shadow-web;
}

/* Stats Section */
.stats-section {
  @apply flex flex-col gap-2 p-3 bg-spiderman-navy-mid/40 rounded-md border border-spiderman-red/20;
}

.stat-row {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply flex justify-between items-center text-sm;
}

.stat-label {
  @apply text-white/50 font-medium;
}

.stat-value {
  @apply text-spiderman-web font-semibold;
}

/* Action Buttons */
.action-buttons {
  @apply flex gap-3 flex-col sm:flex-row;
}

.btn {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply flex-1 px-4 py-3 rounded-md font-bold border
    cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-spiderman-dark
    active:scale-[0.98];
}

.btn-replay {
  @apply bg-gradient-to-r from-spiderman-red to-spiderman-red-soft text-white border-spiderman-red
    hover:brightness-110 focus:ring-spiderman-red;
}

.btn-main-menu {
  @apply bg-transparent text-spiderman-web border-spiderman-red/60
    hover:bg-spiderman-navy-mid/60 focus:ring-spiderman-web;
}

/* Animations */
@keyframes result-card-enter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.6),
                inset 0 0 20px rgba(220, 20, 60, 0.1);
  }
  50% {
    box-shadow: 0 0 40px rgba(220, 20, 60, 1),
                inset 0 0 30px rgba(220, 20, 60, 0.2);
  }
}

@keyframes pulse-yellow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.5),
                inset 0 0 20px rgba(255, 215, 0, 0.1);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.8),
                inset 0 0 30px rgba(255, 215, 0, 0.2);
  }
}

@keyframes pulse-draw {
  0%, 100% {
    box-shadow: 0 0 20px rgba(220, 20, 60, 0.5),
                0 0 15px rgba(255, 215, 0, 0.3),
                inset 0 0 20px rgba(220, 20, 60, 0.05);
  }
  50% {
    box-shadow: 0 0 40px rgba(220, 20, 60, 0.8),
                0 0 30px rgba(255, 215, 0, 0.6),
                inset 0 0 30px rgba(255, 215, 0, 0.1);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-300;
}

.fade-enter-from {
  @apply opacity-0;
}

.fade-leave-to {
  @apply opacity-0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .result-card {
    @apply p-6;
  }

  .result-message {
    @apply text-2xl;
  }

  .winning-cell {
    @apply w-10 h-10 text-xl;
  }

  .btn {
    @apply py-2 text-sm;
  }
}

/* Tablet and above */
@media (min-width: 768px) {
  .result-card {
    @apply max-w-xl;
  }

  .action-buttons {
    @apply gap-4;
  }
}
</style>
