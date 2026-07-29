/**
 * Unit Tests for Move Validation
 * Task 11.4: Write unit tests for move validation
 * Requirements: 2, 8
 *
 * Covers:
 * - Valid move acceptance on empty cells
 * - Invalid moves rejection (occupied, out of bounds, wrong player)
 * - Error message generation for each error type
 * - Edge cases (board edges, corners, center)
 * - Validation across multiple board sizes (3x3, 5x5, 10x10)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
    createEmptyBoard,
    placeMark,
    validateMove,
    isValidMove,
} from '@/utils/boardUtils';
import type { Board, Player } from '@/types/index';

// ─── Test Setup & Helpers ────────────────────────────────────────────────────

/**
 * Create test players for validation tests
 */
function createTestPlayers(): { player1: Player; player2: Player } {
    return {
        player1: { name: 'Player 1', symbol: 'X', isAI: false },
        player2: { name: 'Player 2', symbol: 'O', isAI: false },
    };
}

// ─── Valid Move Acceptance (3x3) ─────────────────────────────────────────────

describe('validateMove - valid move acceptance (3x3)', () => {
    let board: Board;
    let player1: Player;

    beforeEach(() => {
        board = createEmptyBoard(3);
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should accept valid move on top-left corner (0,0)', () => {
        const result = validateMove(board, 0, 0, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid move on top-right corner (0,2)', () => {
        const result = validateMove(board, 0, 2, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid move on bottom-left corner (2,0)', () => {
        const result = validateMove(board, 2, 0, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid move on bottom-right corner (2,2)', () => {
        const result = validateMove(board, 2, 2, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid move on center cell (1,1)', () => {
        const result = validateMove(board, 1, 1, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should accept valid move on top edge cells', () => {
        expect(validateMove(board, 0, 0, player1).valid).toBe(true);
        expect(validateMove(board, 0, 1, player1).valid).toBe(true);
        expect(validateMove(board, 0, 2, player1).valid).toBe(true);
    });

    it('should accept valid move on bottom edge cells', () => {
        expect(validateMove(board, 2, 0, player1).valid).toBe(true);
        expect(validateMove(board, 2, 1, player1).valid).toBe(true);
        expect(validateMove(board, 2, 2, player1).valid).toBe(true);
    });

    it('should accept valid move on left edge cells', () => {
        expect(validateMove(board, 0, 0, player1).valid).toBe(true);
        expect(validateMove(board, 1, 0, player1).valid).toBe(true);
        expect(validateMove(board, 2, 0, player1).valid).toBe(true);
    });

    it('should accept valid move on right edge cells', () => {
        expect(validateMove(board, 0, 2, player1).valid).toBe(true);
        expect(validateMove(board, 1, 2, player1).valid).toBe(true);
        expect(validateMove(board, 2, 2, player1).valid).toBe(true);
    });

    it('should accept valid moves on all empty cells', () => {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const result = validateMove(board, row, col, player1);
                expect(result.valid).toBe(true);
                expect(result.error).toBeUndefined();
            }
        }
    });
});

// ─── Occupied Cell Rejection ─────────────────────────────────────────────────

describe('validateMove - occupied cell rejection', () => {
    let board: Board;
    let player1: Player;
    let player2: Player;

    beforeEach(() => {
        board = createEmptyBoard(3);
        const players = createTestPlayers();
        player1 = players.player1;
        player2 = players.player2;
    });

    it('should reject move on cell occupied by same player', () => {
        board = placeMark(board, 0, 0, 'X');
        const result = validateMove(board, 0, 0, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });

    it('should reject move on cell occupied by different player', () => {
        board = placeMark(board, 1, 1, 'X');
        const result = validateMove(board, 1, 1, player2);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });

    it('should reject move on center cell when occupied', () => {
        board = placeMark(board, 1, 1, 'O');
        const result = validateMove(board, 1, 1, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });

    it('should reject move on corner cell when occupied', () => {
        board = placeMark(board, 0, 0, 'X');
        const result = validateMove(board, 0, 0, player2);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });

    it('should reject all moves on fully filled board', () => {
        // Fill entire board
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                board = placeMark(board, row, col, row % 2 === 0 ? 'X' : 'O');
            }
        }

        // Verify all cells reject moves
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const result = validateMove(board, row, col, player1);
                expect(result.valid).toBe(false);
                expect(result.error).toBe('Cell is already occupied');
            }
        }
    });

    it('should accept moves on empty cells even when some cells are occupied', () => {
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'O');
        board = placeMark(board, 2, 2, 'X');

        // Empty cells should still be valid
        expect(validateMove(board, 0, 1, player1).valid).toBe(true);
        expect(validateMove(board, 0, 2, player1).valid).toBe(true);
        expect(validateMove(board, 1, 0, player1).valid).toBe(true);
    });
});

// ─── Out of Bounds Rejection ─────────────────────────────────────────────────

describe('validateMove - out of bounds rejection', () => {
    let board: Board;
    let player1: Player;

    beforeEach(() => {
        board = createEmptyBoard(3);
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should reject move with negative row', () => {
        const result = validateMove(board, -1, 0, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with negative column', () => {
        const result = validateMove(board, 0, -1, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with row >= board size', () => {
        const result = validateMove(board, 3, 0, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with column >= board size', () => {
        const result = validateMove(board, 0, 3, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with both row and column negative', () => {
        const result = validateMove(board, -1, -1, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with both row and column too large', () => {
        const result = validateMove(board, 5, 5, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with large negative values', () => {
        const result = validateMove(board, -100, -50, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject move with very large positive values', () => {
        const result = validateMove(board, 1000, 2000, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });
});

// ─── Error Message Generation ────────────────────────────────────────────────

describe('validateMove - error message generation', () => {
    let board: Board;
    let player1: Player;

    beforeEach(() => {
        board = createEmptyBoard(3);
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should return descriptive error for out of bounds (negative row)', () => {
        const result = validateMove(board, -1, 1, player1);

        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should return descriptive error for out of bounds (column too large)', () => {
        const result = validateMove(board, 1, 10, player1);

        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should return descriptive error for occupied cell', () => {
        board = placeMark(board, 1, 1, 'X');
        const result = validateMove(board, 1, 1, player1);

        expect(result.error).toBe('Cell is already occupied');
    });

    it('should prioritize boundary check over occupied check', () => {
        // Even if out of bounds position would be "occupied" conceptually,
        // boundary check should happen first
        board = placeMark(board, 0, 0, 'X');
        const result = validateMove(board, -1, -1, player1);

        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should not include error property when move is valid', () => {
        const result = validateMove(board, 1, 1, player1);

        expect(result.error).toBeUndefined();
        expect(result).not.toHaveProperty('error');
    });

    it('should always return error as a string when validation fails', () => {
        const result1 = validateMove(board, -1, 0, player1);
        const result2 = validateMove(placeMark(board, 0, 0, 'X'), 0, 0, player1);

        expect(typeof result1.error).toBe('string');
        expect(typeof result2.error).toBe('string');
    });
});

// ─── 5x5 Board Validation ────────────────────────────────────────────────────

describe('validateMove - 5x5 board', () => {
    let board: Board;
    let player1: Player;

    beforeEach(() => {
        board = createEmptyBoard(5);
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should accept valid moves on all corners (5x5)', () => {
        expect(validateMove(board, 0, 0, player1).valid).toBe(true); // top-left
        expect(validateMove(board, 0, 4, player1).valid).toBe(true); // top-right
        expect(validateMove(board, 4, 0, player1).valid).toBe(true); // bottom-left
        expect(validateMove(board, 4, 4, player1).valid).toBe(true); // bottom-right
    });

    it('should accept valid move on center (2,2) for 5x5', () => {
        const result = validateMove(board, 2, 2, player1);

        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should reject out of bounds for 5x5 (row 5)', () => {
        const result = validateMove(board, 5, 0, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject out of bounds for 5x5 (col 5)', () => {
        const result = validateMove(board, 0, 5, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should accept all edge cells on 5x5 board', () => {
        // Top edge
        for (let col = 0; col < 5; col++) {
            expect(validateMove(board, 0, col, player1).valid).toBe(true);
        }

        // Bottom edge
        for (let col = 0; col < 5; col++) {
            expect(validateMove(board, 4, col, player1).valid).toBe(true);
        }

        // Left edge
        for (let row = 0; row < 5; row++) {
            expect(validateMove(board, row, 0, player1).valid).toBe(true);
        }

        // Right edge
        for (let row = 0; row < 5; row++) {
            expect(validateMove(board, row, 4, player1).valid).toBe(true);
        }
    });

    it('should reject occupied cells on 5x5 board', () => {
        board = placeMark(board, 2, 3, 'O');
        const result = validateMove(board, 2, 3, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });
});

// ─── 10x10 Board Validation ──────────────────────────────────────────────────

describe('validateMove - 10x10 board', () => {
    let board: Board;
    let player1: Player;

    beforeEach(() => {
        board = createEmptyBoard(10);
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should accept valid moves on all corners (10x10)', () => {
        expect(validateMove(board, 0, 0, player1).valid).toBe(true); // top-left
        expect(validateMove(board, 0, 9, player1).valid).toBe(true); // top-right
        expect(validateMove(board, 9, 0, player1).valid).toBe(true); // bottom-left
        expect(validateMove(board, 9, 9, player1).valid).toBe(true); // bottom-right
    });

    it('should accept valid move on center cells (4,4) and (5,5) for 10x10', () => {
        expect(validateMove(board, 4, 4, player1).valid).toBe(true);
        expect(validateMove(board, 5, 5, player1).valid).toBe(true);
        expect(validateMove(board, 4, 5, player1).valid).toBe(true);
        expect(validateMove(board, 5, 4, player1).valid).toBe(true);
    });

    it('should reject out of bounds for 10x10 (row 10)', () => {
        const result = validateMove(board, 10, 5, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should reject out of bounds for 10x10 (col 10)', () => {
        const result = validateMove(board, 5, 10, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Move is outside board boundaries');
    });

    it('should accept moves on middle rows and columns', () => {
        expect(validateMove(board, 5, 5, player1).valid).toBe(true);
        expect(validateMove(board, 4, 6, player1).valid).toBe(true);
        expect(validateMove(board, 7, 3, player1).valid).toBe(true);
    });

    it('should validate all cells correctly on 10x10 (spot check)', () => {
        // Spot check various positions
        const testPositions = [
            [0, 0], [0, 9], [9, 0], [9, 9], // corners
            [0, 5], [9, 5], [5, 0], [5, 9], // edges
            [5, 5], [4, 4], [6, 6], // center area
        ];

        testPositions.forEach(([row, col]) => {
            const result = validateMove(board, row, col, player1);
            expect(result.valid).toBe(true);
        });
    });

    it('should reject occupied cells on 10x10 board', () => {
        board = placeMark(board, 7, 8, 'X');
        const result = validateMove(board, 7, 8, player1);

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Cell is already occupied');
    });
});

// ─── isValidMove Function Tests ──────────────────────────────────────────────

describe('isValidMove - boolean validation', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(3);
    });

    it('should return true for valid moves on empty cells', () => {
        expect(isValidMove(board, 0, 0)).toBe(true);
        expect(isValidMove(board, 1, 1)).toBe(true);
        expect(isValidMove(board, 2, 2)).toBe(true);
    });

    it('should return false for occupied cells', () => {
        board = placeMark(board, 1, 1, 'X');
        expect(isValidMove(board, 1, 1)).toBe(false);
    });

    it('should return false for out of bounds moves', () => {
        expect(isValidMove(board, -1, 0)).toBe(false);
        expect(isValidMove(board, 0, -1)).toBe(false);
        expect(isValidMove(board, 3, 0)).toBe(false);
        expect(isValidMove(board, 0, 3)).toBe(false);
    });

    it('should work correctly on 5x5 board', () => {
        const board5x5 = createEmptyBoard(5);
        expect(isValidMove(board5x5, 4, 4)).toBe(true);
        expect(isValidMove(board5x5, 5, 5)).toBe(false);
    });

    it('should work correctly on 10x10 board', () => {
        const board10x10 = createEmptyBoard(10);
        expect(isValidMove(board10x10, 9, 9)).toBe(true);
        expect(isValidMove(board10x10, 10, 10)).toBe(false);
    });
});

// ─── Edge Cases & Boundary Conditions ────────────────────────────────────────

describe('validateMove - edge cases and boundary conditions', () => {
    let player1: Player;

    beforeEach(() => {
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should handle minimum board size (3x3) correctly', () => {
        const board = createEmptyBoard(3);

        // Valid cells
        expect(validateMove(board, 0, 0, player1).valid).toBe(true);
        expect(validateMove(board, 2, 2, player1).valid).toBe(true);

        // Invalid cells
        expect(validateMove(board, 3, 0, player1).valid).toBe(false);
        expect(validateMove(board, 0, 3, player1).valid).toBe(false);
    });

    it('should handle maximum board size (10x10) correctly', () => {
        const board = createEmptyBoard(10);

        // Valid cells
        expect(validateMove(board, 0, 0, player1).valid).toBe(true);
        expect(validateMove(board, 9, 9, player1).valid).toBe(true);

        // Invalid cells
        expect(validateMove(board, 10, 0, player1).valid).toBe(false);
        expect(validateMove(board, 0, 10, player1).valid).toBe(false);
    });

    it('should handle custom player symbols correctly', () => {
        const board = createEmptyBoard(3);
        const spiderPlayer: Player = { name: 'Spider', symbol: '🕷️', isAI: false };

        const result = validateMove(board, 1, 1, spiderPlayer);
        expect(result.valid).toBe(true);
    });

    it('should handle AI player validation', () => {
        const board = createEmptyBoard(3);
        const cpuPlayer: Player = { name: 'CPU', symbol: 'O', isAI: true };

        const result = validateMove(board, 0, 0, cpuPlayer);
        expect(result.valid).toBe(true);
    });

    it('should return consistent results for the same input', () => {
        const board = createEmptyBoard(3);

        const result1 = validateMove(board, 1, 1, player1);
        const result2 = validateMove(board, 1, 1, player1);

        expect(result1.valid).toBe(result2.valid);
        expect(result1.error).toBe(result2.error);
    });

    it('should handle validation result object structure', () => {
        const board = createEmptyBoard(3);

        const validResult = validateMove(board, 1, 1, player1);
        expect(validResult).toHaveProperty('valid');
        expect(validResult.valid).toBe(true);

        const invalidResult = validateMove(board, -1, 0, player1);
        expect(invalidResult).toHaveProperty('valid');
        expect(invalidResult).toHaveProperty('error');
        expect(invalidResult.valid).toBe(false);
    });

    it('should validate moves at exact boundary positions', () => {
        const board = createEmptyBoard(3);

        // Last valid positions
        expect(validateMove(board, 2, 2, player1).valid).toBe(true);

        // First invalid positions
        expect(validateMove(board, 3, 2, player1).valid).toBe(false);
        expect(validateMove(board, 2, 3, player1).valid).toBe(false);
    });

    it('should handle zero-indexed positions correctly', () => {
        const board = createEmptyBoard(3);

        // (0,0) should be valid (first cell)
        expect(validateMove(board, 0, 0, player1).valid).toBe(true);

        // (-1,-1) should be invalid (before first cell)
        expect(validateMove(board, -1, -1, player1).valid).toBe(false);
    });
});

// ─── Integration: Multiple Board Sizes ───────────────────────────────────────

describe('validateMove - cross-board size consistency', () => {
    let player1: Player;

    beforeEach(() => {
        const players = createTestPlayers();
        player1 = players.player1;
    });

    it('should handle different board sizes with consistent validation logic', () => {
        const sizes = [3, 5, 10];

        sizes.forEach((size) => {
            const board = createEmptyBoard(size);

            // Top-left corner always valid
            expect(validateMove(board, 0, 0, player1).valid).toBe(true);

            // Bottom-right corner always valid
            expect(validateMove(board, size - 1, size - 1, player1).valid).toBe(
                true
            );

            // One past boundary always invalid
            expect(validateMove(board, size, 0, player1).valid).toBe(false);
            expect(validateMove(board, 0, size, player1).valid).toBe(false);
        });
    });

    it('should reject out of bounds consistently across all board sizes', () => {
        const sizes = [3, 5, 10];

        sizes.forEach((size) => {
            const board = createEmptyBoard(size);

            const result = validateMove(board, size, size, player1);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Move is outside board boundaries');
        });
    });

    it('should handle occupied cells consistently across all board sizes', () => {
        const sizes = [3, 5, 10];

        sizes.forEach((size) => {
            let board = createEmptyBoard(size);
            board = placeMark(board, 0, 0, 'X');

            const result = validateMove(board, 0, 0, player1);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Cell is already occupied');
        });
    });
});
