/**
 * Unit Tests for Win Detection Logic
 * Task 11.2: Write unit tests for win detection logic
 * Requirements: 5
 *
 * Covers:
 * - Horizontal win detection (3x3, 5x5, 10x10)
 * - Vertical win detection (3x3, 5x5, 10x10)
 * - Diagonal win detection (TL→BR and TR→BL, all board sizes)
 * - No-win scenarios (empty board, partial board)
 * - Winning line identification (correct cell positions returned)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createEmptyBoard, placeMark, detectWin } from '@/utils/boardUtils';
import type { Board } from '@/types/index';

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Build a board from a 2-D array of characters.
 * '.' means null (empty cell); anything else is the symbol string.
 */
function buildBoard(layout: string[][]): Board {
    return layout.map((row) =>
        row.map((cell) => (cell === '.' ? null : cell))
    );
}

// ─── 3×3 Horizontal Wins ─────────────────────────────────────────────────────

describe('detectWin – horizontal wins (3×3)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(3);
    });

    it('detects a win on the top row and returns correct cell positions', () => {
        let b = placeMark(board, 0, 0, 'X');
        b = placeMark(b, 0, 1, 'X');
        b = placeMark(b, 0, 2, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines).toHaveLength(1);
        expect(winningLines[0]).toEqual([
            [0, 0],
            [0, 1],
            [0, 2],
        ]);
    });

    it('detects a win on the middle row and returns correct cell positions', () => {
        let b = placeMark(board, 1, 0, 'O');
        b = placeMark(b, 1, 1, 'O');
        b = placeMark(b, 1, 2, 'O');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('O');
        expect(winningLines[0]).toEqual([
            [1, 0],
            [1, 1],
            [1, 2],
        ]);
    });

    it('detects a win on the bottom row and returns correct cell positions', () => {
        let b = placeMark(board, 2, 0, 'X');
        b = placeMark(b, 2, 1, 'X');
        b = placeMark(b, 2, 2, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [2, 0],
            [2, 1],
            [2, 2],
        ]);
    });
});

// ─── 3×3 Vertical Wins ───────────────────────────────────────────────────────

describe('detectWin – vertical wins (3×3)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(3);
    });

    it('detects a win on the left column and returns correct cell positions', () => {
        let b = placeMark(board, 0, 0, 'X');
        b = placeMark(b, 1, 0, 'X');
        b = placeMark(b, 2, 0, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [0, 0],
            [1, 0],
            [2, 0],
        ]);
    });

    it('detects a win on the middle column and returns correct cell positions', () => {
        let b = placeMark(board, 0, 1, 'O');
        b = placeMark(b, 1, 1, 'O');
        b = placeMark(b, 2, 1, 'O');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('O');
        expect(winningLines[0]).toEqual([
            [0, 1],
            [1, 1],
            [2, 1],
        ]);
    });

    it('detects a win on the right column and returns correct cell positions', () => {
        let b = placeMark(board, 0, 2, 'X');
        b = placeMark(b, 1, 2, 'X');
        b = placeMark(b, 2, 2, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [0, 2],
            [1, 2],
            [2, 2],
        ]);
    });
});

// ─── 3×3 Diagonal Wins ───────────────────────────────────────────────────────

describe('detectWin – diagonal wins (3×3)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(3);
    });

    it('detects TL→BR diagonal win and returns correct cell positions', () => {
        let b = placeMark(board, 0, 0, 'X');
        b = placeMark(b, 1, 1, 'X');
        b = placeMark(b, 2, 2, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [0, 0],
            [1, 1],
            [2, 2],
        ]);
    });

    it('detects TR→BL diagonal win and returns correct cell positions', () => {
        let b = placeMark(board, 0, 2, 'O');
        b = placeMark(b, 1, 1, 'O');
        b = placeMark(b, 2, 0, 'O');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('O');
        expect(winningLines[0]).toEqual([
            [0, 2],
            [1, 1],
            [2, 0],
        ]);
    });
});

// ─── 3×3 No-Win Scenarios ────────────────────────────────────────────────────

describe('detectWin – no-win scenarios (3×3)', () => {
    it('returns null winner for an empty board', () => {
        const board = createEmptyBoard(3);
        const { winner, winningLines } = detectWin(board, 3);

        expect(winner).toBeNull();
        expect(winningLines).toHaveLength(0);
    });

    it('returns null winner for a partial board with no complete line', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 0, 0, 'X');
        b = placeMark(b, 0, 1, 'X');
        // (0,2) is intentionally empty – no win yet

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBeNull();
        expect(winningLines).toHaveLength(0);
    });

    it('returns null winner when row is broken by a different symbol', () => {
        const b = buildBoard([
            ['X', 'X', 'O'],
            ['.', '.', '.'],
            ['.', '.', '.'],
        ]);

        const { winner } = detectWin(b, 3);

        expect(winner).toBeNull();
    });

    it('returns null winner for a classic draw board (no winner, full board)', () => {
        // X O X / O X X / O X O  → draw
        const b = buildBoard([
            ['X', 'O', 'X'],
            ['O', 'X', 'X'],
            ['O', 'X', 'O'],
        ]);

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBeNull();
        expect(winningLines).toHaveLength(0);
    });
});

// ─── 5×5 Horizontal Wins ─────────────────────────────────────────────────────

describe('detectWin – horizontal wins (5×5)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(5);
    });

    it('detects a full-row horizontal win on row 0 and returns all 5 positions', () => {
        let b = board;
        for (let c = 0; c < 5; c++) b = placeMark(b, 0, c, 'X');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('X');
        expect(winningLines[0]).toHaveLength(5);
        expect(winningLines[0]).toEqual([
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
        ]);
    });

    it('detects a full-row horizontal win on the last row (row 4)', () => {
        let b = board;
        for (let c = 0; c < 5; c++) b = placeMark(b, 4, c, 'O');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('O');
        expect(winningLines[0]).toEqual([
            [4, 0],
            [4, 1],
            [4, 2],
            [4, 3],
            [4, 4],
        ]);
    });
});

// ─── 5×5 Vertical Wins ───────────────────────────────────────────────────────

describe('detectWin – vertical wins (5×5)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(5);
    });

    it('detects a full-column vertical win on column 0 and returns all 5 positions', () => {
        let b = board;
        for (let r = 0; r < 5; r++) b = placeMark(b, r, 0, 'O');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('O');
        expect(winningLines[0]).toHaveLength(5);
        expect(winningLines[0]).toEqual([
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
        ]);
    });

    it('detects a full-column vertical win on the last column (col 4)', () => {
        let b = board;
        for (let r = 0; r < 5; r++) b = placeMark(b, r, 4, 'X');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [0, 4],
            [1, 4],
            [2, 4],
            [3, 4],
            [4, 4],
        ]);
    });
});

// ─── 5×5 Diagonal Wins ───────────────────────────────────────────────────────

describe('detectWin – diagonal wins (5×5)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(5);
    });

    it('detects TL→BR main diagonal win and returns all 5 positions', () => {
        let b = board;
        for (let k = 0; k < 5; k++) b = placeMark(b, k, k, 'X');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('X');
        expect(winningLines[0]).toEqual([
            [0, 0],
            [1, 1],
            [2, 2],
            [3, 3],
            [4, 4],
        ]);
    });

    it('detects TR→BL anti-diagonal win and returns all 5 positions', () => {
        let b = board;
        for (let k = 0; k < 5; k++) b = placeMark(b, k, 4 - k, 'O');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('O');
        expect(winningLines[0]).toEqual([
            [0, 4],
            [1, 3],
            [2, 2],
            [3, 1],
            [4, 0],
        ]);
    });
});

// ─── 5×5 No-Win Scenarios ────────────────────────────────────────────────────

describe('detectWin – no-win scenarios (5×5)', () => {
    it('returns null for an empty 5×5 board', () => {
        const board = createEmptyBoard(5);
        const { winner, winningLines } = detectWin(board, 5);

        expect(winner).toBeNull();
        expect(winningLines).toHaveLength(0);
    });

    it('returns null when only 4 of 5 cells in a row are filled', () => {
        let b = createEmptyBoard(5);
        for (let c = 0; c < 4; c++) b = placeMark(b, 2, c, 'X'); // cols 0-3, missing col 4

        const { winner } = detectWin(b, 5);

        expect(winner).toBeNull();
    });

    it('returns null when symbols alternate along a row', () => {
        const b = buildBoard([
            ['X', 'O', 'X', 'O', 'X'],
            ['.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.'],
            ['.', '.', '.', '.', '.'],
        ]);

        const { winner } = detectWin(b, 5);

        expect(winner).toBeNull();
    });
});

// ─── 10×10 Horizontal Wins ───────────────────────────────────────────────────

describe('detectWin – horizontal wins (10×10)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(10);
    });

    it('detects a full-row horizontal win on row 0 and returns all 10 positions', () => {
        let b = board;
        for (let c = 0; c < 10; c++) b = placeMark(b, 0, c, 'X');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('X');
        expect(winningLines[0]).toHaveLength(10);
        // Spot-check first and last positions
        expect(winningLines[0][0]).toEqual([0, 0]);
        expect(winningLines[0][9]).toEqual([0, 9]);
    });

    it('detects a horizontal win on a middle row (row 5)', () => {
        let b = board;
        for (let c = 0; c < 10; c++) b = placeMark(b, 5, c, 'O');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('O');
        expect(winningLines[0][0]).toEqual([5, 0]);
        expect(winningLines[0][9]).toEqual([5, 9]);
    });

    it('detects a horizontal win on the last row (row 9)', () => {
        let b = board;
        for (let c = 0; c < 10; c++) b = placeMark(b, 9, c, 'X');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('X');
        expect(winningLines[0]).toHaveLength(10);
        expect(winningLines[0][0]).toEqual([9, 0]);
        expect(winningLines[0][9]).toEqual([9, 9]);
    });
});

// ─── 10×10 Vertical Wins ─────────────────────────────────────────────────────

describe('detectWin – vertical wins (10×10)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(10);
    });

    it('detects a full-column vertical win on col 0 and returns all 10 positions', () => {
        let b = board;
        for (let r = 0; r < 10; r++) b = placeMark(b, r, 0, 'X');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('X');
        expect(winningLines[0]).toHaveLength(10);
        expect(winningLines[0][0]).toEqual([0, 0]);
        expect(winningLines[0][9]).toEqual([9, 0]);
    });

    it('detects a vertical win on col 9 and returns all 10 positions', () => {
        let b = board;
        for (let r = 0; r < 10; r++) b = placeMark(b, r, 9, 'O');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('O');
        expect(winningLines[0]).toHaveLength(10);
        expect(winningLines[0][0]).toEqual([0, 9]);
        expect(winningLines[0][9]).toEqual([9, 9]);
    });
});

// ─── 10×10 Diagonal Wins ─────────────────────────────────────────────────────

describe('detectWin – diagonal wins (10×10)', () => {
    let board: Board;

    beforeEach(() => {
        board = createEmptyBoard(10);
    });

    it('detects TL→BR main diagonal win and returns all 10 positions', () => {
        let b = board;
        for (let k = 0; k < 10; k++) b = placeMark(b, k, k, 'X');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('X');
        expect(winningLines[0]).toHaveLength(10);
        expect(winningLines[0][0]).toEqual([0, 0]);
        expect(winningLines[0][9]).toEqual([9, 9]);
        // Verify every position
        for (let k = 0; k < 10; k++) {
            expect(winningLines[0][k]).toEqual([k, k]);
        }
    });

    it('detects TR→BL anti-diagonal win and returns all 10 positions', () => {
        let b = board;
        for (let k = 0; k < 10; k++) b = placeMark(b, k, 9 - k, 'O');

        const { winner, winningLines } = detectWin(b, 10);

        expect(winner).toBe('O');
        expect(winningLines[0]).toHaveLength(10);
        expect(winningLines[0][0]).toEqual([0, 9]);
        expect(winningLines[0][9]).toEqual([9, 0]);
        // Verify every position
        for (let k = 0; k < 10; k++) {
            expect(winningLines[0][k]).toEqual([k, 9 - k]);
        }
    });
});

// ─── 10×10 No-Win Scenarios ──────────────────────────────────────────────────

describe('detectWin – no-win scenarios (10×10)', () => {
    it('returns null for an empty 10×10 board', () => {
        const board = createEmptyBoard(10);
        const { winner, winningLines } = detectWin(board, 10);

        expect(winner).toBeNull();
        expect(winningLines).toHaveLength(0);
    });

    it('returns null when only 9 of 10 cells in a row are filled', () => {
        let b = createEmptyBoard(10);
        for (let c = 0; c < 9; c++) b = placeMark(b, 0, c, 'X'); // missing col 9

        const { winner } = detectWin(b, 10);

        expect(winner).toBeNull();
    });

    it('returns null when a column is broken at one cell', () => {
        let b = createEmptyBoard(10);
        for (let r = 0; r < 10; r++) {
            if (r !== 5) b = placeMark(b, r, 3, 'O'); // skip row 5
        }

        const { winner } = detectWin(b, 10);

        expect(winner).toBeNull();
    });
});

// ─── Winning Line Identification (cross-size) ────────────────────────────────

describe('detectWin – winning line identification', () => {
    it('returns exactly the positions that form the winning line (3×3 vertical)', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 0, 1, 'X');
        b = placeMark(b, 1, 1, 'X');
        b = placeMark(b, 2, 1, 'X');

        const { winningLines } = detectWin(b, 3);

        // Exactly one winning line
        expect(winningLines).toHaveLength(1);
        // Each element is a [row, col] tuple
        const line = winningLines[0];
        expect(line).toHaveLength(3);
        expect(line).toContainEqual([0, 1]);
        expect(line).toContainEqual([1, 1]);
        expect(line).toContainEqual([2, 1]);
    });

    it('returns multiple winning lines when a player has two simultaneous wins', () => {
        // Both rows 0 and 1 are filled by X
        let b = createEmptyBoard(3);
        for (let c = 0; c < 3; c++) b = placeMark(b, 0, c, 'X');
        for (let c = 0; c < 3; c++) b = placeMark(b, 1, c, 'X');

        const { winner, winningLines } = detectWin(b, 3);

        expect(winner).toBe('X');
        expect(winningLines.length).toBeGreaterThanOrEqual(2);
    });

    it('reports line with correct tuple format [row, col] for 5×5 diagonal', () => {
        let b = createEmptyBoard(5);
        for (let k = 0; k < 5; k++) b = placeMark(b, k, k, 'X');

        const { winningLines } = detectWin(b, 5);

        expect(winningLines).toHaveLength(1);
        const line = winningLines[0];
        for (let k = 0; k < 5; k++) {
            const [row, col] = line[k];
            expect(row).toBe(k);
            expect(col).toBe(k);
        }
    });

    it('returns winner symbol and all winning positions for anti-diagonal on 5×5', () => {
        let b = createEmptyBoard(5);
        for (let k = 0; k < 5; k++) b = placeMark(b, k, 4 - k, 'O');

        const { winner, winningLines } = detectWin(b, 5);

        expect(winner).toBe('O');
        expect(winningLines[0]).toHaveLength(5);
        for (let k = 0; k < 5; k++) {
            expect(winningLines[0][k]).toEqual([k, 4 - k]);
        }
    });
});

// ─── Custom Symbols ──────────────────────────────────────────────────────────

describe('detectWin – custom symbol support', () => {
    it('detects a win with emoji symbols', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 0, 0, '🕷️');
        b = placeMark(b, 0, 1, '🕷️');
        b = placeMark(b, 0, 2, '🕷️');

        const { winner } = detectWin(b, 3);

        expect(winner).toBe('🕷️');
    });

    it('detects a win with web emoji symbols', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 1, 0, '🕸️');
        b = placeMark(b, 1, 1, '🕸️');
        b = placeMark(b, 1, 2, '🕸️');

        const { winner } = detectWin(b, 3);

        expect(winner).toBe('🕸️');
    });

    it('returns the correct winning symbol and not the opponent symbol', () => {
        let b = createEmptyBoard(3);
        // O fills top row (wins), X has a column started but not complete
        b = placeMark(b, 0, 0, 'O');
        b = placeMark(b, 0, 1, 'O');
        b = placeMark(b, 0, 2, 'O');
        b = placeMark(b, 1, 0, 'X');
        b = placeMark(b, 2, 0, 'X');

        const { winner } = detectWin(b, 3);

        expect(winner).toBe('O');
    });
});

// ─── Return Object Shape ─────────────────────────────────────────────────────

describe('detectWin – return object shape', () => {
    it('always returns an object with winner and winningLines properties', () => {
        const board = createEmptyBoard(3);
        const result = detectWin(board, 3);

        expect(result).toHaveProperty('winner');
        expect(result).toHaveProperty('winningLines');
        expect(Array.isArray(result.winningLines)).toBe(true);
    });

    it('winningLines is an array of arrays when there is a winner', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 0, 0, 'X');
        b = placeMark(b, 0, 1, 'X');
        b = placeMark(b, 0, 2, 'X');

        const { winningLines } = detectWin(b, 3);

        expect(Array.isArray(winningLines)).toBe(true);
        expect(Array.isArray(winningLines[0])).toBe(true);
    });

    it('each cell in a winning line is a [row, col] number pair', () => {
        let b = createEmptyBoard(3);
        b = placeMark(b, 2, 0, 'X');
        b = placeMark(b, 2, 1, 'X');
        b = placeMark(b, 2, 2, 'X');

        const { winningLines } = detectWin(b, 3);
        const line = winningLines[0];

        for (const cell of line) {
            expect(cell).toHaveLength(2);
            expect(typeof cell[0]).toBe('number');
            expect(typeof cell[1]).toBe('number');
        }
    });
});
