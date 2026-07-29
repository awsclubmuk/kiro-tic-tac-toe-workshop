/**
 * Game Flow Orchestrator Composable
 * Task 9.1: Create main game flow orchestrator
 * Requirements: 4, 6, 9, 15
 *
 * Manages the complete game flow:
 * - Transitions between: setup → playing → game-over
 * - Coordinates: game state, AI moves, UI updates, persistence
 * - Provides: initializeGame(), handlePlayerMove(), handleGameEnd(), resetForReplay()
 */

import { ref, computed, watch } from 'vue';
import type {
    GameMode,
    Difficulty,
    Player,
    GameSession,
} from '../types';
import { GameResult } from '../types';
import { useGameState } from './useGameState';
import { useCPUMove } from './useCPUMove';
import { gameEventBus } from '../utils/gameEventBus';
import { detectWin, detectDraw } from '../utils/boardUtils';
import { persistGameStateDebounced, gameStateToSession } from '../utils/gamePersistence';
import { recordGameResult } from '../utils/gameResultRecorder';
import { clearPersistedGameState } from '../utils/storageAdapter';

interface GameFlowState {
    gameResult: GameResult | null;
    winningLines: Array<Array<[number, number]>>;
    isProcessingMove: boolean;
    isCPUThinking: boolean;
    lastGameSession: GameSession | null;
}

/**
 * Game Flow Orchestrator
 * Coordinates all game logic, AI moves, state updates, and persistence
 */
export function useGameFlow() {
    const gameState = useGameState();
    // Share the same gameState instance so CPU moves operate on the live board
    const cpuMove = useCPUMove(gameState);

    // Local state for game flow
    const flowState = ref<GameFlowState>({
        gameResult: null,
        winningLines: [],
        isProcessingMove: false,
        isCPUThinking: false,
        lastGameSession: null,
    });

    // Computed state
    const isGameOver = computed(() => gameState.gameStatus.value === 'game-over');
    const isPlaying = computed(() => gameState.gameStatus.value === 'playing');
    const isCPUTurn = computed(
        () => isPlaying.value && gameState.getCurrentPlayer().isAI
    );

    /**
     * Initialize a new game with provided configuration
     * @param size - Board size (3-10)
     * @param mode - Game mode (two-player or single-player)
     * @param playerOne - Player 1 configuration
     * @param playerTwo - Player 2 configuration
     * @param difficulty - CPU difficulty level (if applicable)
     */
    async function initializeGame(
        size: number = 3,
        mode: GameMode = 'two-player',
        playerOne?: Player,
        playerTwo?: Player,
        difficulty?: Difficulty
    ): Promise<void> {
        // Reset flow state
        flowState.value = {
            gameResult: null,
            winningLines: [],
            isProcessingMove: false,
            isCPUThinking: false,
            lastGameSession: null,
        };

        // Initialize game state
        gameState.initializeGame(size, mode, playerOne, playerTwo, difficulty);

        // Emit initialization event
        gameEventBus.emit('game-initialized', {
            boardSize: size,
            gameMode: mode,
            difficulty: difficulty || null,
        });

        // If CPU goes first in single-player, execute first move
        if (mode === 'single-player' && gameState.getCurrentPlayer().isAI) {
            await executeCPUTurn();
        }
    }

    /**
     * Handle a player move
     * @param row - Row index
     * @param col - Column index
     * @returns true if move was successful, false otherwise
     */
    async function handlePlayerMove(row: number, col: number): Promise<boolean> {
        // Don't allow moves if game is over or if it's not a human player's turn
        if (isGameOver.value || gameState.getCurrentPlayer().isAI) {
            return false;
        }

        // Mark as processing
        flowState.value.isProcessingMove = true;

        try {
            // Attempt to make the move
            const moveSuccessful = gameState.makeMove(row, col);

            if (!moveSuccessful) {
                return false;
            }

            // Emit move-made event
            gameEventBus.emit('move-made', {
                row,
                col,
                player: gameState.getCurrentPlayer().name,
                symbol: gameState.getCurrentPlayer().symbol,
            });

            // Persist game state
            persistGameStateDebounced(
                gameState.getGameState(),
                gameState.sessionId.value || `session_${Date.now()}`,
            );

            // Check for win/draw after move
            const result = checkGameEnd();

            if (result) {
                await handleGameEnd(result.result, result.winningLines);
                return true;
            }

            // Switch turn and continue flow
            gameState.switchTurn();

            // If now it's CPU's turn, execute CPU move
            if (isCPUTurn.value) {
                // Allow UI to update before CPU move
                await new Promise((resolve) => setTimeout(resolve, 500));
                await executeCPUTurn();
            }

            return true;
        } finally {
            flowState.value.isProcessingMove = false;
        }
    }

    /**
     * Execute a CPU move
     */
    async function executeCPUTurn(): Promise<void> {
        // Prevent overlapping CPU turns (watch + handlePlayerMove / init)
        if (flowState.value.isCPUThinking || !isCPUTurn.value) {
            return;
        }

        flowState.value.isCPUThinking = true;
        gameEventBus.emit('ai-turn-start', {
            difficulty: gameState.difficulty.value,
        });

        try {
            // Brief pause so the UI can show "CPU thinking"
            await new Promise((resolve) => setTimeout(resolve, 400));

            const move = await cpuMove.getNextMove(
                gameState.board.value,
                gameState.getCurrentPlayer().symbol,
                gameState.getOtherPlayer().symbol,
                gameState.boardConfig.size
            );

            if (!move) {
                console.warn('CPU could not find a move');
                gameState.switchTurn();
                return;
            }

            const moveSuccessful = gameState.makeMove(move.row, move.col);

            if (!moveSuccessful) {
                console.warn('CPU move failed validation', move);
                gameState.switchTurn();
                return;
            }

            gameEventBus.emit('move-made', {
                row: move.row,
                col: move.col,
                player: gameState.getCurrentPlayer().name,
                symbol: gameState.getCurrentPlayer().symbol,
            });

            persistGameStateDebounced(
                gameState.getGameState(),
                gameState.sessionId.value || `session_${Date.now()}`,
            );

            const result = checkGameEnd();

            if (result) {
                await handleGameEnd(result.result, result.winningLines);
                return;
            }

            gameState.switchTurn();
        } finally {
            flowState.value.isCPUThinking = false;
            gameEventBus.emit('ai-turn-end', {});
        }
    }

    /**
     * Check if the game has ended (win or draw)
     * @returns Object with result and winning lines if game ended, null otherwise
     */
    function checkGameEnd(): { result: GameResult; winningLines: Array<Array<[number, number]>> } | null {
        // Check for win
        const winResult = detectWin(gameState.board.value, gameState.boardConfig.size);

        if (winResult.winner) {
            const isPlayerOneWinner = winResult.winner === gameState.players.playerOne.symbol;
            const result = isPlayerOneWinner
                ? GameResult.PlayerOneWins
                : GameResult.PlayerTwoWins;

            return {
                result,
                winningLines: winResult.winningLines,
            };
        }

        // Check for draw
        if (detectDraw(gameState.board.value, gameState.boardConfig.size)) {
            return {
                result: GameResult.Draw,
                winningLines: [],
            };
        }

        return null;
    }

    /**
     * Handle game end
     * @param result - Game result (win/loss/draw)
     * @param winningLines - Coordinates of winning lines if applicable
     */
    async function handleGameEnd(
        result: GameResult,
        winningLines: Array<Array<[number, number]>> = []
    ): Promise<void> {
        // Update flow state
        flowState.value.gameResult = result;
        flowState.value.winningLines = winningLines;

        // Update game status
        gameState.setGameStatus('game-over');

        // Determine winner
        let winner: string | null = null;
        if (result === GameResult.PlayerOneWins) {
            winner = gameState.players.playerOne.name;
        } else if (result === GameResult.PlayerTwoWins) {
            winner = gameState.players.playerTwo.name;
        }

        // Create game session for recording
        const sessionId =
            gameState.sessionId.value ||
            `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const gameSession = gameStateToSession(gameState.getGameState(), sessionId);
        gameSession.result = result;
        gameSession.winner = winner;
        gameSession.winningLines = winningLines;
        gameSession.endTime = Date.now();

        // Save session and update analytics
        flowState.value.lastGameSession = gameSession;
        recordGameResult(gameSession);
        clearPersistedGameState();

        // Emit game-over event
        gameEventBus.emit('game-over', {
            result,
            winner,
            winningLines,
        });
    }

    /**
     * Reset game for replay
     * Preserves player configuration and difficulty
     */
    function resetForReplay(): void {
        // Keep current configuration but reset board and moves
        const currentMode = gameState.gameMode.value;
        const currentDifficulty = gameState.difficulty.value;
        const playerOne = { ...gameState.players.playerOne };
        const playerTwo = { ...gameState.players.playerTwo };

        // Option to swap players before replay (kept same by default)
        gameState.resetGame();

        // Restore player configuration
        gameState.players.playerOne = playerOne;
        gameState.players.playerTwo = playerTwo;
        gameState.gameMode.value = currentMode;
        gameState.difficulty.value = currentDifficulty;

        // Reset flow state
        flowState.value = {
            gameResult: null,
            winningLines: [],
            isProcessingMove: false,
            isCPUThinking: false,
            lastGameSession: flowState.value.lastGameSession,
        };

        // Emit replay started event
        gameEventBus.emit('replay-started', {});

        // If CPU goes first, execute first move
        if (gameState.getCurrentPlayer().isAI) {
            executeCPUTurn();
        }
    }

    /**
     * Watch for CPU turn and automatically execute move
     */
    watch(isCPUTurn, async (shouldExecute) => {
        if (shouldExecute && isPlaying.value && !flowState.value.isProcessingMove && !flowState.value.isCPUThinking) {
            await executeCPUTurn();
        }
    });

    return {
        // State
        gameState,
        flowState: computed(() => flowState.value),
        isGameOver,
        isPlaying,
        isCPUTurn,

        // Methods
        initializeGame,
        handlePlayerMove,
        handleGameEnd,
        resetForReplay,
        checkGameEnd,
    };
}
