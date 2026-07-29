/**
 * Unit Tests for CPU AI Strategies
 * Task 11.5: Write unit tests for CPU AI strategies
 * Requirements: 6, 7
 *
 * Covers:
 * - Easy: valid random moves, returned cell is empty, works on 3x3/5x5/10x10, no crash on full board
 * - Medium: blocks player winning move when player has N-1 in a line, falls back to valid move, no crash on full board
 * - Hard: takes winning move on 3x3, blocks player about to win, row/col within board bounds
 */

import { describe, it, expect } from 'vitest';
import {
    easyStrategy,
    mediumStrategy,
    hardStrategy,
} from '../../src/utils/cpuStrategies';
import { createEmptyBoard, placeMark } from '../../src/utils/boardUtils';

// ---------------------------------------------------------------------------
// Helper: fill an entire board so it has no valid moves left
// ---------------------------------------------------------------------------
function fillBoard(size: number) {
    let board = createEmptyBoard(size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            board = placeMark(board, i, j, i % 2 === 0 ? 'X' : 'O');
        }
    }
    return board;
}

// ===========================================================================
// EASY STRATEGY
// ===========================================================================
describe('easyStrategy', () => {
    it('returns a valid {row, col} object on a fresh 3x3 board', () => {
        const board = createEmptyBoard(3);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(typeof move!.row).toBe('number');
        expect(typeof move!.col).toBe('number');
    });

    it('returned cell is empty (null) on a fresh 3x3 board', () => {
        const board = createEmptyBoard(3);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('works on a 5x5 board and returned cell is within bounds and empty', () => {
        const board = createEmptyBoard(5);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(5);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(5);
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('works on a 10x10 board and returned cell is within bounds and empty', () => {
        const board = createEmptyBoard(10);
        const move = easyStrategy(board, 'X');

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(10);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(10);
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('does not crash on a full 3x3 board and returns null', () => {
        const board = fillBoard(3);

        expect(() => easyStrategy(board, 'O')).not.toThrow();
        expect(easyStrategy(board, 'O')).toBeNull();
    });

    it('does not crash on a full 5x5 board and returns null', () => {
        const board = fillBoard(5);

        expect(() => easyStrategy(board, 'X')).not.toThrow();
        expect(easyStrategy(board, 'X')).toBeNull();
    });

    it('produces varied moves across multiple calls (statistical randomness check)', () => {
        const board = createEmptyBoard(3);
        const seen = new Set<string>();

        for (let i = 0; i < 30; i++) {
            const move = easyStrategy(board, 'X');
            seen.add(`${move!.row},${move!.col}`);
        }

        // 9-cell board: extremely unlikely to always pick same cell in 30 tries
        expect(seen.size).toBeGreaterThan(1);
    });
});

// ===========================================================================
// MEDIUM STRATEGY
// ===========================================================================
describe('mediumStrategy', () => {
    it('blocks a horizontal player winning move on a 3x3 board', () => {
        // Player (X) has 2 in a row at [0,0] and [0,1] — must block [0,2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 0, col: 2 });
    });

    it('blocks a vertical player winning move on a 3x3 board', () => {
        // Player (X) has 2 in a column at [0,0] and [1,0] — must block [2,0]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 0, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 0 });
    });

    it('blocks a diagonal player winning move on a 3x3 board', () => {
        // Player (X) has 2 on diagonal [0,0] and [1,1] — must block [2,2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'X');

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 2 });
    });

    it('blocks on a 5x5 board when player has N-1 in a line', () => {
        // Player has 4 of 5 needed in row 0
        let board = createEmptyBoard(5);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 0, 1, 'X');
        board = placeMark(board, 0, 2, 'X');
        board = placeMark(board, 0, 3, 'X');

        const move = mediumStrategy(board, 'O', 'X', 5);
        expect(move).toEqual({ row: 0, col: 4 });
    });

    it('falls back to a valid random move when no blocking is needed', () => {
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X'); // Only one mark — no winning threat

        const move = mediumStrategy(board, 'O', 'X', 3);
        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('does not crash on a full board and returns null', () => {
        const board = fillBoard(3);

        expect(() => mediumStrategy(board, 'O', 'X', 3)).not.toThrow();
        expect(mediumStrategy(board, 'O', 'X', 3)).toBeNull();
    });
});

// ===========================================================================
// HARD STRATEGY
// ===========================================================================
describe('hardStrategy', () => {
    it('takes the winning move when CPU can win in one move on a 3x3 board', () => {
        // CPU (O) has two in a row at [0,0] and [0,1] — should complete at [0,2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'O');
        board = placeMark(board, 0, 1, 'O');
        board = placeMark(board, 1, 0, 'X');
        board = placeMark(board, 2, 2, 'X');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 0, col: 2 });
    });

    it('blocks the player about to win on a 3x3 board', () => {
        // Player (X) is one move away from winning diagonally at [2,2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'X');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 2, col: 2 });
    });

    it('completes a horizontal winning line for CPU on a 3x3 board', () => {
        // CPU (O) has [1,0] and [1,1] — winning move is [1,2]
        let board = createEmptyBoard(3);
        board = placeMark(board, 1, 0, 'O');
        board = placeMark(board, 1, 1, 'O');

        const move = hardStrategy(board, 'O', 'X', 3);
        expect(move).toEqual({ row: 1, col: 2 });
    });

    it('returned row and col are within board bounds on a 3x3 board', () => {
        const board = createEmptyBoard(3);
        const move = hardStrategy(board, 'O', 'X', 3);

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(3);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(3);
    });

    it('returned cell is empty on a fresh board', () => {
        const board = createEmptyBoard(3);
        const move = hardStrategy(board, 'O', 'X', 3);

        expect(move).not.toBeNull();
        expect(board[move!.row][move!.col]).toBeNull();
    });

    it('does not crash on a full board and returns null', () => {
        const board = fillBoard(3);

        expect(() => hardStrategy(board, 'O', 'X', 3)).not.toThrow();
        expect(hardStrategy(board, 'O', 'X', 3)).toBeNull();
    });

    it('returns a valid in-bounds move on a partially filled 4x4 board', () => {
        let board = createEmptyBoard(4);
        board = placeMark(board, 0, 0, 'X');
        board = placeMark(board, 1, 1, 'O');
        board = placeMark(board, 2, 2, 'X');

        const move = hardStrategy(board, 'O', 'X', 4);

        expect(move).not.toBeNull();
        expect(move!.row).toBeGreaterThanOrEqual(0);
        expect(move!.row).toBeLessThan(4);
        expect(move!.col).toBeGreaterThanOrEqual(0);
        expect(move!.col).toBeLessThan(4);
        expect(board[move!.row][move!.col]).toBeNull();
    });
});
