<template>
  <div v-if="isOpen" class="replay-modal-overlay" @click.self="close">
    <div class="replay-modal bg-gradient-to-b from-spiderman-blue to-spiderman-dark border-2 border-spiderman-red rounded-lg shadow-web-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
      <!-- Header -->
      <div class="bg-spiderman-dark border-b-2 border-spiderman-red px-6 py-4 flex justify-between items-center sticky top-0">
        <h2 class="text-2xl font-bold text-spiderman-web">GAME REPLAY</h2>
        <button @click="close" class="text-gray-400 hover:text-spiderman-web text-2xl">&times;</button>
      </div>

      <div class="p-6 space-y-6">
        <!-- Game Info -->
        <div class="game-info bg-spiderman-dark border-l-4 border-spiderman-red p-4 rounded">
          <div class="grid grid-cols-2 gap-4 mb-2">
            <div>
              <div class="text-gray-400 text-sm">Players</div>
              <div class="text-white font-bold">
                {{ gameSession?.playerOne.name }} vs {{ gameSession?.playerTwo.name }}
              </div>
            </div>
            <div>
              <div class="text-gray-400 text-sm">Result</div>
              <div class="text-spiderman-web font-bold">
                {{ getResultText(gameSession) }}
              </div>
            </div>
            <div>
              <div class="text-gray-400 text-sm">Board Size</div>
              <div class="text-white font-bold">
                {{ gameSession?.boardConfig.size }}x{{ gameSession?.boardConfig.size }}
              </div>
            </div>
            <div>
              <div class="text-gray-400 text-sm">Date</div>
              <div class="text-white font-bold">{{ formatDate(gameSession?.startTime) }}</div>
            </div>
          </div>
        </div>

        <!-- Board Display -->
        <div class="board-container flex justify-center">
          <div
            class="replay-board"
            :style="{
              display: 'grid',
              gridTemplateColumns: `repeat(${gameSession?.boardConfig.size}, minmax(0, 1fr))`,
              gap: '8px',
              padding: '16px',
              backgroundColor: 'rgba(10, 10, 10, 0.5)',
              borderRadius: '8px',
              border: '2px solid #DC143C'
            }"
          >
            <div
              v-for="(cell, idx) in currentBoardState"
              :key="`cell-${idx}`"
              class="replay-cell"
              :class="getWinningCellClass(idx)"
              :style="{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0, 31, 63, 0.8)',
                border: '2px solid #DC143C',
                borderRadius: '8px',
                color: getCellTextColor(cell)
              }"
            >
              {{ cell || '' }}
            </div>
          </div>
        </div>

        <!-- Move Counter and Playback Controls -->
        <div class="controls-section space-y-4">
          <!-- Move Counter -->
          <div class="flex justify-between items-center bg-spiderman-dark p-3 rounded border border-spiderman-red">
            <div class="text-gray-400">
              Move <span class="text-spiderman-web font-bold">{{ currentMoveIndex + 1 }}</span> of
              <span class="text-spiderman-web font-bold">{{ gameSession?.moves.length }}</span>
            </div>
            <div class="text-gray-400">
              Current Player: <span class="text-white font-bold">{{ getCurrentPlayerAtMove()?.name }}</span>
            </div>
          </div>

          <!-- Playback Controls -->
          <div class="flex gap-2">
            <!-- First Move -->
            <button
              @click="goToStart"
              :disabled="currentMoveIndex === -1"
              class="px-3 py-2 bg-spiderman-red text-white rounded font-bold hover:shadow-web disabled:opacity-50 transition-all"
            >
              ⏮ Start
            </button>

            <!-- Previous Move -->
            <button
              @click="previousMove"
              :disabled="currentMoveIndex === -1"
              class="px-3 py-2 bg-spiderman-red text-white rounded font-bold hover:shadow-web disabled:opacity-50 transition-all"
            >
              ◀ Back
            </button>

            <!-- Play/Pause -->
            <button
              @click="toggleAutoPlay"
              class="px-4 py-2 bg-spiderman-red text-white rounded font-bold hover:shadow-web transition-all flex-1"
            >
              {{ isAutoPlaying ? '⏸ Pause' : '▶ Play' }}
            </button>

            <!-- Next Move -->
            <button
              @click="nextMove"
              :disabled="currentMoveIndex >= (gameSession?.moves.length || 0) - 1"
              class="px-3 py-2 bg-spiderman-red text-white rounded font-bold hover:shadow-web disabled:opacity-50 transition-all"
            >
              Forward ▶
            </button>

            <!-- Last Move -->
            <button
              @click="goToEnd"
              :disabled="currentMoveIndex >= (gameSession?.moves.length || 0) - 1"
              class="px-3 py-2 bg-spiderman-red text-white rounded font-bold hover:shadow-web disabled:opacity-50 transition-all"
            >
              End ⏭
            </button>
          </div>

          <!-- Speed Control -->
          <div class="bg-spiderman-dark p-3 rounded border border-spiderman-red">
            <label class="text-gray-400 text-sm flex items-center gap-2">
              Playback Speed:
              <input
                v-model.number="playbackSpeed"
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                class="flex-1"
              />
              <span class="text-spiderman-web font-bold">{{ playbackSpeed }}x</span>
            </label>
          </div>
        </div>

        <!-- Move List -->
        <div class="moves-section">
          <h3 class="text-lg font-bold text-spiderman-web mb-2">MOVES</h3>
          <div class="moves-list bg-spiderman-dark border border-spiderman-red rounded max-h-48 overflow-y-auto">
            <div
              v-for="(move, idx) in gameSession?.moves"
              :key="`move-${idx}`"
              class="move-item px-3 py-2 border-b border-spiderman-red last:border-b-0 cursor-pointer hover:bg-opacity-80 transition-all"
              :class="currentMoveIndex === idx ? 'bg-spiderman-red text-white' : 'text-gray-400 hover:text-spiderman-web'"
              @click="goToMove(idx)"
            >
              <span class="font-bold">{{ idx + 1 }}.</span>
              {{ move.playerName }} placed {{ move.symbol }} at ({{ move.row }}, {{ move.col }})
            </div>
          </div>
        </div>

        <!-- Close Button -->
        <button
          @click="close"
          class="w-full px-4 py-3 bg-gradient-to-r from-spiderman-red to-red-700 text-white rounded-lg font-bold hover:shadow-web-lg transition-all"
        >
          CLOSE REPLAY
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { GameSession, Board, Move } from '../types/index';
import { createEmptyBoard, placeMark } from '../utils/boardUtils';

interface Props {
  modelValue: boolean;
  game: GameSession | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'replay-requested': [];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const currentMoveIndex = ref(-1);
const isAutoPlaying = ref(false);
const playbackSpeed = ref(1);
let autoPlayInterval: number | null = null;

/**
 * Gets the current board state based on move index
 */
const currentBoardState = computed((): (string | null)[] => {
  if (!props.game) return [];

  const boardSize = props.game.boardConfig.size;
  const board = createEmptyBoard(boardSize);

  // Apply moves up to current index
  for (let i = 0; i <= currentMoveIndex.value && i < props.game.moves.length; i++) {
    const move = props.game.moves[i];
    board[move.row][move.col] = move.symbol;
  }

  // Flatten board to 1D array for display
  return board.flat();
});

/**
 * Gets CSS class for winning cells
 */
function getWinningCellClass(cellIndex: number): string {
  if (!props.game || !props.game.winningLines) return '';

  const row = Math.floor(cellIndex / (props.game.boardConfig.size || 3));
  const col = cellIndex % (props.game.boardConfig.size || 3);

  const isWinningCell = props.game.winningLines.some((line) =>
    line.some(([r, c]) => r === row && c === col)
  );

  return isWinningCell ? 'winner-cell' : '';
}

/**
 * Gets text color for cell based on symbol
 */
function getCellTextColor(symbol: string | null): string {
  if (!symbol) return 'transparent';
  // Check if it's player one's symbol (typically red)
  if (props.game?.playerOne.symbol === symbol) {
    return '#DC143C';
  }
  // Check if it's player two's symbol (typically yellow)
  if (props.game?.playerTwo.symbol === symbol) {
    return '#FFD700';
  }
  return '#FFFFFF';
}

/**
 * Gets current player at the current move
 */
function getCurrentPlayerAtMove() {
  if (currentMoveIndex.value === -1) {
    return props.game?.playerOne;
  }
  if (currentMoveIndex.value >= 0 && currentMoveIndex.value < (props.game?.moves.length || 0)) {
    const move = props.game?.moves[currentMoveIndex.value];
    if (move?.playerName === props.game?.playerOne.name) {
      return props.game?.playerOne;
    }
    return props.game?.playerTwo;
  }
  return null;
}

/**
 * Formats timestamp to readable date
 */
function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets result text
 */
function getResultText(session: GameSession | null): string {
  if (!session) return '';
  if (session.result === 'draw') return '🤝 Draw';
  if (session.result === 'player-one-wins') return `🏆 ${session.playerOne.name} wins`;
  if (session.result === 'player-two-wins') return `🏆 ${session.playerTwo.name} wins`;
  return 'In Progress';
}

/**
 * Navigation functions
 */
function goToStart(): void {
  currentMoveIndex.value = -1;
}

function goToEnd(): void {
  if (props.game) {
    currentMoveIndex.value = Math.max(0, props.game.moves.length - 1);
  }
}

function previousMove(): void {
  currentMoveIndex.value = Math.max(-1, currentMoveIndex.value - 1);
}

function nextMove(): void {
  if (props.game && currentMoveIndex.value < props.game.moves.length - 1) {
    currentMoveIndex.value++;
  }
}

function goToMove(index: number): void {
  currentMoveIndex.value = index;
}

/**
 * Toggle auto-play
 */
function toggleAutoPlay(): void {
  isAutoPlaying.value = !isAutoPlaying.value;
  if (isAutoPlaying.value) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
}

/**
 * Start auto-play
 */
function startAutoPlay(): void {
  const delayMs = 1000 / playbackSpeed.value;
  autoPlayInterval = window.setInterval(() => {
    if (props.game && currentMoveIndex.value < props.game.moves.length - 1) {
      currentMoveIndex.value++;
    } else {
      stopAutoPlay();
    }
  }, delayMs);
}

/**
 * Stop auto-play
 */
function stopAutoPlay(): void {
  if (autoPlayInterval !== null) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
  isAutoPlaying.value = false;
}

/**
 * Watch playback speed changes
 */
watch(() => playbackSpeed.value, () => {
  if (isAutoPlaying.value) {
    stopAutoPlay();
    startAutoPlay();
  }
});

/**
 * Close modal
 */
function close(): void {
  stopAutoPlay();
  currentMoveIndex.value = -1;
  emit('update:modelValue', false);
}

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  stopAutoPlay();
});
</script>

<style scoped>
.replay-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.replay-modal {
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.moves-list::-webkit-scrollbar {
  width: 6px;
}

.moves-list::-webkit-scrollbar-track {
  background: rgba(1, 31, 63, 0.5);
}

.moves-list::-webkit-scrollbar-thumb {
  background: rgba(220, 20, 60, 0.6);
  border-radius: 3px;
}

.moves-list::-webkit-scrollbar-thumb:hover {
  background: rgba(220, 20, 60, 0.8);
}

.winner-cell {
  animation: winner-pulse 0.6s ease-in-out;
  box-shadow: 0 0 20px rgba(220, 20, 60, 0.8);
}

@keyframes winner-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .replay-modal-overlay {
    padding: 8px;
  }

  .replay-modal {
    width: 100%;
  }
}
</style>
