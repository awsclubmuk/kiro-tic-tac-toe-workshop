<template>
  <div class="main-menu">
    <!-- Landing-only Spider-Man atmosphere -->
    <div class="landing-bg" aria-hidden="true">
      <div class="landing-sky" />
      <svg class="landing-web" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="webFade" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#DC143C" stop-opacity="0.35" />
            <stop offset="55%" stop-color="#DC143C" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#DC143C" stop-opacity="0" />
          </radialGradient>
        </defs>
        <!-- Radial web from upper center -->
        <g stroke="url(#webFade)" stroke-width="0.18" fill="none">
          <line x1="50" y1="28" x2="50" y2="100" />
          <line x1="50" y1="28" x2="0" y2="85" />
          <line x1="50" y1="28" x2="100" y2="85" />
          <line x1="50" y1="28" x2="8" y2="35" />
          <line x1="50" y1="28" x2="92" y2="35" />
          <line x1="50" y1="28" x2="0" y2="55" />
          <line x1="50" y1="28" x2="100" y2="55" />
          <line x1="50" y1="28" x2="18" y2="100" />
          <line x1="50" y1="28" x2="82" y2="100" />
          <ellipse cx="50" cy="28" rx="8" ry="6" />
          <ellipse cx="50" cy="28" rx="18" ry="14" />
          <ellipse cx="50" cy="28" rx="30" ry="24" />
          <ellipse cx="50" cy="28" rx="44" ry="36" />
          <ellipse cx="50" cy="28" rx="58" ry="48" />
        </g>
        <!-- Stylized spider mark (generic silhouette) -->
        <g class="spider-mark" fill="#DC143C" opacity="0.22">
          <ellipse cx="50" cy="26" rx="3.2" ry="4" />
          <ellipse cx="50" cy="31.5" rx="2.4" ry="2.8" />
          <path
            d="M47 27 Q40 22 36 18 M53 27 Q60 22 64 18
               M46.5 28.5 Q38 28 32 26 M53.5 28.5 Q62 28 68 26
               M46.5 30.5 Q38 34 33 38 M53.5 30.5 Q62 34 67 38
               M47 32 Q42 38 38 44 M53 32 Q58 38 62 44"
            fill="none"
            stroke="#DC143C"
            stroke-width="0.7"
            stroke-linecap="round"
            opacity="0.5"
          />
        </g>
      </svg>
      <!-- NYC-style skyline -->
      <svg class="landing-skyline" viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#001F3F" />
            <stop offset="100%" stop-color="#070B12" />
          </linearGradient>
        </defs>
        <path
          fill="url(#skylineGrad)"
          d="M0 220 V140 H40 V90 H70 V140 H95 V70 H120 V50 H145 V70 H160 V140 H200 V100 H230 V60 H255 V100 H280 V140 H320 V85 H350 V40 H375 V85 H400 V140 H450 V110 H480 V75 H510 V110 H540 V140 H590 V95 H620 V55 H650 V30 H680 V55 H710 V95 H740 V140 H800 V105 H830 V70 H860 V105 H890 V140 H940 V88 H970 V45 H1000 V88 H1030 V140 H1080 V100 H1110 V65 H1140 V100 H1170 V140 H1220 V80 H1250 V50 H1280 V80 H1310 V140 H1360 V110 H1390 V140 H1440 V220 Z"
        />
        <!-- Window lights -->
        <g fill="#FFD700" opacity="0.35">
          <rect x="108" y="85" width="3" height="4" /><rect x="118" y="95" width="3" height="4" />
          <rect x="340" y="55" width="3" height="4" /><rect x="360" y="70" width="3" height="4" />
          <rect x="640" y="45" width="3" height="4" /><rect x="665" y="65" width="3" height="4" />
          <rect x="980" y="60" width="3" height="4" /><rect x="1005" y="75" width="3" height="4" />
          <rect x="1245" y="65" width="3" height="4" /><rect x="1265" y="90" width="3" height="4" />
        </g>
        <path
          fill="none"
          stroke="#DC143C"
          stroke-width="2"
          opacity="0.25"
          d="M0 140 H40 V90 H70 V140 H95 V70 H120 V50 H145 V70 H160 V140 H200 V100 H230 V60 H255 V100 H280 V140 H320 V85 H350 V40 H375 V85 H400 V140 H450 V110 H480 V75 H510 V110 H540 V140 H590 V95 H620 V55 H650 V30 H680 V55 H710 V95 H740 V140 H800 V105 H830 V70 H860 V105 H890 V140 H940 V88 H970 V45 H1000 V88 H1030 V140 H1080 V100 H1110 V65 H1140 V100 H1170 V140 H1220 V80 H1250 V50 H1280 V80 H1310 V140 H1360 V110 H1390 V140 H1440"
        />
      </svg>
      <div class="landing-vignette" />
    </div>

    <!-- Hero: brand + tagline + CTAs only -->
    <div class="menu-hero">
      <p class="menu-eyebrow animate-fade-up">New York nights · classic rules</p>
      <h1 class="menu-title animate-title-in">
        <span class="title-line">Spider-Man</span>
        <span class="title-sub">Tic-Tac-Toe</span>
      </h1>
      <p class="menu-tagline animate-fade-up" style="animation-delay: 0.12s">
        Claim the city, one cell at a time.
      </p>

      <nav class="menu-actions animate-fade-up" style="animation-delay: 0.22s" aria-label="Main menu">
        <button class="menu-btn menu-btn-primary" @click="$emit('new-game')">
          New Game
        </button>
        <div class="menu-secondary">
          <button class="menu-btn menu-btn-ghost" @click="$emit('leaderboard')">
            Leaderboard
          </button>
          <button class="menu-btn menu-btn-ghost" @click="$emit('history')">
            History
          </button>
        </div>
      </nav>
    </div>

    <!-- Below-the-fold strip -->
    <section
      v-if="featuredPlayers.length > 0"
      class="featured-strip"
      aria-label="Top players"
    >
      <h2 class="featured-title">Top Web-Slingers</h2>
      <ul class="featured-list">
        <li
          v-for="(player, index) in featuredPlayers"
          :key="player.name"
          class="featured-item"
        >
          <span class="rank">{{ index + 1 }}</span>
          <span class="name">{{ player.name }}</span>
          <span class="stat">{{ player.metrics.winPercentage.toFixed(0) }}%</span>
        </li>
      </ul>
    </section>

    <p v-else class="empty-stats">No games yet — win your first match to climb the board.</p>
  </div>
</template>

<script setup lang="ts">
/**
 * MainMenu — brand-first start screen with Spider-Man landing backdrop
 */

import { computed, onMounted, ref } from 'vue'
import { useLeaderboard, type LeaderboardEntry } from '@/composables/useLeaderboard'

defineEmits<{
  'new-game': []
  leaderboard: []
  history: []
}>()

const { buildLeaderboard } = useLeaderboard()
const entries = ref<LeaderboardEntry[]>([])

onMounted(() => {
  entries.value = buildLeaderboard().slice(0, 3)
})

const featuredPlayers = computed(() => entries.value)
</script>

<style scoped>
.main-menu {
  @apply relative z-10 flex flex-col items-center px-4 sm:px-6;
  min-height: 100vh;
  padding-top: clamp(4rem, 18vh, 8rem);
  padding-bottom: 3rem;
  gap: 0;
  overflow: hidden;
}

.landing-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.landing-sky {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 90% 55% at 50% 8%, rgba(220, 20, 60, 0.45), transparent 55%),
    radial-gradient(ellipse 50% 40% at 80% 20%, rgba(255, 215, 0, 0.08), transparent 50%),
    linear-gradient(180deg, #0a1528 0%, #070B12 55%, #05080f 100%);
}

.landing-web {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.9;
  animation: web-breathe 8s ease-in-out infinite;
}

.spider-mark {
  animation: mark-pulse 4s ease-in-out infinite;
}

.landing-skyline {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: min(32vh, 280px);
  filter: drop-shadow(0 -8px 24px rgba(220, 20, 60, 0.2));
}

.landing-vignette {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(7, 11, 18, 0.85) 0%, transparent 35%),
    radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.5) 100%);
}

@keyframes web-breathe {
  0%, 100% { opacity: 0.75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.03); }
}

@keyframes mark-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.35; }
}

.menu-hero {
  @apply relative z-10 text-center w-full max-w-lg flex flex-col items-center;
  min-height: min(70vh, 36rem);
}

.menu-eyebrow {
  font-family: 'Exo 2', system-ui, sans-serif;
  @apply text-xs sm:text-sm uppercase tracking-[0.2em] text-spiderman-web/70 font-medium mb-4;
}

.menu-title {
  @apply flex flex-col items-center gap-1 mb-4;
  text-shadow: 0 2px 24px rgba(220, 20, 60, 0.45);
}

.title-line {
  font-family: Bangers, cursive;
  @apply text-5xl sm:text-6xl md:text-7xl text-spiderman-red leading-none;
}

.title-sub {
  font-family: Bangers, cursive;
  @apply text-3xl sm:text-4xl md:text-5xl text-white/95 leading-none tracking-wider;
}

.menu-tagline {
  font-family: 'Exo 2', system-ui, sans-serif;
  @apply text-spiderman-web/90 text-base sm:text-lg font-medium max-w-sm mb-10;
}

.menu-actions {
  @apply flex flex-col w-full max-w-xs gap-3;
}

.menu-secondary {
  @apply grid grid-cols-2 gap-2;
}

.menu-btn {
  font-family: 'Exo 2', system-ui, sans-serif;
  @apply w-full py-3.5 px-5 rounded-md font-bold text-base tracking-wide
    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spiderman-web;
}

.menu-btn-primary {
  @apply bg-gradient-to-r from-spiderman-red to-spiderman-red-soft text-white
    shadow-web-soft hover:shadow-web-lg hover:brightness-110 active:scale-[0.98];
}

.menu-btn-ghost {
  @apply bg-transparent text-spiderman-web/90 border border-spiderman-red/40
    hover:border-spiderman-red hover:bg-spiderman-navy-mid/50 active:scale-[0.98]
    backdrop-blur-sm;
}

.featured-strip {
  @apply relative z-10 w-full max-w-md mt-auto pt-16 border-t border-spiderman-red/20;
}

.featured-title {
  font-family: Bangers, cursive;
  @apply text-lg text-spiderman-web/80 tracking-wider mb-3 text-center;
}

.featured-list {
  @apply flex flex-col gap-1.5;
}

.featured-item {
  @apply flex items-center gap-3 text-sm px-2 py-1.5;
}

.rank {
  font-family: Bangers, cursive;
  @apply text-spiderman-red w-6 text-center text-base;
}

.name {
  @apply text-white/90 font-medium flex-1;
}

.stat {
  @apply text-spiderman-web/80 text-xs font-semibold tabular-nums;
}

.empty-stats {
  @apply relative z-10 text-white/40 text-sm text-center mt-auto pt-16;
}
</style>
