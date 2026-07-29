<template>
  <div class="setup-view">
    <header class="setup-header">
      <button class="back-btn" @click="router.push({ name: 'home' })" aria-label="Back to menu">
        ← Menu
      </button>
      <h1 class="setup-title">Game Setup</h1>
    </header>

    <!-- Step indicators -->
    <div class="steps" role="tablist" aria-label="Setup steps">
      <button
        v-for="s in steps"
        :key="s.id"
        class="step-btn"
        :class="{ active: step === s.id, done: step > s.id }"
        role="tab"
        :aria-selected="step === s.id"
        @click="step = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <!-- Step 1: Mode -->
    <section v-if="step === 1" class="setup-panel">
      <GameModeSelector
        :model-value="config.gameMode"
        :difficulty="config.difficulty"
        :player-first="config.playerOneGoesFirst"
        @update:model-value="setGameMode"
        @update:difficulty="setDifficulty"
        @update:player-first="(v) => setFirstPlayer(v ? 1 : 2)"
        @confirm="step = 2"
        @cancel="router.push({ name: 'home' })"
      />
    </section>

    <!-- Step 2: Board size -->
    <section v-else-if="step === 2" class="setup-panel">
      <div class="inline-config">
        <h2 class="panel-heading">Board Size</h2>
        <p class="panel-sub">Choose a grid from 3×3 to 10×10</p>

        <div class="size-row">
          <input
            id="setup-board-size"
            v-model.number="boardSizeDraft"
            type="range"
            min="3"
            max="10"
            class="size-slider"
            aria-label="Board size"
          />
          <span class="size-value">{{ boardSizeDraft }}×{{ boardSizeDraft }}</span>
        </div>

        <p v-if="sizeError" class="error-text" role="alert">{{ sizeError }}</p>

        <div class="nav-row">
          <button class="btn-secondary" @click="step = 1">Back</button>
          <button class="btn-primary" @click="confirmBoardSize">Continue</button>
        </div>
      </div>
    </section>

    <!-- Step 3: Symbols -->
    <section v-else class="setup-panel">
      <SymbolSelection
        :player1-symbol="config.symbols.playerOne.value"
        :player2-symbol="config.symbols.playerTwo.value"
        @update:player1-symbol="onSymbol1"
        @update:player2-symbol="onSymbol2"
        @confirmed="startGame"
      />
      <div class="nav-row mt-4">
        <button class="btn-secondary" @click="step = 2">Back</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * SetupView — Board Configuration → Mode → Symbols → Start
 * Tasks 12.1 / 12.2
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameModeSelector from '@/components/GameModeSelector.vue'
import SymbolSelection from '@/components/SymbolSelection.vue'
import { useAppConfig, useAppGame } from '@/composables/useAppGame'
import type { Difficulty, GameMode } from '@/types'

const router = useRouter()
const {
  config,
  setGameMode: applyMode,
  setDifficulty: applyDifficulty,
  setBoardSize,
  setFirstPlayer,
  setPlayerSymbol,
  persistConfig,
  validateConfig,
  getPlayerObjects,
  getAvailableSymbols,
} = useAppConfig()
const { initializeGame } = useAppGame()

const step = ref(1)
const boardSizeDraft = ref(config.boardSize)
const sizeError = ref('')

const steps = [
  { id: 1, label: '1. Mode' },
  { id: 2, label: '2. Board' },
  { id: 3, label: '3. Symbols' },
]

function setGameMode(mode: GameMode) {
  applyMode(mode)
}

function setDifficulty(level: Difficulty | null) {
  applyDifficulty(level)
}

function confirmBoardSize() {
  if (boardSizeDraft.value < 3 || boardSizeDraft.value > 10) {
    sizeError.value = 'Board size must be between 3 and 10'
    return
  }
  sizeError.value = ''
  setBoardSize(boardSizeDraft.value)
  step.value = 3
}

function onSymbol1(symbol: string) {
  const opt = getAvailableSymbols().find((s) => s.value === symbol) ?? {
    value: symbol,
    displayName: symbol,
    isCustom: true,
  }
  setPlayerSymbol(1, opt)
}

function onSymbol2(symbol: string) {
  const opt = getAvailableSymbols().find((s) => s.value === symbol) ?? {
    value: symbol,
    displayName: symbol,
    isCustom: true,
  }
  setPlayerSymbol(2, opt)
}

async function startGame() {
  if (!validateConfig()) return
  persistConfig()

  const { playerOne, playerTwo } = getPlayerObjects()
  await initializeGame(
    config.boardSize,
    config.gameMode,
    playerOne,
    playerTwo,
    config.difficulty ?? undefined,
  )
  router.push({ name: 'game' })
}
</script>

<style scoped>
.setup-view {
  @apply relative z-10 max-w-3xl mx-auto px-4 py-8 sm:px-6 space-y-6;
}

.setup-header {
  @apply flex items-center gap-4;
}

.back-btn {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply text-spiderman-web/90 text-sm font-semibold border border-spiderman-red/50 rounded-md px-3 py-1.5
    hover:bg-spiderman-red hover:text-white hover:border-spiderman-red;
}

.setup-title {
  font-family: Bangers, cursive;

  @apply text-3xl sm:text-4xl text-spiderman-red tracking-wider;
  text-shadow: 0 2px 14px rgba(220, 20, 60, 0.3);
}

.steps {
  @apply flex gap-2;
}

.step-btn {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply flex-1 py-2 text-xs sm:text-sm font-bold uppercase tracking-wide rounded-md border
    border-spiderman-red/40 bg-spiderman-navy-mid/60 text-spiderman-web/80
    hover:bg-spiderman-navy-mid hover:border-spiderman-red/70;
}

.step-btn.active {
  @apply bg-spiderman-red text-white border-spiderman-red shadow-web-soft;
}

.step-btn.done {
  @apply opacity-75;
}

.setup-panel {
  @apply bg-spiderman-dark/50 border border-spiderman-red/45 rounded-md p-4 sm:p-6 shadow-web-soft;
  backdrop-filter: blur(4px);
}

.inline-config {
  @apply space-y-4;
}

.panel-heading {
  font-family: Bangers, cursive;

  @apply text-2xl text-spiderman-web tracking-wider;
}

.panel-sub {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply text-white/50 text-sm;
}

.size-row {
  @apply flex items-center gap-4;
}

.size-slider {
  @apply flex-1 accent-spiderman-red;
}

.size-value {
  font-family: Bangers, cursive;

  @apply text-spiderman-red text-2xl w-16 text-right;
}

.error-text {
  @apply text-spiderman-red text-sm font-semibold;
}

.nav-row {
  @apply flex justify-between gap-3 pt-2;
}
</style>
