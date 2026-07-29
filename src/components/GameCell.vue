<template>
  <button
    :class="[
      'game-cell',
      {
        'cell-occupied': !!symbol,
        'opacity-75 cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
        'symbol-player1': symbol && symbolColor === 'red',
        'symbol-player2': symbol && symbolColor === 'yellow',
      },
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span v-if="symbol" class="cell-mark">{{ symbol }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  row: number;
  col: number;
  symbol: string | null;
  disabled?: boolean;
  isPlayer1?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isPlayer1: true,
});

const emit = defineEmits<{
  click: [row: number, col: number];
}>();

const symbolColor = computed(() => {
  if (!props.symbol) return null;
  return props.isPlayer1 ? 'red' : 'yellow';
});

const handleClick = () => {
  if (!props.disabled) {
    emit('click', props.row, props.col);
  }
};
</script>

<style scoped>
button {
  min-width: 44px;
  min-height: 44px;
}

.cell-mark {
  line-height: 1;
  user-select: none;
}

.cell-occupied {
  @apply border-spiderman-red/80 bg-spiderman-navy-mid/90;
}

button:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 0 14px rgba(220, 20, 60, 0.4);
}

button:active:not(:disabled) {
  transform: scale(0.96);
}

button.symbol-player1 .cell-mark {
  color: #dc143c;
  filter: drop-shadow(0 0 6px rgba(220, 20, 60, 0.55));
}

button.symbol-player2 .cell-mark {
  color: #ffd700;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.45));
}
</style>
