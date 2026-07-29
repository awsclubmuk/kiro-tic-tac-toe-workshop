<template>
  <div class="board-configuration-overlay" v-if="isOpen" @click.self="close">
    <!-- Modal Panel -->
    <div class="board-configuration-panel">
      <!-- Header -->
      <div class="panel-header">
        <h2 class="panel-title">Board Configuration</h2>
        <button class="close-button" @click="close" aria-label="Close configuration">
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="panel-content">
        <div class="config-section">
          <label for="board-size-slider" class="config-label">
            Select Board Size ({{ minSize }}-{{ maxSize }})
          </label>

          <!-- Slider Input -->
          <div class="slider-container">
            <input
              id="board-size-slider"
              v-model.number="sliderValue"
              type="range"
              :min="minSize"
              :max="maxSize"
              class="size-slider"
              aria-label="Board size slider"
              @input="updateFromSlider"
            />
            <div class="slider-labels">
              <span class="slider-min">{{ minSize }}×{{ minSize }}</span>
              <span class="slider-max">{{ maxSize }}×{{ maxSize }}</span>
            </div>
          </div>

          <!-- Number Input -->
          <div class="number-input-container">
            <label for="board-size-input" class="number-label">Or enter directly:</label>
            <input
              id="board-size-input"
              v-model.number="inputValue"
              type="number"
              :min="minSize"
              :max="maxSize"
              class="number-input"
              placeholder="Enter board size"
              aria-label="Board size number input"
              @input="updateFromInput"
              @blur="validateInput"
            />
          </div>

          <!-- Current Selection Display -->
          <div class="current-selection">
            <p class="selection-text">
              Selected Size: <span class="size-value">{{ currentSize }}×{{ currentSize }}</span>
            </p>
            <p class="selection-info">
              Total cells: <span class="cell-count">{{ totalCells }}</span>
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message" role="alert">
            <span class="error-icon">⚠</span>
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="success-message" role="status">
            <span class="success-icon">✓</span>
            {{ successMessage }}
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="panel-footer">
        <button class="button button-secondary" @click="close">
          Cancel
        </button>
        <button
          class="button button-primary"
          :disabled="!isValid || !hasChanged"
          @click="confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BoardConfiguration Component
 * Task 4.1: Create Board Configuration component
 * Validates: Requirement 1 - Customizable Board
 *
 * Modal panel for selecting board size before game starts.
 * Supports size range 3x3 to 10x10 with both slider and number input.
 * Provides real-time validation with error messaging.
 * Emits 'update:size' event when size is confirmed.
 */

import { ref, computed, watch } from 'vue'

interface Props {
  /**
   * Current board size (for display and initial state)
   */
  modelValue: number
  /**
   * Whether the configuration panel is open
   */
  open?: boolean
}

interface Emits {
  /**
   * Emitted when board size is confirmed
   */
  (e: 'update:modelValue', size: number): void
  /**
   * Emitted when configuration panel should close
   */
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 3,
  open: false,
})

const emit = defineEmits<Emits>()

// Board size constraints
const minSize = 3
const maxSize = 10

// Component state
const sliderValue = ref(props.modelValue)
const inputValue = ref<number | string>(props.modelValue)
const rawInputInvalid = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isOpen = ref(props.open)
const initialSize = ref(props.modelValue)

/**
 * Current board size (synced from slider or input)
 */
const currentSize = computed(() => {
  return Math.min(Math.max(sliderValue.value, minSize), maxSize)
})

/**
 * Total number of cells for display
 */
const totalCells = computed(() => {
  return currentSize.value * currentSize.value
})

/**
 * Whether current size differs from the initial size (enables confirm)
 */
const hasChanged = computed(() => {
  return currentSize.value !== initialSize.value
})

/**
 * Whether current size is valid
 */
const isValid = computed(() => {
  if (rawInputInvalid.value) return false
  const size = currentSize.value
  return size >= minSize && size <= maxSize
})

/**
 * Update from slider input
 */
const updateFromSlider = () => {
  inputValue.value = sliderValue.value
  clearMessages()
}

/**
 * Update from number input
 */
const updateFromInput = () => {
  const value = Number(inputValue.value)

  if (!inputValue.value && inputValue.value !== 0) {
    rawInputInvalid.value = false
    clearMessages()
    return
  }

  if (value >= minSize && value <= maxSize) {
    sliderValue.value = value
    rawInputInvalid.value = false
    clearMessages()
  } else {
    rawInputInvalid.value = true
  }
}

/**
 * Validate input on blur
 */
const validateInput = () => {
  const value = Number(inputValue.value)

  if (!inputValue.value && inputValue.value !== 0) {
    rawInputInvalid.value = false
    clearMessages()
    return
  }

  if (value < minSize) {
    rawInputInvalid.value = true
    showError(`Board size must be at least ${minSize}×${minSize}`)
  } else if (value > maxSize) {
    rawInputInvalid.value = true
    showError(`Board size cannot exceed ${maxSize}×${maxSize}`)
  } else {
    rawInputInvalid.value = false
    sliderValue.value = value
    clearMessages()
  }
}

/**
 * Show error message
 */
const showError = (message: string) => {
  errorMessage.value = message
  successMessage.value = ''
}

/**
 * Show success message
 */
const showSuccess = (message: string) => {
  successMessage.value = message
  errorMessage.value = ''
}

/**
 * Clear all messages
 */
const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

/**
 * Confirm selection and emit size change
 */
const confirm = () => {
  if (!isValid.value) {
    showError(`Invalid board size. Please select between ${minSize} and ${maxSize}.`)
    return
  }

  emit('update:modelValue', currentSize.value)
  showSuccess(`Board size set to ${currentSize.value}×${currentSize.value}`)

  // Close after short delay to show success message
  setTimeout(() => {
    close()
  }, 500)
}

/**
 * Close the configuration panel
 */
const close = () => {
  isOpen.value = false
  emit('close')
  // Reset to initial values on close
  sliderValue.value = initialSize.value
  inputValue.value = initialSize.value
  clearMessages()
}

/**
 * Watch for prop changes
 */
watch(
  () => props.open,
  (newOpen) => {
    isOpen.value = newOpen
    if (newOpen) {
      // Reset when opening
      sliderValue.value = props.modelValue
      inputValue.value = props.modelValue
      initialSize.value = props.modelValue
      clearMessages()
    }
  },
)

watch(
  () => props.modelValue,
  (newSize) => {
    sliderValue.value = newSize
    inputValue.value = newSize
    initialSize.value = newSize
  },
)
</script>

<style scoped>
/**
 * BoardConfiguration Styles
 * Modal overlay with panel styling using Spider-Man theme
 */

/* Overlay backdrop */
.board-configuration-overlay {
  @apply fixed
    inset-0
    bg-black/70
    backdrop-blur-sm
    flex
    items-center
    justify-center
    z-50
    p-4;
}

/* Modal panel */
.board-configuration-panel {
  @apply bg-gradient-to-br
    from-spiderman-dark
    to-spiderman-blue
    border-2
    border-spiderman-red
    rounded-lg
    shadow-web-lg
    max-w-md
    w-full
    overflow-hidden
    flex
    flex-col;

  animation: slide-in 0.3s ease-out;
}

/* Header */
.panel-header {
  @apply flex
    items-center
    justify-between
    px-6
    py-4
    border-b
    border-spiderman-red/30
    bg-spiderman-dark/50;
}

.panel-title {
  @apply text-xl
    font-bold
    text-spiderman-red
    m-0;

  text-shadow: 0 0 10px rgba(220, 20, 60, 0.5);
}

.close-button {
  @apply w-8
    h-8
    flex
    items-center
    justify-center
    text-spiderman-red
    hover:text-spiderman-web
    hover:bg-spiderman-red/20
    rounded
    transition-all
    duration-200
    border
    border-spiderman-red/30
    hover:border-spiderman-red
    cursor-pointer;

  font-size: 1.5rem;
  line-height: 1;
}

.close-button:hover {
  @apply shadow-web;
}

/* Content area */
.panel-content {
  @apply flex-1
    px-6
    py-6
    overflow-y-auto;
}

/* Configuration section */
.config-section {
  @apply space-y-6;
}

/* Labels */
.config-label {
  @apply block
    text-sm
    font-semibold
    text-spiderman-web
    mb-3;

  text-shadow: 0 0 10px rgba(220, 20, 60, 0.5);
}

.number-label {
  @apply block
    text-xs
    font-semibold
    text-gray-300
    mb-2;
}

/* Slider container */
.slider-container {
  @apply space-y-3;
}

.size-slider {
  @apply w-full
    h-2
    bg-spiderman-blue
    rounded-lg
    appearance-none
    cursor-pointer
    border
    border-spiderman-red/30
    transition-all
    duration-200;

  -webkit-appearance: none;
  outline: none;

  /* Thumb styling */
  &::-webkit-slider-thumb {
    @apply appearance-none
      w-6
      h-6
      bg-gradient-to-b
      from-spiderman-red
      to-red-700
      rounded-full
      cursor-pointer
      border-2
      border-spiderman-web
      shadow-web
      transition-all
      duration-200;

    -webkit-appearance: none;
  }

  &::-moz-range-thumb {
    @apply w-6
      h-6
      bg-gradient-to-b
      from-spiderman-red
      to-red-700
      rounded-full
      cursor-pointer
      border-2
      border-spiderman-web
      shadow-web
      transition-all
      duration-200;
  }

  /* Track styling */
  &::-webkit-slider-runnable-track {
    @apply bg-spiderman-blue rounded-lg h-2;
  }

  &::-moz-range-track {
    @apply bg-spiderman-blue rounded-lg h-2 border-0;
  }

  /* Hover effect */
  &:hover {
    @apply shadow-web-lg;

    &::-webkit-slider-thumb {
      @apply scale-110;
    }

    &::-moz-range-thumb {
      @apply scale-110;
    }
  }

  /* Focus effect */
  &:focus {
    @apply border-spiderman-red;

    &::-webkit-slider-thumb {
      @apply ring-2 ring-spiderman-red ring-offset-2 ring-offset-spiderman-dark;
    }
  }
}

/* Slider labels */
.slider-labels {
  @apply flex
    justify-between
    text-xs
    text-gray-400
    px-1;
}

/* Number input container */
.number-input-container {
  @apply space-y-2;
}

.number-input {
  @apply w-full
    px-4
    py-2
    bg-spiderman-dark
    border-2
    border-spiderman-red/50
    rounded-lg
    text-white
    text-center
    font-bold
    text-lg
    transition-all
    duration-200
    focus:border-spiderman-red
    focus:shadow-web
    focus:outline-none
    hover:border-spiderman-red;

  /* Input number spinner styling */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    @apply appearance-none
      m-0;

    -webkit-appearance: none;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}

/* Current selection display */
.current-selection {
  @apply bg-spiderman-dark/30
    border
    border-spiderman-red/30
    rounded-lg
    p-4
    space-y-2;
}

.selection-text,
.selection-info {
  @apply text-sm
    text-gray-300
    m-0;
}

.size-value,
.cell-count {
  @apply font-bold
    text-spiderman-web;
}

/* Error message */
.error-message {
  @apply flex
    items-center
    gap-2
    px-4
    py-3
    bg-red-900/20
    border
    border-red-600
    rounded-lg
    text-red-300
    text-sm
    font-medium;

  animation: slide-in 0.2s ease-out;
}

.error-icon {
  @apply text-lg
    flex-shrink-0;
}

/* Success message */
.success-message {
  @apply flex
    items-center
    gap-2
    px-4
    py-3
    bg-green-900/20
    border
    border-green-600
    rounded-lg
    text-green-300
    text-sm
    font-medium;

  animation: slide-in 0.2s ease-out;
}

.success-icon {
  @apply text-lg
    flex-shrink-0;
}

/* Footer */
.panel-footer {
  @apply flex
    gap-3
    px-6
    py-4
    border-t
    border-spiderman-red/30
    bg-spiderman-dark/50
    justify-end;
}

/* Buttons */
.button {
  @apply px-6
    py-2
    font-semibold
    rounded-lg
    transition-all
    duration-200
    cursor-pointer
    border
    text-sm
    font-bold
    disabled:opacity-50
    disabled:cursor-not-allowed;
}

.button-primary {
  @apply bg-gradient-to-r
    from-spiderman-red
    to-red-700
    text-white
    border-spiderman-red
    hover:shadow-web-lg
    hover:scale-105
    active:scale-95
    disabled:hover:shadow-web
    disabled:hover:scale-100;
}

.button-secondary {
  @apply bg-spiderman-blue
    text-spiderman-web
    border-spiderman-red
    hover:bg-spiderman-dark
    hover:shadow-web
    active:scale-95
    disabled:hover:bg-spiderman-blue;
}

/* Animation */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .board-configuration-panel {
    @apply max-w-sm;
  }

  .panel-header {
    @apply px-4 py-3;
  }

  .panel-content {
    @apply px-4 py-4;
  }

  .panel-footer {
    @apply px-4 py-3 gap-2;
  }

  .button {
    @apply px-4 py-2 text-xs;
  }
}
</style>
