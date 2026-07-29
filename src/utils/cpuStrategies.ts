/**
 * CPU Difficulty Strategies for Tic-Tac-Toe Game
 * Task 5.2, 5.3, 5.4: CPU AI strategies for Easy, Medium, and Hard difficulties
 * Requirements: 7
 */

import type { Board } from '../types/index';
import { detectWin, placeMark, getBoardCopy } from './boardUtils';

/**
 * Get all valid empty cells on the board
 * @param board - Current game board
 * @returns Array of [row, col] coordinates for empty cells
 */
export function getValidMoves(board: Board): Array<[number, number]> {
    const moves: Array<[number, number]> = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === null) {
                moves.push([i, j]);
            }
        }
    }
    return moves;
}

/**
 * Easy difficulty: Random valid moves
 * Task 5.2: Implement Easy difficulty strategy (random valid moves)
 * Requirements: 7
 * @param board - Current game board
 * @param cpuSymbol - CPU's symbol
 * @returns Object with row and col of the chosen move, or null if no moves available
 */
export function easyStrategy(
    board: Board,
    cpuSymbol: string
): { row: number; col: number } | null {
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) {
        return null;
    }

    // Pick a random move from available moves
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const [row, col] = validMoves[randomIndex];

    return { row, col };
}

/**
 * Check if a line (horizontal, vertical, or diagonal) has N-1 symbols of a given player
 * to detect if the player can win on the next move
 * @param board - Current game board
 * @param symbol - Symbol to check for
 * @param boardSize - Size of board (N in N-in-a-row)
 * @returns [row, col] of the empty cell that would complete the line, or null
 */
export function findWinningMove(
    board: Board,
    symbol: string,
    boardSize: number
): [number, number] | null {
    const size = board.length;

    // Check horizontal lines
    for (let row = 0; row < size; row++) {
        for (let colStart = 0; colStart <= size - boardSize; colStart++) {
            let symbolCount = 0;
            let emptyPos: [number, number] | null = null;

            for (let k = 0; k < boardSize; k++) {
                const cell = board[row][colStart + k];
                if (cell === symbol) {
                    symbolCount++;
                } else if (cell === null) {
                    emptyPos = [row, colStart + k];
                } else {
                    // Different symbol in line, break
                    emptyPos = null;
                    symbolCount = 0;
                    break;
                }
            }

            if (symbolCount === boardSize - 1 && emptyPos !== null) {
                return emptyPos;
            }
        }
    }

    // Check vertical lines
    for (let col = 0; col < size; col++) {
        for (let rowStart = 0; rowStart <= size - boardSize; rowStart++) {
            let symbolCount = 0;
            let emptyPos: [number, number] | null = null;

            for (let k = 0; k < boardSize; k++) {
                const cell = board[rowStart + k][col];
                if (cell === symbol) {
                    symbolCount++;
                } else if (cell === null) {
                    emptyPos = [rowStart + k, col];
                } else {
                    emptyPos = null;
                    symbolCount = 0;
                    break;
                }
            }

            if (symbolCount === boardSize - 1 && emptyPos !== null) {
                return emptyPos;
            }
        }
    }

    // Check diagonal lines (top-left to bottom-right)
    for (let row = 0; row <= size - boardSize; row++) {
        for (let col = 0; col <= size - boardSize; col++) {
            let symbolCount = 0;
            let emptyPos: [number, number] | null = null;

            for (let k = 0; k < boardSize; k++) {
                const cell = board[row + k][col + k];
                if (cell === symbol) {
                    symbolCount++;
                } else if (cell === null) {
                    emptyPos = [row + k, col + k];
                } else {
                    emptyPos = null;
                    symbolCount = 0;
                    break;
                }
            }

            if (symbolCount === boardSize - 1 && emptyPos !== null) {
                return emptyPos;
            }
        }
    }

    // Check diagonal lines (top-right to bottom-left)
    for (let row = 0; row <= size - boardSize; row++) {
        for (let col = boardSize - 1; col < size; col++) {
            let symbolCount = 0;
            let emptyPos: [number, number] | null = null;

            for (let k = 0; k < boardSize; k++) {
                const cell = board[row + k][col - k];
                if (cell === symbol) {
                    symbolCount++;
                } else if (cell === null) {
                    emptyPos = [row + k, col - k];
                } else {
                    emptyPos = null;
                    symbolCount = 0;
                    break;
                }
            }

            if (symbolCount === boardSize - 1 && emptyPos !== null) {
                return emptyPos;
            }
        }
    }

    return null;
}

/**
 * Medium difficulty: Blocking + Random
 * Task 5.3: Implement Medium difficulty strategy (blocking + random)
 * Requirements: 7
 * @param board - Current game board
 * @param cpuSymbol - CPU's symbol
 * @param playerSymbol - Player's symbol
 * @param boardSize - Size of board (required for N-in-a-row win condition)
 * @returns Object with row and col of the chosen move, or null if no moves available
 */
export function mediumStrategy(
    board: Board,
    cpuSymbol: string,
    playerSymbol: string,
    boardSize: number
): { row: number; col: number } | null {
    // First, check if player can win on next move and block it
    const playerWinningMove = findWinningMove(board, playerSymbol, boardSize);
    if (playerWinningMove !== null) {
        return { row: playerWinningMove[0], col: playerWinningMove[1] };
    }

    // Otherwise use random move
    return easyStrategy(board, cpuSymbol);
}

/**
 * Minimax evaluation function for Hard difficulty
 * Scores board positions: +10 for CPU win, -10 for player win, 0 for draw
 * @param board - Current game board
 * @param boardSize - Size of board (required for win detection)
 * @param cpuSymbol - CPU's symbol
 * @param playerSymbol - Player's symbol
 * @param depth - Current depth in search tree
 * @param isMaximizing - Whether we're maximizing (CPU) or minimizing (Player)
 * @param alpha - Alpha for alpha-beta pruning
 * @param beta - Beta for alpha-beta pruning
 * @returns Score of the board position
 */
export function minimax(
    board: Board,
    boardSize: number,
    cpuSymbol: string,
    playerSymbol: string,
    depth: number,
    isMaximizing: boolean,
    alpha: number = -Infinity,
    beta: number = Infinity
): number {
    // Check for terminal states
    const { winner } = detectWin(board, boardSize);

    if (winner === cpuSymbol) {
        return 10 - depth; // Prefer winning sooner (lower depth = higher score)
    }

    if (winner === playerSymbol) {
        return depth - 10; // Prefer losing later (higher depth = higher score)
    }

    const validMoves = getValidMoves(board);
    if (validMoves.length === 0) {
        return 0; // Draw
    }

    // Depth limit based on board size for performance
    const maxDepth = calculateMaxDepth(board.length);
    if (depth >= maxDepth) {
        return 0; // Heuristic evaluation at depth limit
    }

    if (isMaximizing) {
        // CPU's turn - maximize score
        let maxScore = -Infinity;

        for (const [row, col] of validMoves) {
            const newBoard = placeMark(board, row, col, cpuSymbol);
            const score = minimax(
                newBoard,
                boardSize,
                cpuSymbol,
                playerSymbol,
                depth + 1,
                false,
                alpha,
                beta
            );

            maxScore = Math.max(score, maxScore);
            alpha = Math.max(alpha, score);

            // Beta cutoff
            if (beta <= alpha) {
                break;
            }
        }

        return maxScore;
    } else {
        // Player's turn - minimize score
        let minScore = Infinity;

        for (const [row, col] of validMoves) {
            const newBoard = placeMark(board, row, col, playerSymbol);
            const score = minimax(
                newBoard,
                boardSize,
                cpuSymbol,
                playerSymbol,
                depth + 1,
                true,
                alpha,
                beta
            );

            minScore = Math.min(score, minScore);
            beta = Math.min(beta, score);

            // Alpha cutoff
            if (beta <= alpha) {
                break;
            }
        }

        return minScore;
    }
}

/**
 * Calculate maximum search depth based on board size for performance
 * @param boardSize - Size of the board
 * @returns Maximum depth to search
 */
export function calculateMaxDepth(boardSize: number): number {
    // Smaller boards can search deeper, larger boards need shallower search
    if (boardSize <= 3) {
        return 9; // 3x3 board: can search entire tree
    } else if (boardSize === 4) {
        return 6;
    } else if (boardSize === 5) {
        return 5;
    } else {
        return 4; // 6x6 and larger: limit depth to 4 for performance
    }
}

/**
 * Hard difficulty: Minimax with alpha-beta pruning
 * Task 5.4: Implement Hard difficulty strategy (minimax algorithm)
 * Requirements: 7
 * @param board - Current game board
 * @param cpuSymbol - CPU's symbol
 * @param playerSymbol - Player's symbol
 * @param boardSize - Size of board (required for win detection)
 * @returns Object with row and col of the best move found, or null if no moves available
 */
export function hardStrategy(
    board: Board,
    cpuSymbol: string,
    playerSymbol: string,
    boardSize: number
): { row: number; col: number } | null {
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) {
        return null;
    }

    let bestScore = -Infinity;
    let bestMove: [number, number] | null = null;

    for (const [row, col] of validMoves) {
        const newBoard = placeMark(board, row, col, cpuSymbol);
        const score = minimax(
            newBoard,
            boardSize,
            cpuSymbol,
            playerSymbol,
            1,
            false
        );

        if (score > bestScore) {
            bestScore = score;
            bestMove = [row, col];
        }
    }

    if (bestMove === null) {
        return null;
    }

    return { row: bestMove[0], col: bestMove[1] };
}
