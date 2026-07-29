<template>
  <div class="game-board-wrapper board-enter">
    <!-- ── Task 10.4: Error Toast ──────────────────────────────────────────── -->
    <!-- Shows a red banner when an invalid move is attempted; auto-dismisses  -->
    <Transition name="error-toast">
      <div
        v-if="errorMessage"
        class="error-toast"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <span aria-hidden="true">⚠️</span>
        <span class="error-toast-text">{{ errorMessage }}</span>
      </div>
    </Transition>

    <!-- Board Grid Container -->
    <div
      role="grid"
      :aria-label="`Tic-tac-toe game board, ${boardSize} by ${boardSize}`"
      class="game-board"
      :style="{
        gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
        '--board-size': boardSize,
        '--cell-size': calculateCellSize(),
      }"
      @keydown="handleBoardKeydown"
    >
      <!-- Game Cells -->
      <div
        v-for="(row, rowIndex) in boardData"
        :key="`row-${rowIndex}`"
        role="row"
        class="cell-row"
      >
        <button
          v-for="(cell, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          :ref="(el) => setCellRef(el, rowIndex, colIndex)"
          role="gridcell"
          class="game-cell"
          :class="[
            {
              'cell-occupied': cell !== null,
              'cell-player1': cell === player1Symbol,
              'cell-player2': cell === player2Symbol,
              'cell-focused': focusedRow === rowIndex && focusedCol === colIndex,
              'cell-keyboard-focus': focusedRow === rowIndex && focusedCol === colIndex,
              'cell-success-flash': isFlashingCell(rowIndex, colIndex),
              'cell-error-shake': isShakingCell(rowIndex, colIndex),
            },
          ]"
          :disabled="cell !== null"
          :tabindex="getCellTabindex(rowIndex, colIndex)"
          :aria-label="`Row ${rowIndex + 1}, Column ${colIndex + 1}${cell ? ', occupied by ' + cell : ', empty'}`"
          :aria-selected="focusedRow === rowIndex && focusedCol === colIndex"
          @click="handleCellClick(rowIndex, colIndex)"
          @focus="handleCellFocus(rowIndex, colIndex)"
        >
          <!-- Symbol Display -->
          <span v-if="cell" class="cell-symbol" :class="getSymbolClass(cell)">
            {{ cell }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * GameBoard Component
 * Task 3.4: Create Game Board component with dynamic grid layout
 * Task 10.4: Add visual feedback for user actions
 * Validates: Requirements 2, 3, 15
 *
 * Displays an interactive game board with CSS Grid layout that adapts to board size (3x3 to 10x10).
 * Renders all cells clearly, updates immediately when moves are made, and handles click events for cell selection.
 * Supports custom symbols for both players with appropriate styling.
 * Provides error toasts for invalid moves and success flash for valid moves.
 */

import { ref, nextTick } from 'vue'
import type { Board } from '@/types'

interface Props {
  /**
   * 2D array representing the board state
   * Each element is either a symbol string or null for empty cells
   */
  boardData: Board

  /**
   * Size of the board (3-10)
   */
  boardSize: number

  /**
   * Symbol for Player 1 (for styling purposes)
   */
  player1Symbol?: string

  /**
   * Symbol for Player 2 (for styling purposes)
   */
  player2Symbol?: string

  /**
   * Array of Move objects for tracking game progression (optional for future use)
   */
  moves?: Array<{ row: number; col: number; symbol: string }>

  /**
   * Optional CSS class for custom sizing adjustments
   */
  boardClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  player1Symbol: '🕷️',
  player2Symbol: '🕸️',
  moves: () => [],
  boardClass: '',
})

const emit = defineEmits<{
  /**
   * Emitted when a cell is clicked
   * @param row - Row index of the clicked cell
   * @param col - Column index of the clicked cell
   */
  'cell-click': [row: number, col: number]
}>()

// ---------------------------------------------------------------------------
// Visual feedback state (Task 10.4)
// ---------------------------------------------------------------------------

/** Current error message shown in the toast banner (null = hidden) */
const errorMessage = ref<string | null>(null)
/** Timer reference so we can clear it if a new error arrives quickly */
let errorTimer: ReturnType<typeof setTimeout> | null = null

/** Key of the cell currently flashing green after a valid move: `"row-col"` */
const flashingCell = ref<string | null>(null)
/** Key of the cell currently shaking after an invalid attempt: `"row-col"` */
const shakingCell = ref<string | null>(null)

/**
 * Show an error toast banner with the given message.
 * Auto-dismisses after 2 seconds.
 */
function showError(message: string): void {
  if (errorTimer !== null) {
    clearTimeout(errorTimer)
  }
  errorMessage.value = message
  errorTimer = setTimeout(() => {
    errorMessage.value = null
    errorTimer = null
  }, 2000)
}

/**
 * Trigger a brief success-flash on the given cell for ~400 ms.
 */
function flashCell(row: number, col: number): void {
  const key = `${row}-${col}`
  flashingCell.value = key
  setTimeout(() => {
    if (flashingCell.value === key) {
      flashingCell.value = null
    }
  }, 400)
}

/**
 * Trigger a brief shake animation on the given cell for ~400 ms.
 */
function shakeCell(row: number, col: number): void {
  const key = `${row}-${col}`
  shakingCell.value = key
  setTimeout(() => {
    if (shakingCell.value === key) {
      shakingCell.value = null
    }
  }, 400)
}

/** Returns true when the cell at (row, col) should display the success flash */
function isFlashingCell(row: number, col: number): boolean {
  return flashingCell.value === `${row}-${col}`
}

/** Returns true when the cell at (row, col) should display the error shake */
function isShakingCell(row: number, col: number): boolean {
  return shakingCell.value === `${row}-${col}`
}

/**
 * Expose showError / flashCell / shakeCell so GameContainer / App.vue
 * can call them from outside after a move attempt.
 */
defineExpose({ showError, flashCell, shakeCell })

/**
 * Calculate dynamic cell size based on board size and viewport.
 * Uses CSS clamp() so cells shrink gracefully on small screens.
 *
 * On xs (320 px) the available inner width after the GameContainer's p-3 (24 px)
 * and board p-1 (4 px) on each side is roughly 320 - 24 - 8 = 288 px.
 * A 3×3 board with 2 gaps of ~4 px leaves ≈ (288 - 8) / 3 ≈ 93 px per cell.
 * The preferred vw values are set to fill that space while the max caps desktop.
 */
const calculateCellSize = (): string => {
  // [min, preferred-vw, max] per board size
  const sizes: Record<number, [string, string, string]> = {
    3:  ['2.75rem', '19vw', '6rem'],
    4:  ['2.2rem',  '14vw', '5rem'],
    5:  ['1.75rem', '11vw', '4rem'],
    6:  ['1.5rem',  '9vw',  '3.5rem'],
    7:  ['1.25rem', '7.5vw','3rem'],
    8:  ['1.1rem',  '6.5vw','2.5rem'],
    9:  ['1rem',    '5.75vw','2.25rem'],
    10: ['0.9rem',  '5vw',  '2rem'],
  }
  const [min, pref, max] = sizes[props.boardSize] ?? ['0.9rem', '5vw', '2rem']
  return `clamp(${min}, ${pref}, ${max})`
}

/**
 * Determine CSS class for symbol styling based on which player owns it
 */
const getSymbolClass = (symbol: string): string => {
  if (symbol === props.player1Symbol) {
    return 'cell-symbol-player1'
  } else if (symbol === props.player2Symbol) {
    return 'cell-symbol-player2'
  }
  return ''
}

/**
 * Handle cell click event
 * Emits cell-click with row and column indices.
 * Triggers shake animation on already-occupied cells.
 */
const handleCellClick = (row: number, col: number): void => {
  if (props.boardData[row]?.[col] !== null) {
    // Cell already occupied — shake it and show error toast
    shakeCell(row, col)
    showError('That cell is already taken! Choose another.')
    return
  }
  emit('cell-click', row, col)
  // Flash the cell to confirm the move was registered
  flashCell(row, col)
}

// ---------------------------------------------------------------------------
// Keyboard navigation state
// ---------------------------------------------------------------------------

/** Currently keyboard-focused cell row (-1 means no keyboard focus active) */
const focusedRow = ref(0)
/** Currently keyboard-focused cell column */
const focusedCol = ref(0)

/** 2D array of cell button element refs for programmatic focus */
const cellRefs = ref<(HTMLButtonElement | null)[][]>([])

/**
 * Register a cell button element ref in the 2D refs array
 */
const setCellRef = (el: unknown, row: number, col: number): void => {
  if (!cellRefs.value[row]) {
    cellRefs.value[row] = []
  }
  cellRefs.value[row][col] = (el as HTMLButtonElement | null)
}

/**
 * Returns tabindex for a cell.
 * Only the currently-focused cell (or [0,0] as default) is in the natural tab order.
 * All others use -1 so the grid acts as a single tab stop (roving tabindex pattern).
 */
const getCellTabindex = (row: number, col: number): number => {
  return focusedRow.value === row && focusedCol.value === col ? 0 : -1
}

/**
 * Update focused cell when a cell receives DOM focus (e.g. via mouse click or tab)
 */
const handleCellFocus = (row: number, col: number): void => {
  focusedRow.value = row
  focusedCol.value = col
}

/**
 * Move keyboard focus to the given cell and programmatically focus the element
 */
const moveFocusTo = (row: number, col: number): void => {
  focusedRow.value = row
  focusedCol.value = col
  nextTick(() => {
    const el = cellRefs.value[row]?.[col]
    if (el) {
      el.focus()
    }
  })
}

/**
 * Handle keydown events on the board grid.
 * Implements arrow-key navigation and Enter/Space to select a cell.
 */
const handleBoardKeydown = (event: KeyboardEvent): void => {
  const size = props.boardSize
  let row = focusedRow.value
  let col = focusedCol.value

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault()
      moveFocusTo(Math.max(0, row - 1), col)
      break
    case 'ArrowDown':
      event.preventDefault()
      moveFocusTo(Math.min(size - 1, row + 1), col)
      break
    case 'ArrowLeft':
      event.preventDefault()
      moveFocusTo(row, Math.max(0, col - 1))
      break
    case 'ArrowRight':
      event.preventDefault()
      moveFocusTo(row, Math.min(size - 1, col + 1))
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      // Delegate to handleCellClick which handles both valid and occupied cases
      handleCellClick(row, col)
      break
    default:
      break
  }
}
</script>

<style scoped>
/**
 * GameBoard Styles
 * Dynamic CSS Grid layout with responsive sizing and Spider-Man theming
 */

.game-board-wrapper {
  @apply flex items-center justify-center w-full;

  /* Responsive padding: very compact on xs, comfortable on desktop */
  @apply p-1 sm:p-3 md:p-5 lg:p-4;
}

/**
 * Main board grid container
 * Dynamically sized based on board size with CSS custom properties
 */
.game-board {
  display: grid;

  /* Responsive gap: tighter on mobile, wider on desktop */
  gap: clamp(0.2rem, 0.8vw, 0.75rem);

  /* Apply responsive sizing based on board size */
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;

  /* Web pattern background */
  @apply bg-web-pattern bg-repeat rounded-lg;

  /* Responsive padding around the grid */
  @apply p-1 sm:p-2 lg:p-4;

  /* Glow effect */
  @apply shadow-web;
}

/**
 * Cell row wrapper (for future organization)
 */
.cell-row {
  display: contents;
}

/**
 * Individual game cell styling
 * Uses CSS clamp() via --cell-size for fluid responsive sizing.
 * Minimum touch target is 44×44 px (WCAG 2.1 SC 2.5.5).
 */
.game-cell {
  /* Fluid sizing via CSS custom property set by calculateCellSize() */
  width: var(--cell-size, clamp(2.5rem, 10vw, 5rem));
  height: var(--cell-size, clamp(2.5rem, 10vw, 5rem));
  min-width: 44px;   /* WCAG minimum touch target */
  min-height: 44px;

  /* Base styling */
  @apply bg-gradient-to-br
    from-spiderman-dark
    to-spiderman-blue
    border-2
    border-spiderman-red
    rounded-lg
    cursor-pointer
    transition-all
    duration-300
    flex
    items-center
    justify-center
    font-bold
    focus:outline-none
    focus:ring-2
    focus:ring-spiderman-web
    focus:ring-offset-2
    focus:ring-offset-spiderman-dark;

  /* Fluid text size — scales with the cell */
  font-size: calc(var(--cell-size, 2.5rem) * 0.55);

  /* Hover effect - glow and scale up */
  &:hover:not(:disabled) {
    @apply shadow-web scale-105 border-spiderman-web;
  }

  /* Active state - scale down effect */
  &:active:not(:disabled) {
    @apply scale-95;
  }

  /* Disabled state for occupied cells */
  &:disabled {
    @apply cursor-not-allowed opacity-100;
  }

  /* Focus visible for keyboard accessibility */
  &:focus-visible {
    @apply outline-none ring-2 ring-spiderman-web;
  }
}

/**
 * Symbol styling
 * Display symbols with appropriate glow effects
 */
.cell-symbol {
  @apply block;

  /* Apply filter drop-shadow for glow effect */
  filter: drop-shadow(0 0 4px rgba(220, 20, 60, 0.5));
}

/**
 * Player 1 symbol styling
 * Red Spider symbol with red glow
 */
.cell-symbol-player1 {
  @apply text-spiderman-red;

  filter: drop-shadow(0 0 8px rgba(220, 20, 60, 0.8));
}

/**
 * Player 2 symbol styling
 * Yellow Web symbol with yellow glow
 */
.cell-symbol-player2 {
  @apply text-spiderman-web;

  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));
}

/**
 * Keyboard-focused cell highlight (roving tabindex pattern)
 */
.cell-focused:not(:disabled) {
  @apply ring-2 ring-spiderman-web ring-offset-2 ring-offset-spiderman-dark;
}

/**
 * Explicit keyboard-focus class (Task 10.3)
 * Bright yellow outline applied to the cell currently navigated via keyboard.
 */
.cell-keyboard-focus {
  outline: 3px solid #ffd700;
  outline-offset: 2px;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
}

/**
 * Occupied cell styling
 * Slightly different appearance for cells with symbols
 */
.cell-occupied {
  @apply border-spiderman-web;
}

/**
 * Player 1 occupied cell styling
 */
.cell-player1 {
  @apply shadow-md;
}

/**
 * Player 2 occupied cell styling
 */
.cell-player2 {
  @apply shadow-md;
}

/* All responsive sizing is handled via clamp() in --cell-size above */

/**
 * ── Task 10.4 Visual Feedback ─────────────────────────────────────────────
 */

/**
 * Error Toast Banner
 * Spider-Man red banner that appears at the top of the board for invalid moves.
 */
.error-toast {
  @apply flex
    items-center
    gap-2
    mb-3
    px-4
    py-3
    rounded-lg
    border-2
    border-spiderman-red
    bg-red-900
    text-white
    text-sm
    font-semibold
    w-full;

  box-shadow: 0 0 16px rgba(220, 20, 60, 0.7);
}

.error-toast-text {
  @apply flex-1;
}

/* Vue <Transition name="error-toast"> enter/leave */
.error-toast-enter-active,
.error-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.error-toast-enter-from,
.error-toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/**
 * Success flash — brief green/gold glow on a valid move cell
 */
.cell-success-flash {
  animation: cell-success-flash 0.4s ease-out;
}

@keyframes cell-success-flash {
  0%   { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: rgba(34, 197, 94, 0.15); }
  40%  { box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); background-color: rgba(34, 197, 94, 0.35); }
  100% { box-shadow: 0 0 0 rgba(255, 215, 0, 0); background-color: transparent; }
}

/**
 * Error shake — brief horizontal shake when an occupied cell is clicked
 */
.cell-error-shake {
  animation: cell-error-shake 0.4s ease-out;
}

@keyframes cell-error-shake {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-5px); border-color: #dc143c; }
  40%  { transform: translateX(5px); }
  60%  { transform: translateX(-4px); }
  80%  { transform: translateX(4px); }
  100% { transform: translateX(0); }
}
</style>
