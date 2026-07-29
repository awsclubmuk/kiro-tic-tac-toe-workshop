/**
 * Board Utility Functions for Tic-Tac-Toe Game
 * Task 1.3: Create base utility functions for board operations
 * Requirements: 2, 8
 */

import type { Board, GameStatus } from '../types/index';

/**
 * Creates an empty board of specified size
 * @param size - Board size (3-10)
 * @returns Empty board with all cells as null
 */
export function createEmptyBoard(size: number): Board {
    const board: Board = [];
    for (let i = 0; i < size; i++) {
        const row: (string | null)[] = [];
        for (let j = 0; j < size; j++) {
            row.push(null);
        }
        board.push(row);
    }
    return board;
}

/**
 * Checks if a move is valid (cell is empty and within bounds)
 * @param board - Current game board
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @returns true if the move is valid, false otherwise
 */
export function isValidMove(board: Board, row: number, col: number): boolean {
    // Check if coordinates are within board boundaries
    if (row < 0 || row >= board.length || col < 0 || col >= board[0]?.length) {
        return false;
    }

    // Check if cell is empty
    if (board[row]?.[col] !== null) {
        return false;
    }

    return true;
}

/**
 * Places a mark on the board at specified position (returns new board without mutation)
 * @param board - Current game board
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @param symbol - Symbol to place (e.g., "X", "O", emoji, etc.)
 * @returns New board with the mark placed
 */
export function placeMark(
    board: Board,
    row: number,
    col: number,
    symbol: string
): Board {
    // Create a deep copy of the board
    const newBoard = getBoardCopy(board);

    // Place the mark
    if (newBoard[row] && col >= 0 && col < newBoard[row].length) {
        newBoard[row][col] = symbol;
    }

    return newBoard;
}

/**
 * Creates a deep copy of the board
 * @param board - Board to copy
 * @returns Deep copy of the board
 */
export function getBoardCopy(board: Board): Board {
    return board.map((row) => [...row]);
}

/**
 * Checks if the board is completely full (no empty cells)
 * @param board - Current game board
 * @returns true if board is full, false if there are empty cells
 */
export function isBoardFull(board: Board): boolean {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Detects win condition and finds all winning lines
 * Task 2.1: Win detection and line finding logic
 * Requirements: 5, 14
 * @param board - Current game board
 * @param boardSize - Size of the board (also the required consecutive symbols for win)
 * @returns Object containing winner symbol and all winning lines with cell positions
 */
export function detectWin(
    board: Board,
    boardSize: number
): { winner: string | null; winningLines: Array<Array<[number, number]>> } {
    const winningLines: Array<Array<[number, number]>> = [];
    const symbols = new Set<string>();

    // Collect all unique non-null symbols on the board
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] !== null) {
                symbols.add(board[i][j]);
            }
        }
    }

    // Check each symbol for winning lines
    let winner: string | null = null;

    for (const symbol of symbols) {
        // Check horizontal lines
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col <= boardSize - boardSize; col++) {
                const line: Array<[number, number]> = [];
                let isConsecutive = true;

                for (let k = 0; k < boardSize; k++) {
                    if (board[row]?.[col + k] === symbol) {
                        line.push([row, col + k]);
                    } else {
                        isConsecutive = false;
                        break;
                    }
                }

                if (isConsecutive && line.length === boardSize) {
                    winningLines.push(line);
                    winner = symbol;
                }
            }
        }

        // Check vertical lines
        for (let col = 0; col < boardSize; col++) {
            for (let row = 0; row <= boardSize - boardSize; row++) {
                const line: Array<[number, number]> = [];
                let isConsecutive = true;

                for (let k = 0; k < boardSize; k++) {
                    if (board[row + k]?.[col] === symbol) {
                        line.push([row + k, col]);
                    } else {
                        isConsecutive = false;
                        break;
                    }
                }

                if (isConsecutive && line.length === boardSize) {
                    winningLines.push(line);
                    winner = symbol;
                }
            }
        }

        // Check diagonal lines (top-left to bottom-right)
        for (let row = 0; row <= boardSize - boardSize; row++) {
            for (let col = 0; col <= boardSize - boardSize; col++) {
                const line: Array<[number, number]> = [];
                let isConsecutive = true;

                for (let k = 0; k < boardSize; k++) {
                    if (board[row + k]?.[col + k] === symbol) {
                        line.push([row + k, col + k]);
                    } else {
                        isConsecutive = false;
                        break;
                    }
                }

                if (isConsecutive && line.length === boardSize) {
                    winningLines.push(line);
                    winner = symbol;
                }
            }
        }

        // Check diagonal lines (top-right to bottom-left)
        for (let row = 0; row <= boardSize - boardSize; row++) {
            for (let col = boardSize - 1; col >= boardSize - 1; col--) {
                const line: Array<[number, number]> = [];
                let isConsecutive = true;

                for (let k = 0; k < boardSize; k++) {
                    if (board[row + k]?.[col - k] === symbol) {
                        line.push([row + k, col - k]);
                    } else {
                        isConsecutive = false;
                        break;
                    }
                }

                if (isConsecutive && line.length === boardSize) {
                    winningLines.push(line);
                    winner = symbol;
                }
            }
        }
    }

    return {
        winner,
        winningLines,
    };
}

/**
 * Detects draw condition
 * Task 2.2: Implement draw detection logic
 * Requirements: 5, 14
 * @param board - Current game board
 * @param boardSize - Size of the board (required to check for wins)
 * @returns true if board is full and no winner exists, false otherwise
 */
export function detectDraw(board: Board, boardSize: number): boolean {
    // First check if board is full
    if (!isBoardFull(board)) {
        return false;
    }

    // Check if there's a winner
    const { winner } = detectWin(board, boardSize);

    // Draw is true only when board is full AND no winner exists
    return winner === null;
}

/**
 * Validates a move with composite validation logic
 * Task 2.5: Implement move validation composite logic
 * Requirements: 2, 8
 * @param board - Current game board
 * @param row - Row index (0-based)
 * @param col - Column index (0-based)
 * @param currentPlayer - Current player making the move
 * @returns Validation result with boolean valid flag and optional error message
 */
export function validateMove(
    board: Board,
    row: number,
    col: number,
    currentPlayer: { symbol: string }
): { valid: boolean; error?: string } {
    // Check if coordinates are within board boundaries
    if (row < 0 || row >= board.length || col < 0 || col >= board[0]?.length) {
        return {
            valid: false,
            error: 'Move is outside board boundaries',
        };
    }

    // Check if cell is empty
    if (board[row]?.[col] !== null) {
        return {
            valid: false,
            error: 'Cell is already occupied',
        };
    }

    // All validations passed
    return { valid: true };
}
