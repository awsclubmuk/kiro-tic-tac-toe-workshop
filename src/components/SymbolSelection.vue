<template>
  <div class="symbol-selection">
    <div class="selection-header">
      <h2 class="selection-title">Choose Your Symbols</h2>
      <p class="selection-subtitle">Each player must select a different symbol</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ errorMessage }}</span>
    </div>

    <!-- Player Symbol Selections -->
    <div class="players-container">
      <!-- Player 1 Selection -->
      <div class="player-selection-card player-1">
        <div class="player-header">
          <h3 class="player-title">Player 1</h3>
          <span class="player-label">Spider</span>
        </div>

        <div class="selected-symbol-display">
          <div class="symbol-preview">{{ player1Symbol }}</div>
        </div>

        <div class="symbol-library">
          <button
            v-for="symbol in symbolLibrary"
            :key="`p1-${symbol}`"
            class="symbol-button"
            :class="{ selected: player1Symbol === symbol }"
            @click="selectPlayer1Symbol(symbol)"
            :title="`Select ${symbol}`"
          >
            {{ symbol }}
          </button>
        </div>
      </div>

      <!-- Player 2 Selection -->
      <div class="player-selection-card player-2">
        <div class="player-header">
          <h3 class="player-title">Player 2</h3>
          <span class="player-label">Web</span>
        </div>

        <div class="selected-symbol-display">
          <div class="symbol-preview">{{ player2Symbol }}</div>
        </div>

        <div class="symbol-library">
          <button
            v-for="symbol in symbolLibrary"
            :key="`p2-${symbol}`"
            class="symbol-button"
            :class="{ selected: player2Symbol === symbol }"
            @click="selectPlayer2Symbol(symbol)"
            :title="`Select ${symbol}`"
          >
            {{ symbol }}
          </button>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="button-container">
      <button class="confirm-button" @click="handleConfirm" :disabled="!canConfirm">
        Confirm Symbols
      </button>
      <button class="reset-button" @click="handleReset">
        Reset to Defaults
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  /** Player 1's selected symbol */
  player1Symbol?: string;
  /** Player 2's selected symbol */
  player2Symbol?: string;
}

const props = withDefaults(defineProps<Props>(), {
  player1Symbol: '🕷️',
  player2Symbol: '🕸️',
});

const emit = defineEmits<{
  /** Emitted when symbols are confirmed */
  'update:player1-symbol': [symbol: string];
  'update:player2-symbol': [symbol: string];
  /** Emitted when symbols are confirmed and validation passes */
  confirmed: [];
}>();

// Default symbols
const DEFAULT_PLAYER1_SYMBOL = '🕷️';
const DEFAULT_PLAYER2_SYMBOL = '🕸️';

// Available symbols library
const symbolLibrary = [
  '🕷️', // Spider
  '🕸️', // Web
  '🔴', // Red Circle
  '🟡', // Yellow Circle
  '⭕', // Hollow Circle
  '❌', // X Mark
  'S',  // Letter S
  'W',  // Letter W
  'P1', // P1
  'P2', // P2
];

// Local state for selected symbols
const player1Symbol = ref<string>(props.player1Symbol);
const player2Symbol = ref<string>(props.player2Symbol);
const errorMessage = ref<string>('');

/**
 * Check if both players have different symbols
 */
const areSymbolsDifferent = computed(() => {
  return player1Symbol.value !== player2Symbol.value;
});

/**
 * Check if form can be confirmed
 */
const canConfirm = computed(() => {
  return areSymbolsDifferent.value && player1Symbol.value && player2Symbol.value;
});

/**
 * Handle Player 1 symbol selection
 */
const selectPlayer1Symbol = (symbol: string) => {
  player1Symbol.value = symbol;
  clearError();
  
  // Check for duplicate
  if (symbol === player2Symbol.value) {
    errorMessage.value = `Symbol ${symbol} is already selected by Player 2. Please choose a different symbol.`;
  }
};

/**
 * Handle Player 2 symbol selection
 */
const selectPlayer2Symbol = (symbol: string) => {
  player2Symbol.value = symbol;
  clearError();
  
  // Check for duplicate
  if (symbol === player1Symbol.value) {
    errorMessage.value = `Symbol ${symbol} is already selected by Player 1. Please choose a different symbol.`;
  }
};

/**
 * Clear error message
 */
const clearError = () => {
  errorMessage.value = '';
};

/**
 * Handle confirmation of symbol selection
 */
const handleConfirm = () => {
  // Final validation
  if (!areSymbolsDifferent.value) {
    errorMessage.value = `Both players cannot have the same symbol. Player 1 has ${player1Symbol.value}, Player 2 has ${player2Symbol.value}.`;
    return;
  }

  // Emit the confirmed symbols
  emit('update:player1-symbol', player1Symbol.value);
  emit('update:player2-symbol', player2Symbol.value);
  emit('confirmed');
};

/**
 * Reset symbols to defaults
 */
const handleReset = () => {
  player1Symbol.value = DEFAULT_PLAYER1_SYMBOL;
  player2Symbol.value = DEFAULT_PLAYER2_SYMBOL;
  clearError();
};
</script>

<style scoped>
.symbol-selection {
  @apply w-full
    max-w-2xl
    mx-auto
    bg-gradient-to-b
    from-spiderman-dark
    to-spiderman-blue
    rounded-lg
    border-2
    border-spiderman-red
    p-6
    md:p-8
    shadow-web;
}

/* Header */
.selection-header {
  @apply text-center mb-8;
}

.selection-title {
  @apply text-2xl
    md:text-3xl
    font-bold
    text-spiderman-red
    mb-2;

  text-shadow: 0 0 15px rgba(220, 20, 60, 0.8);
}

.selection-subtitle {
  @apply text-gray-300 text-sm md:text-base;
}

/* Error Banner */
.error-banner {
  @apply flex
    items-center
    gap-3
    bg-red-900
    bg-opacity-30
    border
    border-red-600
    rounded-lg
    p-4
    mb-6
    animate-pulse;
}

.error-icon {
  @apply text-xl;
}

.error-text {
  @apply text-red-300 text-sm md:text-base font-semibold;
}

/* Players Container */
.players-container {
  @apply grid
    grid-cols-1
    md:grid-cols-2
    gap-6
    mb-8;
}

/* Player Selection Card */
.player-selection-card {
  @apply bg-spiderman-dark
    border-2
    rounded-lg
    p-6
    transition-all
    duration-300;
}

.player-1 {
  @apply border-red-600
    hover:shadow-web;
}

.player-2 {
  @apply border-yellow-500
    hover:shadow-web;
}

/* Player Header */
.player-header {
  @apply flex
    items-center
    justify-between
    mb-4
    pb-4
    border-b
    border-opacity-20;
}

.player-1 .player-header {
  @apply border-red-600;
}

.player-2 .player-header {
  @apply border-yellow-500;
}

.player-title {
  @apply text-lg md:text-xl font-bold;
}

.player-1 .player-title {
  @apply text-red-500;
}

.player-2 .player-title {
  @apply text-yellow-400;
}

.player-label {
  @apply text-xs md:text-sm
    px-2
    py-1
    rounded
    font-semibold
    bg-opacity-20;
}

.player-1 .player-label {
  @apply bg-red-600 text-red-300;
}

.player-2 .player-label {
  @apply bg-yellow-500 text-yellow-200;
}

/* Selected Symbol Display */
.selected-symbol-display {
  @apply flex
    justify-center
    mb-6
    py-4
    bg-spiderman-blue
    rounded-lg
    border-2;
}

.player-1 .selected-symbol-display {
  @apply border-red-600;
}

.player-2 .selected-symbol-display {
  @apply border-yellow-500;
}

.symbol-preview {
  @apply text-5xl md:text-6xl
    font-bold
    transition-all
    duration-300;
}

.player-1 .symbol-preview {
  @apply text-red-500;

  filter: drop-shadow(0 0 15px rgba(220, 20, 60, 0.8));
}

.player-2 .symbol-preview {
  @apply text-yellow-400;

  filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
}

/* Symbol Library */
.symbol-library {
  @apply grid
    grid-cols-5
    gap-2;
}

.symbol-button {
  @apply w-full
    aspect-square
    bg-spiderman-blue
    border-2
    border-gray-600
    rounded-lg
    text-2xl
    md:text-3xl
    font-bold
    cursor-pointer
    transition-all
    duration-200
    hover:scale-110
    hover:shadow-lg
    active:scale-95
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    flex
    items-center
    justify-center;

  &:hover:not(.selected) {
    @apply border-gray-400 bg-spiderman-dark;
  }

  &:focus {
    @apply ring-spiderman-red ring-offset-spiderman-dark;
  }
}

.player-1 .symbol-button.selected {
  @apply bg-gradient-to-br
    from-red-600
    to-red-700
    border-red-400
    text-white
    shadow-web
    scale-110;
}

.player-2 .symbol-button.selected {
  @apply bg-gradient-to-br
    from-yellow-500
    to-yellow-600
    border-yellow-300
    text-white
    shadow-web
    scale-110;
}

/* Button Container */
.button-container {
  @apply flex
    flex-col
    sm:flex-row
    gap-3
    justify-center;
}

/* Confirm Button */
.confirm-button {
  @apply flex-1
    bg-gradient-to-r
    from-spiderman-red
    to-red-700
    text-white
    px-6
    py-3
    rounded-lg
    font-bold
    text-sm
    md:text-base
    cursor-pointer
    transition-all
    duration-300
    hover:shadow-web-lg
    hover:scale-105
    active:scale-95
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:scale-100
    focus:outline-none
    focus:ring-2
    focus:ring-red-400
    focus:ring-offset-2
    focus:ring-offset-spiderman-dark;
}

/* Reset Button */
.reset-button {
  @apply flex-1
    bg-spiderman-blue
    text-spiderman-web
    border-2
    border-spiderman-red
    px-6
    py-3
    rounded-lg
    font-bold
    text-sm
    md:text-base
    cursor-pointer
    transition-all
    duration-300
    hover:bg-spiderman-dark
    hover:shadow-web
    hover:scale-105
    active:scale-95
    focus:outline-none
    focus:ring-2
    focus:ring-spiderman-red
    focus:ring-offset-2
    focus:ring-offset-spiderman-dark;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .symbol-selection {
    @apply p-4;
  }

  .selection-title {
    @apply text-xl;
  }

  .symbol-library {
    @apply grid-cols-5 gap-1;
  }

  .symbol-button {
    @apply text-xl;
  }

  .button-container {
    @apply flex-col gap-2;
  }
}
</style>
