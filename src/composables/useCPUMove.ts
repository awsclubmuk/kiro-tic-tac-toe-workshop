/**
 * CPU Move Execution Composable
 * Task 5.5: Create CPU Move execution composable
 * Requirements: 6
 */

import { ref } from 'vue';
import type { CPUMoveResult, Difficulty } from '../types/index';
import { useGameState } from './useGameState';
import { useCPUOpponent } from './useCPUOpponent';
import { isValidMove } from '../utils/boardUtils';

/**
 * CPU Move execution composable
 * Handles the orchestration of CPU move generation and execution
 * Coordinates with useGameState and CPU strategy functions
 * 
 * Note: This composable takes gameState and cpuOpponent as optional parameters
 * to enable proper test isolation and instance sharing with consuming components
 */
export function useCPUMove(
    gameState?: ReturnType<typeof useGameState>,
    cpuOpponent?: ReturnType<typeof useCPUOpponent>
) {
    // Use provided instances or create new ones
    const gameStateInstance = gameState || useGameState();
    const cpuOpponentInstance = cpuOpponent || useCPUOpponent();

    // Reactive state for tracking CPU move execution
    const isExecuting = ref(false);
    const lastMoveResult = ref<CPUMoveResult | null>(null);

    /**
     * Execute a CPU move with optional delay
     * Selects strategy based on difficulty, generates move, and updates game state
     * Emits event or can be awaited for result
     *
     * @param delay - Optional delay in milliseconds before executing the move (default: 0)
     * @returns Promise that resolves when move is executed or edge case is handled
     * @throws Will not throw - gracefully handles all edge cases
     */
    async function executeMove(delay: number = 0): Promise<void> {
        // Prevent concurrent move execution
        if (isExecuting.value) {
            return;
        }

        try {
            isExecuting.value = true;

            // Wait for specified delay (simulate thinking time)
            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            // Get current game state
            const { board, difficulty, boardConfig } = gameStateInstance;
            const currentPlayer = gameStateInstance.getCurrentPlayer();
            const otherPlayer = gameStateInstance.getOtherPlayer();

            // Validate CPU is current player and has valid difficulty
            if (!currentPlayer.isAI) {
                console.warn('executeMove called when CPU is not the current player');
                return;
            }

            if (!difficulty.value) {
                console.warn('executeMove called with no difficulty level set');
                // Default to easy if no difficulty is set
                difficulty.value = 'easy' as Difficulty;
            }

            // Get CPU move from strategy
            const moveResult = cpuOpponentInstance.getCPUMove(
                board.value,
                difficulty.value as Difficulty,
                currentPlayer.symbol,
                otherPlayer.symbol,
                boardConfig.size
            );

            // Handle edge case: no move can be generated (board is full or no valid moves)
            if (!moveResult) {
                console.warn('CPU could not generate a valid move - switching turn back to human player');
                // Switch turn back to human player to allow them to continue or end game
                gameStateInstance.switchTurn();
                lastMoveResult.value = null;
                return;
            }

            // Validate generated move is actually valid
            if (!isValidMove(board.value, moveResult.row, moveResult.col)) {
                console.warn(`CPU generated invalid move at [${moveResult.row}, ${moveResult.col}] - switching turn`);
                // Switch turn back to human player
                gameStateInstance.switchTurn();
                lastMoveResult.value = null;
                return;
            }

            // Execute the move on the board
            const moveSuccessful = gameStateInstance.makeMove(moveResult.row, moveResult.col);

            if (!moveSuccessful) {
                console.warn('CPU move execution failed - switching turn back to human player');
                // Switch turn back to human player
                gameStateInstance.switchTurn();
                lastMoveResult.value = null;
                return;
            }

            // Store move result for tracking/debugging
            lastMoveResult.value = moveResult;

            // Switch turn to human player after successful CPU move
            gameStateInstance.switchTurn();

            // Emit event or trigger UI update
            // This can be extended with event bus or custom event emission
            window.dispatchEvent(
                new CustomEvent('cpu-move-executed', {
                    detail: {
                        moveResult,
                        board: gameStateInstance.board.value,
                        currentPlayer: gameStateInstance.getCurrentPlayer(),
                    },
                })
            );
        } catch (error) {
            console.error('Error executing CPU move:', error);
            // Gracefully handle any unexpected errors by switching turn
            gameStateInstance.switchTurn();
            lastMoveResult.value = null;
        } finally {
            isExecuting.value = false;
        }
    }

    /**
     * Get the last executed CPU move result
     * @returns Last move result or null if no move was executed
     */
    function getLastMoveResult(): CPUMoveResult | null {
        return lastMoveResult.value;
    }

    /**
     * Check if CPU is currently executing a move
     * @returns true if execution is in progress
     */
    function isExecutingMove(): boolean {
        return isExecuting.value;
    }

    /**
     * Reset move tracking state
     * Useful when starting a new game
     */
    function resetMoveTracking(): void {
        lastMoveResult.value = null;
    }

    /**
     * Compute the next CPU move without applying it to game state.
     * Used by useGameFlow so the orchestrator owns board mutations.
     */
    async function getNextMove(
        board: import('../types').Board,
        cpuSymbol: string,
        playerSymbol: string,
        boardSize: number,
        delay: number = 0,
    ): Promise<CPUMoveResult | null> {
        if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const difficulty =
            (gameStateInstance.difficulty.value as Difficulty | null) ?? ('medium' as Difficulty);

        return cpuOpponentInstance.getCPUMove(
            board,
            difficulty,
            cpuSymbol,
            playerSymbol,
            boardSize,
        );
    }

    return {
        // Methods
        executeMove,
        getNextMove,
        getLastMoveResult,
        isExecutingMove,
        resetMoveTracking,

        // State
        isExecuting,
        lastMoveResult,
    };
}
