<template>
  <div class="game-view">
    <GameHeader
      :board-size="gameState.boardConfig.size"
      :model-game-mode="headerMode"
      :model-difficulty="headerDifficulty"
      class="mb-4"
    />

    <div class="game-layout">
      <!-- Center board column -->
      <section class="board-column" aria-label="Game Board">
        <PlayerIndicator
          v-if="gameState.gameStatus.value !== 'setup'"
          :current-player="currentPlayer"
          :isCPUThinking="flowState.isCPUThinking || isCPUTurn"
          :is-active="isPlaying"
          :player-number="playerNumber"
          class="mb-4"
        />

        <p v-if="turnHint" class="turn-hint" role="status">
          {{ turnHint }}
        </p>

        <p v-if="moveFeedback" class="move-feedback" :class="feedbackClass" role="status">
          {{ moveFeedback }}
        </p>

        <GameContainer>
          <GameBoard
            :board-data="gameState.board.value"
            :board-size="gameState.boardConfig.size"
            :player1-symbol="gameState.players.playerOne.symbol"
            :player2-symbol="gameState.players.playerTwo.symbol"
            :moves="gameState.moveHistory.value"
            @cell-click="onCellClick"
          />

          <ControlPanel
            class="mt-4"
            :game-status="gameState.gameStatus.value"
            :is-disabled="flowState.isProcessingMove"
            @start="onReplay"
            @reset="onReset"
            @replay="onReplay"
          />
        </GameContainer>
      </section>
    </div>

    <GameResultOverlay
      v-if="isGameOver && flowState.gameResult"
      :game-result="flowState.gameResult"
      :winner="winnerName"
      :winning-lines="flowState.winningLines"
      :player-one="gameState.players.playerOne"
      :player-two="gameState.players.playerTwo"
      :board="gameState.board.value"
      :board-size="gameState.boardConfig.size"
      :moves="gameState.moveHistory.value"
      :start-time="gameState.startTime.value"
      :end-time="Date.now()"
      :is-visible="true"
      @replay="onReplay"
      @main-menu="router.push({ name: 'home' })"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * GameView — active gameplay screen
 * Tasks 12.1 / 12.2
 */

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Difficulty, GameMode } from '@/types'
import GameHeader from '@/components/GameHeader.vue'
import GameContainer from '@/components/GameContainer.vue'
import GameBoard from '@/components/GameBoard.vue'
import ControlPanel from '@/components/ControlPanel.vue'
import PlayerIndicator from '@/components/PlayerIndicator.vue'
import GameResultOverlay from '@/components/GameResultOverlay.vue'
import { useAppGame, useAppConfig } from '@/composables/useAppGame'

const router = useRouter()
const {
  gameState,
  flowState,
  isGameOver,
  isPlaying,
  isCPUTurn,
  handlePlayerMove,
  resetForReplay,
  initializeGame,
} = useAppGame()
const { config, getPlayerObjects } = useAppConfig()

const moveFeedback = ref('')
const feedbackClass = ref('')

onMounted(async () => {
  // Guard: if user navigates here without setup, redirect or start from saved config
  if (!gameState.board.value.length) {
    const { playerOne, playerTwo } = getPlayerObjects()
    await initializeGame(
      config.boardSize,
      config.gameMode,
      playerOne,
      playerTwo,
      config.difficulty ?? undefined,
    )
  }
})

const currentPlayer = computed(() => {
  // Depend on index explicitly so the indicator updates every turn
  const _idx = gameState.currentPlayerIndex.value
  void _idx
  return gameState.getCurrentPlayer()
})
const playerNumber = computed(() => (gameState.currentPlayerIndex.value === 0 ? 1 : 2) as 1 | 2)

const turnHint = computed(() => {
  if (!isPlaying.value) return ''
  if (isCPUTurn.value) return 'CPU is thinking…'
  if (gameState.gameMode.value === 'two-player') {
    return `Hot-seat · ${currentPlayer.value.name}'s turn (same device)`
  }
  return 'Your turn — tap an empty cell'
})

const headerMode = computed(() =>
  gameState.gameMode.value === 'single-player' ? GameMode.SinglePlayer : GameMode.TwoPlayer,
)
const headerDifficulty = computed(() => {
  const d = gameState.difficulty.value
  if (d === 'easy') return Difficulty.Easy
  if (d === 'hard') return Difficulty.Hard
  return Difficulty.Medium
})

const winnerName = computed(() => {
  const result = flowState.value.gameResult
  if (result === 'player-one-wins') return gameState.players.playerOne.name
  if (result === 'player-two-wins') return gameState.players.playerTwo.name
  return ''
})

async function onCellClick(row: number, col: number) {
  if (!isPlaying.value || isCPUTurn.value || flowState.value.isProcessingMove) {
    moveFeedback.value = 'Wait for your turn'
    feedbackClass.value = 'error'
    return
  }

  const ok = await handlePlayerMove(row, col)
  if (ok) {
    moveFeedback.value = 'Move placed!'
    feedbackClass.value = 'success'
  } else {
    moveFeedback.value = 'Invalid move — cell occupied or out of bounds'
    feedbackClass.value = 'error'
  }

  window.setTimeout(() => {
    moveFeedback.value = ''
  }, 1200)
}

async function onReplay() {
  // Prefer same-config replay; fall back to re-init from saved config
  if (gameState.gameStatus.value === 'game-over' || gameState.board.value.length > 0) {
    resetForReplay()
  } else {
    const { playerOne, playerTwo } = getPlayerObjects()
    await initializeGame(
      config.boardSize,
      config.gameMode,
      playerOne,
      playerTwo,
      config.difficulty ?? undefined,
    )
  }
}

function onReset() {
  router.push({ name: 'setup' })
}
</script>

<style scoped>
.game-view {
  @apply relative z-10 px-4 py-5 sm:px-6 sm:py-8 max-w-3xl mx-auto;
}

.game-layout {
  @apply flex flex-col items-center mt-2;
}

.board-column {
  @apply w-full flex flex-col items-center gap-1;
}

.move-feedback {
  font-family: 'Exo 2', system-ui, sans-serif;

  @apply text-xs font-semibold mb-2 px-3 py-1 rounded-md;
}

.turn-hint {
  font-family: 'Exo 2', system-ui, sans-serif;
  @apply text-sm text-spiderman-web/80 font-medium mb-2 tracking-wide;
}

.move-feedback.success {
  @apply text-emerald-200 bg-emerald-950/50 border border-emerald-600/50;
}

.move-feedback.error {
  @apply text-spiderman-red bg-red-950/40 border border-spiderman-red/60;
}
</style>
