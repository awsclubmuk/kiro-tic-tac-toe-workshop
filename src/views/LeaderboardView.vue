<template>
  <div class="panel-view">
    <header class="panel-header">
      <button class="back-btn" @click="router.push({ name: 'home' })">← Menu</button>
      <h1 class="panel-title">Leaderboard</h1>
    </header>

    <LeaderboardPanel @select-player="onSelectPlayer" />

    <PlayerStatsPanel
      v-if="selectedPlayer"
      class="mt-4"
      :player-name="selectedPlayer"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * LeaderboardView — lazy-loaded analytics screen
 * Tasks 12.2 / 12.5
 */

import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

const LeaderboardPanel = defineAsyncComponent(
  () => import('@/components/LeaderboardPanel.vue'),
)
const PlayerStatsPanel = defineAsyncComponent(
  () => import('@/components/PlayerStatsPanel.vue'),
)

const router = useRouter()
const selectedPlayer = ref<string | null>(null)

function onSelectPlayer(name: string) {
  selectedPlayer.value = name
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
