<template>
  <div class="app-shell min-h-screen text-white font-body">
    <!-- Layered atmosphere: city-night gradient + web motif -->
    <div class="app-atmosphere" aria-hidden="true">
      <div class="atmosphere-base" />
      <div class="atmosphere-web" />
      <div class="atmosphere-vignette" />
    </div>

    <ErrorBoundary class="relative z-10 min-h-screen flex flex-col">
      <RouterView v-slot="{ Component }">
        <Transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue — main shell with cinematic Spider-Man atmosphere
 */

import ErrorBoundary from '@/components/ErrorBoundary.vue'
</script>

<style scoped>
.app-shell {
  position: relative;
  isolation: isolate;
}

.app-atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.atmosphere-base {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(ellipse 80% 60% at 50% -10%, rgba(220, 20, 60, 0.28), transparent 55%),
    radial-gradient(ellipse 70% 50% at 80% 100%, rgba(0, 31, 63, 0.9), transparent 50%),
    linear-gradient(165deg, #070B12 0%, #0A2A4A 45%, #070B12 100%);
}

.atmosphere-web {
  position: absolute;
  inset: 0;
  @apply bg-web-pattern;
  background-size: 72px 72px;
  opacity: 0.45;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%);
}

.atmosphere-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.55) 100%);
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
