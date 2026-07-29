<template>
  <div class="panel-view">
    <header class="panel-header">
      <button class="back-btn" @click="router.push({ name: 'home' })">← Menu</button>
      <h1 class="panel-title">Game History</h1>
    </header>

    <GameHistoryPanel @select-game="onSelectGame" />

    <GameReplayModal
      v-model="replayOpen"
      :game="selectedGame"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * HistoryView — lazy-loaded history + replay
 * Tasks 12.2 / 12.5
 */

import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import type { GameSession } from '@/types'

const GameHistoryPanel = defineAsyncComponent(
  () => import('@/components/GameHistoryPanel.vue'),
)
const GameReplayModal = defineAsyncComponent(
  () => import('@/components/GameReplayModal.vue'),
)

const router = useRouter()
const selectedGame = ref<GameSession | null>(null)
const replayOpen = ref(false)

function onSelectGame(game: GameSession) {
  selectedGame.value = game
  replayOpen.value = true
}
</script>

<style scoped>
.panel-view {
  @apply relative z-10 max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-4;
}

.panel-header {
  @apply flex items-center gap-4 mb-2;
}

.back-btn {
  @apply text-spiderman-web text-sm font-bold border border-spiderman-red rounded px-3 py-1.5
    hover:bg-spiderman-red hover:text-white transition-all;
}

.panel-title {
  @apply text-2xl sm:text-3xl font-black text-spiderman-web;
}
</style>
