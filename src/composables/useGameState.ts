/**
 * Game State Composable
 * Task 2.3: Implement game state composable for managing active game
 * Task 6.5: Auto-save after each move
 * Requirements: 4, 8, 13, 15
 */

import { ref, computed, reactive, watch } from 'vue';
import type {
    Board,
    GameStatus,
    GameMode,
    Difficulty,
    Player,
    Move,
    BoardConfig,
    GameState,
} from '../types/index';
import { createEmptyBoard, isValidMove, placeMark, isBoardFull } from '../utils/boardUtils';
import {
    persistGameStateDebounced,
    cancelAutoSave as cancelAutoSaveTimer,
} from '../utils/gamePersistence';

/**
 * Game state composable for managing the active game
 * Provides reactive state management for board, players, and game flow
 */
export function useGameState() {
    // Reactive state
    const board = ref<Board>([]);
    const gameStatus = ref<GameStatus>('setup');
    const moveHistory = ref<Move[]>([]);
    const boardConfig = reactive<BoardConfig>({
        size: 3,
        winLineLength: 3,
    });

    // Current players and turn
    const currentPlayerIndex = ref<0 | 1>(0);
    const players = reactive<{
        playerOne: Player;
        playerTwo: Player;
    }>({
        playerOne: {
            name: 'Player 1',
            symbol: 'X',
            isAI: false,
        },
        playerTwo: {
            name: 'Player 2',
            symbol: 'O',
            isAI: false,
        },
    });

    // Game session metadata
    const gameMode = ref<GameMode>('two-player');
    const difficulty = ref<Difficulty | null>(null);
    const startTime = ref<number>(0);

    // Session ID for auto-save — set when a game is initialised
    const sessionId = ref<string>('');

    // Auto-save debounce delay in milliseconds (300ms per spec)
    const AUTO_SAVE_DELAY = 300;

    /**
     * Auto-save watcher: persists game state after every board change.
     * Only triggers when a session is active (sessionId is set) and the
     * game is in the 'playing' state to avoid redundant saves.
     */
    watch(
        board,
        () => {
            if (sessionId.value && gameStatus.value === 'playing') {
                persistGameStateDebounced(
                    {
                        board: board.value.map((row) => [...row]),
                        currentPlayer:
                            currentPlayerIndex.value === 0 ? players.playerOne : players.playerTwo,
                        gameStatus: gameStatus.value,
                        boardConfig: { ...boardConfig },
                        players: {
                            playerOne: { ...players.playerOne },
                            playerTwo: { ...players.playerTwo },
                        },
                        moveHistory: [...moveHistory.value],
                        gameMode: gameMode.value,
                        difficulty: difficulty.value,
                        startTime: startTime.value,
                    },
                    sessionId.value,
                    AUTO_SAVE_DELAY,
                );
            }
        },
        { deep: true },
    );

    /**
     * Initialize a new game with the given configuration
     * @param size - Board size (3-10)
     * @param mode - Game mode (two-player or single-player)
     * @param playerOne - Player 1 configuration
     * @param playerTwo - Player 2 configuration
     * @param gameDifficulty - CPU difficulty (if applicable)
     * @param id - Optional session ID (auto-generated if not provided)
     */
    function initializeGame(
        size: number = 3,
        mode: GameMode = 'two-player',
        playerOne?: Player,
        playerTwo?: Player,
        gameDifficulty?: Difficulty,
        id?: string
    ): void {
        // Create empty board
        board.value = createEmptyBoard(size);

        // Update board configuration
        boardConfig.size = size;
        boardConfig.winLineLength = size;

        // Update player information
        if (playerOne) {
            players.playerOne = playerOne;
        }
        if (playerTwo) {
            players.playerTwo = playerTwo;
        }

        // Update game settings
        gameMode.value = mode;
        difficulty.value = gameDifficulty || null;

        // Reset game state
        currentPlayerIndex.value = 0;
        moveHistory.value = [];
        gameStatus.value = 'playing';
        startTime.value = Date.now();

        // Set session ID for auto-save (generate a unique one if not provided)
        sessionId.value = id ?? `session-${startTime.value}-${Math.random().toString(36).slice(2, 9)}`;
    }

    /**
     * Make a move on the board
     * @param row - Row index (0-based)
     * @param col - Column index (0-based)
     * @returns true if move was successful, false if invalid
     */
    function makeMove(row: number, col: number): boolean {
        // Validate move is within bounds and cell is empty
        if (!isValidMove(board.value, row, col)) {
            return false;
        }

        // Get current player symbol
        const currentPlayer = getCurrentPlayer();
        const symbol = currentPlayer.symbol;

        // Place mark on board
        board.value = placeMark(board.value, row, col, symbol);

        // Record move in history
        const move: Move = {
            row,
            col,
            symbol,
            playerName: currentPlayer.name,
            timestamp: Date.now(),
        };
        moveHistory.value.push(move);

        return true;
    }

    /**
     * Switch turn to the other player
     */
    function switchTurn(): void {
        currentPlayerIndex.value = currentPlayerIndex.value === 0 ? 1 : 0;
    }

    /**
     * Get the current player
     * @returns Current player object
     */
    function getCurrentPlayer(): Player {
        return currentPlayerIndex.value === 0 ? players.playerOne : players.playerTwo;
    }

    /**
     * Get the other player (not current)
     * @returns Other player object
     */
    function getOtherPlayer(): Player {
        return currentPlayerIndex.value === 0 ? players.playerTwo : players.playerOne;
    }

    /**
     * Get the current game status
     * @returns Current game status
     */
    function getGameStatus(): GameStatus {
        return gameStatus.value;
    }

    /**
     * Set the game status
     * @param status - New game status
     */
    function setGameStatus(status: GameStatus): void {
        gameStatus.value = status;
    }

    /**
     * Reset the game to initial state
     */
    function resetGame(): void {
        board.value = createEmptyBoard(boardConfig.size);
        currentPlayerIndex.value = 0;
        moveHistory.value = [];
        gameStatus.value = 'playing';
        startTime.value = Date.now();
    }

    /**
     * Get the current game state as a snapshot
     * @returns Current game state
     */
    function getGameState(): GameState {
        return {
            board: board.value.map((row) => [...row]),
            currentPlayer: getCurrentPlayer(),
            gameStatus: gameStatus.value,
            boardConfig: { ...boardConfig },
            players: {
                playerOne: { ...players.playerOne },
                playerTwo: { ...players.playerTwo },
            },
            moveHistory: [...moveHistory.value],
            gameMode: gameMode.value,
            difficulty: difficulty.value,
            startTime: startTime.value,
        };
    }

    /**
     * Restore game state from a snapshot
     * @param state - Game state to restore
     */
    function restoreGameState(state: GameState): void {
        board.value = state.board.map((row) => [...row]);
        boardConfig.size = state.boardConfig.size;
        boardConfig.winLineLength = state.boardConfig.winLineLength;
        players.playerOne = { ...state.players.playerOne };
        players.playerTwo = { ...state.players.playerTwo };
        moveHistory.value = [...state.moveHistory];
        gameMode.value = state.gameMode;
        difficulty.value = state.difficulty;
        startTime.value = state.startTime;
        gameStatus.value = state.gameStatus;

        // Update current player index based on move count
        currentPlayerIndex.value = moveHistory.value.length % 2 === 0 ? 0 : 1;
    }

    /**
     * Check if the board is full
     * @returns true if board is full, false otherwise
     */
    const isBoardFilledComputed = computed(() => {
        return isBoardFull(board.value);
    });

    /**
     * Get the total number of moves made
     * @returns Total moves
     */
    const totalMovesMade = computed(() => {
        return moveHistory.value.length;
    });

    return {
        // State
        board,
        gameStatus,
        moveHistory,
        boardConfig,
        currentPlayerIndex,
        players,
        gameMode,
        difficulty,
        startTime,

        // Session ID for auto-save
        sessionId,

        // Methods
        initializeGame,
        makeMove,
        switchTurn,
        getCurrentPlayer,
        getOtherPlayer,
        getGameStatus,
        setGameStatus,
        resetGame,
        getGameState,
        restoreGameState,

        // Computed
        isBoardFilledComputed,
        totalMovesMade,
    };
}
