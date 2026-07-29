<template>
  <div v-if="hasError" class="error-boundary" role="alert">
    <div class="error-card">
      <div class="error-icon">🕷️💥</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button class="btn-primary" @click="recover">Try Again</button>
        <button class="btn-secondary" @click="goHome">Main Menu</button>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
/**
 * ErrorBoundary Component
 * Task 12.4: Implement error handling and recovery
 *
 * Catches runtime errors via errorCaptured and offers recovery actions.
 */

import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  recover: []
  'go-home': []
}>()

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('An unexpected error occurred. Your game progress may have been saved.')

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMessage.value = err?.message
    ? `Oops — ${err.message}`
    : 'An unexpected error occurred. Your game progress may have been saved.'
  console.error('[ErrorBoundary]', err)
  return false
})

function recover() {
  hasError.value = false
  errorMessage.value = 'An unexpected error occurred. Your game progress may have been saved.'
  emit('recover')
}

function goHome() {
  hasError.value = false
  emit('go-home')
  router.push({ name: 'home' })
}
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen flex items-center justify-center p-6 bg-spiderman-dark;
}

.error-card {
  @apply max-w-md w-full bg-spiderman-blue border-4 border-spiderman-red rounded-lg shadow-web-lg p-8 text-center space-y-4;
}

.error-icon {
  @apply text-5xl;
}

.error-title {
  @apply text-2xl font-bold text-spiderman-red;
}

.error-message {
  @apply text-spiderman-web text-sm leading-relaxed;
}

.error-actions {
  @apply flex flex-col sm:flex-row gap-3 justify-center pt-2;
}

.btn-primary {
  @apply bg-gradient-to-r from-spiderman-red to-red-700 text-white px-6 py-3 rounded-lg font-bold hover:shadow-web-lg hover:scale-105 transition-all duration-300 active:scale-95;
}

.btn-secondary {
  @apply bg-spiderman-dark text-spiderman-web border-2 border-spiderman-red px-6 py-3 rounded-lg font-bold hover:bg-spiderman-blue transition-all duration-300;
}
</style>
