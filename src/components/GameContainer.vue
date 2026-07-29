<template>
  <div class="game-container board-enter" :class="containerClass">
    <div class="container-web" aria-hidden="true" />
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * GameContainer — board frame with restrained Spider-Man chrome
 */

interface Props {
  containerClass?: string
}

withDefaults(defineProps<Props>(), {
  containerClass: '',
})
</script>

<style scoped>
.game-container {
  @apply relative w-full mx-auto
    bg-spiderman-dark/80
    border border-spiderman-red/60
    rounded-md
    shadow-web-soft
    p-3 max-w-sm
    sm:p-5 sm:max-w-md
    md:p-6 md:max-w-lg
    lg:p-8 lg:max-w-none;
  backdrop-filter: blur(4px);
}

.container-web {
  @apply absolute inset-0 rounded-md pointer-events-none bg-web-pattern opacity-[0.12];
  background-size: 48px 48px;
}

@media (max-width: 400px) {
  .game-container {
    @apply p-2.5 border-spiderman-red/50;
  }
}
</style>
